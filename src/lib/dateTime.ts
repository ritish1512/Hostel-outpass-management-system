const IST_OFFSET_MINUTES = 5 * 60 + 30;

export function parseDateTimeLocalAsIST(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);

  if (!match) {
    throw new Error("Invalid date format provided.");
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const wallClockDate = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  ));

  if (
    wallClockDate.getUTCFullYear() !== Number(year) ||
    wallClockDate.getUTCMonth() !== Number(month) - 1 ||
    wallClockDate.getUTCDate() !== Number(day) ||
    wallClockDate.getUTCHours() !== Number(hour) ||
    wallClockDate.getUTCMinutes() !== Number(minute) ||
    wallClockDate.getUTCSeconds() !== Number(second)
  ) {
    throw new Error("Invalid date format provided.");
  }

  return new Date(wallClockDate.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
}

export function formatDateTimeInIST(value: Date | string): string {
  return new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

export function formatDateTimeLocalInIST(value: Date | string): string {
  const offset = IST_OFFSET_MINUTES * 60 * 1000;
  const gnTime = new Date(value).getTime();
  const crnt = gnTime + offset;
  const crntObj = new Date(crnt);
  const res = crntObj.toISOString().slice(0,16);
  return res;
  // const parts = new Intl.DateTimeFormat("en-GB", {
  //   timeZone: "Asia/Kolkata",
  //   year: "numeric",
  //   month: "2-digit",
  //   day: "2-digit",
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   hourCycle: "h23",
  // }).formatToParts(new Date(value));
  // const values = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  // return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function formatDateInIST(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}