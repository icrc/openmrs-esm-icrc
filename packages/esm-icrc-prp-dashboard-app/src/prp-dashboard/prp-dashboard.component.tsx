import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';

const ConditionsDetailedSummary: React.FC = () => {
  const { t } = useTranslation();

  return <ExtensionSlot name="prp-dashboard-widgets-slot" />;
};

export default ConditionsDetailedSummary;
