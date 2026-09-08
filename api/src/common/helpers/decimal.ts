import Decimal from 'decimal.js';

// Decimal.js-ийн глобал тохиргоо (Бөөрөнхийлөлт ба нарийвчлал)
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP, // 0.5-аас дээш бол дээшээ бөөрөнхийлнө
});

export class DecimalHelper {
  /**
   * Хоёр тоог нэмэх: a + b
   */
  static add(a: string | number, b: string | number): string {
    return new Decimal(a).plus(new Decimal(b)).toFixed(2);
  }

  /**
   * Хоёр тоог хасах: a - b
   */
  static subtract(a: string | number, b: string | number): string {
    return new Decimal(a).minus(new Decimal(b)).toFixed(2);
  }

  /**
   * Хоёр тоог үржих: a * b
   */
  static multiply(a: string | number, b: string | number): string {
    return new Decimal(a).times(new Decimal(b)).toFixed(2);
  }

  /**
   * Тоог хуваах: a / b
   */
  static divide(a: string | number, b: string | number): string {
    const divisor = new Decimal(b);
    if (divisor.isZero()) {
      throw new Error('0-д хувааж болохгүй');
    }
    return new Decimal(a).dividedBy(divisor).toFixed(2);
  }

  /**
   * Хувь бодох (Жишээ нь: 100,000-аас 10% НӨАТ = 10,000)
   */
  static percentage(amount: string | number, percent: string | number): string {
    return new Decimal(amount)
      .times(new Decimal(percent))
      .dividedBy(100)
      .toFixed(2);
  }

  /**
   * Тоог мөнгөн дүнгээр форматлах (Жишээ нь: 1234567.89 -> "1,234,567.89 ₮")
   */
  static formatCurrency(
    amount: string | number,
    currencySymbol: string = '₮',
    locale: string = 'mn-MN',
  ): string {
    const numericValue = new Decimal(amount).toNumber();
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);

    return `${formatted} ${currencySymbol}`;
  }

  /**
   * Бааз руу хадгалах зорилгоор Decimal объект болгож авах
   */
  static toDecimal(amount: string | number): Decimal {
    return new Decimal(amount);
  }
}
