import React, {memo, useCallback, useMemo, useState} from 'react';

import {useBaseMapContext} from '../../BaseMapContext';
import DirectionsSearchBox from './DirectionsSearchBox';
import Infobox from './Infobox';
import SearchField, {type SearchFieldProps} from './SearchField';
import './Sidebar.css';
import type {HighlightedSearchResult, LocationInfo} from './Sidebar.types';
import {currentPosSearchResult, useFetchLocationInfo} from './hooks';

/** Pseudo-highlighted search result corresponding to the current location. */
const currentPosHighlightedSearchResult: HighlightedSearchResult = {
  ...currentPosSearchResult,
  matchedRanges: [[0, currentPosSearchResult.label.length]],
} as const;

/** Renders the sidebar for the application. */
const Sidebar = () => {
  const {mapRef, setStartMarker, setEndMarker} = useBaseMapContext();

  const {fetchLocationInfo} = useFetchLocationInfo();

  // Whether directions are shown on the map.
  const [areDirectionsShown, setAreDirectionsShown] = useState(false);

  // The primary selected search result.
  const [primarySelectedSearchResult, setPrimarySelectedSearchResult] =
    useState<HighlightedSearchResult | null>(null);
  // The primary search results.
  const [primarySearchResults, setPrimarySearchResults] = useState<
    ReadonlySet<HighlightedSearchResult>
  >(new Set());

  // Information about the currently selected start location.
  const [selectedStartLocationInfo, setSelectedStartLocationInfo] =
    useState<LocationInfo>();
  // Information about the currently selected end location.
  const [selectedEndLocationInfo, setSelectedEndLocationInfo] =
    useState<LocationInfo>();

  /** Default value for the search field. */
  const defaultSearchFieldValue = useMemo<SearchFieldProps['defaultValue']>(
    () => ({
      textInput: primarySelectedSearchResult?.label,
      selectedSearchResult: primarySelectedSearchResult,
      searchResults: primarySearchResults,
    }),
    [primarySelectedSearchResult, primarySearchResults]
  );

  /** Shows directions from start to end locations on the map. */
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
      } else if (startLocationInfo) {
        mapRef?.current?.flyTo([
          startLocationInfo.latitude,
          startLocationInfo.longitude,
        ]);
      } else if (endLocationInfo) {
        mapRef?.current?.flyTo([
          endLocationInfo.latitude,
          endLocationInfo.longitude,
        ]);
      }
    },
    [mapRef, setStartMarker, setEndMarker]
  );

  return (
    <div className="sidebar">
      {areDirectionsShown ? (
        <DirectionsSearchBox
          defaultValues={{
            start: {
              textInput: currentPosHighlightedSearchResult.label,
              selectedSearchResult: currentPosHighlightedSearchResult,
              searchResults: new Set([currentPosHighlightedSearchResult]),
            },
            end: defaultSearchFieldValue,
          }}
          onStartChange={async searchResult => {
            const startLocationInfo = searchResult
              ? await fetchLocationInfo(searchResult)
              : undefined;
            showDirectionsOnMap(startLocationInfo, selectedEndLocationInfo);
            setSelectedStartLocationInfo(startLocationInfo);
          }}
          onEndChange={async searchResult => {
            const endLocationInfo = searchResult
              ? await fetchLocationInfo(searchResult)
              : undefined;
            showDirectionsOnMap(selectedStartLocationInfo, endLocationInfo);
            setSelectedEndLocationInfo(endLocationInfo);
          }}
          onSwap={() => {
            showDirectionsOnMap(
              selectedEndLocationInfo,
              selectedStartLocationInfo
            );
            setSelectedStartLocationInfo(selectedEndLocationInfo);
            setSelectedEndLocationInfo(selectedStartLocationInfo);
          }}
        />
      ) : (
        <>
          <SearchField
            defaultValue={defaultSearchFieldValue}
            onChange={(newSelectedSearchResult, newSearchResults) => {
              setPrimarySelectedSearchResult(newSelectedSearchResult);
              setPrimarySearchResults(newSearchResults);
            }}
          />
          <Infobox
            searchResult={primarySelectedSearchResult}
            showDirectionsOnMap={(startLocationInfo, endLocationInfo) => {
              showDirectionsOnMap(startLocationInfo, endLocationInfo);
              setSelectedStartLocationInfo(startLocationInfo);
              setSelectedEndLocationInfo(endLocationInfo);
            }}
          />
        </>
      )}
    </div>
  );
};

export default memo(Sidebar);
