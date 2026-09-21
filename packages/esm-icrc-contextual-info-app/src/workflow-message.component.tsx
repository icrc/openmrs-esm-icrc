import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { InlineNotification } from '@carbon/react';
import styles from './workflow-message.module.scss';
import { useTranslation } from 'react-i18next';

const CONTAINER_ID = 'icrc-contextual-info-container';

function isFastDataEntryRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, '');
  return pathname === '/ui/forms';
}

export default function FastDataEntryMessage() {
  const { t } = useTranslation();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(isFastDataEntryRoute());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      const isFde = isFastDataEntryRoute();

      setIsVisible(isFde);

      if (isFde) {
        setDismissed(false);
      }
    };

    window.addEventListener('single-spa:routing-event', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('single-spa:routing-event', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      const existing = document.getElementById(CONTAINER_ID);
      existing?.remove();

      setPortalContainer(null);
      return;
    }

    const appsContainer = document.getElementById('omrs-apps-container');

    if (!appsContainer) {
      console.warn('Could not find #omrs-apps-container');
      return;
    }

    let container = document.getElementById(CONTAINER_ID) as HTMLDivElement | null;

    if (!container) {
      container = document.createElement('div');
      container.id = CONTAINER_ID;

      Object.assign(container.style, {
        display: 'block',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: '0',
        zIndex: '1',
      });

      appsContainer.prepend(container);
    }

    setPortalContainer(container);

    return () => {
      container?.remove();
      setPortalContainer(null);
    };
  }, [isVisible]);

  if (!isVisible || !portalContainer || dismissed) {
    return null;
  }

  return createPortal(
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '1rem 1rem 0rem 1rem',
      }}
    >
      <InlineNotification
        className={styles.workflowNotification}
        kind="info"
        title={t('workflowTitle', 'Workflow')}
        subtitle={t('workflowDescription', 'Assessment form + Scale → Follow-up(s) → Scale + Closure')}
        lowContrast
        onClose={() => setDismissed(true)}
      />
    </div>,
    portalContainer,
  );
}
