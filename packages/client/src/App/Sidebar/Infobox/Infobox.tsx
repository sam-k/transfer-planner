import {
  Map as MapIcon,
  Place as PlaceIcon,
  type SvgIconComponent,
} from '@mui/icons-material';
import {Typography} from '@mui/material';
import React from 'react';

import './Infobox.css';
import type {InfoboxProps} from './Infobox.types';

/** */
const InfoboxDetails = ({
  Icon,
  text,
}: {
  Icon: SvgIconComponent;
  text: string;
}) => (
  <div className="infobox-details">
    <div className="infobox-details-iconContainer">
      <Icon sx={{color: 'text.secondary'}} />
    </div>
    <div className="infobox-details-textContainer">
      <Typography variant="body2">{text}</Typography>
    </div>
  </div>
);

/** */
const Infobox = (props: InfoboxProps) => {
  const {searchResult} = props;

  return (
    <div className="infobox">
      <div>
        <Typography className="infobox-name" color="text.primary">
          {searchResult.label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {searchResult.description}
        </Typography>
      </div>
      <div className="infobox-detailsContainer">
        <InfoboxDetails Icon={PlaceIcon} text={searchResult.fullName} />
        <InfoboxDetails
          Icon={MapIcon}
          text={[searchResult.latitude, searchResult.longitude]
            .filter(Boolean)
            .join(', ')}
        />
      </div>
    </div>
  );
};

export default Infobox;
