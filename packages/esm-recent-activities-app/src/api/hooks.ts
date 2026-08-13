import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export function useUserProperty(userUuid: string, property: string) {
  const { data, error, isValidating } = useSWR<{ data }, Error>(`/ws/rest/v1/user/${userUuid}`, openmrsFetch);

  return {
    property: data ? data?.data?.userProperties[String(property)] : null,
    isError: error,
    isLoading: !data && !error,
    isValidating: isValidating,
  };
}

export function useEncounter(encounterUuid: string) {
  const customRepresentation =
    'custom:(uuid,display,encounterDatetime,patient:(id,uuid,display),encounterType:(uuid,display),visit:(uuid,visitType:(uuid)),form:(uuid,display))';
  const { data, error, isValidating } = useSWR<{ data }, Error>(
    `/ws/rest/v1/encounter/${encounterUuid}?v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    encounter: data ? data?.data : [],
    isError: error,
    isLoading: !data && !error,
    isValidating: isValidating,
  };
}
