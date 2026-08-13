import React from 'react';
import { useConfig, showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import GenericActionButton from './generic-action-button.component';

interface TransferPatientMenuItemProps {
  patientUuid: string;
}

const TransferPatientMenuItem: React.FC<TransferPatientMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { actionButtons } = useConfig();

  const handleClick = () => {
    const close = showModal('transfer-patient-modal', {
      closeModal: () => close(),
      patientUuid: patientUuid,
    });
  };

  return (
    <GenericActionButton
      privilege={actionButtons?.transferPatient?.requiredPrivilege}
      handleClick={handleClick}
      title={t('transferPatient', 'Transfer Patient')}
    />
  );
};

export default TransferPatientMenuItem;
