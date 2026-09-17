import React, { useEffect, useState, useMemo } from 'react';
import { CardHeader, EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { Link, TableContainer, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  getConfig,
  useConfig,
  usePatient,
  formatDate,
  parseDate,
  UserHasAccess,
  updateVisit,
  showToast,
  showNotification,
  useSession,
  userHasAccess,
} from '@openmrs/esm-framework';
import { useVisit, useVisits } from '../visit.resource';
import {
  Checkmark,
  CheckmarkFilled,
  CheckmarkOutline,
  CircleStroke,
  CircleFilled,
  CircleDash,
  CloseFilled,
} from '@carbon/icons-react';
import { useObs } from '../useObs';
import { WorkflowStep, workflowSteps } from './workflow';
import { HtmlFormEntryForm, requiredPrivilege } from '../config-schema';
import styles from './hsu-journey.scss';
import { useForms } from '../form.resource';
import { useParams } from 'react-router-dom';
import { getExternalLink } from '../helpers';
import { launchFormEntryOrHtmlForms } from '../form-entry-interop';

interface HsuJourneyProps {
  basePath: string;
  patient: fhir.Patient;
}

export const FORM_STATUS = {
  NOT_DONE: 'not done',
  DRAFT: 'draft',
  VALIDATED: 'validated',
};

const HsuJourney: React.FC<HsuJourneyProps> = ({ patient, basePath }) => {
  const config = useConfig();
  const session = useSession();

  const { t } = useTranslation();

  const { patientUuid: hookPatientUuid } = usePatient();
  const { patientUuid: urlPatientUuid } = useParams();

  const [urlVisitId, setUrlVisitId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('visitId');
    setUrlVisitId(id);
  }, []);

  const patientUuid = urlPatientUuid || hookPatientUuid;
  const headerTitle = t('hsuJourney', 'HSU Journey');

  let {
    visits: currentVisit,
    isError: isError2,
    isLoading: isLoading2,
    isValidating: isValidating2,
  } = useVisit(urlVisitId);

  // Enrich workflowSteps structure with the forms edit privileges and proper name to be displayed fetched from backend
  const { forms } = useForms();

  useEffect(() => {
    if (forms && workflowSteps) {
      workflowSteps.forEach((step) => {
        step.forms?.forEach((form) => {
          const meta = forms.find((f) => f.uuid === form.formUuid);
          if (meta) {
            form.editPrivilege = meta.encounterType?.editPrivilege?.name;
            form.display = meta.display || form.display;
          }
        });
      });
    }
  }, [forms]);

  const endCurrentVisit = () => {
    const endVisitPayload = {
      location: currentVisit.location.uuid,
      startDatetime: parseDate(currentVisit.startDatetime),
      visitType: currentVisit.visitType.uuid,
      stopDatetime: new Date(),
    };

    const abortController = new AbortController();
    updateVisit(currentVisit.uuid, endVisitPayload, abortController)
      .then((response) => {
        if (response.status === 200) {
          showToast({
            critical: true,
            kind: 'success',
            description: t('visitEndSuccessfully', `${response?.data?.visitType?.display} ended successfully`),
            title: t('visitEnded', 'Visit ended'),
          });
        }
      })
      .catch((error) => {
        showNotification({
          title: t('endVisitError', 'Error ending active visit'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      });
  };

  const [htmlFormEntryFormsConfig, setHtmlFormEntryFormsConfig] = React.useState<null | Array<HtmlFormEntryForm>>([]);
  React.useEffect(() => {
    getConfig('@openmrs/esm-patient-forms-app').then((config) => {
      setHtmlFormEntryFormsConfig(config.htmlFormEntryForms as HtmlFormEntryForm[]);
    });
  }, [config]);

  const { visits, isError, isLoading } = useVisits(patientUuid);

  let workflow: WorkflowStep[] = [];
  let nextStep = null;
  let status = null;
  let encounters = [];

  if (!urlVisitId) {
    currentVisit = visits && visits[0] && !visits[0].stopDatetime ? visits[0] : null;
  }

  if (currentVisit) {
    let previousStep = null;
    let visit = currentVisit;

    // Order visits
    visit.encounters = visit.encounters.sort((a, b) => {
      const dateA = new Date(a.encounterDatetime).getTime();
      const dateB = new Date(b.encounterDatetime).getTime();

      if (dateA === dateB) {
        return a.id - b.id; // Sort by id if encounter date is the same - PRONE TO ERROR!
      }

      return dateA - dateB;
    });

    encounters = [...visit.encounters];

    visit.encounters.forEach(function (encounter, i) {
      // Get the workflow state saved within this encounter
      let iteratedVisitStatus = encounter.obs.filter((obs) => {
        return obs.concept.uuid === '7f45c437-da7e-4f8a-81cc-07bba2c51f1d';
      })[0];
      // If this encounter has no state obs, assume we're still in the previous encounter state
      status = iteratedVisitStatus ? iteratedVisitStatus : status;

      let validatedByObs = encounter?.obs.filter((obs) => {
        return obs.concept.uuid === '1382a696-3e63-11e9-b210-d663bd873d93'; // ICRC:Validated_By
      })[0];

      if (!validatedByObs || !status) return;

      let iteratedStep;

      if (i === 0 && !status) {
        iteratedStep = workflowSteps[0];
      } else {
        // Get the next workflow step according to the state we're in
        iteratedStep = workflowSteps.filter((step) => {
          let isEligibleStep = step.requiredStates?.filter((state) => {
            return state === status?.value.uuid;
          })[0];
          return isEligibleStep?.length > 0;
        })[0];
      }

      // TODO: DELETE
      if (!iteratedStep) {
        iteratedStep = workflowSteps[workflowSteps.length - 1];
      }

      let workflowStep = workflowSteps[0];
      if (iteratedStep) {
        workflowStep = JSON.parse(JSON.stringify(iteratedStep));
        workflowStep.encounterId = encounter.id;
      }

      let test = workflowSteps.filter((step) => {
        return step.encounterTypeUuid.includes(encounter.encounterType.uuid);
      })[0];

      if (test) workflow.push(workflowStep);
      // If this is the same workflow step as previous encounter, make a copy
      if (previousStep === workflowStep) {
        let idx = workflow.findIndex((x) => x === workflowStep);
        workflowStep = JSON.parse(JSON.stringify(workflowStep));
        workflowStep.step = encounter.form.display;
        workflowStep.encounterId = encounter.id;
        workflowStep.date = parseDate(encounter.encounterDatetime);
        workflow.splice(idx + 1, 0, workflowStep);
        return;
      }

      let s = encounter.obs.filter((obs) => {
        return obs.concept.uuid === '7f45c437-da7e-4f8a-81cc-07bba2c51f1d';
      })[0];
      status = s ? s : status;

      workflowStep.step = encounter.form?.display || '-';
      workflowStep.date = parseDate(encounter.encounterDatetime);
      workflowStep.status = s ? s.value.display : previousStep?.status;
      previousStep = workflowStep;
    });

    if (!status) {
      // No workflow status so, we're still on the 1st step
      nextStep = workflowSteps[0];
      // workflow = workflow.concat(workflowSteps.slice(workflowSteps.indexOf(nextStep) + 1));
    } else {
      // Get the next step from all the workflow steps
      nextStep = workflowSteps.filter((step) => {
        let isElegibleStep = step.requiredStates?.filter((state) => {
          return state === status?.value.uuid;
        })[0];
        return isElegibleStep?.length > 0;
      })[0];
    }

    if (nextStep) {
      workflow.push(nextStep);
      workflow = workflow.concat(workflowSteps.slice(workflowSteps.indexOf(nextStep) + 1));
    }
  } else {
    workflow.push(workflowSteps[0]);
  }

  const nextFormList = useMemo(() => {
    const rawForms = nextStep?.overrides?.(encounters)?.forms || nextStep?.forms || [];
    if (forms) {
      rawForms.forEach((form) => {
        const meta = forms.find((f) => f.uuid === form.formUuid);
        if (meta) {
          form.editPrivilege = meta.encounterType?.editPrivilege?.name;
          form.display = meta.display || form.display;
        }
      });
    }
    return rawForms;
  }, [nextStep, encounters, forms]);

  function getFormStatus(encounterTypeUuid, encounters, statusUuid) {
    // Order visits
    let encountersDesc = [...encounters].sort((a, b) => {
      return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
    });

    let encounter = encountersDesc.filter(function (encounter, i) {
      return encounter.encounterType.uuid === encounterTypeUuid;
    });

    if (encounter.length === 0) return FORM_STATUS.NOT_DONE;

    let obs = encounter[0].obs.filter((obs) => {
      //return obs.concept.uuid === '1382a47a-3e63-11e9-b210-d663bd873d93'; // ICRC:Validated
      return (
        obs.concept.uuid === '1382a33a-3e63-11e9-b210-d663bd873d93' || // ICRC:Pre_Checkout_Finishing_Validation
        obs.concept.uuid === '1382a696-3e63-11e9-b210-d663bd873d93' // ICRC:Validated_By
      );
    });

    return obs.length === 0 ? FORM_STATUS.DRAFT : FORM_STATUS.VALIDATED;
  }

  function getEncounterId(encounterTypeUuid, encounters) {
    let encounter = encounters.filter(function (encounter, i) {
      return encounter.encounterType.uuid === encounterTypeUuid;
    })[0];
    return encounter?.id;
  }

  if (!currentVisit) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <UserHasAccess privilege={requiredPrivilege}>
          <div className={styles.lastVisitsWidgetContainer}>
            <CardHeader title={headerTitle}>
              <></>
            </CardHeader>
            <TableContainer className={styles.esmpatientmedicationscard}>
              <div style={{ width: '100%', height: '130px', textAlign: 'center' }}>
                <h5 className={styles.tile}>
                  <EmptyDataIllustration />
                  <p className={styles.content}>{t('noActiveVisit', 'No Active Visit')}</p>
                </h5>
              </div>
            </TableContainer>
          </div>
        </UserHasAccess>
      </div>
    );
  } else {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <CardHeader title={headerTitle}>
          <></>
        </CardHeader>
        <TableContainer className={styles.esmpatientmedicationscard} id="hsu-journey-container">
          {isLoading ? (
            <InlineLoading style={{ margin: '1rem' }} description={t('loading', 'Loading...')} />
          ) : (
            <div style={{ width: '100%', height: 'auto', display: 'flex', gap: '1rem' }}>
              <div className="journeyList" style={{ flex: 1, height: '100%' }}>
                {workflow.map((workflowStep, i) => {
                  const isStart = !workflowStep?.status && i === 0;
                  const isNext = !workflowStep?.status && workflow[i - 1]?.status;
                  return (
                    (i === 0 || workflow[i - 1]?.status) && (
                      <div key={i}>
                        <div
                          className={`${isNext || isStart ? styles.incompleteStep : styles.completedStep} ${
                            i === 0 ? styles.firstStep : ''
                          }`}
                          style={{
                            minHeight: '75px',
                            overflowWrap: 'break-word',
                            paddingLeft: '10px',
                            paddingTop: '20px',
                            fontSize: '0.875rem',
                            lineHeight: '1',
                          }}
                        >
                          <div style={{ width: '8%', float: 'left', textAlign: 'center' }}>
                            {workflowStep?.status && <CheckmarkOutline className={styles.blue} />}
                            {!workflowStep?.status && workflowStep?.step === nextStep?.step && (
                              <CircleFilled className={styles.blue} />
                            )}
                            {!workflowStep?.status && !workflow[i - 1]?.status && i != 0 && (
                              <CircleDash className={styles.blue} />
                            )}
                          </div>
                          <div style={{ width: '90%', height: '100%', float: 'left' }}>
                            <span
                              style={{
                                color: i > 0 && !workflow[i - 1]?.status ? 'lightgrey' : '',
                                fontWeight: workflowStep?.step === nextStep?.step ? 'bold' : 'normal',
                              }}
                            >
                              {t(workflowStep?.overrides?.(encounters)?.step ?? workflowStep?.step)}
                            </span>
                            {workflowStep?.status && (
                              <div>
                                <div style={{ color: 'grey', paddingTop: '6px' }}>Status: {workflowStep?.status}</div>
                                <div style={{ color: 'grey', paddingTop: '6px' }}>
                                  {workflowStep?.date &&
                                    formatDate(workflowStep?.date, {
                                      day: false,
                                      time: true,
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  );
                })}
              </div>

              <div style={{ flex: 1, height: '100%' }}>
                <div style={{ paddingBottom: '20px' }}>
                  <strong>{t('currentVisitSuggestedActions', 'Current Visit Suggested Actions')}</strong>
                </div>
                <div style={{ paddingBottom: '10px' }}>
                  {t('actionsMarked', 'Actions marked with')} <span style={{ color: 'red' }}>*</span>{' '}
                  {t('areMandatory', 'are mandatory')}
                </div>

                {!nextStep && (
                  <>
                    <CloseFilled style={{ width: '30px' }} className={styles.black} />
                    <Link
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        endCurrentVisit();
                      }}
                      role="presentation"
                      className={styles.formName}
                    >
                      {'End visit'}
                    </Link>
                  </>
                )}
                {nextFormList?.map((form, i) => {
                  let formStatus =
                    (form.getFormStatus && form.getFormStatus(form.encounterTypeUuid, encounters, status.value.uuid)) ||
                    getFormStatus(form.encounterTypeUuid, encounters, status?.value?.uuid);

                  let shouldCreateNewEncounter =
                    formStatus === FORM_STATUS.NOT_DONE || (form.allowMultiple && formStatus === FORM_STATUS.VALIDATED);
                  let isFormBlocked =
                    (form.isBlocked && form.isBlocked(encounters, status.value.uuid)) ||
                    !userHasAccess(form?.editPrivilege, session?.user);
                  return (
                    <div key={i}>
                      <div className={styles.journeystep}>
                        <div style={{ cursor: 'pointer', float: 'left' }}>
                          {(formStatus === FORM_STATUS.NOT_DONE || isFormBlocked) && (
                            <CircleStroke style={{ width: '30px' }} className={styles.black} />
                          )}

                          {formStatus === FORM_STATUS.DRAFT && !isFormBlocked && (
                            <Checkmark style={{ width: '30px' }} className={styles.black} />
                          )}

                          {formStatus === FORM_STATUS.VALIDATED && !isFormBlocked && (
                            <CheckmarkFilled style={{ width: '30px' }} className={styles.black} />
                          )}
                        </div>
                        <div style={{ float: 'left', maxWidth: 'calc(100% - 40px)' }}>
                          {!isFormBlocked && (
                            <Link
                              external={getExternalLink(
                                htmlFormEntryFormsConfig,
                                patientUuid,
                                form.formUuid,
                                currentVisit.uuid,
                                !shouldCreateNewEncounter && getEncounterId(form.encounterTypeUuid, encounters),
                              )}
                              style={{
                                cursor: 'pointer',
                                display: 'inline-block',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                              }}
                              onClick={() => {
                                launchFormEntryOrHtmlForms(
                                  currentVisit,
                                  form.formUuid,
                                  { id: patientUuid },
                                  htmlFormEntryFormsConfig || [],
                                  !shouldCreateNewEncounter && getEncounterId(form.encounterTypeUuid, encounters),
                                  form.display,
                                );
                              }}
                              role="presentation"
                              className={styles.formName}
                            >
                              {form.display}
                            </Link>
                          )}
                          {isFormBlocked && (
                            <span
                              style={{
                                color: 'grey',
                                fontSize: '0.875rem',
                                display: 'inline-block',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                              }}
                            >
                              {form.display}
                            </span>
                          )}
                        </div>
                        <span className={styles.blue}>
                          {form.isMandatory && <span style={{ color: 'red' }}>&nbsp;*</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TableContainer>
      </div>
    );
  }
};

export default HsuJourney;
