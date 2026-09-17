interface Equipment {
  display: string;
  name: string;
  location: string;
  id: number;
  serialNo: number;
  category: {
    categoryName: string;
    categoryId: number;
  };
}
export interface MaintenanceResponse {
  id: number;
  name: string;
  display: string;
  equipment: Equipment;
  requestDate: string;
  scheduleDate: string;
  duration?: string | number;
  resourceVersion?: string;
}

export interface Inventory {
  id: number;
  name: string;
  display: string;
  resourceVersion?: string;
}
