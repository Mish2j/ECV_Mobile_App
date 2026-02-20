import React, { useEffect, useRef, useState, useCallback } from "react";
import { useHistory, useLocation } from "react-router";
import { IonCol, IonContent, IonPage } from "@ionic/react";
import { MapContainer, TileLayer } from "react-leaflet";
// import L, { latLng } from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";
import {
  DataParams,
  SpatialArea,
  SpatialAreaType,
} from "../../types/time-series.types";

// Import the marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Banner from "../UI/Banner";
import MapResizer from "./MapResizer";
import LocationMarker from "./LocationMarker";
import CoordinateInput from "./CoordinateInput";
import TerraSpatialPicker from "@nasa-terra/components/dist/react/spatial-picker";
import TerraMap from "@nasa-terra/components/dist/react/map";

import TerraInput from "@nasa-terra/components/dist/react/input";

import "leaflet/dist/leaflet.css";
import styles from "./Location.module.css";

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

  // console.log(location);
  // console.log(location.search);
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
    console.log(mapRef);
    if (!el) return;
    // getMapValue();
    console.log(el);
    // cause: "draw"
    const onValueChange = (e: CustomEvent) => {
      console.log("location change: ", e);

      if (e.detail.cause === "clear") {
        console.log("CLEAR");
        cancelRequest();
        // call leaflet cancel
        // TODO: set default map values
        return;
      }
      // // point
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

    return () => {
      el.removeEventListener(
        "terra-map-change",
        onValueChange as EventListener
      );
    };
  }, []);

  // useEffect(() => {
  //   const el = mapRef.current;
  //   if (!el) return;

  //   // Wait for Lit element to finish rendering
  //   el.updateComplete.then(() => {
  //     console.log("Lit component finished rendering");
  //     // Safe to access properties, shadow DOM, methods, etc.
  //     console.log(mapRef);
  //   });
  // }, []);

  // useEffect(() => {
  //   const queryString = window.location.search;
  //   const params = new URLSearchParams(queryString);
  //   console.log("params ", params.get("spatial"));
  //   // setParamValue(params.get('myParam')); // Get the value of 'myParam'
  // }, [window.location.search]); // Run once on component mount

  // console.log(ctxParams.spatialArea.value);

  const initialValue =
    ctxParams.spatialArea.type === SpatialAreaType.COORDINATES
      ? `${ctxParams.spatialArea.value.lat}, ${ctxParams.spatialArea.value.lng}`
      : `${ctxParams.spatialArea.value.west},
          ${ctxParams.spatialArea.value.south},
          ${ctxParams.spatialArea.value.east},
          ${ctxParams.spatialArea.value.north}`;

  // console.log(initialValue);

  const changeHandler = () => {
    console.log("change detected");
  };

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
          {/* <TerraSpatialPicker
            ref={mapRef}
            // hasNavigation=false produces error
            // hasNavigation
            // hasShapeSelector={true}
            showMapOnFocus={false}
            hasCoordTracker={false}
            hideLabel
            // label="Picker"
            mapValue={getMapValue(staged, ctxParams, mapRef)}
            initialValue={initialValue}
            inline
            // onChange={changeHandler}
            // updateComplete={changeHandler}
          ></TerraSpatialPicker> */}
          <TerraMap
            ref={mapRef}
            style={{ width: "500px", height: "500px" }}
            hasShapeSelector={true}
            hasNavigation
            value={getMapValue(staged, ctxParams, mapRef)}
          />
        </div>
      </IonContent>
      {/* <CoordinateInput
        latitude={staged.lat || ctxParams.lat}
        longitude={staged.lon || ctxParams.lon}
        onLatChange={handleLatChange}
        onLngChange={handleLngChange}
      /> */}
      <TerraInput
        label="Phone"
        // type="tel"
        pattern="/^-?(90(\.0+)?|[1-8]?\d(\.\d+)?),\s*-?(180(\.0+)?|(1[0-7]\d|[1-9]?\d)(\.\d+)?)$/"

        // placeholder="555-123-4567"
        // helpText="Format: 555-123-4567"
      ></TerraInput>
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

const getMapValue = (
  stagedParams: Partial<DataParams>,
  currentParams: DataParams,
  mapRef: any
) => {
  // if (cause === "cancel") {
  //   console.log("canceled");
  //   return;
  // }
  console.log("works");
  if (stagedParams.spatialArea) {
    return stagedParams.spatialArea.type === SpatialAreaType.COORDINATES
      ? {
          lat: stagedParams.spatialArea.value.lat,
          lng: stagedParams.spatialArea.value.lng,
        }
      : {
          west: stagedParams.spatialArea.value.west,
          south: stagedParams.spatialArea.value.south,
          east: stagedParams.spatialArea.value.east,
          north: stagedParams.spatialArea.value.north,
        };
  }

  // console.log(ctxParams.spatialArea);
  if (mapRef.current) {
    console.log(mapRef.current.geoJsonRepository);
    console.log(mapRef.current.map.geoJsonRepository);
    console.log(mapRef.current.cancelDraw);
    console.log(mapRef.current._handlers);
    console.log(mapRef.current.drawHandler);
  }

  return currentParams.spatialArea.type === SpatialAreaType.COORDINATES
    ? {
        lat: currentParams.spatialArea.value.lat,
        lng: currentParams.spatialArea.value.lng,
      }
    : {
        west: currentParams.spatialArea.value.west,
        south: currentParams.spatialArea.value.south,
        east: currentParams.spatialArea.value.east,
        north: currentParams.spatialArea.value.north,
      };
};
