import React, { useCallback, useMemo, useState } from 'react';
import { ComposedModal, Button, ModalHeader, ModalFooter, ModalBody, FormLabel, Loading } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, fetchCurrentPatient, openmrsFetch, showSnackbar, usePatient } from '@openmrs/esm-framework';
import styles from './styles.scss';

const MemExtension = React.memo(ExtensionSlot);

const PatientRow = ({ patient, removePatient }) => {
  const { t } = useTranslation();
  const { patient: patientInfo, error, isLoading } = usePatient(patient?.uuid);
  const onClickHandler = useCallback(() => removePatient(patient?.uuid), [patient, removePatient]);

  const patientDisplay = useMemo(() => {
    if (isLoading || error || !patientInfo) return '';

    const { identifier, name } = patientInfo;
    const displayIdentifier = identifier?.[0]?.value || '';
    const givenNames = `${(name?.[0]?.given || []).join(' ')} ${name?.[0]?.family || ''}`;

    return `${displayIdentifier ? `${displayIdentifier} -` : ''}${givenNames ? ` ${givenNames}` : ''}`.trim();
  }, [isLoading, error, patientInfo]);

  return (
    <li className={styles.patientRow}>
      <span>
        <Button
          kind="tertiary"
          size="sm"
          hasIconOnly
          onClick={onClickHandler}
          renderIcon={TrashCan}
          tooltipAlignment="start"
          tooltipPosition="top"
          iconDescription={t('remove', 'Remove')}
        />
      </span>
      <span className={styles.patientName}>{patientDisplay}</span>
    </li>
  );
};

const NewGroupForm = (props) => {
  const { name, setName, patientList, updatePatientList, errors, validate, removePatient } = props;
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '1rem',
      }}
    >
      {errors?.patientList && (
        <p className={styles.formError}>{t('noPatientError', 'Please enter at least one patient.')}</p>
      )}
      {!errors?.patientList && (
        <ul className={styles.patientList}>
          {patientList?.map((patient, index) => (
            <PatientRow patient={patient} removePatient={removePatient} key={patient.uuid} />
          ))}
        </ul>
      )}

      <FormLabel>{t('searchForPatientsToAddToSession', 'Search for patients to add to session')}</FormLabel>
      <div className={styles.searchBar}>
        <MemExtension
          name="patient-search-bar-slot"
          state={{
            selectPatientAction: updatePatientList,
            buttonProps: {
              kind: 'secondary',
            },
          }}
        />
      </div>
    </div>
  );
};

const AddPatient2SessionModal = ({
  patients = undefined,
  groupName = '',
  isOpen,
  onPostCancel,
  onPostSubmit,
  session,
}) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [name, setName] = useState(groupName);
  const [patientList, setPatientList] = useState(patients || []);
  const [isLoading, setIsLoading] = useState(false);

  const removePatient = useCallback(
    (patientUuid: string) =>
      setPatientList((patientList) => patientList.filter((patient) => patient.uuid !== patientUuid)),
    [setPatientList],
  );

  const validate = useCallback(() => {
    let valid = true;
    if (!patientList.length) {
      setErrors((errors) => ({ ...errors, patientList: 'required' }));
      valid = false;
    } else {
      setErrors((errors) => ({ ...errors, patientList: null }));
    }
    return valid;
  }, [patientList.length]);

  const updatePatientList = useCallback(
    (patientUuid) => {
      function getPatientName(patient) {
        return [patient?.name?.[0]?.given, patient?.name?.[0]?.family].join(' ');
      }
      if (!patientList.find((p) => p.uuid === patientUuid)) {
        fetchCurrentPatient(patientUuid).then((result) => {
          const newPatient = { uuid: patientUuid, ...result };
          setPatientList(
            [...patientList, newPatient].sort((a, b) =>
              getPatientName(a).localeCompare(getPatientName(b), undefined, {
                sensitivity: 'base',
              }),
            ),
          );
        });
      }
      setErrors((errors) => ({ ...errors, patientList: null }));
    },
    [patientList, setPatientList],
  );

  const onSave = useCallback(() => {
    showSnackbar({
      title: t('successfullyTransferred', 'Successfully added'),
      kind: 'success',
      isLowContrast: true,
      subtitle: `${t('patientAdded2Session', 'Patient(s) successfully added to session "{{session}}"', {
        session: session.name,
      })}`,
    });
  }, [session.name, t]);

  const onError = useCallback(() => {
    showSnackbar({
      title: t('error', 'Error'),
      kind: 'error',
      isLowContrast: true,
    });
  }, [t]);

  const handleSubmit = () => {
    if (validate()) {
      setIsLoading(true);
      const payload = { ids: patientList.map((item) => item.uuid) };

      openmrsFetch(`/ws/icrc/sessions/` + (session.id ?? session.name) + '/patients', {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      })
        .then(onSave)
        .catch(onError)
        .finally(() => {
          setIsLoading(false);
          onPostSubmit();
        });
    }
  };

  const handleCancel = () => {
    setPatientList(patients || []);
    if (onPostCancel) {
      onPostCancel();
    }
  };

  return (
    <div className={styles.modal}>
      <ComposedModal open={isOpen} onClose={handleCancel} preventCloseOnClickOutside={true}>
        {isLoading && <Loading withOverlay={true} />}
        <ModalHeader label={t('addPatientsToSession', 'Add Patients to Session')} title={session.name}></ModalHeader>
        <ModalBody>
          <NewGroupForm
            {...{
              name,
              setName,
              patientList,
              updatePatientList,
              errors,
              validate,
              removePatient,
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={handleCancel} disabled={isLoading}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" onClick={handleSubmit} disabled={isLoading}>
            {t('addPatients', 'Add Patients')}
          </Button>
        </ModalFooter>
      </ComposedModal>
    </div>
  );
};

export default AddPatient2SessionModal;
