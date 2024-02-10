import {LocationOn as LocationOnIcon} from '@mui/icons-material';
import {Autocomplete, Grid, TextField, Typography} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {useAppContext} from '../../../AppContext';
import {API_SERVER_URL, debounceAsync} from '../../../utils';
import './SearchField.css';
import type {
  HighlightedSearchResult,
  SearchFieldProps,
  SearchResult,
} from './SearchField.types';
import {
  DEBOUNCE_MS,
  transformNominatimJSONv2Response,
} from './SearchField.utils';

/** Renders a search field for looking up locations. */
const SearchField = (props: SearchFieldProps) => {
  const {searchApi} = props;

  const {boundingBox} = useAppContext();

  // Current text input in the search field.
  const [textInput, setTextInput] = useState('');
  // Currently selected search result.
  const [selectedValue, setSelectedValue] =
    useState<HighlightedSearchResult | null>(null);
  // All fetched search results.
  const [searchResults, setSearchResults] = useState<
    Set<HighlightedSearchResult>
  >(new Set());

  /** Whether the current text input is from a selected value. */
  const isInputFromValue = useRef(false);
  // Whether we're currently searching for a location.
  const [isSearching, setIsSearching] = useState(false);

  /** Encoded search URL with the URI param `query`. */
  const encodedSearchUrl = useMemo(() => {
    let url: string;
    switch (searchApi) {
      case 'nominatim':
      default:
        url =
          'https://nominatim.openstreetmap.org/search?' +
          [
            'format=jsonv2',
            'addressdetails=1',
            // Convert latitude-longitude pairs to X-Y pairs.
            `viewbox=${
              boundingBox
                ? encodeURIComponent(
                    [
                      boundingBox[0][1],
                      boundingBox[0][0],
                      boundingBox[1][1],
                      boundingBox[1][0],
                    ].join(',')
                  )
                : ''
            }`,
            'bounded=1',
            'q={query}',
          ].join('&');
    }
    return encodeURIComponent(url);
  }, [searchApi, boundingBox]);

  /** Fetches search results for the provided query. */
  const fetchSearchResults = useMemo(
    () =>
      debounceAsync(
        async (query: string): Promise<SearchResult[]> => {
          const responseJson = await (
            await fetch(
              `${API_SERVER_URL}/fetch?` +
                [
                  `encodedUrl=${encodedSearchUrl}`,
                  `query=${encodeURIComponent(query)}`,
                ].join('&')
            )
          ).json();

          let transformedResponse;
          switch (searchApi) {
            case 'nominatim':
            default:
              transformedResponse =
                transformNominatimJSONv2Response(responseJson);
          }

          return transformedResponse;
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
    [searchApi, encodedSearchUrl]
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
  }, [textInput, selectedValue, fetchSearchResults]);

  return (
    <Autocomplete
      className="searchField"
      // Text input field props.
      renderInput={renderInputProps => {
        const {
          InputProps: renderInputInputProps,
          ...additionalRenderInputProps
        } = renderInputProps;
        return (
          <TextField
            {...additionalRenderInputProps}
            placeholder="Search for a location"
            fullWidth
            InputProps={{
              ...renderInputInputProps,
              className: 'searchField-textField-input',
            }}
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
          <Grid container alignItems="center">
            <Grid item className="searchField-iconContainer">
              <LocationOnIcon sx={{color: 'text.secondary'}} />
            </Grid>
            <Grid item className="searchField-searchResult">
              {parse(option.label, option.matchedRanges).map(
                (matchedPart, index) => (
                  <span
                    key={index}
                    className="searchField-searchResult-highlight"
                  >
                    {matchedPart.text}
                  </span>
                )
              )}
              <Typography variant="body2" color="text.secondary">
                {option.description}
              </Typography>
            </Grid>
          </Grid>
        </li>
      )}
      isOptionEqualToValue={(option, selectedValue) =>
        option.fullName === selectedValue.fullName
      }
      // Remove MUI's default `filterOptions`.
      filterOptions={options => options}
    />
  );
};

export default SearchField;
