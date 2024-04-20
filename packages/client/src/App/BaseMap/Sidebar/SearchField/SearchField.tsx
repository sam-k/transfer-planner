import {
  MyLocation as MyLocationIcon,
  Place as PlaceIcon,
} from '@mui/icons-material';
import {Autocomplete, TextField, Typography} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import {mergeWith} from 'lodash-es';
import React, {memo, useEffect, useMemo, useRef, useState} from 'react';

import type {HighlightedSearchResult} from '../Sidebar.types';
import {CURRENT_POS_SEARCH_RESULT, useFetchSearchResults} from '../hooks';
import './SearchField.css';
import type {SearchFieldProps} from './SearchField.types';

/** Renders a search field for looking up locations. */
const SearchField = (props: SearchFieldProps) => {
  const {
    classNames,
    placeholderText,
    defaultValue: {
      textInput: defaultTextInput,
      selectedSearchResult: defaultSelectedSearchResult,
      searchResults: defaultSearchResults,
    } = {},
    onChange,
    allowSearchingCurrentPos,
  } = props;

  const {isFetching, fetchSearchResults} = useFetchSearchResults({
    allowSearchingCurrentPos,
  });

  // Current text input in the search field.
  const [textInput, setTextInput] = useState(defaultTextInput ?? '');
  // Currently selected search result.
  const [selectedSearchResult, setSelectedSearchResult] =
    useState<HighlightedSearchResult | null>(
      defaultSelectedSearchResult ?? null
    );
  // All fetched search results.
  const [searchResults, setSearchResults] = useState<
    ReadonlySet<HighlightedSearchResult>
  >(defaultSearchResults ?? new Set());

  /** Whether the current text input is from a selected value. */
  const isInputFromValue = useRef(Boolean(defaultSelectedSearchResult));
  // Update search results.
  useEffect(() => {
    if (isInputFromValue.current) {
      // If this text input was populated by a value selection, then don't
      // attempt another search.
      return;
    }

    if (textInput === '') {
      // Reset search results.
      setSearchResults(
        new Set(selectedSearchResult ? [selectedSearchResult] : [])
      );
      return;
    }

    setSearchResults(new Set());
    fetchSearchResults(textInput).then(results => {
      setSearchResults(
        new Set(
          results.map(result => ({
            ...result,
            matchedRanges: match(result.label, textInput, {
              insideWords: true,
            }),
          }))
        )
      );
    });
    // Do not refetch if fetch function changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textInput, selectedSearchResult]);

  /** Resolves default and consumer-provided class names. */
  const resolvedClassNames = useMemo(
    () =>
      mergeWith(
        {},
        classNames ?? {},
        {
          inputRoot: 'searchField-inputRoot',
          paper: 'searchField-resultsContainer',
        },
        (objVal, srcVal) =>
          objVal &&
          srcVal &&
          typeof objVal === 'string' &&
          typeof srcVal === 'string'
            ? [objVal, srcVal].join(' ')
            : undefined
      ),
    [classNames]
  );

  return (
    <Autocomplete
      classes={resolvedClassNames}
      // Text input field props.
      renderInput={renderInputProps => (
        <TextField
          {...renderInputProps}
          placeholder={placeholderText ?? 'Search for a location'}
          fullWidth
        />
      )}
      onInputChange={(_, newInput, reason) => {
        if (reason !== 'reset') {
          // Update ref upon user input only.
          isInputFromValue.current = false;
        }
        setTextInput(newInput);
      }}
      // Selected value props.
      value={selectedSearchResult}
      onChange={(_, newValue) => {
        if (newValue) {
          isInputFromValue.current = true;
          setSelectedSearchResult(newValue);
        } else {
          setSelectedSearchResult(null);
        }
        onChange?.(newValue, searchResults);
      }}
      autoComplete
      includeInputInList
      // Selection list props.
      options={[...searchResults]}
      loading={isFetching}
      loadingText="Searching..."
      noOptionsText="No results"
      getOptionLabel={option => option.label}
      getOptionKey={option => option.id}
      renderOption={(optionProps, option) => (
        <li {...optionProps}>
          <div className="searchField-result">
            <div className="searchField-result-iconContainer">
              {option.label === CURRENT_POS_SEARCH_RESULT.label ? (
                <MyLocationIcon sx={{color: 'text.secondary'}} />
              ) : (
                <PlaceIcon sx={{color: 'text.secondary'}} />
              )}
            </div>
            <div className="searchField-result-name">
              {parse(option.label, option.matchedRanges).map(
                (matchedPart, index) => (
                  <span
                    key={index}
                    className={
                      matchedPart.highlight
                        ? 'searchField-result-name-highlight'
                        : undefined
                    }
                  >
                    {matchedPart.text}
                  </span>
                )
              )}
              <Typography variant="body2" color="text.secondary">
                {option.description}
              </Typography>
            </div>
          </div>
        </li>
      )}
      disablePortal
      blurOnSelect
      openOnFocus
      isOptionEqualToValue={(option, selectedValue) =>
        option.id === selectedValue.id
      }
      // Remove MUI's default `filterOptions`.
      filterOptions={options => options}
    />
  );
};

export default memo(SearchField);
