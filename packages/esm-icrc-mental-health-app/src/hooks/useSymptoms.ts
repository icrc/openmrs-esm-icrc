import useSWR from 'swr';
import { openmrsFetch, Visit } from '@openmrs/esm-framework';
import { ObsUuid } from '@openmrs/esm-patient-common-lib';
import { isObsDateBetweenAssessmentAndClosureEncounters } from '../helpers';

export function useSymptoms(
  patientUuid: string,
  encounterTypes: Array<string>,
  obsUuids: Array<ObsUuid>,
  minDate: Date,
  maxDate: Date,
) {
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
  var encounterTypesfiltered: any = allEncounter?.filter((enc) => encounterTypes.includes(enc.encounterType.uuid));

  let obsObject = {};
  encounterTypes.forEach((ec) => {
    obsObject[ec] = {};
  });

  encounterTypesfiltered?.forEach((e) => {
    e.obs?.forEach((o) => {
      if (obsUuids.includes(o?.concept?.uuid)) {
        if (
          !(obsObject[String(e.encounterType.uuid)] && obsObject[String(e.encounterType.uuid)][String(o.concept?.uuid)])
        ) {
          obsObject[String(e.encounterType.uuid)][String(o.concept?.uuid)] = [];
        }

        if (isObsDateBetweenAssessmentAndClosureEncounters(e.encounterDatetime, minDate, maxDate)) {
          obsObject[String(e.encounterType.uuid)][String(o.concept?.uuid)].push({
            id: String(o.value?.display ? o.value.display : o.value) + String(e.encounterDatetime),
            value: getValue(o),
            dateTime: e.encounterDatetime,
          });
        }
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

function getValue(observation: any) {
  if (observation?.value?.display) {
    return observation?.value?.display;
  }
  if (typeof observation?.value === 'number' || typeof observation?.value === 'string') {
    return observation?.value;
  } else if (observation?.value?.uuid) {
    return observation?.value?.uuid;
  }
}
