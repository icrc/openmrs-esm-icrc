import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';

const HCDDashboardConditionsDetailedSummary: React.FC = () => {
  const { t } = useTranslation();

  return <ExtensionSlot name="hcd-dashboard-widgets-slot" />;
};

export default HCDDashboardConditionsDetailedSummary;
