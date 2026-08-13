import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export const pageSize = 100;

const customRepresentation = 'custom:(uuid,display,encounterDatetime,encounterType:(uuid,display)&order=desc&limit=1';

export function useLastEncounter(patientUuid: string, encounterType: string): UseLatestEncountersResult {
  const {
    data: result,
    error,
    isValidating,
  } = useSWR<{ data: any }, Error>(
    `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${encounterType}&fromdate=${new Date(
      0,
    ).toISOString()}&v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    lastEncounter: result?.data?.results?.[0],
    error: error,
    isLoading: !result && !error,
    isValidating,
  };
}

export interface UseLatestEncountersResult {
  lastEncounter: SimpleEncounterResult;
  error: Error;
  isLoading: boolean;
  isValidating: boolean;
}

type SimpleEncounterResult = {
  uuid: string;
  display: string;
  encounterDatetime: Date;
  encounterType: { uuid: string; display: string };
};
