import { parseDate, formatDatetime } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

function convertHourstoMinutes(hours) {
  return Math.floor(hours * 60);
}

const getEndDate = (duration, startDate) => {
  const durationMins = convertHourstoMinutes(duration);
  const endDate = dayjs(startDate).add(durationMins).format('MMM DD, YYYY HH:mm');
  return endDate;
};

export const formatInventoryData = (inventory) => {
  const { name, date } = inventory;
  let formattedInventory = {
    name: name,
    fromDateTime: formatDatetime(parseDate(date)),
    toDateTime: '_',
  };
  return formattedInventory;
};

export const formatMaintenanceData = (maintenance) => {
  const { name, requestDate, duration } = maintenance;
  let formattedMaintenance = {
    name: name,
    fromDateTime: formatDatetime(parseDate(requestDate)),
    toDateTime: duration ? getEndDate(duration, requestDate) : '_',
  };
  return formattedMaintenance;
};
