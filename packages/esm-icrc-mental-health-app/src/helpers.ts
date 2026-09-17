import dayjs from 'dayjs';

export function isObsDateBetweenAssessmentAndClosureEncounters(
  date: Date,
  lastAssessmentDate: Date,
  lastClosureDate: Date,
) {
  if (!lastClosureDate) {
    return dayjs(date).isAfter(dayjs(lastAssessmentDate)) || dayjs(date).isSame(dayjs(lastAssessmentDate));
  }

  if (dayjs(lastAssessmentDate).isAfter(dayjs(lastClosureDate))) {
    return dayjs(date).isAfter(dayjs(lastAssessmentDate)) || dayjs(date).isSame(dayjs(lastAssessmentDate));
  }

  return isBetweenDates(date, lastAssessmentDate, lastClosureDate);
}

export function isBetweenDates(date: Date, minDate: Date, maxDate: Date) {
  return (
    (dayjs(date).isAfter(dayjs(minDate)) || dayjs(date).isSame(dayjs(minDate))) &&
    (dayjs(date).isBefore(dayjs(maxDate)) || dayjs(date).isSame(dayjs(maxDate)))
  );
}

export function isObjectEmpty(obj: any) {
  return !Object.values(obj).some(isNotEmpty);
}

const isNotEmpty = (element) => element.length > 0;
