import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  InlineLoading,
} from '@carbon/react';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { parseDate, formatDate, useSession, usePatient } from '@openmrs/esm-framework';
import type { SymptomsList } from '../types';
import styles from './main-cluster-presented-symptoms.scss';
import { useSymptoms } from '../hooks/useSymptoms';
import {
  ASSESSMENT_FORM_ENCOUNTER_TYPE_UUID,
  ASSESSMENT_FORM_UUID,
  CLOSURE_FORM_ENCOUNTER_TYPE_UUID,
  FOLLOW_UP_FORM_UUID,
  SYMPTOM_CONCEPT_UUID,
} from '../constants';
import { useLastEncounter } from '../hooks/useLastEncounter';
import { isObjectEmpty } from '../helpers';

const MainClusterPresentedSymptomsTables: React.FC = () => {
  const { t } = useTranslation();
  const session = useSession();
  const { patientUuid } = usePatient();
  const [currentSessionProviderUuid, setCurrentSessionProviderUuid] = useState<string | null>('');
  const [currentSessionLocationUuid, setCurrentSessionLocationUuid] = useState('');
  const MAX_SYMPTOMS_PER_CATEGORY = 5;

  const { lastEncounter: lastAssessmentForm } = useLastEncounter(patientUuid, ASSESSMENT_FORM_ENCOUNTER_TYPE_UUID);
  const { lastEncounter: lastClosureForm } = useLastEncounter(patientUuid, CLOSURE_FORM_ENCOUNTER_TYPE_UUID);

  const { encounters, isLoading, isError, isValidating } = useSymptoms(
    patientUuid,
    [ASSESSMENT_FORM_UUID, FOLLOW_UP_FORM_UUID],
    [SYMPTOM_CONCEPT_UUID],
    lastAssessmentForm?.encounterDatetime,
    lastClosureForm?.encounterDatetime,
  );
  useEffect(() => {
    if (session && !currentSessionLocationUuid && !currentSessionProviderUuid) {
      setCurrentSessionLocationUuid(session?.sessionLocation?.uuid);
      setCurrentSessionProviderUuid(session?.currentProvider?.uuid);
    }
  }, [currentSessionLocationUuid, currentSessionProviderUuid, session]);

  let config = {
    title: 'Main Cluster Presented Symptoms Table',
    headers: [
      { key: 'date', header: t('date', 'Date') },
      {
        key: 'symptom',
        header: t('symptoms', 'Symptoms'),
      },
    ],
    rows: [],
  };

  function getSymptomCategoryByTitle(symptomTitle: string) {
    const firstChar = symptomTitle?.charAt(0).toLowerCase();

    switch (firstChar) {
      case 'g':
        return 'general';
      case 'e':
        return 'emotional';
      case 'f':
        return 'functionality';
      case 'p':
        return 'psychotic';
      case 'o':
      case 'x':
        return 'other';
      default:
        return 'other';
    }
  }

  const assessmentSymptomsList: SymptomsList = useMemo(() => {
    let symptomsList = {
      general: [],
      emotional: [],
      functionality: [],
      psychotic: [],
      other: [],
    };

    if (encounters[ASSESSMENT_FORM_UUID][SYMPTOM_CONCEPT_UUID] != undefined) {
      encounters[ASSESSMENT_FORM_UUID][SYMPTOM_CONCEPT_UUID].slice(0).map((s) =>
        symptomsList[getSymptomCategoryByTitle(s?.value)].push({
          id: s.id,
          date: s.dateTime,
          symptom: s.value,
        }),
      );
    }

    return symptomsList;
  }, [encounters]);

  const followUpSymptomsList = useMemo(() => {
    let symptomsList = {
      general: [],
      emotional: [],
      functionality: [],
      psychotic: [],
      other: [],
    };

    if (encounters[FOLLOW_UP_FORM_UUID][SYMPTOM_CONCEPT_UUID] != undefined) {
      encounters[FOLLOW_UP_FORM_UUID][SYMPTOM_CONCEPT_UUID].map((s) =>
        symptomsList[getSymptomCategoryByTitle(s?.value)]?.push({
          id: s.id,
          date: s.dateTime,
          symptom: s.value,
        }),
      );
    }
    return symptomsList;
  }, [encounters]);

  return (
    <div className={styles.mainClusterPresentedSymptomsSymptomTable}>
      {!isObjectEmpty(assessmentSymptomsList) ? (
        <>
          <CardHeader title={t('symptomsAtAssessment', 'Symptoms at Assessment')}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </CardHeader>
          <DataTable rows={[]} headers={config?.headers}>
            {({ headers }) => (
              <TableContainer className={styles.mainClusterPresentedSymptomsContainer}>
                <Table>
                  <TableHead>
                    {headers.map((header) => (
                      <TableHeader key={header.key}>{header.header}</TableHeader>
                    ))}
                  </TableHead>
                  <TableBody>
                    {Object.keys(assessmentSymptomsList)?.map((category) => (
                      <React.Fragment key={category}>
                        {assessmentSymptomsList[category]?.length > 0 ? (
                          <h6 className={`${styles.mainClusterPresentedSymptomsSymptomSection}`}>{category}</h6>
                        ) : null}
                        {assessmentSymptomsList[category]?.slice(0, MAX_SYMPTOMS_PER_CATEGORY)?.map((row) => (
                          <TableRow key={row?.id}>
                            <TableCell className={`${styles.mainClusterPresentedSymptomsDateCell}`}>
                              {formatDate(parseDate(row?.date))}
                            </TableCell>
                            <TableCell className={`${styles.mainClusterPresentedSymptomsSymptomCell}`}>
                              {row?.symptom}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </>
      ) : (
        <EmptyState
          displayText={t('symptomsAtAssessment', 'Symptoms at Assessment')}
          headerTitle={t('symptomsAtAssessment', 'Symptoms at Assessment')}
        />
      )}
      <div className={styles.mainClusterPresentedSymptomsSeparator}></div>
      {!isObjectEmpty(followUpSymptomsList) ? (
        <>
          <CardHeader title={t('followUpOfSymptoms', 'Follow-up of Symptoms')} children={undefined}></CardHeader>
          <DataTable rows={[]} headers={config?.headers}>
            {({ headers }) => (
              <TableContainer className={styles.mainClusterPresentedSymptomsContainer}>
                <Table>
                  <TableHead>
                    {headers.map((header) => (
                      <TableHeader className={styles.mainClusterPresentedSymptomsSymptomHeader} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableHead>
                  <TableBody>
                    {Object.keys(followUpSymptomsList).map((category) => (
                      <React.Fragment key={category}>
                        {followUpSymptomsList[category]?.length > 0 ? (
                          <h6 className={`${styles.mainClusterPresentedSymptomsSymptomSection}`}>{category}</h6>
                        ) : null}
                        {followUpSymptomsList[category]?.slice(0, MAX_SYMPTOMS_PER_CATEGORY)?.map((row) => (
                          <TableRow key={row?.id}>
                            <TableCell className={`${styles.mainClusterPresentedSymptomsDateCell}`}>
                              {formatDate(parseDate(row?.date))}
                            </TableCell>
                            <TableCell className={`${styles.mainClusterPresentedSymptomsSymptomCell}`}>
                              {row?.symptom}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </>
      ) : (
        <EmptyState
          displayText={t('followUpOfSymptoms', 'Follow-up of Symptoms')}
          headerTitle={t('followUpOfSymptoms', 'Follow-up of Symptoms')}
        />
      )}
    </div>
  );
};

export default MainClusterPresentedSymptomsTables;
