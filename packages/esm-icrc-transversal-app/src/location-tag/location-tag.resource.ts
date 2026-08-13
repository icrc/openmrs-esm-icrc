import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Identifier } from '../config-schema';
import { hsuIdType } from '../constants';

export function useHsuIdIdentifier(patientUuid: string) {
  const url = `ws/rest/v1/patient/${patientUuid}/identifier`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<Identifier> } }, Error>(url, openmrsFetch);

  const hsuIdentifier = data?.data?.results.length
    ? data.data.results.find((id: Identifier) => id.identifierType.uuid == hsuIdType)
    : undefined;

  return {
    hsuIdentifier: hsuIdentifier,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
