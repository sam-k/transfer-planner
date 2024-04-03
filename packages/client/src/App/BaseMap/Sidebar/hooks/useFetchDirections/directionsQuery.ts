import type {QueryTypePlanArgs} from '@internal/otp';
import gql from 'graphql-tag';

import type {OtpQueryDocument, OtpQueryName} from '../utils';

/** Name of the OTP `plan` query. */
export const PLAN_QUERY_NAME = 'plan' satisfies OtpQueryName;

/**
 * Abridged from
 * https://docs.opentripplanner.org/api/dev-2.x/graphql-gtfs/queries/plan.
 */
export const PLAN_QUERY_DOCUMENT: OtpQueryDocument<
  typeof PLAN_QUERY_NAME,
  QueryTypePlanArgs
> = gql`
  query (
    $date: String
    $time: String
    $from: InputCoordinates
    $to: InputCoordinates
    $wheelchair: Boolean
    $numItineraries: Int
    $pageCursor: String
    $arriveBy: Boolean
    $preferred: InputPreferred
    $unpreferred: InputUnpreferred
    $banned: InputBanned
    $transferPenalty: Int
    $transportModes: [TransportMode]
  ) {
    plan(
      date: $date
      time: $time
      from: $from
      to: $to
      wheelchair: $wheelchair
      numItineraries: $numItineraries
      pageCursor: $pageCursor
      arriveBy: $arriveBy
      preferred: $preferred
      unpreferred: $unpreferred
      banned: $banned
      transferPenalty: $transferPenalty
      transportModes: $transportModes
    ) {
      date
      from {
        name
        vertexType
        lat
        lon
      }
      to {
        name
        vertexType
        lat
        lon
      }
      itineraries {
        startTime
        endTime
        duration
        waitingTime
        walkTime
        walkDistance
        legs {
          startTime
          endTime
          departureDelay
          arrivalDelay
          mode
          duration
          legGeometry {
            length
            points
          }
          realTime
          realtimeState
          distance
          transitLeg
          from {
            name
            vertexType
            lat
            lon
            arrivalTime
            departureTime
          }
          to {
            name
            vertexType
            lat
            lon
            arrivalTime
            departureTime
          }
          trip {
            gtfsId
            route {
              gtfsId
              agency {
                gtfsId
                name
                url
                timezone
              }
              shortName
              longName
              mode
              type
              desc
              color
              textColor
            }
            tripShortName
            tripHeadsign
            directionId
            wheelchairAccessible
          }
          intermediateStops {
            gtfsId
            name
            lat
            lon
            code
            desc
            locationType
            parentStation {
              gtfsId
              name
              lat
              lon
              code
              desc
              locationType
              vehicleType
              vehicleMode
              platformCode
            }
            vehicleType
            vehicleMode
          }
        }
        elevationGained
        elevationLost
        accessibilityScore
        numberOfTransfers
      }
      nextPageCursor
      previousPageCursor
    }
  }
`;
