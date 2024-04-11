import {
  DefaultError,
  PathNotFoundError,
  getRelativePath,
  printWarn,
} from '@internal/script-utils';
import {parse as parseCsv, stringify as stringifyCsv} from 'csv';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  renameSync,
  unlinkSync,
} from 'fs';
import {globSync} from 'glob';
import {dirname, join as joinPath} from 'path';
import {Transform} from 'stream';
import {pipeline} from 'stream/promises';

import type {DataSources} from '../../config/schemas/dataSources.schema';
import {PKG_DIR} from '../utils';

/** Reads a CSV file's headers. */
const getCsvHeaders = async (csvPath: string) =>
  await new Promise<string[]>((resolve, reject) => {
    const readFs = createReadStream(csvPath);
    const csvStream = parseCsv();
    readFs
      .pipe(csvStream)
      .on('data', (data: string[]) => {
        csvStream.destroy();
        readFs.destroy();
        resolve(data);
      })
      .on('error', err => {
        reject(err);
      });
  });

/** Transforms a CSV file in place. */
const transformCsv = async (csvPath: string, transformer: Transform) => {
  // Create temp file path. Appending the current timestamp should be enough to
  // make the path unique.
  const tmpCsvPath = `${csvPath}-${Date.now()}`;
  await pipeline(
    createReadStream(csvPath),
    parseCsv({columns: true}),
    transformer,
    stringifyCsv({header: true}),
    createWriteStream(tmpCsvPath)
  );
  unlinkSync(csvPath);
  renameSync(tmpCsvPath, csvPath);
};

/**
 * Transformer to propagate deduplicated column values to a CSV stream.
 *
 * Instead of using the `Transform` constructor, we define this as a separate
 * class to enable one-to-many streaming.
 */
class PropagateDedupedCsvTransform extends Transform {
  colName: string;
  /** Map of column values to their counts within the original file. */
  colValueCounts: ReadonlyMap<string, number>;
  /**
   * Map of duplicated column values to their counts within the file being
   * transformed, to be populated here.
   *
   * For logging purposes only.
   */
  dupedColValueCountsInFile?: Map<string, number>;

  constructor(
    colName: string,
    colValueCounts: Map<string, number>,
    dupedColValueCountsInFile?: Map<string, number>
  ) {
    super({objectMode: true});

    this.colName = colName;
    this.colValueCounts = colValueCounts;
    this.dupedColValueCountsInFile = dupedColValueCountsInFile;
  }

  _transform(...[data, , callback]: Parameters<Transform['_transform']>) {
    const colValue = data[this.colName];
    const count = this.colValueCounts.get(colValue) ?? 1;

    if (count <= 1) {
      callback(/* error= */ null, data);
      return;
    }

    this.dupedColValueCountsInFile?.set(
      colValue,
      (this.dupedColValueCountsInFile.get(colValue) ?? 0) + 1
    );
    for (let i = 2; i <= count; i++) {
      // Disregard backpressure. See https://github.com/nodejs/help/issues/1791.
      this.push(Object.assign({}, data, {[this.colName]: `${colValue}-${i}`}));
    }
    callback();
  }
}

/** Type for sanitizing a CSV file. */
type SanitizeFunction = (
  /** Path of the CSV file to sanitize. */
  csvPath: string,
  /** Name of the column whose values to sanitize. */
  colName: string,
  /**
   * Name of the reference column associated with this sanitization.
   *
   * For logging purposes only.
   */
  refColName?: string
) => Promise<void>;

/**
 * Enforces non-null values in a CSV file's given column, populating them as
 * `GENERATED_NON_NULL`.
 */
const enforceNonNull: SanitizeFunction = async (
  csvPath,
  colName,
  refColName
) => {
  const csvRelativePath = getRelativePath({path: csvPath, parentPath: PKG_DIR});
  let nullCount = 0;

  let areNullValuesFound = false;
  await transformCsv(
    csvPath,
    new Transform({
      objectMode: true,
      transform(data, _, callback) {
        const colValue = data[colName];
        const refColValue = refColName && data[refColName];

        if (!colValue) {
          nullCount++;
          const newColValue = 'GENERATED_NON_NULL';
          data[colName] = newColValue;
          if (!areNullValuesFound) {
            printWarn(`Populating ${colName} in ${csvRelativePath}...`);
            areNullValuesFound = true;
          }
          if (refColValue) {
            printWarn(null, `- (${refColName}: ${refColValue})`);
          }
        }
        callback(/* error= */ null, data);
      },
    })
  );
  if (nullCount && !refColName) {
    printWarn(null, `- ${nullCount} instances`);
  }
};

