import {Place as PlaceIcon} from '@mui/icons-material';
import {Autocomplete, TextField, Typography} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import {inRange} from 'lodash-es';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {useAppContext} from '../../../AppContext';
import {API_SERVER_URL, ENV_VARS} from '../../../constants';
import {debounceAsync, getHaversineDistKm} from '../../../utils';
import './SearchField.css';
import type {
  HighlightedSearchResult,
  SearchFieldProps,
  SearchResult,
} from './SearchField.types';
import {DEBOUNCE_MS, transformSearchResponse} from './SearchField.utils';

/** Renders a search field for looking up locations. */
const SearchField = (props: SearchFieldProps) => {
  const {searchApi, selectedValue, setSelectedValue} = props;

  const {currentPos, boundingBox} = useAppContext();

  // Current text input in the search field.
  const [textInput, setTextInput] = useState('');
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

    const {latitude: currentLat, longitude: currentLon} = currentPos.coords;
    const [[latBound1, lonBound1], [latBound2, lonBound2]] = boundingBox;
    if (
      !inRange(currentLat, latBound1, latBound2) ||
      !inRange(currentLon, lonBound1, lonBound2)
    ) {
      // Current position lies outside the bounding box.
      return undefined;
    }

    const maxDistKm = Math.max(
      getHaversineDistKm(currentLat, currentLon, latBound1, lonBound1),
      getHaversineDistKm(currentLat, currentLon, latBound1, lonBound2),
      getHaversineDistKm(currentLat, currentLon, latBound2, lonBound1),
      getHaversineDistKm(currentLat, currentLon, latBound2, lonBound2)
    );
    return Math.round(maxDistKm * 1000); // Convert to m
  }, [currentPos, boundingBox]);

  /** Encoded search URL with the URI param `query`. */
  const encodedSearchOptions = useMemo(() => {
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
            Authorization: ENV_VARS.foursquareApiKey,
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
          // Convert latitude-longitude pairs to X-Y pairs.
          boundingBox
            ? `viewbox=${encodeURIComponent(
                [
                  boundingBox[0][1],
                  boundingBox[0][0],
                  boundingBox[1][1],
                  boundingBox[1][0],
                ].join(',')
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
          const {encodedUrl, encodedOptions} = encodedSearchOptions;
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
    [searchApi, encodedSearchOptions]
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
      setSearchResults(new Set(selectedValue ? [selectedValue] : []));
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
    // Do not rerun search if fetch function changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textInput, selectedValue]);

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
      onInputChange={(event, newInput) => {
        isInputFromValue.current = false;
        setTextInput(newInput);
      }}
      // Selected value props.
      value={selectedValue}
      onChange={(event, newValue) => {
        if (newValue) {
          isInputFromValue.current = true;
          setSelectedValue(newValue);
        } else {
          setSelectedValue(null);
        }
      }}
      autoComplete
      includeInputInList
      // Selection list props.
      options={[...searchResults]}
      loading={isSearching}
      loadingText="Searching..."
      noOptionsText="No results"
      getOptionLabel={option => option.label}
      getOptionKey={option => option.fullName}
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
      isOptionEqualToValue={(option, selectedValue) =>
        option.fullName === selectedValue.fullName
      }
      // Remove MUI's default `filterOptions`.
      filterOptions={options => options}
    />
  );
};

export default SearchField;
