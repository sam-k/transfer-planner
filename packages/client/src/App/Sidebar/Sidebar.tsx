import React, {memo, useCallback, useState} from 'react';

import Infobox from './Infobox';
import SearchField, {type HighlightedSearchResult} from './SearchField';
import './Sidebar.css';
import type {SidebarProps} from './Sidebar.types';

/** Renders the sidebar for the application. */
const Sidebar = (props: SidebarProps) => {
  const {searchApi} = props;

  const [selectedSearchResult, setSelectedSearchResult] =
    useState<HighlightedSearchResult | null>(null);

  const onSearchResultChange = useCallback(
    (newSearchResult: HighlightedSearchResult | null) => {
      setSelectedSearchResult(newSearchResult);
    },
    []
  );

  return (
    <div className="sidebar">
      <SearchField searchApi={searchApi} onChange={onSearchResultChange} />
      <Infobox searchApi={searchApi} searchResult={selectedSearchResult} />
    </div>
  );
};

export default memo(Sidebar);
