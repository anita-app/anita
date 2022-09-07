import { MONTHS } from './months.const';
import { YassbDirective, YassbDirectiveProps, YassbDirectiveResponse } from 'yassb-web';
import { YassbBaseDirective } from 'yassb-web/tools';

export class DateFormatterDirective extends YassbBaseDirective implements YassbDirective {

  /**
   * The ISO string date to be formatted
   */
  private isoDateToFormat: string;

  /**
   * Format provided by the user
   */
  private format: string;

  /**
   * The date to format as a date object
   */

  /**
   * The formatted date
   */
  private formattedDate: string;

  /**
   * Regex to match the comments to invoke the directive
   */
  public static regex: RegExp = /<!--\s*date-formatter\s*=\s*".+"\s*-->/g;

  /**
   * Creates an instance of the Class and calls `super` so YassbBaseDirective assigns the args to the protected properties.
   * @param args
   */
  constructor(args: YassbDirectiveProps) {
    super(args);
  }

  /**
   * Inits the directive and calls the date formatter.
   * @returns init 
   */
  public init(): YassbDirectiveResponse {
    this.setIsoDateToFormat();
    this.setFormatIfNeeded();
    this.formatDate();
    this.replaceDirectiveFullStringWithFormattedDate();
    return { html: this.fileContents, data: {} };
  }

  /**
   * Sets this.isoDateToFormat reading the date string from the directive
   */
  private setIsoDateToFormat(): void {
    this.isoDateToFormat = this.directiveFullString.split('date-formatter="')[1].split('"')[0];
  }

  /**
   * Sets this.format by calling this.setFormat() if this.hasFormat() is true, else defaults to "YYYY-MM-DD"
   */
  private setFormatIfNeeded(): void {
    if (this.hasFormat())
      this.setFormat();
    else
      this.format = 'YYYY-MM-DD';
  }

  /**
   * Checks if this.directiveFullString includes the strinf "format" twice
   */
  private hasFormat(): boolean {
    return this.directiveFullString.split('format').length > 2;
  }

  /**
   * Sets this.format reading the format string from the directive
   */
  private setFormat(): void {
    this.format = this.directiveFullString.split('format="')[1].split('"')[0];
  }

  /**
   * Create a new instance of DateFormatter and set this.formattedDate to the formatted date
   */
  private formatDate(): void {
    this.formattedDate = new DateFormatter(this.isoDateToFormat, this.format).doFormat();
  }

  /**
   * Replaces the directiveFullString with the formatted date and assigns it to fileContents
   */
  private replaceDirectiveFullStringWithFormattedDate(): void {
    this.fileContents = this.fileContents.replace(this.directiveFullString, this.formattedDate);
  }

}

export class DateFormatter {

  /**
   * The date to format as a date object
   */
  private dateObject: Date;

  /**
   * The formatted date
   */
  private formattedDate: string;

  /**
   * Creates an instance of the Class
   * @param isoDateToFormat the ISO string date to be formatted
   * @param format the format provided by the user
   */
  constructor(
    private isoDateToFormat: string,
    private format: string
  ) { }

  /**
   * Inits the directive and calls the date formatter.
   */
  public doFormat(): string {
    this.setDateObject();
    this.doFormatDateWithFormat();
    return this.formattedDate;
  }

  /**
   * Converts isoDateToFormat to a date object and sets it to this.dateObject
   */
  private setDateObject(): void {
    this.dateObject = new Date(this.isoDateToFormat);
  }

  /**
   * Replaces the values in this.format with the year, month and day values of this.dateObject and assigns the final value to formattedDate
   */
  private doFormatDateWithFormat(): void {
    this.formattedDate = this.format.replace('YYYY', this.dateObject.getFullYear().toString());
    this.formattedDate = this.formattedDate.replace('MM', (this.dateObject.getMonth() + 1).toString());
    this.formattedDate = this.formattedDate.replace('month', MONTHS[this.dateObject.getMonth()]);
    this.formattedDate = this.formattedDate.replace('DD', this.dateObject.getDate().toString());
  }

}

