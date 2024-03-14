import React, {memo, useCallback, useState} from 'react';

import {filterAndJoin} from '../../../utils';
import {useBaseMapContext} from '../../BaseMapContext';
import DoubleSearchField from './DoubleSearchField';
import Infobox from './Infobox';
import SearchField from './SearchField';
import './Sidebar.css';
import type {HighlightedSearchResult, LocationInfo} from './Sidebar.types';

/** Renders the sidebar for the application. */
const Sidebar = () => {
  const {mapRef, setStartMarker, setEndMarker} = useBaseMapContext();

  const [areDirectionsShown, setAreDirectionsShown] = useState(false);

  const [startSearchResult, setStartSearchResult] =
    useState<HighlightedSearchResult | null>(null);
  const [endSearchResult, setEndSearchResult] =
    useState<HighlightedSearchResult | null>(null);

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
      {true ? (
        <DoubleSearchField
          onStartChange={newSearchResult => {
            setStartSearchResult(newSearchResult);
          }}
          onEndChange={newSearchResult => {
            setEndSearchResult(newSearchResult);
          }}
          onSwap={() => {
            const start = startSearchResult;
            const end = endSearchResult;
            setStartSearchResult(end);
            setEndSearchResult(start);
          }}
        />
      ) : (
        <>
          <SearchField
            onChange={newSearchResult => {
              setStartSearchResult(newSearchResult);
            }}
          />
          <Infobox
            searchResult={startSearchResult}
            showDirectionsOnMap={showDirectionsOnMap}
          />
        </>
      )}
    </div>
  );
};

export default memo(Sidebar);
