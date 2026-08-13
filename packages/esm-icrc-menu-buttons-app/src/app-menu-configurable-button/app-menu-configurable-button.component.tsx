import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig, UserHasAccess } from '@openmrs/esm-framework';
import { fetchGlobalProperty } from '@icrc/esm-icrc-transversal-app/src/reports-widget/reports-widget.resource';

interface ConfigurableAppMenuButtonProps {
  patientUuid?: string;
}

const AppMenuConfigurableButton: React.FC<ConfigurableAppMenuButtonProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { menuButtonsConfig } = useConfig();
  const [servers, setServers] = React.useState<Map<string, string>>(new Map());
  const [links, setLinks] = React.useState<Map<string, string>>(new Map());

  const generateReportURI = useCallback(
    (serverGlobalProperty, url) => {
      if (serverGlobalProperty) {
        return `${servers.get(serverGlobalProperty)}/${url}`;
      } else {
        return `${window.spaBase}/${url}`;
      }
    },
    [servers],
  );

  useMemo(() => {
    const propertyKeys: Array<string> = [
      ...new Set(menuButtonsConfig?.map((config) => config.serverGlobalProperty)),
    ] as Array<string>;

    propertyKeys.forEach((propertyKey) => {
      const property = sessionStorage.getItem(propertyKey);
      if (property) {
        setServers((servers) => new Map(servers.set(propertyKey, property)));
      } else {
        const abortController = new AbortController();
        fetchGlobalProperty(abortController, propertyKey).then((response) => {
          if (response.status === 200) {
            response.data.results.map((globalProperty) => {
              sessionStorage.setItem(propertyKey, globalProperty.value);
              setServers((servers) => new Map(servers.set(propertyKey, globalProperty.value)));
              return;
            });
          }
        });
      }
    });
  }, [menuButtonsConfig]);

  useMemo(() => {
    menuButtonsConfig.forEach((config) =>
      setLinks(
        (links) => new Map(links.set(config.nameCode, generateReportURI(config.serverGlobalProperty, config.url))),
      ),
    );
  }, [menuButtonsConfig, generateReportURI]);

  return (
    <>
      {menuButtonsConfig?.map((buttonConfig, index) => {
        return (
          <UserHasAccess key={index} privilege={buttonConfig.requiredPrivilege}>
            <a
              className="btn; bx--overflow-menu-options__btn"
              role="menuitem"
              title={t(buttonConfig.nameCode, buttonConfig.name)}
              href={links.get(buttonConfig.nameCode)}
              target={buttonConfig.newTab ? '_blank' : '_self'}
              style={{
                maxWidth: '100vw',
                color: 'white',
              }}
            >
              <span className="bx--overflow-menu-options__option-content">
                {t(buttonConfig.nameCode, buttonConfig.name)}
              </span>
            </a>
          </UserHasAccess>
        );
      })}
    </>
  );
};

export default AppMenuConfigurableButton;
