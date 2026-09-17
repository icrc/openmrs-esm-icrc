import { useSession } from '@openmrs/esm-framework';
import { useEffect, useMemo, useState } from 'react';
import { SimpleEncounterResult, usePatientEncounters } from '../hooks/usePatientEncounters';
import { useLastEncounter } from '../hooks/useLastEncounter';
import {
  ASSESSMENT_FORM_ENCOUNTER_TYPE_UUID,
  CLOSURE_FORM_ENCOUNTER_TYPE_UUID,
  TOTAL_SESSION_CONCEPTS,
  SESSION_TYPE_QUESTION_CONCEPT,
  PERSON_PRESENT_SESSION_QUESTION_CONCEPT,
  YES_CONCEPT,
  FOLLOWUP_FORM_ENCOUNTER_TYPE_UUID,
} from '../constants';
import { isObsDateBetweenAssessmentAndClosureEncounters } from '../helpers';

export interface TotalSessions {
  individual: number;
  group: number;
  family: number;
  total: number;
}

export function useTotalSessions(patientUuid: string): TotalSessions {
  const session = useSession();
  const [currentSessionProviderUuid, setCurrentSessionProviderUuid] = useState<string | null>('');
  const [currentSessionLocationUuid, setCurrentSessionLocationUuid] = useState('');

  useEffect(() => {
    if (session && !currentSessionLocationUuid && !currentSessionProviderUuid) {
      setCurrentSessionLocationUuid(session?.sessionLocation?.uuid);
      setCurrentSessionProviderUuid(session?.currentProvider?.uuid);
    }
  }, [currentSessionLocationUuid, currentSessionProviderUuid, session]);

  const { lastEncounter: lastAssessmentForm } = useLastEncounter(patientUuid, ASSESSMENT_FORM_ENCOUNTER_TYPE_UUID);
  const { lastEncounter: lastClosureForm } = useLastEncounter(patientUuid, CLOSURE_FORM_ENCOUNTER_TYPE_UUID);

  const { encounters: encounters } = usePatientEncounters(
    patientUuid,
    lastAssessmentForm?.encounterDatetime ? new Date(lastAssessmentForm?.encounterDatetime) : new Date(0),
  );

  // Filter and order the encounters
  const sessionEncounters = encounters
    .filter(
      (e) =>
        [
          ASSESSMENT_FORM_ENCOUNTER_TYPE_UUID,
          FOLLOWUP_FORM_ENCOUNTER_TYPE_UUID,
          CLOSURE_FORM_ENCOUNTER_TYPE_UUID,
        ].includes(e.encounterType.uuid) &&
        isObsDateBetweenAssessmentAndClosureEncounters(
          e.encounterDatetime,
          lastAssessmentForm?.encounterDatetime,
          lastClosureForm?.encounterDatetime,
        ),
    )
    .slice()
    .sort((a, b) => {
      return a.encounterDatetime.getTime() - b.encounterDatetime.getTime();
    });

  function countEncounters(encounters: SimpleEncounterResult[]): TotalSessions {
    const counters: TotalSessions = { individual: 0, group: 0, family: 0, total: 0 };

    let lastSessionType;

    // Count the sessions
    for (const encounter of sessionEncounters) {
      const encTypeUuid = encounter.encounterType.uuid;

      switch (encTypeUuid) {
        case ASSESSMENT_FORM_ENCOUNTER_TYPE_UUID:
        case FOLLOWUP_FORM_ENCOUNTER_TYPE_UUID:
          const obsSessionType = encounter.obs.find((o) => SESSION_TYPE_QUESTION_CONCEPT.includes(o.concept.uuid));

          if (TOTAL_SESSION_CONCEPTS.individual.includes(obsSessionType.value.uuid)) {
            counters.individual++;
            lastSessionType = 'individual';
          } else if (TOTAL_SESSION_CONCEPTS.group.includes(obsSessionType.value.uuid)) {
            counters.group++;
            lastSessionType = 'group';
          } else if (TOTAL_SESSION_CONCEPTS.family.includes(obsSessionType.value.uuid)) {
            counters.family++;
            lastSessionType = 'family';
          }
          break;
        case CLOSURE_FORM_ENCOUNTER_TYPE_UUID:
          const isPersonPresent =
            encounter.obs.filter((o) => {
              return PERSON_PRESENT_SESSION_QUESTION_CONCEPT == o.concept.uuid && YES_CONCEPT == o.value.uuid;
            }).length > 0;

          if (isPersonPresent && lastSessionType) {
            switch (lastSessionType) {
              case 'individual':
                counters.individual++;
                break;
              case 'group':
                counters.group++;
                break;
              case 'family':
                counters.family++;
                break;
            }
          }
          break;
      }
    }
    counters.total = counters.individual + counters.group + counters.family;
    return counters;
  }
  return countEncounters(sessionEncounters);
}
