import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  RangeCustomEvent,
  IonCol,
  IonGrid,
  IonRow,
} from "@ionic/react";
import { server } from "ionicons/icons";
import { useLocation } from "react-router-dom";
import { isEmpty } from "lodash";

import { TimeSeriesDataRow, DataParams } from "../../types/time-series.types";
import { useDataParams } from "../../store/DataParamsContext";
import { DefaultParams, TimeIntervalKey } from "../../constants/time-series";
import { getUTCStartOfDay, formatUtcDate } from "../../utils/date";
import {
  getMiddleIndex,
  convertTimeInterval,
  getDefaultDateRange,
} from "./helpers";
import catalog from "./../Catalog/catalog.json";
import TerraTimeSeries, {
  TerraTimeSeriesDataChangeEvent,
} from "@nasa-terra/components/dist/react/time-series";

// import TerraTimeAverageMap from "@nasa-terra/components/dist/react/time-average-map";
import Slider from "./Slider";
import StorageManager from "./Storage/StorageManager";
import Banner from "../UI/Banner";
import TimeInterval from "./TimeInterval";

import "./Plot.css";

const Plot: React.FC = () => {
  const [stateData, setStateData] = useState<TimeSeriesDataRow[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [selectedTimeInterval, setSelectedTimeInterval] =
    useState<TimeIntervalKey>("half-hourly");
  const {
    params: ctxParams,
    updateParams,
    setMetadata,
    metadata,
  } = useDataParams();
  const location = useLocation();
  const catalogPageVariable = location.state;

  const productDetailsFromCatalog = catalog.find(
    (data) => data.dataFieldId === ctxParams.variable
  );

  const currentProductTimeInterval =
    productDetailsFromCatalog?.dataProductTimeInterval;

  useEffect(() => {
    if (!productDetailsFromCatalog) return;
    setSelectedTimeInterval(
      productDetailsFromCatalog?.dataProductTimeInterval as TimeIntervalKey
    );
  }, [productDetailsFromCatalog]);

  useEffect(() => {
    setSliderValue(getMiddleIndex(stateData));
  }, [stateData]);

  /**
   *
   * This will only work when user selects a variable on the catalog page.
   * It uses default parameters and user selected variable.
   *
   */
  useEffect(() => {
    if (!catalogPageVariable) return;
    // console.log("run useeffect with: ", catalogPageVariable);
    // FIXME: returns today's date
    // const { startDate: defaultStartDate, endDate: defaultEndDate } =
    //   getDefaultDateRange(
    //     dayjs(productDetailsFromCatalog?.dataProductBeginDateTime),
    //     dayjs(productDetailsFromCatalog?.dataProductEndDateTime),
    //     productDetailsFromCatalog?.dataProductTimeInterval as TimeIntervalKey
    //   );
    // console.log("SENDING REQUEST: ", defaultStartDate, defaultEndDate);
    // TODO: Should use device's location if provided
    updateParams({
      lat: DefaultParams.LATITUDE,
      lon: DefaultParams.LONGITUDE,
      // begin_time: defaultStartDate,
      // end_time: defaultEndDate,
      begin_time: DefaultParams.BEGIN_TIME,
      end_time: DefaultParams.END_TIME,
      variable: catalogPageVariable as string,
    });
  }, [catalogPageVariable]);

  // console.log(
  //   "getDefaultDateRange",
  //   getDefaultDateRange(
  //     dayjs(productDetailsFromCatalog?.dataProductBeginDateTime),
  //     dayjs(productDetailsFromCatalog?.dataProductEndDateTime),
  //     "half-hourly"
  //   )
  // );

  // console.log(
  //   "getDefaultDateRange",
  //   getDefaultDateRange(
  //     dayjs(productDetailsFromCatalog?.dataProductBeginDateTime),
  //     dayjs(productDetailsFromCatalog?.dataProductEndDateTime),
  //     "monthly"
  //   )
  // );

  // console.log(
  //   "getDefaultDateRange",
  //   getDefaultDateRange(
  //     dayjs(productDetailsFromCatalog?.dataProductBeginDateTime),
  //     dayjs(productDetailsFromCatalog?.dataProductEndDateTime),
  //     "weekly"
  //   )
  // );
  // console.log(`_______________________________`);
  // console.log(productDetailsFromCatalog?.dataProductBeginDateTime);

  const sliderValueChangeHandler = (e: RangeCustomEvent) => {
    if (!stateData.length) return;
    const activeIndex = Number(e.detail.value);
    setSliderValue(activeIndex);
  };

  /* FIXME: Slider buttons don't work when plot fully zoomed in -- check stateData */
  const sliderLeftBtnHandler = () => {
    if (stateData.length === 0) return;
    if (sliderValue === 0) return;

    setSliderValue((prevNum) =>
      Math.max(
        0,
        prevNum -
          convertTimeInterval(
            currentProductTimeInterval as TimeIntervalKey,
            selectedTimeInterval
          )
      )
    );
  };

  const sliderRightBtnHandler = () => {
    if (stateData.length === 0) return;
    if (sliderValue === stateData.length - 1) return;

    setSliderValue((prevNum) =>
      Math.min(
        stateData.length - 1,
        prevNum +
          convertTimeInterval(
            currentProductTimeInterval as TimeIntervalKey,
            selectedTimeInterval
          )
      )
    );
  };

  const plotCachedItemHandler = (newParams: DataParams) => {
    console.log(newParams.end_time);
    console.log("formatted", getUTCStartOfDay(newParams.end_time));
    updateParams({
      lat: newParams.lat,
      lon: newParams.lon,
      begin_time: newParams.begin_time,
      end_time: newParams.end_time,
      variable: newParams.variable,
    });
  };

  // Emitted whenever time series data has been fetched from Giovanni. Or zoomed in/out.
  const timeSeriesDataChangeHandler = (e: TerraTimeSeriesDataChangeEvent) => {
    setStateData(e.detail.data.data);
    console.log("e", e);
    setMetadata(e.detail.data.metadata);
  };

  // Emitted whenever the date range is modified
  // const timeSeriesDateRangeChangeHandler = (e: CustomEvent) => {
  // };
  // console.log("as it is: ", ctxParams.begin_time);
  // console.log(formatToDate(ctxParams.begin_time));
  // console.log(
  //   ctxParams.begin_time.replace(/(\d{4})-(\d{2})-(\d{2}).*/, "$2/$3/$1")
  // );
  console.log("For Time Series component", formatUtcDate(ctxParams.end_time));

  // TODO: check date picker value when plotting data from history
  return (
    <IonPage>
      <IonContent fullscreen={true}>
        <Banner>
          <IonButton
            slot="end"
            size="small"
            onClick={() => setIsStorageOpen(true)}
          >
            <IonIcon aria-hidden="true" size="medium" icon={server} />
          </IonButton>
        </Banner>
        <div className="ion-padding">
          <StorageManager
            onPlot={plotCachedItemHandler}
            isOpen={isStorageOpen}
            onModalClose={() => setIsStorageOpen(false)}
          />
          <IonGrid fixed>
            <IonRow>
              {/* <IonCol size="12">
                <TerraTimeAverageMap
                  style={{
                    height: "300px",
                  }}
                  collection="M2T1NXAER_5_12_4"
                  variable="BCCMASS"
                  start-date="01/01/2009"
                  end-date="01/05/2009"
                  location="62,5,95,40"
                  bearer-token="YOUR_BEARER_TOKEN"
                ></TerraTimeAverageMap>
              </IonCol> */}
              <IonCol size="12">
                {/* The start date for the time series plot. (ex: 2021-01-01) */}

                <TerraTimeSeries
                  // onTerraDateRangeChange={timeSeriesDateRangeChangeHandler}
                  onTerraTimeSeriesDataChange={timeSeriesDataChangeHandler}
                  variableEntryId={ctxParams.variable}
                  // start-date={ctxParams.begin_time.replace(
                  //   /(\d{4})-(\d{2})-(\d{2}).*/,
                  //   "$2/$3/$1"
                  // )}
                  // end-date={ctxParams.end_time.replace(
                  //   /(\d{4})-(\d{2})-(\d{2}).*/,
                  //   "$2/$3/$1"
                  // )}
                  start-date={formatUtcDate(ctxParams.begin_time)}
                  end-date={formatUtcDate(ctxParams.end_time)}
                  // start-date={formatToDate(ctxParams.begin_time)}
                  // end-date={formatToDate(ctxParams.end_time)}
                  location={`${ctxParams.lat},${ctxParams.lon}`}
                ></TerraTimeSeries>
              </IonCol>
              <IonCol size="12">
                {
                  <Slider
                    onLeftBtnClick={sliderLeftBtnHandler}
                    onRightBtnClick={sliderRightBtnHandler}
                    value={sliderValue}
                    max={stateData.length - 1}
                    min={0}
                    onValueChange={sliderValueChangeHandler}
                    pinFormatter={(index: number) =>
                      stateData[index]?.timestamp
                        ? `${stateData[index].timestamp}, ${stateData[index].value}`
                        : ""
                    }
                    disabled={isEmpty(metadata) && stateData.length === 0}
                    startDate={stateData[0]?.timestamp}
                    endDate={stateData[stateData.length - 1]?.timestamp}
                  />
                }
              </IonCol>
              {!isEmpty(metadata) && stateData.length !== 0 && (
                <TimeInterval
                  onIntervalChange={(intervalOption) =>
                    setSelectedTimeInterval(intervalOption as TimeIntervalKey)
                  }
                  currentProductTimeInterval={
                    currentProductTimeInterval as TimeIntervalKey
                  }
                  selectedOption={selectedTimeInterval}
                />
              )}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Plot;
