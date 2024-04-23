import type {Itinerary} from '@internal/otp';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import type {LatLngCoords} from '../../../types';
import {useBaseMapContext} from '../../BaseMapContext';
import DirectionsInfoBox from './DirectionsInfobox';
import DirectionsListBox from './DirectionsListBox';
import DirectionsSearchBox from './DirectionsSearchBox';
import DirectionsTimeBox from './DirectionsTimeBox';
import Infobox from './Infobox';
import SearchField, {type SearchFieldProps} from './SearchField';
import './Sidebar.css';
import type {HighlightedSearchResult, LocationInfo} from './Sidebar.types';
import {
  CURRENT_POS_SEARCH_RESULT,
  useFetchDirections,
  useFetchLocationInfo,
  useFetchTimezone,
} from './hooks';

/** Pseudo-highlighted search result corresponding to the current location. */
const CURRENT_POS_HIGHLIGHTED_SEARCH_RESULT: HighlightedSearchResult = {
  ...CURRENT_POS_SEARCH_RESULT,
  matchedRanges: [[0, CURRENT_POS_SEARCH_RESULT.label.length]],
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
  // Information about the currently selected directions schedule.
  const [selectedScheduleInfos, setSelectedScheduleInfos] = useState<{
    dateTime?: Date;
    isArriveBy?: boolean;
  }>({});

  // The currently selected transit itinerary.
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary>();

  const {fetchLocationInfo} = useFetchLocationInfo();

  // Transit result from start to end locations.
  const {queryData: directionsData} = useFetchDirections({
    startLocation: selectedLocationInfos.start,
    endLocation: selectedLocationInfos.end,
    schedule: selectedScheduleInfos,
  });

  const {fetchTimezone} = useFetchTimezone();

  // Timezone of the start location.
  const [startTimezone, setStartTimezone] = useState<string>();
  useEffect(() => {
    const startCoords: LatLngCoords | undefined = directionsData?.from && [
      directionsData.from.lat,
      directionsData.from.lon,
    ];
    if (!startCoords) {
      setStartTimezone(undefined);
      return;
    }
    fetchTimezone(startCoords).then(timezone => {
      setStartTimezone(timezone);
    });
  }, [directionsData, fetchTimezone]);

  // Timezone of the end location.
  const [endTimezone, setEndTimezone] = useState<string>();
  useEffect(() => {
    const endCoords: LatLngCoords | undefined = directionsData?.to && [
      directionsData.to.lat,
      directionsData.to.lon,
    ];
    if (!endCoords) {
      setEndTimezone(undefined);
      return;
    }
    fetchTimezone(endCoords).then(timezone => {
      setEndTimezone(timezone);
    });
  }, [directionsData, fetchTimezone]);

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
        selectedItinerary ? (
          <DirectionsInfoBox
            itinerary={selectedItinerary}
            startLocationLabel={selectedLocationInfos.start?.label}
            endLocationLabel={selectedLocationInfos.end?.label}
            startTimezone={startTimezone}
            endTimezone={endTimezone}
            onClose={() => {
              setSelectedItinerary(undefined);
            }}
          />
        ) : (
          <>
            <DirectionsSearchBox
              defaultValues={{
                start: {
                  textInput: CURRENT_POS_HIGHLIGHTED_SEARCH_RESULT.label,
                  selectedSearchResult: CURRENT_POS_HIGHLIGHTED_SEARCH_RESULT,
                  searchResults: new Set([
                    CURRENT_POS_HIGHLIGHTED_SEARCH_RESULT,
                  ]),
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
            <DirectionsTimeBox
              onTimeChange={newTime => {
                const newDateTime = new Date(
                  selectedScheduleInfos.dateTime ?? new Date()
                );
                newDateTime.setHours(
                  newTime.getHours(),
                  newTime.getMinutes(),
                  newTime.getSeconds(),
                  newTime.getMilliseconds()
                );
                setSelectedScheduleInfos(prevState => ({
                  ...prevState,
                  dateTime: newDateTime,
                }));
              }}
              onDateChange={newDate => {
                const newDateTime = new Date(
                  selectedScheduleInfos.dateTime ?? new Date()
                );
                newDateTime.setFullYear(
                  newDate.getFullYear(),
                  newDate.getMonth(),
                  newDate.getDate()
                );
                setSelectedScheduleInfos(prevState => ({
                  ...prevState,
                  dateTime: newDateTime,
                }));
              }}
              onModeChange={newMode => {
                setSelectedScheduleInfos(prevState => ({
                  ...prevState,
                  isArriveBy: newMode === 'arriveBy',
                }));
              }}
            />
            <DirectionsListBox
              isLoading={!directionsData}
              itineraries={directionsData?.itineraries.filter(
                (itin): itin is Itinerary => Boolean(itin)
              )}
              startTimezone={startTimezone}
              endTimezone={endTimezone}
              onSelect={(itin: Itinerary) => {
                setSelectedItinerary(itin);
              }}
            />
          </>
        )
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
