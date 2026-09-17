import React, { useCallback } from 'react';
import { TableCell, TableRow, Button, Tag } from '@carbon/react';
import {
  showModal,
  showSnackbar,
  formatDate,
  parseDate,
  ConfigurableLink,
  UserHasAccess,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Edit, TrashCan } from '@carbon/react/icons';
import { deleteEncounter } from '../../../api/sessions.resource';
import { MappedEncounter, Session } from '../../../types';

interface EncounterListRowProps {
  encounter: MappedEncounter;
  session: Session;
  onActions?: { [key: string]: (...args: any[]) => any };
}

const EncounterListRow: React.FC<EncounterListRowProps> = ({ encounter, session, onActions }) => {
  const { t } = useTranslation();

  const handleEditEncounter = useCallback(() => {
    onActions?.onEditEncounter(session, encounter);
  }, [encounter, onActions, session]);

  const handleDeleteEncounter = useCallback(() => {
    const close = showModal('delete-encounter-modal', {
      close: () => close(),
      encounterTypeName: session.encounterTypeName || '',
      onConfirmation: () => {
        const abortController = new AbortController();
        deleteEncounter(encounter.id, abortController)
          .then(() => {
            onActions?.onDeleteEncounter(session.id, encounter.id);
            showSnackbar({
              isLowContrast: true,
              title: t('encounterDeleted', 'Encounter deleted'),
              subtitle: t('encounterSuccessfullyDeleted', 'Encounter successfully deleted'),
              kind: 'success',
            });
          })
          .catch((e) => {
            showSnackbar({
              isLowContrast: false,
              title: t('error', 'Error'),
              subtitle: t('encounterCouldntBeDeleted', "Encounter couldn't be deleted"),
              kind: 'error',
            });
            console.error(e);
          });
        close();
      },
    });
  }, [encounter, session, onActions, t]);

  return (
    <TableRow key={`${encounter.id}-encounter`}>
      <TableCell key={`${encounter.patientUuid}-patient`}>
        <ConfigurableLink to={`\${openmrsSpaBase}/patient/${encounter.patientUuid}/chart`}>
          {encounter.patientName}
        </ConfigurableLink>
      </TableCell>
      <TableCell key={`${encounter.patientUuid}-identifier`}>
        <span>
          <Tag type="gray" title={'HSU ID'}>
            {'HSU ID'}
          </Tag>
          {encounter.patientIdentifier}
        </span>
      </TableCell>
      <TableCell key={`${encounter.patientUuid}-birthDate`}>
        {formatDate(parseDate(encounter.patientBirthdate), { mode: 'wide', time: false })}
      </TableCell>
      <TableCell key={`${encounter.id}-actions`}>
        <UserHasAccess privilege={session.editPrivilege}>
          <Button kind="ghost" onClick={handleEditEncounter} renderIcon={(props) => <Edit size={16} {...props} />}>
            {t('editEncounter', 'Edit encounter')}
          </Button>
          {/* <Button kind="ghost" onClick={handleEditEncounter} renderIcon={(props) => <Unlink size={16} {...props} />}>
          {t('disassociateEncounter', 'Disassociate Encounter')}
        </Button> */}
          <Button
            kind="danger--ghost"
            onClick={handleDeleteEncounter}
            renderIcon={(props) => <TrashCan size={16} {...props} />}
          >
            {t('deleteEncounter', 'Delete encounter')}
          </Button>
        </UserHasAccess>
      </TableCell>
    </TableRow>
  );
};

export default EncounterListRow;
