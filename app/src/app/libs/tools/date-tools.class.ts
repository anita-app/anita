export class DateTools {
  public static getUtcIsoString (date: Date = new Date()): string {
    return new Date(date.toUTCString()).toISOString()
  }
}
