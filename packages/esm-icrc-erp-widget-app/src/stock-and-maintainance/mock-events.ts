import { formatInventoryData, formatMaintenanceData } from '../helpers';

export const mockInventoryResponse = [
  {
    id: 1,
    name: 'Annual Inventory',
    display: 'Annual Inventory',
    date: '2021-12-31T05:00:15.000-0500',
    resourceVersion: '1.8',
  },
  {
    id: 2,
    name: 'First Quarter Inventory',
    display: 'First Quarter Inventory',
    date: '2022-03-31T11:00:20.000-0400',
    resourceVersion: '1.8',
  },
  {
    id: 3,
    name: 'Second Quarter Inventory',
    display: 'Second Quarter Inventory',
    date: '2022-06-30T12:00:20.000-0400',
    resourceVersion: '1.8',
  },
];

export const mockMaintenanceResponse = [
  {
    id: 1,
    name: 'Upper Left Limb Repair',
    display: 'Upper Left Limb Repair',
    equipment: {
      display: 'Upper Left Limb',
      name: 'Upper Left Limb',
      location: 'Repair House 1',
      id: 101,
      category: {
        categoryName: 'prosthesis',
        categoryId: 201,
      },
      serialNo: 'ULL',
    },
    requestDate: '2022-06-28',
    scheduleDate: '2022-06-28T07:00:15.000-0400',
    duration: 1.0,
    resourceVersion: '1.8',
  },
  {
    id: 2,
    name: 'Lower Left Limb Repair',
    display: 'Lower Left Limb Repair',
    equipment: {
      display: 'Lower Left Limb',
      name: 'Lower Left Limb',
      location: 'Repair House 2',
      id: 102,
      category: {
        categoryName: 'orthesis',
        categoryId: 202,
      },
      serialNo: 'LLL',
    },
    requestDate: '2022-06-29',
    scheduleDate: '2022-06-29T12:00:20.000-0400',
    duration: 2.0,
    resourceVersion: '1.8',
  },
];

export const inventoryData = mockInventoryResponse.map((inventory) => formatInventoryData(inventory));
export const maintenanceData = mockMaintenanceResponse.map((maintenace) => formatMaintenanceData(maintenace));

export const mockedEvents = [...inventoryData, ...maintenanceData];
