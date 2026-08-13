import React, { useEffect } from 'react';
import styles from './total-sessions-widget.scss';
import TotalSessionsCard from './total-sessions-card.component';
import { useTotalSessions } from './total-sessions-widget.resource';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { Trans, useTranslation } from 'react-i18next';
import { User, UserProfile, EventsAlt, PedestrianFamily } from '@carbon/react/icons';
import { InlineNotification } from '@carbon/react';

interface TotalSessionsProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

export default function TotalSessions({ basePath, patient, patientUuid }: TotalSessionsProps) {
  const { t } = useTranslation();
  const sessions = useTotalSessions(patientUuid);

  return (
    <div className={`${styles.totalSessionsWidget}`}>
      <CardHeader title={t('totalSessions_Consultations', 'Total Sessions / Consultations')}>
        <></>
      </CardHeader>
      <div className={`${styles.container}`}>
        <InlineNotification
          aria-label="Total Sessions Description"
          hideCloseButton
          kind="info"
          lowContrast
          statusIconDescription="notification"
          subtitle={t(
            'totalSessionsDescription',
            'The sessions are counted starting from the last Assessment form. Please note that a Closure form is counted as a session if on the form you have ticked that the person is present during closure.',
          )}
        />
      </div>

      <div className={`${styles.container}`}>
        <div className={`${styles.totalSessionsCard}`}>
          <TotalSessionsCard
            title={t('individualSessions', 'Individual Sessions')}
            value={sessions.individual}
            icon={<User size={32} />}
          />
        </div>
        <div className={`${styles.totalSessionsCard}`}>
          <TotalSessionsCard
            title={t('groupSessions', 'Group Sessions')}
            value={sessions.group}
            icon={<EventsAlt size={32} />}
          />
        </div>
        <div className={`${styles.totalSessionsCard}`}>
          <TotalSessionsCard
            title={t('familySessions', 'Family Sessions')}
            value={sessions.family}
            icon={<PedestrianFamily size={32} />}
          />
        </div>
        <div className={`${styles.totalSessionsCard}`}>
          <TotalSessionsCard
            title={t('totalSessions', 'Sessions')}
            value={sessions.total}
            icon={<UserProfile size={32} />}
          />
        </div>
      </div>
    </div>
  );
}
