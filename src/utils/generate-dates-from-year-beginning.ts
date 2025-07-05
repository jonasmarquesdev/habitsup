import dayjs from 'dayjs';

export function generateDatesFromYearBeginning() {
  const firstDayOfTheYear = dayjs().utc().startOf('year');
  const today = dayjs().utc().startOf('day');

  const dates = [];
  let compareDate = firstDayOfTheYear;

  while (compareDate.isBefore(today) || compareDate.isSame(today, 'day')) {
    dates.push(compareDate.toDate());
    compareDate = compareDate.add(1, 'day');
  }

  return dates;
}

export function generateDatesFromMonth(year: number, month: number) {
  const firstDayOfMonth = dayjs().year(year).month(month).startOf('month').utc();
  const lastDayOfMonth = dayjs().year(year).month(month).endOf('month').utc();
  const today = dayjs().utc().startOf('day');

  const dates = [];
  let compareDate = firstDayOfMonth;

  // Só incluir datas até hoje se for o mês atual
  const endDate = lastDayOfMonth.isBefore(today) ? lastDayOfMonth : today;

  while (compareDate.isBefore(endDate) || compareDate.isSame(endDate, 'day')) {
    dates.push(compareDate.toDate());
    compareDate = compareDate.add(1, 'day');
  }

  return dates;
}