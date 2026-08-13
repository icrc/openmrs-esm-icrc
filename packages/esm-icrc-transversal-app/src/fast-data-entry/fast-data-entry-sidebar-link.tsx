import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

export default function FastDataEntrySidebarLink() {
  const { t } = useTranslation();

  return (
    <div>
      <ConfigurableLink className={classNames('cds--side-nav__link')} to="${openmrsSpaBase}/forms">
        {t('fastDataEntryAppMenuLink', 'Fast Data Entry')}
      </ConfigurableLink>
    </div>
  );
}
