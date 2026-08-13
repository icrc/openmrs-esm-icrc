import useSWR from 'swr';
import { openmrsFetch, useSession, usePatient, formatDate, useConfig } from '@openmrs/esm-framework';
import { LastVisit, ServerAttachments, ServerVisit } from '../config-schema';

export function useLastVisits() {
  const config = useConfig();
  const currentUserSession = useSession();
  const sessionLocation = currentUserSession?.sessionLocation?.uuid;
  const patientUuid = usePatient().patientUuid;

  const customRepresentation =
    'custom:(uuid,startDatetime,stopDatetime,visitType:(uuid),encounters:(uuid,encounterDatetime,form:(uuid,display)))' +
    '&patient=' +
    patientUuid +
    '&location=' +
    sessionLocation;
  const url = `/ws/rest/v1/visit?includeInactive=true&limit=${config.numberOfLastVisits + 1}&v=${customRepresentation}`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<ServerVisit> } }, Error>(
    sessionLocation ? url : null,
    openmrsFetch,
  );

  const mapVisitProperties = (serverVisit: ServerVisit): LastVisit => ({
    id: serverVisit.uuid,
    from: formatDate(new Date(serverVisit.startDatetime), { time: false }),
    to: serverVisit.stopDatetime ? formatDate(new Date(serverVisit.stopDatetime), { time: false }) : null,
    encounters: serverVisit.encounters
      .filter((encounter) => {
        return encounter.form;
      })
      .map((encounter) => {
        return {
          uuid: encounter.uuid,
          formUuid: encounter.form.uuid,
          name: encounter.form.display,
          encounterDate: formatDate(new Date(encounter.encounterDatetime), { time: false }),
        };
      }),
    attachments: [],
    visitType: serverVisit.visitType,
    startDatetime: serverVisit.startDatetime,
    uuid: serverVisit.uuid,
  });

  const formattedLastVisits = data?.data?.results.length
    ? data.data.results
        .slice(
          data.data.results[0].stopDatetime ? 0 : 1,
          data.data.results[0].stopDatetime ? config.numberOfLastVisits : config.numberOfLastVisits + 1,
        )
        .map(mapVisitProperties)
    : [];

  return {
    lastVisits: formattedLastVisits,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export function fetchAttachmentByVisit(abortController: AbortController, visitUuid: string, patientUuid: string) {
  const customRepresentation = (patientUuid: string, visitUuid: string): string => {
    return `&patient=${patientUuid}&visit=${visitUuid}`;
  };
  const url = `/ws/rest/v1/attachment?includeInactive=false${customRepresentation(patientUuid, visitUuid)}`;

  return openmrsFetch<ServerAttachments>(url, {
    signal: abortController.signal,
  });
}
