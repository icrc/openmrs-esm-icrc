import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter, OrderedList, ListItem } from '@carbon/react';
import styles from '../../style.scss';

interface DeleteSessionConfirmationProps {
  sessionName?: string;
  sessionPatients?: Array<string>;
  close: Function;
  onConfirmation: Function;
}

const DeleteSessionConfirmation: React.FC<DeleteSessionConfirmationProps> = ({
  close,
  onConfirmation,
  sessionName,
  sessionPatients,
}) => {
  const { t } = useTranslation();
  const handleCancel = () => close();
  const handleDelete = () => onConfirmation?.();

  return (
    <>
      <ModalHeader closeModal={close} className={styles.productiveHeading03}>
        {t('deleteSession', 'Delete group session - {{sessionName}}', { sessionName: sessionName })}?
      </ModalHeader>
      <ModalBody>
        <p className={styles.bodyLong01}>
          {t(
            'deleteSessionConfirmationText',
            `Are you sure you want to delete this session? This action can't be undone.`,
            { sessionName: sessionName },
          )}
        </p>
        <br />
        <p className={styles.bodyLong01}>
          {t(
            'deleteSessionDisclaimerText',
            `Deleting this session will also remove {{numberOfEncounters}} encounter(s) that were in this session for the following patient(s)`,
            { numberOfEncounters: sessionPatients?.length },
          )}
          :
        </p>
        <p className={styles.bodyLong01}>{sessionPatients.toString()}</p>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" kind="secondary" onClick={handleCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button autoFocus kind="danger" onClick={handleDelete} size="lg">
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteSessionConfirmation;
