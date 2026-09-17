import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import {
  ComposedModal,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  TextInput,
  Tile,
  Layer,
  DatePicker,
  DatePickerInput,
  TextArea,
  Loading,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getConfig, openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import useSpecificQuestions from './specificquestions/useSpecificQuestions';
import ConfigurableQuestionsSection from './specificquestions/ConfigurableQuestionsSection';

const SessionForm = ({ questions, session, disabled }) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <>
      <Tile>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '1.5rem',
          }}
        >
          {!session.extraSessionData?.hasOwnProperty('sessionName') && (
            <TextInput
              id="text"
              type="text"
              defaultValue={session.name}
              labelText={t('sessionName', 'Session Name')}
              {...register('sessionName')}
              invalid={errors.sessionName}
              invalidText={t('requiredField', 'This field is required')}
              disabled={disabled}
            />
          )}
          {!session.extraSessionData?.hasOwnProperty('practitionerName') && (
            <TextInput
              id="text"
              type="text"
              defaultValue={session.practitioner}
              labelText={t('practitionerName', 'Practitioner Name')}
              {...register('practitionerName')}
              invalid={errors.practitionerName}
              invalidText={t('requiredField', 'This field is required')}
              disabled={disabled}
            />
          )}
          {!session.extraSessionData?.hasOwnProperty('sessionDate') && (
            <Controller
              name="sessionDate"
              control={control}
              defaultValue={session.datetime}
              render={({ field }) => (
                <DatePicker datePickerType="single" size="md" {...field}>
                  <DatePickerInput
                    id="session-date"
                    labelText={t('sessionDate', 'Session Date')}
                    placeholder="mm/dd/yyyy"
                    size="md"
                    invalid={errors.sessionDate}
                    invalidText={t('requiredField', 'This field is required')}
                    disabled={disabled}
                  />
                </DatePicker>
              )}
            />
          )}
          {!session.extraSessionData?.hasOwnProperty('sessionNotes') && (
            <TextArea
              id="text"
              type="text"
              defaultValue={session.details}
              labelText={t('sessionNotes', 'Session Notes')}
              {...register('sessionNotes')}
              invalid={errors.sessionNotes}
              invalidText={t('requiredField', 'This field is required')}
              disabled={disabled}
            />
          )}
        </div>
      </Tile>
      {questions?.length > 0 ? (
        <>
          <Tile>
            <Layer>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: '1.5rem',
                }}
              >
                <ConfigurableQuestionsSection register={register} specificQuestions={questions} />
              </div>
            </Layer>
          </Tile>
        </>
      ) : null}
    </>
  );
};

const SessionDetailsEditModal = ({ isOpen, session, handleSessionUpdate, onPostCancel }) => {
  const { t } = useTranslation();
  const methods = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onCancel = useCallback(() => {
    onPostCancel();
  }, [onPostCancel]);

  const [fdeConfig, setFdeConfig] = React.useState({});
  useEffect(() => {
    getConfig('@openmrs/esm-fast-data-entry-app').then((config) => {
      setFdeConfig(config);
    });
  }, []);
  const { questions } = useSpecificQuestions(session.formUuid, fdeConfig['specificQuestions'] || []);

  const extraSessionData = useMemo(() => {
    if (questions && session?.extraSessionData) {
      const updatedQuestions = questions.map((question) => ({
        ...question,
        question: {
          ...question.question,
          defaultAnswer: session.extraSessionData[question.question.id] || question.question.defaultAnswer,
        },
      }));
      return [...updatedQuestions];
    }
  }, [questions, session]);

  const saveSessionDetails = useCallback(
    (data) => {
      setIsLoading(true);
      const payload = {
        name: data.sessionName,
        datetime: new Date(data.sessionDate),
        originalDatetime: new Date(session.datetime),
        practitioner: data.practitionerName,
        details: data.sessionNotes,
        // Include only string key-value pairs from 'data' as extra
        extraSessionData: Object.fromEntries(Object.entries(data).filter(([key, value]) => typeof value === 'string')),
      };
      openmrsFetch(`/ws/icrc/sessions/` + (session.id ?? session.name), {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      })
        .then(() => {
          showSnackbar({
            title: t('sessionDetailsSaved', 'Successfully Saved'),
            kind: 'success',
            isLowContrast: true,
            subtitle: `${t('sessionDetailsSaved', '"{{session}}" session details updated', {
              session: session.name,
            })}`,
          });
          handleSessionUpdate({ id: session.id, ...data });
        })
        .catch(() => {
          showSnackbar({
            title: t('error', 'Error'),
            kind: 'error',
            isLowContrast: true,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [session, handleSessionUpdate, t],
  );

  return (
    <form onSubmit={methods.handleSubmit((data) => saveSessionDetails(data))}>
      <ComposedModal preventCloseOnClickOutside={true} open={isOpen} onClose={onCancel}>
        {isLoading && <Loading withOverlay={true} />}
        <ModalHeader label={t('editSessionDetails', 'Edit session details')} title={session.name}></ModalHeader>
        <ModalBody>
          <FormProvider {...methods}>
            <SessionForm questions={extraSessionData} session={session} disabled={isLoading} />
          </FormProvider>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onCancel} disabled={isLoading}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" kind="primary" disabled={isLoading}>
            {t('save', 'Save')}
          </Button>
        </ModalFooter>
      </ComposedModal>
    </form>
  );
};

export default SessionDetailsEditModal;
