import {
  Directions as DirectionsIcon,
  Map as MapIcon,
  Public as PublicIcon,
  type SvgIconComponent,
} from '@mui/icons-material';
import {Button, LinearProgress, Typography} from '@mui/material';
import React, {memo, useCallback, useEffect, useState} from 'react';

import {areCoordsInBounds, convertDdToDmsCoords} from '../../../../utils';
import {useBaseMapContext} from '../../../BaseMapContext';
import type {LocationInfo} from '../Sidebar.types';
import {useFetchLocationInfo} from '../hooks';
import './Infobox.css';
import type {InfoboxProps} from './Infobox.types';

/** Renders a row showing given details about the location. */
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

/** Renders information about a location. */
const Infobox = (props: InfoboxProps) => {
  const {searchResult: selectedSearchResult, showDirectionsOnMap} = props;

  const {currentPos, boundingBox, mapRef, setMarker} = useBaseMapContext();

  const {isFetching, fetchLocationInfo} = useFetchLocationInfo();

  // Whether the selected location is out of bounds of the map.
  const [isLocationOutOfBounds, setIsLocationOutOfBounds] = useState(false);

  // The selected location.
  const [selectedLocationInfo, setSelectedLocationInfo] =
    useState<LocationInfo>();
  useEffect(() => {
    if (!selectedSearchResult) {
      setMarker?.(undefined);
      return;
    }
    fetchLocationInfo(selectedSearchResult).then(location => {
      setSelectedLocationInfo(location);

      if (
        boundingBox &&
        !areCoordsInBounds([location.latitude, location.longitude], boundingBox)
      ) {
        setIsLocationOutOfBounds(true);
        return;
      }

      setIsLocationOutOfBounds(false);
      mapRef?.current?.flyTo(
        [location.latitude, location.longitude],
        /* zoom= */ 16
      );
      setMarker?.({
        label: location.label,
        latitude: location.latitude,
        longitude: location.longitude,
        classNames: {icon: 'selectedLocation-icon'},
      });
    });
    // Do not refetch if fetch function changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSearchResult]);

  const onDirectionsClick = useCallback(() => {
    showDirectionsOnMap?.(
      currentPos && {
        label: '',
        description: '',
        address: '',
        latitude: currentPos.coords.latitude,
        longitude: currentPos.coords.longitude,
        attribution: '',
      },
      selectedLocationInfo
    );
  }, [showDirectionsOnMap, currentPos, selectedLocationInfo]);

  if (!selectedSearchResult) {
    return null;
  }
  return (
    <div className="infobox">
      {!selectedLocationInfo || isFetching ? (
        <Typography className="infobox-loadingContainer" color="text.disabled">
          <LinearProgress className="infobox-loading" color="inherit" />
        </Typography>
      ) : (
        <>
          <div>
            <Typography className="infobox-name" color="text.primary">
              {selectedLocationInfo.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedLocationInfo.description}
            </Typography>
          </div>
          <div className="infobox-actionsContainer">
            {isLocationOutOfBounds ? (
              <Typography className="infobox-errorText" color="error">
                Location is out of bounds.
              </Typography>
            ) : (
              <Button
                className="infobox-actionButton"
                color="primary"
                onClick={onDirectionsClick}
              >
                <DirectionsIcon className="infobox-actionButton-icon" />
                <Typography
                  className="infobox-actionButton-text"
                  variant="caption"
                >
                  Directions
                </Typography>
              </Button>
            )}
          </div>
          <div className="infobox-detailsContainer">
            <InfoboxDetails
              Icon={MapIcon}
              text={selectedLocationInfo.address}
            />
            <InfoboxDetails
              Icon={PublicIcon}
              text={convertDdToDmsCoords([
                selectedLocationInfo.latitude,
                selectedLocationInfo.longitude,
              ])}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default memo(Infobox);
