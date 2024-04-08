import type {Itinerary} from '@internal/otp';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {useBaseMapContext} from '../../BaseMapContext';
import DirectionsListBox from './DirectionsListBox';
import DirectionsSearchBox from './DirectionsSearchBox';
import Infobox from './Infobox';
import SearchField, {type SearchFieldProps} from './SearchField';
import './Sidebar.css';
import type {HighlightedSearchResult, LocationInfo} from './Sidebar.types';
import {
  currentPosSearchResult,
  useFetchDirections,
  useFetchLocationInfo,
} from './hooks';

/** Pseudo-highlighted search result corresponding to the current location. */
const currentPosHighlightedSearchResult: HighlightedSearchResult = {
  ...currentPosSearchResult,
  matchedRanges: [[0, currentPosSearchResult.label.length]],
} as const;

/** Renders the sidebar for the application. */
const Sidebar = () => {
  const {mapRef, setDirectionsMarkers} = useBaseMapContext();

  // Whether directions are shown on the map.
  const [areDirectionsShown, setAreDirectionsShown] = useState(false);

  // The primary selected search result.
  const [primarySelectedSearchResult, setPrimarySelectedSearchResult] =
    useState<HighlightedSearchResult | null>(null);
  // The primary search results.
  const [primarySearchResults, setPrimarySearchResults] = useState<
    ReadonlySet<HighlightedSearchResult>
  >(new Set());

  // Information about the currently selected start and end locations.
  const [selectedLocationInfos, setSelectedLocationInfos] = useState<{
    start?: LocationInfo;
    end?: LocationInfo;
  }>({});

  const {fetchLocationInfo} = useFetchLocationInfo();

  // Transit result from start to end locations.
  const {queryData: directionsData} = useFetchDirections({
    startLocation: selectedLocationInfos.start,
    endLocation: selectedLocationInfos.end,
  });

  /** Default value for the search field. */
  const defaultSearchFieldValue = useMemo<SearchFieldProps['defaultValue']>(
    () => ({
      textInput: primarySelectedSearchResult?.label,
      selectedSearchResult: primarySelectedSearchResult,
      searchResults: primarySearchResults,
    }),
    [primarySelectedSearchResult, primarySearchResults]
  );

  /** Flies to a location, or the bounding box of two locations, on the map. */
  const flyToLocation = useCallback(
    (location1?: LocationInfo, location2?: LocationInfo) => {
      if (!mapRef?.current) {
        return;
      }

      if (location1 && location2) {
        mapRef.current.flyToBounds([
          [location1.latitude, location1.longitude],
          [location2.latitude, location2.longitude],
        ]);
        return;
      }

      const location = location1 ?? location2;
      if (location) {
        mapRef.current.flyTo([location.latitude, location.longitude]);
      }
    },
    [mapRef]
  );

  // Shows directions from start to end locations on the map.
  useEffect(() => {
    if (
      !areDirectionsShown ||
      !selectedLocationInfos.start ||
      !selectedLocationInfos.end
    ) {
      setDirectionsMarkers?.(undefined);
      return;
    }

    setDirectionsMarkers?.({
      start: selectedLocationInfos.start,
      end: selectedLocationInfos.end,
    });

    flyToLocation(selectedLocationInfos.start, selectedLocationInfos.end);

    // TODO: Render directions.
    console.log(
      `DIRECTIONS: ${JSON.stringify(
        directionsData,
        /* replacer= */ null,
        /* space= */ 2
      )}`
    );
  }, [
    setDirectionsMarkers,
    areDirectionsShown,
    selectedLocationInfos,
    flyToLocation,
    directionsData,
  ]);

  return (
    <div className="sidebar">
      {areDirectionsShown ? (
        <>
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
              const newStartLocationInfo = searchResult
                ? await fetchLocationInfo(searchResult)
                : undefined;
              setSelectedLocationInfos(prevState => ({
                ...prevState,
                start: newStartLocationInfo,
              }));
            }}
            onEndChange={async searchResult => {
              const newEndLocationInfo = searchResult
                ? await fetchLocationInfo(searchResult)
                : undefined;
              setSelectedLocationInfos(prevState => ({
                ...prevState,
                end: newEndLocationInfo,
              }));
            }}
            onSwap={() => {
              setSelectedLocationInfos(prevState => ({
                start: prevState.end,
                end: prevState.start,
              }));
            }}
            onClose={() => {
              setAreDirectionsShown(false);
              setSelectedLocationInfos({});
              setDirectionsMarkers?.(undefined);
            }}
          />
          <DirectionsListBox
            startCoords={
              directionsData?.from && [
                directionsData.from.lat,
                directionsData.from.lon,
              ]
            }
            endCoords={
              directionsData?.to && [
                directionsData.to.lat,
                directionsData.to.lon,
              ]
            }
            itineraries={directionsData?.itineraries.filter(
              (itin): itin is Itinerary => Boolean(itin)
            )}
            isLoading={!directionsData}
          />
        </>
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
              setAreDirectionsShown(true);
              setSelectedLocationInfos({
                start: startLocationInfo,
                end: endLocationInfo,
              });
            }}
          />
        </>
      )}
    </div>
  );
};

export default memo(Sidebar);
