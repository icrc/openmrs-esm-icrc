import { fhirBaseUrl, openmrsFetch, useSession } from '@openmrs/esm-framework';
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

interface IdentifierExtension {
  url: string;
  valueReference: {
    reference: string;
    type: string;
    display: string;
  };
}

interface PatientIdentifier {
  id: string;
  extension?: Array<IdentifierExtension>;
  use: string;
  type: {
    coding: Array<{ code: string }>;
    text: string;
  };
  value: string;
}

interface FhirPatient {
  id: string;
  identifier?: Array<PatientIdentifier>;
}

export type RegistrationPeriod = 'today' | 'yesterday' | 'threeDays' | 'week';

function getPeriodStart(period: RegistrationPeriod) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (period === 'yesterday') {
    date.setDate(date.getDate() - 1);
  } else if (period === 'threeDays') {
    date.setDate(date.getDate() - 3);
  } else if (period === 'week') {
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  }
  return date;
}

export function useRecentlyRegisteredPatients(period: RegistrationPeriod) {
  const locationUuid = useSession()?.sessionLocation?.uuid;
  const url = `${fhirBaseUrl}/Patient?_lastUpdated=ge${getPeriodStart(period).toISOString()}&_sort=-_lastUpdated&_count=100`;
  const { data, error } = useSWR<{ data: { entry?: Array<{ resource: FhirPatient }> } }, Error>(
    locationUuid ? url : null,
    openmrsFetch,
  );

  return {
    patientUuids: data
      ? (data.data.entry ?? [])
          .map(({ resource }) => resource)
          .filter((patient) =>
            patient.identifier?.some((identifier) =>
              identifier.extension?.some(
                (extension) =>
                  extension.url?.endsWith('identifier#location') &&
                  extension.valueReference?.reference === `Location/${locationUuid}`,
              ),
            ),
          )
          .map((patient) => patient.id as string)
      : [],
    isError: error,
    isLoading: !data && !error,
  };
}
