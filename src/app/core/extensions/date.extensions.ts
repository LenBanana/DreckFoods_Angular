export function formatLocalISO(date: Date): string {
  const timeZoneOffset = date.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
  console.log("Time Zone Offset in hours:", date.getTimezoneOffset() / 60);
  date = new Date(date.getTime() - timeZoneOffset); // Adjust date to local time
  return date.toISOString();
}