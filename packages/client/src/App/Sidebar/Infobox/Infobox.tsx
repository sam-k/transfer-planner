import {
  Map as MapIcon,
  Public as PublicIcon,
  type SvgIconComponent,
} from '@mui/icons-material';
import {LinearProgress, Typography} from '@mui/material';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {API_SERVER_URL, ENV_VARS} from '../../../constants';
import {convertDdToDmsCoords} from '../../../utils';
import type {SearchResult} from '../SearchField';
import type {LocationInfo} from '../Sidebar.types';
import './Infobox.css';
import type {InfoboxProps} from './Infobox.types';
import {transformFsqAddressDetailsResponse} from './Infobox.utils';

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
  const {searchApi, searchResult: selectedSearchResult} = props;

  // Whether the infobox contents are currently loading.
  const [isLoading, setIsLoading] = useState(false);

  /** Encoded fetch URL with the param `id`. */
  const encodedFetchLocationData = useMemo(() => {
    let url = '';
    let options: {} | undefined = undefined;

    switch (searchApi) {
      case 'foursquare': {
        url = 'https://api.foursquare.com/v3/address/{id}';
        options = {
          headers: {
            Authorization: ENV_VARS.fsqApiKey,
          },
        };
        break;
      }

      case 'nominatim':
      default:
        break;
    }

    return {
      encodedUrl: encodeURIComponent(url),
      encodedOptions: options && encodeURIComponent(JSON.stringify(options)),
    };
  }, [searchApi]);

  /** Fetches location information for the provided search result. */
  const fetchLocationInfo = useCallback(
    async (searchResult: SearchResult): Promise<LocationInfo> => {
      setIsLoading(true);

      let locationInfo: LocationInfo = {
        label: searchResult.label,
        description: searchResult.description,
        address: searchResult.address ?? '',
        latitude: searchResult.latitude ?? 0,
        longitude: searchResult.longitude ?? 0,
        attribution: searchResult.attribution,
      };

      switch (searchApi) {
        case 'foursquare': {
          if (
            searchResult.address &&
            searchResult.latitude !== undefined &&
            searchResult.longitude !== undefined
          ) {
            break;
          }
          const {encodedUrl, encodedOptions} = encodedFetchLocationData;
          const responseJson = await (
            await fetch(
              `${API_SERVER_URL}/fetch?` +
                [
                  `encodedUrl=${encodedUrl}`,
                  encodedOptions ? `encodedOptions=${encodedOptions}` : '',
                  `id=${encodeURIComponent(searchResult.apiId ?? '')}`,
                ]
                  .filter(Boolean)
                  .join('&')
            )
          ).json();
          locationInfo = {
            ...locationInfo,
            ...transformFsqAddressDetailsResponse(responseJson),
          };
          break;
        }

        case 'nominatim':
        default:
          break;
      }

      setIsLoading(false);
      return locationInfo;
    },
    [searchApi, encodedFetchLocationData]
  );

  // The selected location.
  const [selectedLocationInfo, setSelectedLocationInfo] =
    useState<LocationInfo>();
  useEffect(() => {
    if (!selectedSearchResult) {
      return;
    }
    fetchLocationInfo(selectedSearchResult).then(location => {
      setSelectedLocationInfo(location);
    });
    // Do not refetch if fetch function changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSearchResult]);

  if (!selectedSearchResult) {
    return null;
  }
  return (
    <div className="infobox">
      {!selectedLocationInfo || isLoading ? (
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
          <div className="infobox-detailsContainer">
            <InfoboxDetails
              Icon={MapIcon}
              text={selectedLocationInfo.address}
            />
            <InfoboxDetails
              Icon={PublicIcon}
              text={convertDdToDmsCoords(
                selectedLocationInfo.latitude,
                selectedLocationInfo.longitude
              )}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default memo(Infobox);
