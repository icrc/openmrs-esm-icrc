import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export function usePatientEncounters(patientUuid: string, fromDate: Date): UsePatientEncountersResult {
  const customRepresentation =
    'custom:(uuid,encounterDatetime,' +
    'obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display)),value),' +
    'form:(uuid,name),' +
    'encounterType:(uuid,display))';

  const {
    data: result,
    error,
    isValidating,
  } = useSWR<{ data: any }, Error>(
    `/ws/rest/v1/encounter?patient=${patientUuid}&fromdate=${fromDate?.toISOString()}&v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    encounters:
      result?.data?.results?.map((enc: any) => ({
        ...enc,
        encounterDatetime: new Date(enc.encounterDatetime),
      })) ?? [],
    error: error,
    isLoading: !result && !error,
    isValidating,
  };
}

export interface SimpleEncounterResult {
  uuid: string;
  encounterDatetime: Date;
  obs: Array<{
    uuid: string;
    concept: { uuid: string; display: string; conceptClass: { uuid: string; display: string } };
    display: string;
    groupMembers: Array<{
      uuid: string;
      concept: { uuid: string; display: string };
      value: { uuid: string; display: string } | string | number | null;
    }>;
    value: { uuid: string; display: string };
  }>;
  form: { uuid: string; name: string } | null;
  encounterType: { uuid: string; display: string } | null;
}

export interface UsePatientEncountersResult {
  encounters: SimpleEncounterResult[];
  error: Error;
  isLoading: boolean;
  isValidating: boolean;
}
