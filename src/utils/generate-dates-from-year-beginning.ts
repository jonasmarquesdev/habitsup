import dayjs from 'dayjs';

export function generateDatesFromYearBeginning() {
  const firstDayOfTheYear = dayjs().startOf('year'); // Fixed: should be 'year', not 'month'
  const today = new Date();

  const dates = [];
  let compareDate = firstDayOfTheYear;

  while (compareDate.isBefore(today)) {
    dates.push(compareDate.toDate());
    compareDate = compareDate.add(1, 'day');
  }

  return dates;
}