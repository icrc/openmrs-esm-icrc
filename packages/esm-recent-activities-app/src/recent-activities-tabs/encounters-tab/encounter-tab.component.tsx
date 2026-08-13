import React from 'react';
import EncounterListTable from './encounter-list/encounter-list-table.component';
import styles from './encounter-tab.scss';

const EncounterTabComponent = () => {
  return (
    <main className={`omrs-main-content ${styles.encounterTab}`}>
      <section>
        <div className={styles.tableContainer}>
          <EncounterListTable />
        </div>
      </section>
    </main>
  );
};

export default EncounterTabComponent;
