import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, InlineLoading } from '@carbon/react';
import { RegistrationPeriod, useRecentlyRegisteredPatients } from '../../api/hooks';
import PatientListTable from '../patient-tab/patient-list/patient-list-table.component';
import styles from './registered-patients-tab.scss';

const RegisteredPatientsTabComponent = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<RegistrationPeriod>('today');
  const { patientUuids, isLoading } = useRecentlyRegisteredPatients(period);

  const periods: Array<{ id: RegistrationPeriod; label: string }> = [
    { id: 'today', label: t('today', 'Today') },
    { id: 'yesterday', label: t('yesterday', 'Yesterday') },
    { id: 'threeDays', label: t('threeDaysAgo', '3 days ago') },
    { id: 'week', label: t('thisWeek', 'This week') },
  ];

  return (
    <main className="omrs-main-content">
      <section>
        <Dropdown
          id="registered-period-dropdown"
          className={styles.dropdown}
          titleText={t('fromDate', 'From')}
          label=""
          items={periods}
          itemToString={(item) => item?.label ?? ''}
          selectedItem={periods.find(({ id }) => id === period)}
          onChange={({ selectedItem }) => setPeriod(selectedItem.id)}
        />
        {isLoading ? (
          <InlineLoading className={styles.loading} />
        ) : (
          <PatientListTable
            patientUuids={patientUuids}
            emptyMessage={t(
              'emptyRegisteredPatients',
              'There are no patients registered in this location for the selected period',
            )}
          />
        )}
      </section>
    </main>
  );
};

export default RegisteredPatientsTabComponent;
