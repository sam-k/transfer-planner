import React, {memo, useState} from 'react';

import Infobox from './Infobox';
import SearchField, {type HighlightedSearchResult} from './SearchField';
import './Sidebar.css';

/** Renders the sidebar for the application. */
const Sidebar = () => {
  const [selectedSearchResult1, setSelectedSearchResult1] =
    useState<HighlightedSearchResult | null>(null);
  const [selectedSearchResult2, setSelectedSearchResult2] =
    useState<HighlightedSearchResult | null>(null);

  return (
    <div className="sidebar">
      {selectedSearchResult2 ? (
        <></>
      ) : (
        <>
          <SearchField
            onChange={newSearchResult => {
              setSelectedSearchResult1(newSearchResult);
            }}
          />
          <Infobox searchResult={selectedSearchResult1} />
        </>
      )}
    </div>
  );
};

export default memo(Sidebar);
