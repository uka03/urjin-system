import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
export class DateHelper {
  private static readonly DEFAULT_TIMEZONE = 'Asia/Ulaanbaatar';

  static nowUTC(): string {
    return dayjs().utc().toISOString();
  }

  static formatToLocal(date: string, format: string = 'YYYY-MM-DD'): string {
    return dayjs(date).tz(this.DEFAULT_TIMEZONE).format(format);
  }

  static addDate(
    date: string | Date,
    amount: number,
    unit: dayjs.ManipulateType,
  ): Date {
    return dayjs(date).add(amount, unit).toDate();
  }
  static diff(fromDate: string | Date, toDate: Date = new Date()): number {
    return dayjs(toDate).diff(dayjs(fromDate));
  }
}
