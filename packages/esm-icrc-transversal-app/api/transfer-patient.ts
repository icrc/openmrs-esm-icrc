import { openmrsFetch } from '@openmrs/esm-framework';
export const restBaseUrl = '/ws/rest/v1';
export const transferPatientEndpoint = `${restBaseUrl}/transfer-patient`;

export async function transferPatient(
  patientUuid: string,
  locationUuid: string,
  abortController: AbortController,
): Promise<any> {
  return openmrsFetch(transferPatientEndpoint, {
    method: 'POST',
    body: { locationUuid: locationUuid, patientUuid: patientUuid },
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}
