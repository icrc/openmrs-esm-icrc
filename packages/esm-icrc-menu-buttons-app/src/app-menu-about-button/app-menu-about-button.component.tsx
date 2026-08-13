import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InformationIcon } from '@openmrs/esm-framework';
import { SwitcherItem } from '@carbon/react';
import styles from './app-menu-about-button.scss';

const AppMenuAboutButton: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [versionInfo, setVersionInfo] = useState({ version: 'loading...', build_date: 'loading...' });

  useEffect(() => {
    fetch('/ui/version.json')
      .then((res) => res.json())
      .then(setVersionInfo)
      .catch(() => setVersionInfo({ version: '', build_date: '' }));
  }, []);

  return (
    <>
      <SwitcherItem aria-label={t('about', 'About')}>
        <InformationIcon size={20} />
        <div className={styles.aboutInfoContainer}>
          <p>{t('version', 'Version')}</p>
          <span>{versionInfo.version}</span>
        </div>
      </SwitcherItem>
    </>
  );
};

export default AppMenuAboutButton;
