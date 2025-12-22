import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

type AllDateTypes = string | number | Date | Dayjs;

const NO_MILLIS_UTC_STRING = "YYYY-MM-DDTHH:mm:ss[Z]";
const UTC_STRING = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";

export function toLocalShortDateTime(date: string | number | Date): string {
  return dayjs(date).format("YYYY-MM-DD HH:mm");
}

export function toStartOfDay(date: string | number | Date): string {
  return dayjs(date).startOf("day").format("YYYY-MM-DD[T]HH:mm:ss");
}

export function getDate(date: string | number | Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

export function getUTCStartOfDay(date: AllDateTypes): string {
  return dayjs(date).utc().startOf("day").format(NO_MILLIS_UTC_STRING);
}

/**
 *
 * @param date
 * @returns boolean
 *
 *  @summary checks if datetime is in UTC format ("YYYY-MM-DDTHH:mm:ss[Z]" or "YYYY-MM-DDTHH:mm:ss.SSS[Z]")
 *
 */
export function isValidUTC(date: string): boolean {
  const formats = [NO_MILLIS_UTC_STRING, UTC_STRING];

  for (const format of formats) {
    if (dayjs.utc(date, format, true).isValid()) {
      const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      if (regex.test(date)) return true;
    }
  }

  return false;
}
