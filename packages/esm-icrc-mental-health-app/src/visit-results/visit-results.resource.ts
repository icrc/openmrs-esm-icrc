import useSWR from 'swr';
import { openmrsFetch, Visit } from '@openmrs/esm-framework';
import type { ObsUuid } from '@openmrs/esm-patient-common-lib';

export function useVisitResults(patientUuid: string, encounterTypes: Array<string>, obsUuids: Array<ObsUuid>) {
  let allEncounter = [];

  const customRepresentation =
    'custom:(uuid,encounters:(uuid,form:(uuid,display),encounterDatetime,' +
    'orders:full,' +
    'obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),' +
    'display,groupMembers:(uuid,concept:(uuid,display),' +
    'value:(uuid,display)),value),encounterType:(uuid,display),' +
    'encounterProviders:(uuid,display,encounterRole:(uuid,display),' +
    'provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,patient';

  const { data, error, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    `/ws/rest/v1/visit?patient=${patientUuid}&v=${customRepresentation}&endDatetime=null`,
    openmrsFetch,
  );

  //Group encounters
  data?.data.results.forEach(({ encounters }) => {
    if (encounters.length > 0) {
      encounters.forEach((encounter) => {
        allEncounter.push(encounter);
      });
    }
  });

  //filter by encounterTypes
  var encounterTypesFiltered: any = allEncounter?.filter((enc) => encounterTypes.includes(enc.encounterType.uuid));

  let obsObject = {};
  encounterTypes.forEach((ec) => {
    obsObject[ec] = {};
  });

  //UUID's of incomplete and complete (answers) for the form complete concept
  const responseCompleteUUID = '6cf29178-21a8-4737-89b3-49bb3f141c89';
  const responseIncompleteUUID = '163339AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  //UUID for the form complete concept
  const formCompleteUUID = 'cb22cf53-a9d9-4923-947e-281694a54f0e';

  //iterate each encounter (form filled)
  encounterTypesFiltered?.forEach((e) => {
    //check if we have the form completeness values
    const completeObservation = e.obs.find((o) => o.concept?.uuid === formCompleteUUID);

    let complete = undefined;
    if (completeObservation) {
      if (completeObservation.value.uuid === responseCompleteUUID) complete = true;
      else if (completeObservation.value.uuid === responseIncompleteUUID) complete = false;
    }

    //iterate each observation of the form filled
    e.obs?.forEach((o) => {
      if (obsUuids.includes(o?.concept?.uuid)) {
        if (
          !(obsObject[String(e.encounterType.uuid)] && obsObject[String(e.encounterType.uuid)][String(o.concept?.uuid)])
        ) {
          obsObject[String(e.encounterType.uuid)][String(o.concept?.uuid)] = [];
        }

        obsObject[String(e.encounterType.uuid)][String(o.concept?.uuid)].push({
          value: getValue(o),
          dateTime: e.encounterDatetime,
          complete: Boolean(complete),
        });
      }
    });
  });

  return {
    encounters: obsObject,
    isError: error,
    isLoading: !obsObject && !error,
    isValidating,
  };
}

export function useEncounterResult(patientUuid: string, encounterTypes: string) {
  const customRepresentation =
    'custom:(uuid,encounterDatetime,' +
    'obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display)),value),' +
    'form:(uuid,name),encounterType:ref)';

  const { data, error, isValidating } = useSWR<{ data: { results: any } }, Error>(
    `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${encounterTypes}&v=${customRepresentation}`,
    openmrsFetch,
  );

  let closureFormDataTime = data?.data.results.map((item) => {
    return {
      uuid: item.uuid,
      encounterDatetime: item.encounterDatetime,
    };
  });

  return {
    closureForms: closureFormDataTime,
    isError: error,
    isLoading: !closureFormDataTime && !error,
    isValidating,
  };
}

export function useObservationByEncounterType(patientUuid: string, encounterType: string) {
  const { data, error, isValidating } = useSWR<{ data: { results: any } }, Error>(
    `/ws/fhir2/R4/Observation?patient=${patientUuid}&encounter.type=${encounterType}&_sort=-date&_count=200`,
    openmrsFetch,
  );

  return {
    closureForms: null,
    isError: error,
    isLoading: null,
    isValidating,
  };
}

function getValue(observation: any) {
  if (typeof observation?.value === 'number' || typeof observation?.value === 'string') {
    return observation?.value;
  } else if (observation?.value?.uuid) {
    return observation?.value?.uuid;
  } else if (observation?.groupMembers) {
    const index = observation?.groupMembers.findIndex(
      (ele) => ele.concept.uuid === '85958712-afc3-4037-b3ce-26147307faaf',
    );

    if (index >= 0) return observation?.groupMembers?.[index]?.value.uuid;
  }
}
