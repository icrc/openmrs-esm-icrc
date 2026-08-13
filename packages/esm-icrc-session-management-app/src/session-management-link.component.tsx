import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

export default function SessionManagementLink() {
  const { t } = useTranslation();
  return (
    <ConfigurableLink to="${openmrsSpaBase}/session-management">
      {t('sessionManagementAppMenuLink', 'Session Management')}
    </ConfigurableLink>
  );
}
