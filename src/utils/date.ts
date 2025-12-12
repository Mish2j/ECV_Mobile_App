import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { isValid, format } from "date-fns";

dayjs.extend(utc);
const NO_MILLIS_UTC_STRING = "YYYY-MM-DDTHH:mm:ss[Z]";
const UTC_STRING = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";

export function toLocalShortDateTime(str: string | number | Date): string {
  return dayjs(str).format("YYYY-MM-DD HH:mm");
}

export function toStartOfDay(str: string | number | Date): string {
  return dayjs(str).startOf("day").format("YYYY-MM-DD[T]HH:mm:ss");
}

// Format as YYYY-MM-DD if value exists
export function formatToDate(dateStr: string | null) {
  return dateStr ? new Date(dateStr).toISOString().split("T")[0] : undefined;
}

type MaybeDate = string | number | Date;
export function getUTCDate(date: MaybeDate, endOfDay = false) {
  let utcDate: Date;

  if (date instanceof Date) {
    utcDate = new Date(date.getTime());
  } else if (typeof date === "string") {
    utcDate = new Date(date);
  } else if (typeof date === "number") {
    utcDate = new Date(date);
  } else {
    utcDate = new Date();
  }

  // Convert to UTC by adjusting for timezone offset
  const offset = utcDate.getTimezoneOffset();
  utcDate = new Date(utcDate.getTime() + offset * 60000);

  if (endOfDay) {
    utcDate.setUTCHours(23, 59, 59, 999);
  }

  return utcDate;
}

type AllDates = string | number | Date | Dayjs | Date;

export function normalizeToUTC(input: AllDates): string {
  return dayjs(input).utc().format(NO_MILLIS_UTC_STRING);
}

// TODO: change argument
export function getUTCStartOfDay(value: AllDates): string {
  return dayjs(value).utc().startOf("day").format(NO_MILLIS_UTC_STRING);
}

export function getUTCEndOfDay(value: AllDates) {
  return dayjs(value).utc().endOf("day").format(NO_MILLIS_UTC_STRING);
}

// export function isValidUTC(value: AllDates) {
//   return dayjs(value).isUTC();
// }

export function toLocalYMD(value: AllDates) {
  return dayjs.utc(value).local().format("YYYY-MM-DD");
}

export function isValidUTC(value: string): boolean {
  const formats = [NO_MILLIS_UTC_STRING, UTC_STRING];

  // Try each format strictly
  for (const format of formats) {
    if (dayjs.utc(value, format, true).isValid()) {
      // Also ensure it literally ends with Z
      const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      if (regex.test(value)) return true;
    }
  }

  return false;
}

console.log(toLocalShortDateTime("2019-12-01T00:00:00Z"));
console.log(toStartOfDay("2019-12-01T00:00:00Z"));
console.log(formatToDate("2019-12-01T00:00:00Z"));
console.log(getUTCDate("2019-12-01T00:00:00Z"));
console.log(normalizeToUTC("2019-12-01T00:00:00Z"));
console.log(getUTCStartOfDay("2019-12-01T00:00:00Z"));
console.log(getUTCEndOfDay("2019-12-01T00:00:00Z"));
console.log(toLocalYMD("2019-12-01T00:00:00Z"));

// console.log(toStartOfDay("2025-05-16 23:30:00"));
// console.log(toStartOfDay("2025-05-16 03:30:00"));
// console.log(toStartOfDay("2025-05-16 13:30:00"));
// console.log(toStartOfDay("2025-05-16 00:30:00"));
// console.log(toStartOfDay("2025-05-16 23:59:59"));

/**
 * Converts an ISO datetime string (ending in Z)
 * to a YYYY-MM-DD date string in UTC.
 */
export function formatUtcDate(input: string): string {
  return dayjs.utc(input).format("YYYY-MM-DD");
}

/**
 * formats a date using date-fns format patterns
 * See https://date-fns.org/v3.6.0/docs/format for available formatting options
 */
export function formatDate(date: MaybeDate, formatString?: string) {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (typeof date === "number") {
    dateObj = new Date(date);
  } else {
    dateObj = new Date();
  }

  // Default format if none provided
  const defaultFormat = "yyyy-MM-dd";
  return format(dateObj, formatString || defaultFormat);
}

// console.log(formatDate("2020-01-01T07:30:00Z", "yyyy-MM-dd"));
// console.log(formatDate("2020-01-01T01:30:00Z", "yyyy-MM-dd"));
// console.log(formatDate("2020-01-01T23:59:59Z", "yyyy-MM-dd"));
// console.log("----------- UTC -----------");
// console.log(getUTCDate("2019-12-31"));
// console.log(getUTCDate("2019-12-31", true));
// console.log(getUTCDate("2020-01-01", true));
