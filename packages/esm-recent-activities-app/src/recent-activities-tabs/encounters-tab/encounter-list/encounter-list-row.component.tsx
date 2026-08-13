import React, { useEffect, useState } from 'react';
import { TableCell, TableRow, InlineLoading, Button } from '@carbon/react';
import { formatDatetime, ConfigurableLink, navigate, getConfig } from '@openmrs/esm-framework';
import styles from './encounter-list-table.scss';
import { useTranslation } from 'react-i18next';
import { Edit } from '@carbon/react/icons';
import { useEncounter } from '../../../api/hooks';
import { launchFormEntryOrHtmlForms } from '../../../api/form-entry-interop';
import { HtmlFormEntryForm } from '../../../config-schema';

interface EncounterListRowProps {
  encounterUuid: string;
}

const EncounterListRow: React.FC<EncounterListRowProps> = ({ encounterUuid }) => {
  const { encounter } = useEncounter(encounterUuid);
  const { t } = useTranslation();

  const [htmlFormEntryFormsConfig, setHtmlFormEntryFormsConfig] = useState<Array<HtmlFormEntryForm> | undefined>([]);
  useEffect(() => {
    getConfig('@openmrs/esm-patient-forms-app').then((config) => {
      setHtmlFormEntryFormsConfig(config.htmlFormEntryForms as HtmlFormEntryForm[]);
    });
  });

  async function handleEditEncounter() {
    await navigate({
      to: `\${openmrsSpaBase}/patient/${encounter?.patient?.uuid}/chart`,
    });

    setTimeout(() => {
      launchFormEntryOrHtmlForms(
        encounter?.visit,
        encounter?.form?.uuid,
        encounter?.patient,
        htmlFormEntryFormsConfig,
        encounter?.uuid,
        encounter?.form?.display,
      );
    }, 500);
  }

  return encounter ? (
    <TableRow>
      <TableCell key={`${encounterUuid}-datetime`}>
        {encounter?.encounterDatetime ? formatDatetime(new Date(encounter.encounterDatetime)) : ''}
      </TableCell>
      <TableCell className={styles.tableCell} key={`${encounterUuid}-patient`}>
        <ConfigurableLink to={`\${openmrsSpaBase}/patient/${encounter?.patient?.uuid}/chart/Patient Summary`}>
          {encounter?.patient?.display}
        </ConfigurableLink>
      </TableCell>
      <TableCell key={`${encounterUuid}-encounterType`}>{encounter?.encounterType?.display}</TableCell>
      <TableCell key={`${encounterUuid}-actions`}>
        <Button
          kind="ghost"
          onClick={handleEditEncounter}
          renderIcon={(props) => <Edit size={16} {...props} />}
          style={{ marginLeft: '-1rem', marginTop: '0.5rem' }}
        >
          {t('editEncounter', 'Edit encounter')}
        </Button>
      </TableCell>
    </TableRow>
  ) : (
    <div className={styles.loading}>
      <InlineLoading />
    </div>
  );
};

export default EncounterListRow;
