
export function inToday(time: number) {
  if (!time) return false
  return new Date(time).toDateString() === new Date().toDateString();
}

export function inYesterday(time: number) {
  if (!time) return false
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);
  const test = new Date(time);
  return yesterday.getFullYear() === test.getFullYear() && yesterday.getMonth() === test.getMonth() && yesterday.getDate() === test.getDate();
}

export const Second = 1000;
export const Minute = 60 * Second;
export const Hour = 60 * Minute;
export const Day = 24 * Hour;

export function dateStr2Time(dateStr: string) {
  const days = Number(dateStr.split(" ")[0])
  const timeStr = dateStr.split(" ")[1]
  const hours = Number(timeStr.split(":")[0])
  const minutes = Number(timeStr.split(":")[1])
  const seconds = Number(timeStr.split(":")[2])

  return seconds * Second + minutes * Minute +
    hours * Hour + days * Day;
}

export function time2DateStr(time: number) {
  if (!time) return "";

  const date = new Date(time);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function time2TimeStr(time: number) {
  if (!time) return "";

  const date = new Date(time);
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");

  return `${hour}:${minute}:${second}`;
}

export function time2Str(time: number, separator = "/") {
  if (!time) return "";

  const date = new Date(time);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");

  return `${year}${separator}${month}${separator}${day} ${hour}:${minute}:${second}`;
}

export function startMillsOfDay(year: number, month: number, day: number) {
  const d = new Date(year, month, day, 0, 0, 0)
  return d.getTime()
}
export function str2Date(timeStr: string): Date {
  let [date, time] = timeStr.split(" ");
  let [year, month, day] = date.split("/");
  let [hour, minute, second] = time.split(":");

  return new Date(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second));
}

export function str2Timestamp(timeStr: string): number {
  return str2Date(timeStr).valueOf();
}

export function sec2Str(sec: number) {
  if (sec == null) return "";
  sec = Math.round(sec);
  const minStr = Math.floor(sec / 60).toString().padStart(2, "0");
  const secStr = (sec % 60).toString().padStart(2, "0");
  return `${minStr}:${secStr}`;
}

export function date2DayStart(date: Date | number) {
  let res = new Date(date)
  res.setHours(0, 0, 0, 0);
  return res;
}

export function isToday(date: Date | number) {
  return dayDiff(new Date(), date) == 0;
}

export function dayDiff(date1: Date | number, date2: Date | number) {
  if (typeof date1 == 'number' && date1 <= 0)
    return Number.NEGATIVE_INFINITY;
  if (typeof date2 == 'number' && date2 <= 0)
    return Number.POSITIVE_INFINITY;

  const day1 = date2DayStart(date1).getTime();
  const day2 = date2DayStart(date2).getTime();

  return (day1 - day2) / Day;
}

export function diff2Time(diff: number) {
  const days = Math.floor(diff / Day);
  const hours = Math.floor(diff % Day / Hour);
  const minute = Math.floor(diff % Hour / Minute);
  const seconds = Math.floor(diff % Minute / Second);

  return [days, hours, minute, seconds]
}

