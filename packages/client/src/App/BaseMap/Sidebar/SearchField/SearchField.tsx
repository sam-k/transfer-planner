import {Place as PlaceIcon} from '@mui/icons-material';
import {Autocomplete, TextField, Typography} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, {memo, useEffect, useRef, useState} from 'react';

import type {HighlightedSearchResult} from '../Sidebar.types';
import {useFetchSearchResults} from '../hooks';
import './SearchField.css';
import type {SearchFieldProps} from './SearchField.types';

/** Renders a search field for looking up locations. */
const SearchField = (props: SearchFieldProps) => {
  const {onChange} = props;

  const {isFetching, fetchSearchResults} = useFetchSearchResults();

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
      loading={isFetching}
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
