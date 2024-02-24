import React, {createContext, useContext, useMemo} from 'react';

import type {
  AppContextProviderProps,
  AppContextValue,
} from './AppContext.types';

const AppContext = createContext<AppContextValue>({});

/** Renders a provider for the `AppContext`. */
export const AppContextProvider = (props: AppContextProviderProps) => {
  const {currentPos, tileApi, searchApi, boundingBox, children} = props;

  const contextValue = useMemo<AppContextValue>(
    () => ({currentPos, tileApi, searchApi, boundingBox}),
    [currentPos, tileApi, searchApi, boundingBox]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

/** Provides the `AppContext` to child components. */
export const useAppContext = () => useContext(AppContext);
