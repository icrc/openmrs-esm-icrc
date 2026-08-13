import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useForms() {
  const { data, error, isValidating } = useSWR<{ data: { results: Array<any> } }, Error>(
    `/ws/rest/v1/form?v=custom:(uuid,name,display,encounterType:(uuid,name,viewPrivilege,editPrivilege),version,published,retired,resources:(uuid,name,dataType,valueReference))`,
    openmrsFetch,
  );

  return {
    forms: data ? data?.data?.results : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}
