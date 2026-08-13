import React from 'react';
import { navigate, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import GenericActionButton from './generic-action-button.component';

interface PrintWristbandMenuItemProps {
  patientUuid: string;
}

const MaterialRequestMenuItem: React.FC<PrintWristbandMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { actionButtons } = useConfig();

  const handleClick = () => {
    let path = `${window.openmrsBase}/icrc/prpMaterialRequest.page?patientId=${patientUuid}&returnUrl=${window.location.href}`;
    navigate({ to: `${path}` });
  };

  return (
    <GenericActionButton
      privilege={actionButtons?.materialRequest?.requiredPrivilege}
      handleClick={handleClick}
      title={t('materialRequest', 'Material Request')}
    />
  );
};

export default MaterialRequestMenuItem;
