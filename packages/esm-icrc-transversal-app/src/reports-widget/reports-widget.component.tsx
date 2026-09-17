import React, { useCallback, useEffect, useState } from 'react';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Link, Search } from '@carbon/react';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import type { Report } from '../config-schema';
import { fetchGlobalProperty } from './reports-widget.resource';
import { superUserRole } from '../constants';
import styles from './reports-widget.scss';

interface ReportWidgetProps {}

const ReportWidget: React.FC<ReportWidgetProps> = () => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [searchString, setSearchString] = useState('');
  const [externalServer, setExternalServer] = React.useState<null | string>();
  const [searchResults, setSearchResults] = useState<Report[]>([]);
  const config = useConfig();
  const handleSearch = useCallback((e) => setSearchString(e.target.value), []);
  const title = config?.title ? t(config.titleCode, config.title) : t('reports', 'Reports');

  useEffect(() => {
    if (config?.reports) {
      const searchStringInsensitive = searchString?.toLowerCase();
      setSearchResults(
        config.reports.filter((r) => (t(r.labelCode, r.label)?.toLowerCase() ?? '').includes(searchStringInsensitive)),
      );
    }
  }, [searchString, config.reports, t]);

  React.useEffect(() => {
    if (config?.serverGlobalProperty) {
      const property = sessionStorage.getItem(config.serverGlobalProperty);
      if (property) {
        setExternalServer(property);
      } else {
        const abortController = new AbortController();
        fetchGlobalProperty(abortController, config.serverGlobalProperty).then((response) => {
          if (response.status === 200) {
            setExternalServer(
              response.data.results.map((globalProperty) => {
                sessionStorage.setItem(config.serverGlobalProperty, globalProperty.value);
                return globalProperty.value;
              })[0],
            );
          }
        });
      }
    }
  }, [config]);

  const generateReportURI = useCallback(
    (url: string) => {
      if (externalServer) {
        return `${externalServer}/${url}`;
      }
      return `${window.openmrsBase}/${url}&returnUrl=${window.spaBase}/home`;
    },
    [externalServer],
  );

  const userHasAccess = (privileges: Array<String>) => {
    return (
      user.roles.find((role) => role.display === superUserRole) ||
      user.privileges.some((p) => privileges.indexOf(p.display) >= 0)
    );
  };

  return (
    <div className={styles.reportsWidgetContainer}>
      <CardHeader title={title} children={undefined} />
      {config?.serverGlobalProperty && !externalServer ? (
        <div className={styles.error}>
          <label>
            {t('globalPropertyServerNotFound', 'Global Property for server not found: ')}
            {config.serverGlobalProperty}
          </label>
        </div>
      ) : null}
      <Search
        labelText={t('reports', 'Reports')}
        placeholder={t('searchForAReport', 'Search for a report')}
        onChange={handleSearch}
      />
      <div className={styles.reportsParent}>
        {searchResults.map((r, i) => {
          if (userHasAccess(r.requiredPrivileges)) {
            return (
              <div className={styles.reportsElement} key={i}>
                {externalServer ? (
                  <Link href={generateReportURI(r.url)} target="_blank" rel="noopener noreferrer">
                    {t(r.labelCode, r.label)}
                  </Link>
                ) : (
                  <Link href={generateReportURI(r.url)}>{t(r.labelCode, r.label)}</Link>
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default ReportWidget;
