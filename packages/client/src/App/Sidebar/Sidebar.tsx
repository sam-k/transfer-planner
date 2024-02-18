import React, {useState} from 'react';

import Infobox from './Infobox';
import SearchField, {type HighlightedSearchResult} from './SearchField';
import './Sidebar.css';
import type {SidebarProps} from './Sidebar.types';

/** Renders the sidebar for the application. */
const Sidebar = (props: SidebarProps) => {
  const {searchApi} = props;

  const [selectedValue, setSelectedValue] =
    useState<HighlightedSearchResult | null>(null);

  return (
    <div className="sidebar">
      <SearchField
        searchApi={searchApi}
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
      />
      {selectedValue && <Infobox searchResult={selectedValue} />}
    </div>
  );
};

export default Sidebar;
