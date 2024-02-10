import React from 'react';

import SearchField from './SearchField';
import './Sidebar.css';
import type {SidebarProps} from './Sidebar.types';

/** Renders the sidebar for the application. */
const Sidebar = (props: SidebarProps) => {
  const {searchApi} = props;

  return (
    <div className="sidebar">
      <SearchField searchApi={searchApi} />
    </div>
  );
};

export default Sidebar;
