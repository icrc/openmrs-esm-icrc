import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanels, TabPanel } from '@carbon/react';
import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import PatientTabComponent from './patient-tab/patient-tab.component';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import EncounterTabComponent from './encounters-tab/encounter-tab.component';
import styles from './recent-activities.scss';

enum TabTypes {
  ENCOUNTERS,
  PATIENTS,
  ALL,
}

const RecentActivitiesList: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(TabTypes.ENCOUNTERS);
  const config = useConfig();

  return (
    <main className={`omrs-main-content ${styles.recentActivitiesPage}`}>
      <section className={styles.recentActivities}>
        {config.showBreadcrumbs ? <ExtensionSlot name="breadcrumbs-slot" className={styles.breadcrumbsSlot} /> : null}
        <CardHeader title={t('recentActivities', 'Recent Activities')} children={undefined} />
        <Tabs className={styles.tabs} tabContentClassName={styles.hiddenTabsContent} onSelectionChange={setSelectedTab}>
          <TabList className={styles.tabs} aria-label="List tabs">
            <Tab id={'tab-recent-encounters'}>{t('recentEncounters', 'Recent Encounters')}</Tab>
            <Tab id={'tab-recent-patients'}>{t('recentPatients', 'Recent Patients')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <EncounterTabComponent />
            </TabPanel>
            <TabPanel>
              <PatientTabComponent />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </section>
    </main>
  );
};

export default RecentActivitiesList;
