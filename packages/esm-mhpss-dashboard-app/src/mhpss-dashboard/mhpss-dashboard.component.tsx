import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './mhpss-dashboard.scss';

export interface DashboardConfig {
  slot: string;
  title: string;
  columns: number;
}

export interface MhpssDashboardProps {
  patientUuid: string;
}

const MhpssDashboard: React.FC<MhpssDashboardProps> = () => {
  const { t } = useTranslation();

  return (
    <ExtensionSlot
      key="mhpss-dashboard-slot-1"
      name="mhpss-dashboard-slot-1"
      className={styles.dashboard}
      style={{ gridTemplateColumns: '1fr' }}
    />
  );
};

export default MhpssDashboard;
