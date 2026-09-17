import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createErrorHandler,
  openmrsFetch,
  showNotification,
  showToast,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
import GenericActionButton from './generic-action-button.component';

interface MarkPatientDeceasedMenuItemProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const causeOfDeadUuid = '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const deathDate = new Date();

const MarkPatientDeceasedMenuItem: React.FC<MarkPatientDeceasedMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { patient } = usePatient();
  const { actionButtons } = useConfig();

  const markPatientDeceased = useCallback((patientUuid, abortController) => {
    return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: {
        person: {
          dead: true,
          deathDate: deathDate.toISOString(),
          causeOfDeath: causeOfDeadUuid,
        },
      },
      signal: abortController.signal,
    });
  }, []);

  const handleClick = useCallback(() => {
    const abortController = new AbortController();

    markPatientDeceased(patientUuid, abortController)
      .then(() => {
        showToast({
          critical: true,
          kind: 'success',
          description: t('patientMarkedAsDeceased', 'The patient is now marked as deceased'),
          title: t('success', 'Success'),
        });
      })
      .catch((err) => {
        createErrorHandler();
        showNotification({
          title: t('errorMarkPatientDeceased', 'Error when marking the patient as deceased'),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      });
  }, [t, markPatientDeceased, patientUuid]);

  return (
    !patient?.deceasedDateTime && (
      <GenericActionButton
        privilege={actionButtons?.markPatientDeceased?.requiredPrivilege}
        handleClick={handleClick}
        title={t('markPatientDeceased', 'Mark HSU deceased')}
      />
    )
  );
};

export default MarkPatientDeceasedMenuItem;
