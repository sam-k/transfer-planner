import React, {createContext, useContext, useMemo} from 'react';

import type {
  BaseMapContextProviderProps,
  BaseMapContextValue,
} from './BaseMapContext.types';

const BaseMapContext = createContext<BaseMapContextValue>({});

/** Renders a provider for the `BaseMapContext`. */
export const BaseMapContextProvider = (props: BaseMapContextProviderProps) => {
  const {
    tileApi,
    searchApi,
    currentPos,
    boundingBox,
    mapRef,
    setMarker,
    setDirectionsMarkers,
    setDirectionsPolylines,
    children,
  } = props;

  const contextValue = useMemo<BaseMapContextValue>(
    () => ({
      tileApi,
      searchApi,
      currentPos,
      boundingBox,
      mapRef,
      setMarker,
      setDirectionsMarkers,
      setDirectionsPolylines,
    }),
    [
      tileApi,
      searchApi,
      currentPos,
      boundingBox,
      mapRef,
      setMarker,
      setDirectionsMarkers,
      setDirectionsPolylines,
    ]
  );

  return (
    <BaseMapContext.Provider value={contextValue}>
      {children}
    </BaseMapContext.Provider>
  );
};

/** Provides the `BaseMapContext` to child components. */
export const useBaseMapContext = () => useContext(BaseMapContext);
