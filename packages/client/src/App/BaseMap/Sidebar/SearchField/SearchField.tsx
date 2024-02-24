import {Place as PlaceIcon} from '@mui/icons-material';
import {Autocomplete, TextField, Typography} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, {memo, useEffect, useMemo, useRef, useState} from 'react';

import {API_SERVER_URL, DEBOUNCE_MS, ENV_VARS} from '../../../../constants';
import type {LatLngCoords} from '../../../../types';
import {
  areCoordsInBounds,
  debounceAsync,
  getHaversineDistKm,
} from '../../../../utils';
import {useBaseMapContext} from '../../../BaseMapContext';
import './SearchField.css';
import type {
  HighlightedSearchResult,
  SearchFieldProps,
  SearchResult,
} from './SearchField.types';
import {transformSearchResponse} from './SearchField.utils';

/** Renders a search field for looking up locations. */
const SearchField = (props: SearchFieldProps) => {
  const {searchApi, onChange} = props;

  const {currentPos, boundingBox} = useBaseMapContext();

  // Current text input in the search field.
  const [textInput, setTextInput] = useState('');
  // Currently selected search result.
  const [selectedSearchResult, setSelectedSearchResult] =
    useState<HighlightedSearchResult | null>(null);
  // All fetched search results.
  const [searchResults, setSearchResults] = useState<
    ReadonlySet<HighlightedSearchResult>
  >(new Set());

  /** Whether the current text input is from a selected value. */
  const isInputFromValue = useRef(false);
  // Whether we're currently searching for a location.
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Radius centered at the current position, encompassing the map's bounding
   * box, in meters. This is for when the bounding box itself cannot be supplied
   * to an API.
   */
  const boundingRadiusM = useMemo(() => {
    if (!currentPos?.coords || !boundingBox) {
      // No radius to calculate.
      return undefined;
    }

    const currentCoords: LatLngCoords = [
      currentPos.coords.latitude,
      currentPos.coords.longitude,
    ];
    if (!areCoordsInBounds(currentCoords, boundingBox)) {
      // Current position lies outside the bounding box.
      return undefined;
    }

    const [[latBound1, lonBound1], [latBound2, lonBound2]] = boundingBox;
    const maxDistKm = Math.max(
      getHaversineDistKm(currentCoords, [latBound1, lonBound1]),
      getHaversineDistKm(currentCoords, [latBound1, lonBound2]),
      getHaversineDistKm(currentCoords, [latBound2, lonBound1]),
      getHaversineDistKm(currentCoords, [latBound2, lonBound2])
    );
    return Math.round(maxDistKm * 1000); // Convert to m
  }, [currentPos, boundingBox]);

  /** Encoded fetch URL with the URI param `query`. */
  const encodedFetchSearchData = useMemo(() => {
    let baseUrl: string;
    let uriParams: string[];
    let options: {} | undefined = undefined;

    switch (searchApi) {
      case 'foursquare': {
        baseUrl = 'https://api.foursquare.com/v3/autocomplete';
        uriParams = [
          currentPos?.coords.latitude &&
          currentPos?.coords.longitude &&
          boundingRadiusM
            ? [
                `ll=${encodeURIComponent(
                  [
                    currentPos.coords.latitude,
                    currentPos.coords.longitude,
                  ].join(',')
                )}`,
                `radius=${boundingRadiusM}`,
              ].join('&')
            : '',
          'query={query}',
        ];
        options = {
          headers: {
            Authorization: ENV_VARS.fsqApiKey,
          },
        };
        break;
      }

      case 'nominatim':
      default:
        baseUrl = 'https://nominatim.openstreetmap.org/search';
        uriParams = [
          'format=jsonv2',
          'addressdetails=1',
          boundingBox
            ? `viewbox=${encodeURIComponent(
                // Convert latitude-longitude pairs to X-Y pairs.
                boundingBox.flatMap(([lat, lon]) => [lon, lat]).join(',')
              )}`
            : '',
          'bounded=1',
          'q={query}',
        ];
        break;
    }

    const uriParamsStr = uriParams.filter(Boolean).join('&');
    const fullUrl = baseUrl + (uriParamsStr ? `?${uriParamsStr}` : '');
    return {
      encodedUrl: encodeURIComponent(fullUrl),
      encodedOptions: options && encodeURIComponent(JSON.stringify(options)),
    };
  }, [
    searchApi,
    currentPos?.coords.latitude,
    currentPos?.coords.longitude,
    boundingBox,
    boundingRadiusM,
  ]);

  /** Fetches search results for the provided query. */
  const fetchSearchResults = useMemo(
    () =>
      debounceAsync(
        async (query: string): Promise<SearchResult[]> => {
          const {encodedUrl, encodedOptions} = encodedFetchSearchData;
          const responseJson = await (
            await fetch(
              `${API_SERVER_URL}/fetch?` +
                [
                  `encodedUrl=${encodedUrl}`,
                  encodedOptions ? `encodedOptions=${encodedOptions}` : '',
                  `query=${encodeURIComponent(query)}`,
                ]
                  .filter(Boolean)
                  .join('&')
            )
          ).json();

          return transformSearchResponse(searchApi, responseJson);
        },
        DEBOUNCE_MS,
        {
          leadingCallback: () => {
            setIsSearching(true);
            setSearchResults(new Set());
          },
          trailingCallback: () => {
            setIsSearching(false);
          },
        }
      ),
    [searchApi, encodedFetchSearchData]
  );

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

    fetchSearchResults(textInput)
      .then(results => {
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
      })
      .catch(() => {
        setSearchResults(new Set());
      });
    // Do not refetch if fetch function changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textInput, selectedSearchResult]);

  return (
    <Autocomplete
      classes={{
        inputRoot: 'searchField-inputRoot',
        paper: 'searchField-resultsContainer',
      }}
      // Text input field props.
      renderInput={renderInputProps => {
        return (
          <TextField
            {...renderInputProps}
            placeholder="Search for a location"
            fullWidth
          />
        );
      }}
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
        onChange?.(newValue);
      }}
      autoComplete
      includeInputInList
      // Selection list props.
      options={[...searchResults]}
      loading={isSearching}
      loadingText="Searching..."
      noOptionsText="No results"
      getOptionLabel={option => option.label}
      getOptionKey={option => option.id}
      renderOption={(optionProps, option) => (
        <li {...optionProps}>
          <div className="searchField-result">
            <div className="searchField-result-iconContainer">
              <PlaceIcon sx={{color: 'text.secondary'}} />
            </div>
            <div className="searchField-result-name">
              {parse(option.label, option.matchedRanges).map(
                (matchedPart, index) => (
                  <span
                    key={index}
                    className={
                      matchedPart.highlight
                        ? 'searchField-result-name-highlight'
                        : ''
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
