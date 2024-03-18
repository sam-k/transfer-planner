import React, {memo, useCallback, useMemo, useState} from 'react';

import {useBaseMapContext} from '../../BaseMapContext';
import DoubleSearchField from './DoubleSearchField';
import Infobox from './Infobox';
import SearchField, {type SearchFieldProps} from './SearchField';
import './Sidebar.css';
import type {HighlightedSearchResult, LocationInfo} from './Sidebar.types';
import {currentPosSearchResult} from './hooks';

/** */
const currentPosHighlightedSearchResult: HighlightedSearchResult = {
  ...currentPosSearchResult,
  matchedRanges: [[0, currentPosSearchResult.label.length]],
} as const;

/** Renders the sidebar for the application. */
const Sidebar = () => {
  const {mapRef, setStartMarker, setEndMarker} = useBaseMapContext();

  //
  const [areDirectionsShown, setAreDirectionsShown] = useState(false);

  //
  const [primarySelectedSearchResult, setPrimarySelectedSearchResult] =
    useState<HighlightedSearchResult | null>(null);
  //
  const [primarySearchResults, setPrimarySearchResults] = useState<
    ReadonlySet<HighlightedSearchResult>
  >(new Set());

  /** */
  const defaultSearchFieldValues = useMemo<SearchFieldProps['defaultValue']>(
    () => ({
      textInput: primarySelectedSearchResult?.label,
      selectedSearchResult: primarySelectedSearchResult,
      searchResults: primarySearchResults,
    }),
    [primarySelectedSearchResult, primarySearchResults]
  );

  /** */
  const showDirectionsOnMap = useCallback(
    (
      startLocationInfo: LocationInfo | undefined,
      endLocationInfo: LocationInfo | undefined
    ) => {
      setAreDirectionsShown(true);

      if (startLocationInfo) {
        setStartMarker?.({
          label: startLocationInfo.label,
          latitude: startLocationInfo.latitude,
          longitude: startLocationInfo.longitude,
        });
      }
      if (endLocationInfo) {
        setEndMarker?.({
          label: endLocationInfo.label,
          latitude: endLocationInfo.latitude,
          longitude: endLocationInfo.longitude,
        });
      }

      if (startLocationInfo && endLocationInfo) {
        mapRef?.current?.flyToBounds(
          [
            [startLocationInfo.latitude, startLocationInfo.longitude],
            [endLocationInfo.latitude, endLocationInfo.longitude],
          ],
          {maxZoom: 16}
        );
      }
    },
    [mapRef, setStartMarker, setEndMarker]
  );

  return (
    <div className="sidebar">
      {areDirectionsShown ? (
        <DoubleSearchField
          defaultValues={{
            start: {
              textInput: currentPosHighlightedSearchResult.label,
              selectedSearchResult: currentPosHighlightedSearchResult,
              searchResults: new Set([currentPosHighlightedSearchResult]),
            },
            end: defaultSearchFieldValues,
          }}
          onStartChange={() => {}}
          onEndChange={() => {}}
          onSwap={() => {}}
        />
      ) : (
        <>
          <SearchField
            defaultValue={defaultSearchFieldValues}
            onChange={(newSelectedSearchResult, newSearchResults) => {
              setPrimarySelectedSearchResult(newSelectedSearchResult);
              setPrimarySearchResults(newSearchResults);
            }}
          />
          <Infobox
            searchResult={primarySelectedSearchResult}
            showDirectionsOnMap={showDirectionsOnMap}
          />
        </>
      )}
    </div>
  );
};

export default memo(Sidebar);
