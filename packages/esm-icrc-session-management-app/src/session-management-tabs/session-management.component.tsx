import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanels, TabPanel } from '@carbon/react';
import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import SessionsListTable from './sessions-tab/sessions-list/sessions-list-table.component';
import styles from './session-management.scss';

enum TabTypes {
  ALL_SESSIONS,
  MY_SESSIONS,
}

const SessionManagement: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(TabTypes.ALL_SESSIONS);
  const config = useConfig();

  return (
    <main className={`omrs-main-content ${styles.sessionManagementPage}`}>
      <section className={styles.sessionManagement}>
        {config.showBreadcrumbs && <ExtensionSlot name="breadcrumbs-slot" className={styles.breadcrumbsSlot} />}
        <CardHeader title={t('groupFamilySessions', 'Group/Family sessions')} children={undefined} />
        <Tabs className={styles.tabs} tabContentClassName={styles.hiddenTabsContent} onSelectionChange={setSelectedTab}>
          <TabList className={styles.tabs} aria-label="List tabs">
            <Tab id={'tab-all-sessions'}>{t('allSessions', 'All Sessions')}</Tab>
            {/* <Tab id={'tab-my-sessions'}>{t('mySessions', 'My Sessions')}</Tab> */}
          </TabList>
          <TabPanels>
            <TabPanel>
              <SessionsListTable />
            </TabPanel>
            {/* <TabPanel>My sessions component</TabPanel> */}
          </TabPanels>
        </Tabs>
      </section>
    </main>
  );
};

export default SessionManagement;
