const XDate = require('xdate');
const {parseDate} = require('./interface');

const latinNumbersPattern = /[0-9]/g;

const PersianDateUtils = require('./persian/dateutils');
const {pFormat, pDateDay, pSetLocale, pDiffMonths, sameMonth, month} = PersianDateUtils;

pSetLocale();

// function sameMonth(a, b) {
//   return (
//     a instanceof XDate && b instanceof XDate && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
//   );
// }

function sameDate(a: XDate, b: XDate) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function sameWeek(a: XDate, b: XDate, firstDayOfWeek: number) {
  const weekDates = getWeekDates(a, firstDayOfWeek, 'yyyy-MM-dd');
  return weekDates?.includes(b);
}

function isToday(date: XDate) {
  return sameDate(date, XDate.today());
}

function isGTE(a: XDate, b: XDate) {
  return b.diffDays(a) > -1;
}

function isLTE(a: XDate, b: XDate) {
  return a.diffDays(b) > -1;
}

function formatNumbers(date: any) {
  const numbers = XDate.locales[XDate.defaultLocale].numbers;
  return numbers ? date.toString().replace(latinNumbersPattern, (char: any) => numbers[+char]) : date;
}

function fromTo(a: XDate, b: XDate) {
  const days = [];
  let from = +a,
    to = +b;
  for (; from <= to; from = new XDate(from, true).addDays(1).getTime()) {
    days.push(new XDate(from, true));
  }
  return days;
}

// function month(xd) {
//   const year = xd.getFullYear(),
//     month = xd.getMonth();
//   const days = new Date(year, month + 1, 0).getDate();

//   const firstDay = new XDate(year, month, 1, 0, 0, 0, true);
//   const lastDay = new XDate(year, month, days, 0, 0, 0, true);

//   return fromTo(firstDay, lastDay);
// }

function weekDayNames(firstDayOfWeek = 0) {
  let weekDaysNames = XDate.locales[XDate.defaultLocale].dayNamesShort;
  const dayShift = firstDayOfWeek % 7;
  if (dayShift) {
    weekDaysNames = weekDaysNames.slice(dayShift).concat(weekDaysNames.slice(0, dayShift));
  }
  return weekDaysNames;
}

function page(date: XDate, firstDayOfWeek = 0, showSixWeeks = false, jalali = false) {
  const days = month(date, jalali);
  let before = [],
    after = [];

  const fdow = (7 + firstDayOfWeek) % 7 || 7;
  const ldow = (fdow + 6) % 7;

  firstDayOfWeek = firstDayOfWeek || 0;

  const from = days[0].clone();
  const daysBefore = from.getDay();

  if (from.getDay() !== fdow) {
    from.addDays(-(from.getDay() + 7 - fdow) % 7);
  }

  const to = days[days.length - 1].clone();
  const day = to.getDay();
  if (day !== ldow) {
    to.addDays((ldow + 7 - day) % 7);
  }

  const daysForSixWeeks = (daysBefore + days.length) / 6 >= 6;

  if (showSixWeeks && !daysForSixWeeks) {
    to.addDays(7);
  }

  if (isLTE(from, days[0])) {
    before = fromTo(from, days[0]);
  }

  if (isGTE(to, days[days.length - 1])) {
    after = fromTo(days[days.length - 1], to);
  }

  return before.concat(days.slice(1, days.length - 1), after);
}

function isDateNotInTheRange(minDate: XDate, maxDate: XDate, date: XDate) {
  return (minDate && !isGTE(date, minDate)) || (maxDate && !isLTE(date, maxDate));
}

function getWeekDates(date: XDate, firstDay = 0, format?: string) {
  if (date && parseDate(date).valid()) {
    const current = parseDate(date);
    const daysArray = [current];
    let dayOfTheWeek = current.getDay() - firstDay;
    if (dayOfTheWeek < 0) {
      // to handle firstDay > 0
      dayOfTheWeek = 7 + dayOfTheWeek;
    }

    let newDate = current;
    let index = dayOfTheWeek - 1;
    while (index >= 0) {
      newDate = parseDate(newDate).addDays(-1);
      daysArray.unshift(newDate);
      index -= 1;
    }

    newDate = current;
    index = dayOfTheWeek + 1;
    while (index < 7) {
      newDate = parseDate(newDate).addDays(1);
      daysArray.push(newDate);
      index += 1;
    }

    if (format) {
      return daysArray.map(d => d.toString(format));
    }

    return daysArray;
  }
}

export {
  weekDayNames,
  sameMonth,
  sameWeek,
  sameDate,
  month,
  page,
  fromTo,
  isToday,
  isLTE,
  isGTE,
  isDateNotInTheRange,
  getWeekDates,
  pDiffMonths,
  pFormat,
  pDateDay,
  formatNumbers
};