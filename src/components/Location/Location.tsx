import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { IonCol, IonContent, IonPage } from "@ionic/react";
import { MapContainer, TileLayer } from "react-leaflet";
// import L, { latLng } from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";
import { SpatialArea, SpatialAreaType } from "../../types/time-series.types";

// Import the marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Banner from "../UI/Banner";
import MapResizer from "./MapResizer";
import LocationMarker from "./LocationMarker";
import CoordinateInput from "./CoordinateInput";
import TerraSpatialPicker from "@nasa-terra/components/dist/react/spatial-picker";

import "leaflet/dist/leaflet.css";
import styles from "./Location.module.css";
import { isEmpty } from "lodash";

// Fix default marker icon issues
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

const Location: React.FC = () => {
  const mapRef = useRef<any>(null);
  const {
    params: ctxParams,
    staged,
    requestUpdateParams,
    cancelRequest,
  } = useDataParams();
  const history = useHistory();
  const location = useLocation();
  const [mapValue, setMapValue] = useState<any>({});

  console.log(location);
  console.log(location.search);
  // const handleLatChange = (e: CustomEvent) => {
  //   const newLat = e.detail.value; // get new latitude
  //   requestUpdateParams({ lat: convertToFixedFloat(newLat, 4) });
  // };

  // const handleLngChange = (e: CustomEvent) => {
  //   const newLng = e.detail.value; // get new longitude
  //   requestUpdateParams({ lon: convertToFixedFloat(newLng, 4) });
  // };

  // canceling location change doesn't modify the URL to it's
  // previous state
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    // getMapValue();

    // cause: "draw"
    const onValueChange = (e: CustomEvent) => {
      console.log("location change: ", e);

      if (e.detail.cause === "clear") {
        console.log("CLEAR");
        cancelRequest();
        // TODO: set default map values
        return;
      }
      // point
      if (e.detail.latLng) {
        console.log("This Happening!!!");
        const { lat, lng } = e.detail.latLng;
        requestUpdateParams({
          spatialArea: {
            type: SpatialAreaType.COORDINATES,
            value: {
              lat: convertToFixedFloat(lat, 4).toString(),
              lng: convertToFixedFloat(lng, 4).toString(),
            },
          },
        });
      } else {
        // bounding box
        const { lat: south, lng: west } = e.detail.bounds._southWest;
        const { lat: north, lng: east } = e.detail.bounds._northEast;

        // TODO: convert to fixed float
        requestUpdateParams({
          spatialArea: {
            type: SpatialAreaType.BOUNDING_BOX,
            value: {
              west: convertToFixedFloat(west, 4).toString(),
              south: convertToFixedFloat(south, 4).toString(),
              east: convertToFixedFloat(east, 4).toString(),
              north: convertToFixedFloat(north, 4).toString(),
            },
          },
        });
      }
    };

    el.addEventListener("terra-map-change", onValueChange as EventListener);
    console.log(getMapValue());
    return () => {
      el.removeEventListener(
        "terra-map-change",
        onValueChange as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    console.log("params ", params.get("spatial"));
    // setParamValue(params.get('myParam')); // Get the value of 'myParam'
  }, [window.location.search]); // Run once on component mount

  const getMapValue = () => {
    // if (!staged.spatialArea) {
    //   console.log("canceled");
    //   return;
    // }

    if (staged.spatialArea) {
      return staged.spatialArea.type === SpatialAreaType.COORDINATES
        ? {
            lat: staged.spatialArea.value.lat,
            lng: staged.spatialArea.value.lng,
          }
        : {
            west: staged.spatialArea.value.west,
            south: staged.spatialArea.value.south,
            east: staged.spatialArea.value.east,
            north: staged.spatialArea.value.north,
          };
    }

    // console.log(ctxParams.spatialArea);

    return ctxParams.spatialArea.type === SpatialAreaType.COORDINATES
      ? {
          lat: ctxParams.spatialArea.value.lat,
          lng: ctxParams.spatialArea.value.lng,
        }
      : {
          west: ctxParams.spatialArea.value.west,
          south: ctxParams.spatialArea.value.south,
          east: ctxParams.spatialArea.value.east,
          north: ctxParams.spatialArea.value.north,
        };
  };
  // console.log(ctxParams.spatialArea.value);

  const initialValue =
    ctxParams.spatialArea.type === SpatialAreaType.COORDINATES
      ? `${ctxParams.spatialArea.value.lat}, ${ctxParams.spatialArea.value.lng}`
      : `${ctxParams.spatialArea.value.west},
          ${ctxParams.spatialArea.value.south},
          ${ctxParams.spatialArea.value.east},
          ${ctxParams.spatialArea.value.north}`;

  // console.log(initialValue);

  return (
    <IonPage>
      <Banner />
      {/* <IonContent scrollY={false} fullscreen={false}>
        <div className={styles["map-container"]}>
          <MapContainer
            center={[ctxParams.lat, ctxParams.lon]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // tile source
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // attribution
            />
            <LocationMarker />
            <MapResizer />
          </MapContainer>
        </div>
      </IonContent> */}
      <IonContent scrollY={false} fullscreen={false}>
        <div className={styles["map-container"]}>
          <TerraSpatialPicker
            ref={mapRef}
            // hasNavigation
            // hasShapeSelector
            // hasCoordTracker
            mapValue={getMapValue()}
            initialValue={initialValue}
            inline
          ></TerraSpatialPicker>
        </div>
      </IonContent>
      {/* <CoordinateInput
        latitude={staged.lat || ctxParams.lat}
        longitude={staged.lon || ctxParams.lon}
        onLatChange={handleLatChange}
        onLngChange={handleLngChange}
      /> */}
    </IonPage>
  );
};

export default Location;

export function getSpatialAreaFromUrl(urlString: string): SpatialArea | null {
  const url = new URL(urlString);
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");
  const bounds = url.searchParams.get("bounds")?.split(",");

  if (bounds && bounds.length >= 4) {
    return {
      type: SpatialAreaType.BOUNDING_BOX,
      value: {
        west: bounds[0],
        south: bounds[1],
        east: bounds[2],
        north: bounds[3],
      },
    };
  }

  if (lat && lng) {
    return {
      type: SpatialAreaType.COORDINATES,
      value: {
        lat,
        lng,
      },
    };
  }

  return null;
}
