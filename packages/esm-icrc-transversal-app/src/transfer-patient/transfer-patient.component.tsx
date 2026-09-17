import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { showSnackbar, useSession } from '@openmrs/esm-framework';
import { LocationPicker } from '../location-picker';
import { transferPatient } from '../../api/transfer-patient';
import { Button, ModalBody, InlineLoading, ModalFooter, ModalHeader } from '@carbon/react';
import styles from './transfer-patient.styles.scss';

interface TransferLocationtion {
  uuid: string;
  name: string;
}

interface TransferPatientProps {
  closeModal: () => void;
  patientUuid: string;
}

const TransferPatient: React.FC<TransferPatientProps> = ({ closeModal, patientUuid }) => {
  const { t } = useTranslation();
  const { sessionLocation } = useSession();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<TransferLocationtion | null>({
    uuid: sessionLocation.uuid,
    name: sessionLocation.display,
  });
  const handleSubmit = useCallback(async () => {
    const abortController = new AbortController();

    if (!selectedLocation) {
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: t('selectLocation', 'Please select a location to transfer the patient to.'),
      });
      return;
    }

    setIsSubmitting(true);

    await transferPatient(patientUuid, selectedLocation.uuid, abortController)
      .then(() => {
        showSnackbar({
          title: t('successfullyTransferred', 'Successfully transferred'),
          kind: 'success',
          isLowContrast: true,
          subtitle: `${t('successTransferPatient', 'Patient successfully transferred to {{location}}.', {
            location: selectedLocation?.name,
          })}`,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch(() =>
        showSnackbar({
          title: t('error', 'Error'),
          kind: 'error',
          subtitle: `${t(
            'errorTransferPatient',
            'An error occurred while trying to transfer the patient to {{location}}.',
            {
              location: selectedLocation?.name,
            },
          )}`,
        }),
      )
      .finally(() => {
        setIsSubmitting(false);
        closeModal();
      });
  }, [selectedLocation, patientUuid, closeModal, t]);
  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={t('transferPatient', 'Transfer Patient')}
        label={t('transferAllPatientData', 'Transfer all patient data to the specified location')}
      />
      <ModalBody>
        <LocationPicker
          selectedLocation={{ uuid: sessionLocation.uuid, name: sessionLocation.display }}
          defaultLocationUuid={sessionLocation.uuid}
          locationTag={'Login Location'}
          onChange={(location) => setSelectedLocation(location)}
        />
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          className={styles.confirmButton}
          kind="primary"
          onClick={handleSubmit}
          disabled={!selectedLocation || isSubmitting}
        >
          {isSubmitting ? (
            <InlineLoading className={styles.loader} description={t('transferring', 'Transferring')} />
          ) : (
            <span>{t('transferAllPatientDataTo', { location: selectedLocation?.name })}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default TransferPatient;
