import dayjs from 'dayjs';

export function generateDatesFromYearBeginning() {
  const firstDayOfTheYear = dayjs().utc().startOf('year'); // Fixed: use UTC and 'year'
  const today = dayjs().utc().startOf('day');

  const dates = [];
  let compareDate = firstDayOfTheYear;

  while (compareDate.isBefore(today) || compareDate.isSame(today, 'day')) {
    dates.push(compareDate.toDate());
    compareDate = compareDate.add(1, 'day');
  }

  return dates;
}