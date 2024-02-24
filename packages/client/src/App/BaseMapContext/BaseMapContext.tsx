import React, {createContext, useContext, useMemo} from 'react';

import type {
  BaseMapContextProviderProps,
  BaseMapContextValue,
} from './BaseMapContext.types';

const BaseMapContext = createContext<BaseMapContextValue>({});

/** Renders a provider for the `BaseMapContext`. */
export const BaseMapContextProvider = (props: BaseMapContextProviderProps) => {
  const {currentPos, boundingBox, mapRef, setMarkers, children} = props;

  const contextValue = useMemo<BaseMapContextValue>(
    () => ({currentPos, boundingBox, mapRef, setMarkers}),
    [currentPos, boundingBox, mapRef, setMarkers]
  );

  return (
    <BaseMapContext.Provider value={contextValue}>
      {children}
    </BaseMapContext.Provider>
  );
};

/** Provides the `BaseMapContext` to child components. */
export const useBaseMapContext = () => useContext(BaseMapContext);
