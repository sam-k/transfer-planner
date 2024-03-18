import React, {memo, useCallback, useMemo, useState} from 'react';

import {useBaseMapContext} from '../../BaseMapContext';
import DoubleSearchField from './DoubleSearchField';
import Infobox from './Infobox';
import SearchField, {type SearchFieldProps} from './SearchField';
import './Sidebar.css';
import type {HighlightedSearchResult, LocationInfo} from './Sidebar.types';
import {currentPosSearchResult, useFetchLocationInfo} from './hooks';

/** */
const currentPosHighlightedSearchResult: HighlightedSearchResult = {
  ...currentPosSearchResult,
  matchedRanges: [[0, currentPosSearchResult.label.length]],
} as const;

/** Renders the sidebar for the application. */
const Sidebar = () => {
  const {mapRef, setStartMarker, setEndMarker} = useBaseMapContext();

  const {fetchLocationInfo} = useFetchLocationInfo();

  //
  const [areDirectionsShown, setAreDirectionsShown] = useState(false);

  //
  const [primarySelectedSearchResult, setPrimarySelectedSearchResult] =
    useState<HighlightedSearchResult | null>(null);
  //
  const [primarySearchResults, setPrimarySearchResults] = useState<
    ReadonlySet<HighlightedSearchResult>
  >(new Set());

  //
  const [selectedStartLocationInfo, setSelectedStartLocationInfo] =
    useState<LocationInfo>();
  //
  const [selectedEndLocationInfo, setSelectedEndLocationInfo] =
    useState<LocationInfo>();

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
        <DoubleSearchField
          defaultValues={{
            start: {
              textInput: currentPosHighlightedSearchResult.label,
              selectedSearchResult: currentPosHighlightedSearchResult,
              searchResults: new Set([currentPosHighlightedSearchResult]),
            },
            end: defaultSearchFieldValues,
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
            defaultValue={defaultSearchFieldValues}
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
