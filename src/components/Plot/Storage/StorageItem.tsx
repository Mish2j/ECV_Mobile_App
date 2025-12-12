import React from "react";
import { IonButton, IonIcon, IonItem, IonLabel, IonText } from "@ionic/react";
import { trash } from "ionicons/icons";

import { DataParams, VariableDbEntry } from "../../../types/time-series.types";
import { extractLatLonFromCacheKey } from "../helpers";
// import {
//   toLocalShortDateTime,
//   formatToDate,
//   getUTCStartOfDay,
// } from "../../../utils/date";
import catalog from "../../Catalog/catalog.json";

import styles from "./StorageItem.module.css";

interface StorageItemProps {
  item: Partial<VariableDbEntry>;
  onDelete: (key: string) => void;
  onPlot: ({ lat, lon, begin_time, end_time, variable }: DataParams) => void;
}

const StorageItem: React.FC<StorageItemProps> = ({
  item,
  onDelete,
  onPlot,
}) => {
  const itemMetadataFromCatalog = catalog.find(
    (data) => data.dataFieldId === item.variableEntryId
  );

  const plotCachedItemHandler = () => {
    if (!item.key) return;

    const coords = extractLatLonFromCacheKey(item.key);

    if (
      coords === null ||
      !item.metadata ||
      !item.variableEntryId ||
      !item.startDate ||
      !item.endDate
    )
      return;

    const cachedDataParams = {
      lat: coords.lat,
      lon: coords.lon,
      // begin_time: getUTCStartOfDay(item.metadata.begin_time),
      // end_time: getUTCStartOfDay(item.metadata.end_time),
      begin_time: item.startDate,
      end_time: item.endDate,
      variable: item.variableEntryId,
    };

    onPlot(cachedDataParams);
  };

  return (
    <IonItem>
      <IonLabel className="ion-padding-top">
        <IonText>
          <h2 className={styles["item-label"]}>
            {itemMetadataFromCatalog?.label}
          </h2>
          {item.metadata?.Request_time && (
            <p>Timestamp: {item.metadata.Request_time}</p>
          )}
          {item.metadata?.begin_time && (
            <p>Begin Time: {item.startDate && item.startDate}</p>
          )}
          {item.metadata?.end_time && (
            <p>End Time: {item.endDate && item.endDate}</p>
          )}
          <p>Latitude: {item.metadata?.lat}</p>
          <p>Longitude: {item.metadata?.lon}</p>
        </IonText>
        <div className={`${styles["button-group"]} ion-margin-top`}>
          <IonButton
            size="default"
            expand="block"
            className={styles.button}
            onClick={plotCachedItemHandler}
          >
            <IonLabel>Plot</IonLabel>
          </IonButton>
          <IonButton
            size="default"
            color="danger"
            expand="block"
            className={styles.button}
            onClick={() => item.key && onDelete(item.key)}
          >
            <IonIcon aria-hidden="true" icon={trash} />
          </IonButton>
        </div>
      </IonLabel>
    </IonItem>
  );
};

export default StorageItem;
