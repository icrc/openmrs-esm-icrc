import React, { useEffect, useState } from 'react';

import { CommonWidgetProps } from '../models';
import { openmrsFetch } from '@openmrs/esm-api';
import * as styles from './intervention-plan.css';

const INTERVENTION_CONCEPT_UUID = '14f953af-3fed-4279-bbb1-318a05e93665';
const INTERVENTION_DATE_CONCEPT_UUID = '8cc11dea-2c15-4f3e-9264-d09130fe83d4';
const INTERVENTION_LOCATION_CONCEPT_UUID = 'bdc709c7-badc-4b3e-9afe-6c46c1faf1f6';
const OPERATION_REPORT_ENCOUNTER_TYPE = 'de326112-d757-4037-b303-88ac9872fcf1';

type PlannedIntervention = {
  partOf: string;
  date?: string | null;
  location?: string | null;
  interventionName?: string | null;
  patientName?: string | null;
};

async function getObsForEncounter(encounterId: string) {
  const res = await openmrsFetch(`/ws/fhir2/R4/Observation?encounter=${encounterId}&_count=1000`);
  return res.data.entry?.map((e: { resource: any }) => e.resource) ?? [];
}

export default function InterventionPlan({ locale }: InterventionPlanProps) {
  const [plannedInterventions, setPlannedInterventions] = useState<PlannedIntervention[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // TODO: Pagination?
        const encResponse = await openmrsFetch(
          `/ws/fhir2/R4/Encounter?type=${OPERATION_REPORT_ENCOUNTER_TYPE}&_sort=-date&_count=1000`,
        );

        const encounters = encResponse.data.entry?.map((e: { resource: any }) => e.resource) ?? [];
        const encounterIds = encounters.map((e: { id: any }) => e.id);

        const allObsArrays = await Promise.all(encounterIds.map((id: string) => getObsForEncounter(id)));
        const allObs = allObsArrays.flat();

        const filteredObs = allObs.filter((obs) => {
          const coding = obs.code?.coding ?? [];
          return coding.some(
            (c: { code: string }) =>
              c.code === INTERVENTION_DATE_CONCEPT_UUID ||
              c.code === INTERVENTION_CONCEPT_UUID ||
              c.code === INTERVENTION_LOCATION_CONCEPT_UUID,
          );
        });

        const groups: Record<string, PlannedIntervention> = {};
        for (const obs of filteredObs) {
          const partOfRef: string | undefined = obs.partOf?.[0]?.reference;
          if (!partOfRef) {
            // TODO: No obsgroup?
            continue;
          }

          const partOf = partOfRef.split('/')[1];

          if (!groups[partOf]) {
            groups[partOf] = {
              partOf: partOf,
              date: null,
              interventionName: null,
              patientName: obs.subject?.display ?? null,
            };
          }

          const coding = obs.code?.coding ?? [];

          if (coding.some((c: any) => c.code === INTERVENTION_DATE_CONCEPT_UUID)) {
            groups[partOf].date = obs.valueDateTime ?? null;
          }

          if (coding.some((c: any) => c.code === INTERVENTION_LOCATION_CONCEPT_UUID)) {
            groups[partOf].location = obs.valueCodeableConcept?.text ?? null;
          }

          if (coding.some((c: any) => c.code === INTERVENTION_CONCEPT_UUID)) {
            const display = obs.valueCodeableConcept?.coding?.[0]?.display ?? obs.valueCodeableConcept?.text ?? null;
            groups[partOf].interventionName = display;
          }
        }

        const result: PlannedIntervention[] = Object.values(groups);

        result.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setPlannedInterventions(result);
        setLoading(false);
      } catch (err) {
        console.error(err);
        //setError(err);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div style={{ paddingTop: '24px' }}>Loading...</div>;
  }

  if (error) {
    return error;
  }

  return (
    <div style={{ background: '#eee' }}>
      <div className={styles.widgetHeader}>
        <i className={'svg-icon icon-calendar'}></i>
        <span className={styles.title}>Interventions</span>
      </div>
      <div style={{ margin: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'center' }}>Date</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'center' }}>Location</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'center' }}>Patient</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'center' }}>Intervention</th>
            </tr>
          </thead>

          <tbody>
            {plannedInterventions &&
              plannedInterventions.map((item) => (
                <tr key={item.partOf}>
                  <td style={{ padding: '6px', textAlign: 'left' }}>{item.date?.split('T')[0]}</td>
                  <td style={{ padding: '6px', textAlign: 'left' }}>{item.location}</td>
                  <td style={{ padding: '6px', textAlign: 'left' }}>{item.patientName}</td>
                  <td style={{ padding: '6px', textAlign: 'left' }}>{item.interventionName}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type InterventionPlanProps = CommonWidgetProps & {
  prop1: any;
};
