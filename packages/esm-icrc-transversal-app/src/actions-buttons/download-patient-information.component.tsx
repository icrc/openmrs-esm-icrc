import React from 'react';
import { navigate, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import GenericActionButton from './generic-action-button.component';

interface DownloadPatientInformationOverflowMenuItemProps {
  patientUuid: string;
}

const DownloadPatientInformationOverflowMenuItem: React.FC<DownloadPatientInformationOverflowMenuItemProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { actionButtons } = useConfig();

  const handleClick = () => {
    let path = `${window.openmrsBase}/module/commonreports/patientHistory.form?patientUuid=${patientUuid}`;
    navigate({ to: `${path}` });
  };

  return (
    <GenericActionButton
      privilege={actionButtons?.downloadPatientInformation?.requiredPrivilege}
      handleClick={handleClick}
      title={t('downloadPatientInformation', 'Download Patient Information')}
    />
  );
};

export default DownloadPatientInformationOverflowMenuItem;
