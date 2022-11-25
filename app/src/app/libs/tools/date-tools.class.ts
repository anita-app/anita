export class DateTools {
  public static getUtcIsoString (date: Date = new Date()): string {
    return new Date(date.toUTCString()).toISOString()
  }

  public static areEqual (date1: Date | string | undefined, date2: Date | string | undefined): boolean {
    const d1 = new Date(date1 || 0)
    const d2 = new Date(date2 || 0)
    return d1.getTime() === d2.getTime()
  }

  public static firstIsAfterSecond (date1: Date | string | undefined, date2: Date | string | undefined): boolean {
    const d1 = new Date(date1 || 0)
    const d2 = new Date(date2 || 0)
    return d1.getTime() > d2.getTime()
  }
}