/**
 * Enforces unique values in a CSV file's given column, and updates all other
 * CSV files in the file referencing those duplicated values.
 */
const enforceUnique: SanitizeFunction = async (
  csvPath,
  colName,
  refColName
) => {
  const csvRelativePath = getRelativePath({path: csvPath, parentPath: PKG_DIR});
  const colValueCounts = new Map<string, number>();

  // Rename duplicated column values.
  let areDuplicatesFound = false;
  await transformCsv(
    csvPath,
    new Transform({
      objectMode: true,
      transform(data, _, callback) {
        const colValue = data[colName];
        const refColValue = refColName && data[refColName];

        const newColValueCount = (colValueCounts.get(colValue) ?? 0) + 1;
        colValueCounts.set(colValue, newColValueCount);

        if (newColValueCount > 1) {
          const newColValue = `${colValue}-${newColValueCount}`;
          data[colName] = newColValue;
          if (!areDuplicatesFound) {
            printWarn(`Deduplicating ${colName} in ${csvRelativePath}...`);
            areDuplicatesFound = true;
          }
          printWarn(
            null,
            `- ${colValue} -> ${newColValue}` +
              (refColValue ? ` (${refColName}: ${refColValue})` : '')
          );
        }
        callback(/* error= */ null, data);
      },
    })
  );

  // Replicate rows in other files in the directory with the duplicated column
  // values.
  await Promise.all(
    globSync(joinPath(dirname(csvPath), '*')).map(async otherCsvPath => {
      if (
        otherCsvPath === csvPath ||
        !(await getCsvHeaders(otherCsvPath)).includes(colName)
      ) {
        return;
      }

      const dupedColValueCountsInFile = new Map<string, number>();
      await transformCsv(
        otherCsvPath,
        new PropagateDedupedCsvTransform(
          colName,
          colValueCounts,
          dupedColValueCountsInFile
        )
      );
      if (dupedColValueCountsInFile.size) {
        printWarn(
          `Propagating deduplicated instances of ${colName} in ${getRelativePath(
            {path: otherCsvPath, parentPath: PKG_DIR}
          )}...`,
          ...[
            ...new Map(
              [...dupedColValueCountsInFile].sort(([key1], [key2]) =>
                key1.localeCompare(key2)
              )
            ).entries(),
          ].map(([colValue, count]) => `- ${colValue}: ${count} instances`)
        );
      }
    })
  );
};

/** Sanitizes CSV file in a data source. */
export const sanitizeCsvInSource = async (
  sourcePath: string,
  rule: NonNullable<
    DataSources['regions'][number]['sources'][number]['sanitizeRules']
  >[number]
) => {
  const csvPath = joinPath(sourcePath, rule.fileName);
  if (!existsSync(csvPath)) {
    throw new PathNotFoundError(csvPath, PKG_DIR);
  }
  const csvRelativePath = getRelativePath({path: csvPath, parentPath: PKG_DIR});

  const csvHeaders = new Set(await getCsvHeaders(csvPath));
  if (
    rule.referenceColName !== undefined &&
    !csvHeaders.has(rule.referenceColName)
  ) {
    throw new DefaultError(
      `Reference column ${rule.referenceColName} not found in ${csvRelativePath}.`
    );
  }

  let sanitize: SanitizeFunction;
  switch (rule.ruleType) {
    case 'nonNull':
      sanitize = enforceNonNull;
      break;
    case 'unique':
      sanitize = enforceUnique;
      break;
    default:
      throw new DefaultError(
        `Unrecognized sanitization rule type: ${rule.ruleType}`
      );
  }

  // We block on each promise here instead of awaiting them all in parallel, so
  // the file manipulations do not race with each other.
  for (const colName of rule.sanitizeColNames) {
    if (!csvHeaders.has(colName)) {
      throw new DefaultError(
        `Sanitize column ${colName} not found in ${csvRelativePath}.`
      );
    }
    await sanitize(csvPath, colName, rule.referenceColName);
  }
};
