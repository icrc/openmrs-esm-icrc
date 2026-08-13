import React from 'react';
import { navigate, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import GenericActionButton from './generic-action-button.component';

interface MergeVisitOverflowMenuItemProps {
  patientUuid: string;
}

const MergeVisitOverflowMenuItem: React.FC<MergeVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { actionButtons } = useConfig();

  const handleClick = () => {
    let path = `${window.openmrsBase}/coreapps/mergeVisits.page?patientId=${patientUuid}&returnUrl=%2Fui%2Fpatient%2F${patientUuid}%2Fchart%2FPatient%2520Summary`;
    navigate({ to: `${path}` });
  };

  return (
    <GenericActionButton
      privilege={actionButtons?.mergeVisits?.requiredPrivilege}
      handleClick={handleClick}
      title={t('mergeVisit', 'Merge Visit')}
    />
  );
};

export default MergeVisitOverflowMenuItem;
