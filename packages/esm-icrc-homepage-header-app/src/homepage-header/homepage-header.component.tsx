import React from 'react';
import { useSession, useConfig, formatDate, formatDatetime } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './homepage-header.scss';
import { ConfigSchema } from '../config-schema';
import { Calendar, Location } from '@carbon/react/icons';
import { homeForCode, homeForLabel, openmrsName, superUserRole } from '../constants';
import IllustrationHeader from './header-illustration-component';

interface HomepageHeaderProps {}

const HomepageHeader: React.FC<HomepageHeaderProps> = () => {
  const { t } = useTranslation();
  const { user, sessionLocation } = useSession();
  const location = sessionLocation?.display;
  const { homepagesHeaderConfig, addHomeFor } = useConfig() as ConfigSchema;
  const [title, setTitle] = React.useState<string>('');
  const [displayHeader, setDisplayHeader] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (user?.roles && user.roles.find((role) => role.display === superUserRole)) {
      setTitle((addHomeFor ? t(homeForCode, homeForLabel) : '').concat(t('administrator', 'Administrator')));
      setDisplayHeader(true);
    } else if (homepagesHeaderConfig) {
      setTitle(
        (addHomeFor ? t(homeForCode, homeForLabel) : '').concat(
          homepagesHeaderConfig
            .filter((config) => {
              return user && user.privileges.find((p) => config.requiredPrivilege === p.display);
            })
            .map((config) => {
              setDisplayHeader(true);
              return t(config.titleCode, config.title);
            })
            .join(' | '),
        ),
      );
    }
  }, [addHomeFor, homepagesHeaderConfig, t, user]);

  if (displayHeader) {
    return (
      <div className={styles.header}>
        <div className={styles['left-justified-items']}>
          <IllustrationHeader />
          <div className={styles['page-labels']}>
            <p>{openmrsName}</p>
            <p className={styles['page-name']}>{title}</p>
          </div>
        </div>
        <div className={styles['right-justified-items']}>
          <div className={styles['date-and-location']}>
            <Location size={16} />
            <span className={styles.value}>{location}</span>
            <span className={styles.middot}>&middot;</span>
            <Calendar size={16} />
            <span className={styles.value}>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HomepageHeader;
