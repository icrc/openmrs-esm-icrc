import { useMemo } from 'react';
import useSWR from 'swr';

import { openmrsFetch } from '@openmrs/esm-framework';
import { MaintenanceResponse, Inventory } from '../types';
import { formatInventoryData, formatMaintenanceData } from '../helpers';

export function useMaintenances() {
  const apiUrl = `/ws/rest/v1/erp/maintenancerequest`;

  const { data, error, isValidating, mutate } = useSWR<{ data: { results: Array<MaintenanceResponse> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const maintenances = data?.data?.results?.map((maintenace) => formatMaintenanceData(maintenace));

  const results = useMemo(
    () => ({
      maintenances: maintenances?.length ? maintenances : [],
      isLoading: !data && !error,
      isError: error,
      isValidating,
      mutate,
    }),
    [error, isValidating, mutate, data, maintenances],
  );
  return results;
}

export function useInventories() {
  const apiUrl = `/ws/rest/v1/erp/inventoryadjustment`;

  const { data, error, isValidating, mutate } = useSWR<{ data: { results: Array<Inventory> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const inventoriesData = data?.data?.results?.map((inventory) => formatInventoryData(inventory));

  const results = useMemo(
    () => ({
      inventories: inventoriesData?.length ? inventoriesData : [],
      isLoading: !data && !error,
      isError: error,
      isValidating,
      mutate,
    }),
    [error, isValidating, mutate, inventoriesData, data],
  );
  return results;
}
