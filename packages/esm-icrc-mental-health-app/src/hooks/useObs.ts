import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, FHIRResource } from '@openmrs/esm-framework';

export const pageSize = 999;

export function useObs(patientUuid: string, concept: Array<string>, values: Array<string>): UseObsResult {
  const {
    data: result,
    error,
    isValidating,
  } = useSWR<{ data: ObsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${concept.toString()}&value-concept=${values.toString()}&_count=${pageSize}`,
    openmrsFetch,
  );

  const observations =
    result?.data?.entry?.map((entry) => {
      const observation = {
        uuid: entry.resource.id,
        date: entry.resource.effectiveDateTime,
        code: entry.resource.valueCodeableConcept.coding[0].code,
        display: entry.resource.valueCodeableConcept.coding[0].display,
      };

      return observation;
    }) ?? [];

  return {
    data: observations,
    error: error,
    isLoading: !result && !error,
    isValidating,
  };
}

interface ObsFetchResponse {
  entry: Array<{
    resource: FHIRResource['resource'];
  }>;
  id: string;
  meta: {
    lastUpdated: string;
  };
  resourceType: string;
  total: number;
  type: string;
}

export interface UseObsResult {
  data: Array<SimpleObsResult>;
  error: Error;
  isLoading: boolean;
  isValidating: boolean;
}

type SimpleObsResult = {
  date: Date;
  uuid: string;
  code: string;
  display: string;
};
