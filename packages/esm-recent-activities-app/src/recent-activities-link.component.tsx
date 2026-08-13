import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

export default function RecentActivitiesLink() {
  const { t } = useTranslation();
  return (
    <ConfigurableLink to="${openmrsSpaBase}/recent-activities">
      {t('recentActivitiesAppMenuLink', 'Recent Activities')}
    </ConfigurableLink>
  );
}
