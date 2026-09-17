import { useSession } from '@openmrs/esm-framework';
import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PatientListTable from './patient-list/patient-list-table.component';
import styles from './patient-tab.scss';

const PatientTabComponent = () => {
  const { t } = useTranslation();
  const session = useSession();

  return (
    <main className={`omrs-main-content ${styles.patientTab}`}>
      <section>
        <div className={styles.tableContainer}>
          <PatientListTable />
        </div>
      </section>
    </main>
  );
};

export default PatientTabComponent;
