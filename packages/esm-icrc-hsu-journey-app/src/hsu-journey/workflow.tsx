import { FORM_STATUS } from './hsu-journey.component';

const VALIDATED_BY_CONCEPT_UUID: string = '1382a696-3e63-11e9-b210-d663bd873d93';
const WALKING_AID_CONCEPT_UUID: string = '94be49d2-9ce4-46af-9748-2833036f1466';
const ADL_PRODUCT_CONCEPT_UUID: string = '378deba0-d84c-40dc-afd0-6f56af8e2299';
const RENEW_ASSISTIVE_DEVICE_CONCEPT_UUID: string = '4e242956-b38d-11e9-a2a3-2a2ae2dbcce4';

const BASIC_SERVICE_PLAN_ENCTYPE_UUID: string = '9243ddfe-0386-498e-92b3-65d31eca9b5f';
const SOCIO_ECON_ASSASS_ENCTYPE_UUID: string = 'ac8de8c2-58ad-48e7-80aa-2bb5a6b855fc';
const FINANCING_DECISION_ENCTYPE_UUID: string = '78169009-b366-4c5b-973b-d1cc613a2dae';
const INTERM_ASSASS_OUT_GOAL_ENCTYPE_UUID: string = 'a99369d3-0bf4-4f06-b50b-7fc1520fdffd';

function getEncounter(encounterTypeUuid, encounters) {
  let a = encounters.filter(function (encounter, i) {
    return encounter.encounterType.uuid === encounterTypeUuid;
  });
  return a[0];
}

function isFormSavedAndValidated(encouterTypeUuid, encounters) {
  let encounter = getEncounter(encouterTypeUuid, encounters);

  let validatedByObs = encounter?.obs.filter((obs) => {
    return obs.concept.uuid === VALIDATED_BY_CONCEPT_UUID;
  })[0];

  return validatedByObs;
}

function getServiceFormStatus(encounterTypeUuid, encounters) {
  // Order visits
  let encountersDesc = encounters.sort((a, b) => {
    return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
  });
  let formStatus = null;
  encountersDesc.every((e) => {
    if (e.encounterType.uuid === BASIC_SERVICE_PLAN_ENCTYPE_UUID) {
      // Basic service plan
      // There a 'Basic service plan' before any of the specified service form
      formStatus = FORM_STATUS.NOT_DONE;
      return false;
    }
    if (e.encounterType.uuid === encounterTypeUuid) {
      // There a service form after last 'Basic service plan'
      if (isFormValidated(e)) {
        formStatus = isFormValidated(e) ? FORM_STATUS.VALIDATED : FORM_STATUS.DRAFT;
      }
      return false;
    }
    return true;
  });
  return formStatus;
}

function isFormValidated(encounter) {
  let validatedByObs = encounter?.obs.filter((obs) => {
    return obs.concept.uuid === VALIDATED_BY_CONCEPT_UUID;
  })[0];
  return !!validatedByObs;
}

interface WorkflowForm {
  formUuid?: string;
  encounterTypeUuid?: string;
  display: string;
  isMandatory?: Boolean;
  allowMultiple?: Boolean;
  isBlocked?(Visit, string): Boolean;
  getFormStatus?(encounterTypeUuid: string, encounters: Array<any>, statusUuid: string): any;
  editPrivilege?: string;
}

export interface WorkflowStep {
  encounterId?: string;
  encounterTypeUuid: string[];
  step: string;
  requiredStates?: string[];
  date?: Date;
  status?: string;
  forms: WorkflowForm[];
  overrides?(encounters: Array<any>): any;
}

export const workflowSteps: WorkflowStep[] = [
  {
    encounterId: null,
    encounterTypeUuid: ['849f7545-6839-4788-be48-bbc800d2692f'],
    step: 'Initial Decision After Registration',
    requiredStates: [],
    date: null,
    status: null,
    forms: [
      {
        formUuid: '97c09137-5bf6-4afc-8073-ccde16bb2698',
        encounterTypeUuid: '849f7545-6839-4788-be48-bbc800d2692f',
        display: 'Initial Decision After Registration',
        isMandatory: true,
      },
    ],
  },
  {
    encounterTypeUuid: ['01f08012-e4a4-4add-8c11-b977bdb1c8ba'],
    step: 'Initial Assessment Form',
    requiredStates: [
      '9dd57e78-cb7c-44da-84d0-913ec79536b4', // ICRC:AWAITING_IDTIA
    ],
    forms: [
      {
        formUuid: '8e4289bc-cfda-4d07-a90b-c28a7ff6c576',
        encounterTypeUuid: '01f08012-e4a4-4add-8c11-b977bdb1c8ba',
        display: 'Initial assessment Form',
        isMandatory: true,
      },
    ],
  },
  {
    encounterTypeUuid: ['5ce338a9-dfde-2279-a96d-d58522a22a22'],
    step: 'Initial Assessment Outcome and Goal Setting',
    requiredStates: [
      '5154f49e-c04f-4e61-95e8-054018546d9a', // ICRC:INITIAL_ASSESSMENT_DONE
    ],
    overrides(encounters) {
      let encountersDesc = encounters.sort((a, b) => {
        return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
      });

      let initDecisionAfterRegiEncounter = encountersDesc.filter(function (encounter, i) {
        return encounter.encounterType.uuid === '849f7545-6839-4788-be48-bbc800d2692f';
      });

      if (initDecisionAfterRegiEncounter.length === 0) {
        return null;
      }

      let walkingAidObs = initDecisionAfterRegiEncounter[0].obs.filter((obs) => {
        return obs.value.uuid === '94be49d2-9ce4-46af-9748-2833036f1466';
      });

      if (walkingAidObs.length === 0) {
        return null;
      } else {
        return {
          forms: [
            {
              formUuid: 'a52cdbd3-a1ec-4be9-a921-47f1902f4983',
              encounterTypeUuid: '13458695-3b06-4d59-9508-d217aa21ea27',
              display: 'Walking aid and ADL product card',
              isMandatory: true,
            },
          ],
          step: 'Walking aid and ADL product card',
        };
      }
    },
    forms: [
      {
        formUuid: '5ce338a9-eede-ee79-a96d-d99754135a5b',
        encounterTypeUuid: '5ce338a9-dfde-2279-a96d-d58522a22a22',
        display: 'Initial assessment Outcome and Goal Setting',
        isMandatory: true,
      },
      {
        formUuid: '13a42203-1675-422a-9149-0d480b9cc1c7',
        encounterTypeUuid: '5ce338a9-dfde-4779-a96d-d9022da35a5b',
        display: 'Stump Assessment',
      },
      {
        formUuid: '5ce338a9-dfde-4779-a96d-d98899835a5b',
        encounterTypeUuid: '5ce338a9-dfde-4779-a96d-d58585a35a5b',
        display: 'Muscle and ROM - Lower Limb',
      },
      {
        formUuid: 'c7bcdf30-b0f0-43d4-9a38-7f23cf86186c',
        encounterTypeUuid: '549d700a-74b2-458c-904c-5f8cd6af561e',
        display: 'Muscle and ROM - Upper Limb',
      },
      {
        formUuid: 'a7efgf30-b0f0-43d4-9a37-7f23cf86198b',
        encounterTypeUuid: '946e912b-74b2-458c-904c-9z3aa9bc923b',
        display: 'Muscle and ROM - Trunk',
      },
      {
        formUuid: '26bc8e97-4243-46da-b998-fc49892eff8d',
        encounterTypeUuid: '7b78eeb7-2ba2-4b27-afe4-d0bdb74b6319',
        display: 'Pain Assessment',
      },
      {
        formUuid: '3b07bccc-1623-4380-af4a-4bb68424e909',
        encounterTypeUuid: 'cb7abef2-b690-4754-a8d8-581f9166913d',
        display: 'Sensory Assessment',
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a921-37f1902f239c',
        encounterTypeUuid: 'fa67ce3e-61ec-4152-8527-453836d6d525',
        display: 'Functional Activities - Lower Limb',
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a915-37f1902k239t',
        encounterTypeUuid: 'fa67ce3e-61ec-4152-8915-453836d6k625',
        display: 'Functional Activities - Upper Limb',
      },
      {
        formUuid: 'dbc7bc9b-9368-4e99-83e5-c66c158c284e',
        encounterTypeUuid: '3143d81d-f1c5-4fb4-b49c-cb0034bcc21d',
        display: 'Gait Analysis Assessment',
      },
      {
        formUuid: '3b07b00c-1623-4380-af4a-4bb8255arat6',
        encounterTypeUuid: '6c39d93d-73c2-4388-bffa-ccf80508064b',
        display: 'Action Research Arm Test (ARAT)',
      },
      {
        formUuid: 'd2e1d055-70e3-3dde-801e-efb2f717d24d',
        encounterTypeUuid: '6c39d93d-73c2-4388-whod-asf80508064b',
        display: 'WHODAS 2.0 Form',
      },
      {
        formUuid: '8ce228a9-bge1-bb77-a96d-d28754134b2c',
        encounterTypeUuid: '9bbc2ae5-c7f6-5108-9f40-8d9f8a146ec3',
        display: 'Diabetic Foot Assessment',
      },
    ],
  },
  {
    encounterTypeUuid: [BASIC_SERVICE_PLAN_ENCTYPE_UUID],
    step: 'Basic service plan',
    requiredStates: [
      'd39d856d-db86-414b-8e8f-be54762d0998', // ICRC:ELIGIBLE_SERVICES
      '41aba08d-d8cc-4445-b26c-50082634303d', // ICRC:SERVICES_ADJUSTMENT
    ],
    forms: [
      {
        formUuid: '3b07b00c-1623-4380-af4a-4bb68244eff5',
        encounterTypeUuid: BASIC_SERVICE_PLAN_ENCTYPE_UUID,
        display: 'Basic service plan',
        isMandatory: true,
        getFormStatus(encounterTypeUuid, encounters, statusUuid) {
          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });
          let formStatus = null;
          encountersDesc.every((e) => {
            if (e.encounterType.uuid === INTERM_ASSASS_OUT_GOAL_ENCTYPE_UUID) {
              // Intermediate Assessment Outcome and Goal Setting
              // There a 'Intermediate Assessment Outcome and Goal Setting' before any 'Basic service plan'
              formStatus = FORM_STATUS.NOT_DONE;
              return false;
            }
            if (e.encounterType.uuid === BASIC_SERVICE_PLAN_ENCTYPE_UUID) {
              // Basic service plan
              // There a 'Basic service plan' after last 'Intermediate Assessment Outcome and Goal Setting'
              if (isFormValidated(e)) {
                formStatus = isFormValidated(e) ? FORM_STATUS.VALIDATED : FORM_STATUS.DRAFT;
              }
              return false;
            }
            return true;
          });
          return formStatus;
        },
      },
      {
        formUuid: '41dc6bae-b5f8-4e3d-975d-k943k9t3k39t',
        encounterTypeUuid: '41dc6bae-b5f8-4e3d-975d-e97c3k9t3k39',
        display: 'Add Clinical Consent',
        isBlocked(encounters, statusUuid) {
          let isBlocked = true;

          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });

          encountersDesc.every((e) => {
            if (e.encounterType.uuid === INTERM_ASSASS_OUT_GOAL_ENCTYPE_UUID) {
              // Intermediate Assessment Outcome and Goal Setting
              isBlocked = true;
              return false;
            }
            if (e.encounterType.uuid === BASIC_SERVICE_PLAN_ENCTYPE_UUID) {
              // Basic service plan
              isBlocked = false;
              return false;
            }
            return true;
          });
          return isBlocked;
          // let encounter = getEncounter(BASIC_SERVICE_PLAN_ENCTYPE_UUID, encounters); // Basic service plan
          // return !encounter;
        },
      },
    ],
  },
  {
    // This step is included to ensure that, along with the workflow, the status is displayed once a Financing Decision encounter is completed.
    encounterTypeUuid: [FINANCING_DECISION_ENCTYPE_UUID],
    step: 'Financing Decision',
    requiredStates: [],
    forms: [],
  },
  {
    encounterTypeUuid: ['fa67ce3e-61ec-4152-8527-453836d6d719', SOCIO_ECON_ASSASS_ENCTYPE_UUID],
    step: 'Financial Capacity Assessment',
    requiredStates: [
      '8fdfda3b-93b0-43ab-b945-4aeb4ad7f900', // ICRC:SERVICES_PLANNED
      'fd2608b9-130f-4cde-a034-d56b85d2483a', // ICRC:1990739,Finance approval pending
      '61e270b9-4617-4561-9f94-5274282d9fba', // ICRC:SOCIO_ECON_PENDING
    ],
    forms: [
      {
        formUuid: '4b4a19c2-6531-4d94-b63d-b0787be55cbd',
        encounterTypeUuid: 'fa67ce3e-61ec-4152-8527-453836d6d719',
        display: 'Financial Capacity Assessment',
        isMandatory: true,
        getFormStatus(encounterTypeUuid, encounters, statusUuid) {
          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });
          let formStatus = null;
          encountersDesc.every((e) => {
            if (e.encounterType.uuid === BASIC_SERVICE_PLAN_ENCTYPE_UUID) {
              // Basic service plan
              // There a 'Basic service plan' before any 'Financial Capacity Assessment'
              formStatus = FORM_STATUS.NOT_DONE;
              return false;
            }
            if (e.encounterType.uuid === 'fa67ce3e-61ec-4152-8527-453836d6d719') {
              // Financial Capacity Assessment
              // There a 'Financial Capacity Assessment' after last 'Basic service plan'
              if (isFormValidated(e)) {
                formStatus = isFormValidated(e) ? FORM_STATUS.VALIDATED : FORM_STATUS.DRAFT;
              }
              return false;
            }
            return true;
          });
          return formStatus;
        },
      },
      {
        formUuid: '3b07b00c-1623-4380-af4a-4bb68244e4e5',
        encounterTypeUuid: SOCIO_ECON_ASSASS_ENCTYPE_UUID,
        display: 'Socio-economic assessment',
        isBlocked(encounters, statusUuid) {
          // Finance approval pending
          if (statusUuid === 'fd2608b9-130f-4cde-a034-d56b85d2483a') {
            return false;
          }

          let isBlocked = false;
          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });
          let formStatus = null;
          encountersDesc.every((e) => {
            if (e.encounterType.uuid === BASIC_SERVICE_PLAN_ENCTYPE_UUID) {
              // Basic service plan
              // There a 'Basic service plan' before any 'Financial Capacity Assessment'
              isBlocked = true;
              return false;
            }
            if (e.encounterType.uuid === 'fa67ce3e-61ec-4152-8527-453836d6d719') {
              // Financial capacity assessment
              // There a 'Financial capacity assessment' after last 'Basic service plan'
              if (isFormValidated(e)) {
                isBlocked = isFormValidated(e) ? false : true;
              }
              return false;
            }
            return true;
          });
          return isBlocked;
        },
        getFormStatus(encounterTypeUuid, encounters, statusUuid) {
          // Finance approval pending
          if (statusUuid === 'fd2608b9-130f-4cde-a034-d56b85d2483a') {
            return FORM_STATUS.VALIDATED;
          }
          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });
          let formStatus = null;
          encountersDesc.every((e) => {
            if (e.encounterType.uuid === BASIC_SERVICE_PLAN_ENCTYPE_UUID) {
              // Basic service plan
              // There a 'Basic service plan' before any 'Financial Capacity Assessment'
              formStatus = FORM_STATUS.NOT_DONE;
              return false;
            }
            if (e.encounterType.uuid === SOCIO_ECON_ASSASS_ENCTYPE_UUID) {
              // Socio-economic assessment
              // There a 'Socio-economic assessment' after last 'Basic service plan'
              if (isFormValidated(e)) {
                formStatus = isFormValidated(e) ? FORM_STATUS.VALIDATED : FORM_STATUS.DRAFT;
              }
              return false;
            }
            return true;
          });
          return formStatus;
        },
      },
      {
        formUuid: '3b07b00c-1623-4380-af4a-4bb68244e099',
        encounterTypeUuid: FINANCING_DECISION_ENCTYPE_UUID,
        display: 'Financing Decision',
        isBlocked(encounters, statusUuid) {
          let isBlocked = false;
          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });
          let formStatus = null;
          encountersDesc.every((e) => {
            if (e.encounterType.uuid === BASIC_SERVICE_PLAN_ENCTYPE_UUID) {
              // Basic service plan
              // There a 'Basic service plan' before any 'Financial Capacity Assessment'
              isBlocked = true;
              return false;
            }
            if (
              e.encounterType.uuid === SOCIO_ECON_ASSASS_ENCTYPE_UUID || // Socio-economic assessment
              statusUuid === 'fd2608b9-130f-4cde-a034-d56b85d2483a' // ICRC:1990739,Socio economic assessment pending
            ) {
              // Socio-economic assessment
              // There a 'Socio-economic assessment' after last 'Basic service plan'
              if (isFormValidated(e)) {
                isBlocked = isFormValidated(e) ? false : true;
              }
              return false;
            }
            return true;
          });
          return isBlocked;
        },
        getFormStatus(encounterTypeUuid, encounters, statusUuid) {
          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });
          let formStatus = null;
          encountersDesc.every((e) => {
            if (e.encounterType.uuid === BASIC_SERVICE_PLAN_ENCTYPE_UUID) {
              // Basic service plan
              // There a 'Basic service plan' before any 'Financial Capacity Assessment'
              formStatus = FORM_STATUS.NOT_DONE;
              return false;
            }
            if (e.encounterType.uuid === FINANCING_DECISION_ENCTYPE_UUID) {
              // Financing Decision
              // There a 'Financing Decision' after last 'Basic service plan'

              // TODO: This should be reviewed. Currently form will always be shown as draft because we want the user to
              //  edit it if answer was 'pending' even if it's validated. The user must change answer to approved in
              //  order to proceed.
              // if (isFormValidated(e)) {
              //   formStatus = isFormValidated(e) ? FORM_STATUS.VALIDATED : FORM_STATUS.DRAFT;
              // }
              formStatus = FORM_STATUS.DRAFT;
              return false;
            }
            return true;
          });
          return formStatus;
        },
      },
    ],
  },
  {
    encounterTypeUuid: [
      INTERM_ASSASS_OUT_GOAL_ENCTYPE_UUID, // Intermediate Assessment Outcome and Goal Setting
      '5ae338a9-df1e-2179-a96d-d58522a12a22', // Final Assessment Outcome and Goal Setting
    ],
    requiredStates: [
      '8100e4b7-3b70-4214-ad85-3b2bade71a57', // ICRC:SERVICES_APPROVED
      '86072aec-1f0c-411f-bb95-157bef9b5605', // ICRC:PRP_SERVICES_STARTED
    ],
    step: 'Services',
    overrides(encounters) {
      let encountersDesc = encounters.sort((a, b) => {
        return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
      });

      let initDecisionAfterRegiEncounter = encountersDesc.filter(function (encounter, i) {
        return encounter.encounterType.uuid === '849f7545-6839-4788-be48-bbc800d2692f';
      });

      if (initDecisionAfterRegiEncounter.length === 0) {
        return null;
      }

      let walkingAidObs = initDecisionAfterRegiEncounter[0].obs.filter((obs) => {
        return obs.value.uuid === '94be49d2-9ce4-46af-9748-2833036f1466';
      });

      if (walkingAidObs.length === 0) {
        return null;
      } else {
        return {
          forms: [
            {
              display: 'Final Assessment Outcome and Goal Setting',
              formUuid: '5fa318a9-eade-ea79-a96e-d91754135a5c',
              encounterTypeUuid: '5ae338a9-df1e-2179-a96d-d58522a12a22',
              isMandatory: true,
            },
          ],
          step: 'Walking Aid Measurement Card',
        };
      }
    },
    forms: [
      {
        formUuid: 'e8248157-56ef-4c00-a28a-193c6122b7df',
        encounterTypeUuid: INTERM_ASSASS_OUT_GOAL_ENCTYPE_UUID,
        display: 'Intermediate Assessment Outcome and Goal Setting', //  (if selected activate the Intermediate Assessment Outcome and Goal Setting step)
        isMandatory: true,
        isBlocked(encounters, statusUuid) {
          return statusUuid !== '86072aec-1f0c-411f-bb95-157bef9b5605';
        },
        getFormStatus(encounterTypeUuid, encounters, statusUuid) {
          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });
          let formStatus = null;
          encountersDesc.every((e) => {
            if (e.encounterType.uuid === BASIC_SERVICE_PLAN_ENCTYPE_UUID) {
              // Basic service plan
              // There a 'Basic service plan' before any 'Financial Capacity Assessment'
              formStatus = FORM_STATUS.NOT_DONE;
              return false;
            }
            if (e.encounterType.uuid === INTERM_ASSASS_OUT_GOAL_ENCTYPE_UUID) {
              // Intermediate Assessment Outcome and Goal Setting
              // There a 'Intermediate Assessment Outcome and Goal Setting' after last 'Basic service plan'
              if (isFormValidated(e)) {
                formStatus = isFormValidated(e) ? FORM_STATUS.VALIDATED : FORM_STATUS.DRAFT;
              }
              return false;
            }
            return true;
          });
          return formStatus;
        },
      },
      {
        display: 'Final Assessment Outcome and Goal Setting',
        formUuid: '5fa318a9-eade-ea79-a96e-d91754135a5c',
        encounterTypeUuid: '5ae338a9-df1e-2179-a96d-d58522a12a22',
        isMandatory: true,
        isBlocked(encounters, statusUuid) {
          return statusUuid !== '86072aec-1f0c-411f-bb95-157bef9b5605';
        },
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a921-37f1902f498z',
        encounterTypeUuid: '74c7c064-f5f8-4b2a-918e-421f35fc7aa1',
        display: 'Prosthesis Technical Card (Lower Limb) HD',
        getFormStatus: getServiceFormStatus,
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a921-37f1902f498f',
        encounterTypeUuid: '74c7c064-f5f8-4b2a-918e-421f35fc7aa2',
        display: 'Prosthesis Technical Card (Lower Limb) KD',
      },
      {
        formUuid: 'a61cdbd3-a1ec-4be9-a921-37f1902f498f',
        encounterTypeUuid: '74c7c064-f5f8-4b2a-918e-421f35fc7aa6',
        display: 'Prosthesis Technical Card (Lower Limb) PF',
      },
      {
        formUuid: 'a51cdbd3-a1ec-4be9-a921-37f1902f498f',
        encounterTypeUuid: '74c7c064-f5f8-4b2a-918e-421f35fc7aa5',
        display: 'Prosthesis Technical Card (Lower Limb) AD',
      },
      {
        formUuid: 'b52cdbd3-b1ec-4be9-b921-37f1902f498f',
        encounterTypeUuid: '74c7c064-f5f8-4b2a-918e-421f35fc7aa4',
        display: 'Prosthesis Technical Card (Lower Limb) TF',
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a921-37f1902f418f',
        encounterTypeUuid: '412d94fb-b2d7-436e-951b-2b2ad54a9212',
        display: 'Prosthesis Technical Card (Lower Limb) TT',
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a921-37f1902f4984',
        encounterTypeUuid: '74c7c064-f5f8-4b2a-918e-421f35fc7aa7',
        display: 'Prosthesis Technical Card (Upper Limb) TH',
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a921-37f1902f4983',
        encounterTypeUuid: '74c7c064-f5f8-4b2a-918e-421f35fc7aa3',
        display: 'Prosthesis Technical Card (Upper Limb) TR',
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a921-37f1902f4932',
        encounterTypeUuid: '',
        display: 'Orthosis Technical Card (Upper Limb)',
      },
      {
        formUuid: 'a52cdbd3-a1ec-4bf7-a921-37g1902j4936',
        encounterTypeUuid: '',
        display: 'Orthosis Technical Card (Lower Limb) AFO',
      },
      {
        formUuid: 'a52cdbd3-a1ec-4bf7-a921-37f1902h4936',
        encounterTypeUuid: '',
        display: 'Orthosis Technical Card (Lower Limb) KAFO',
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a921-37f1902h4936',
        encounterTypeUuid: '',
        display: 'Orthosis Technical Card (Trunk) Spinal Contention',
      },
      {
        formUuid: 'dfacb755-2762-4b69-a94e-76df839e5869',
        encounterTypeUuid: 'b5ed89bb-625f-43b2-a8f6-4a8da60761b2',
        display: 'Physiotherapy Assessment Outcomes and Treatment Plan',
        isMandatory: true,
      },
      {
        formUuid: '9b9a8f52-1713-4230-916d-2e3051696ad1',
        encounterTypeUuid: '9b9a8f52-1713-4230-916d-2e3051696ad1',
        display: 'Club foot treatment record, assessment & cast follow up',
        isMandatory: true,
      },
      {
        formUuid: 'd67419c3-5879-3fd7-8031-a149c7aa3739',
        encounterTypeUuid: '774dev78-9657-4165-be8d-emn9d9957d7d',
        display: 'Basic and Intermediate Wheelchair Assessment',
        isMandatory: true,
      },
      {
        formUuid: 'a52cdbd3-a1ec-4be9-a921-47f1902f4983',
        encounterTypeUuid: '13458695-3b06-4d59-9508-d217aa21ea27',
        display: 'Walking aid and ADL product card',
        isMandatory: true,
      },
      {
        formUuid: '3c07n00f-1623-4380-af4a-4cn68244ptt3',
        encounterTypeUuid: '756d16c1-dbdd-46c6-88a3-46b61a3813ea',
        display: 'Physiotherapy treatment session record',
        allowMultiple: true,
      },
      {
        formUuid: 'd6dfa4ac-1ac9-4d90-b145-2961174ed5ff',
        encounterTypeUuid: 'd6dfa4ac-1ac9-4d90-b145-2961174ed5ff',
        display: 'CP - HSU history',
      },
      {
        formUuid: 'fbfacde0-929c-4fdc-9410-8962958288e5',
        encounterTypeUuid: '6fef9fe5-6875-436a-b518-d1e8489f7ff8',
        display: 'CP - Physical examination',
      },
      {
        formUuid: '9d9a6439-48b8-4c96-b530-a076849c7d4a',
        encounterTypeUuid: '97e66af1-d9e8-4957-a7cc-6360ab5c60bb',
        display: 'CP - Functional evaluation',
      },
      {
        formUuid: '50684e58-3c15-4116-8832-fbe3c0490c26',
        encounterTypeUuid: '7ef5d574-955b-44a8-9f2c-707b2e01cae2',
        display: 'CP - Conclusion and treatment plan',
      },
      {
        formUuid: '5e8f1050-19e6-4f06-ab04-e68e0epbaeb8',
        encounterTypeUuid: 'bf8e1910-1906-48a6-ab40-e68b0epbaeb2',
        display: 'Physiotherapy Outcome and Treatment Conclusion',
      },
      {
        formUuid: '3b07b00c-1623-4380-af4a-5aa68266eae7',
        encounterTypeUuid: '664dea58-9657-4165-be8d-eab9d9957c2c',
        display: 'Basic and Intermediate Wheelchair Checklist User Training',
      },
      {
        formUuid: '06480331-cf78-4b83-8406-7d8dd0428d1a',
        encounterTypeUuid: '65367b27-368c-4b98-8536-756e57e37819',
        display: 'Basic Wheelchair Fitting Checklist before delivery',
      },
      {
        formUuid: 'dc3772a4-8546-4aa9-bfbe-1a6184c8e433',
        encounterTypeUuid: 'aa916069-799e-45c9-aafd-e34665cfc455',
        display: 'Walking aids HSU training',
      },
      {
        formUuid: 'c6effbbf-e5d3-413a-a03f-a400a1ffa2ed',
        encounterTypeUuid: 'd4c1903c-66fb-419a-b54e-b50617f51001',
        display: 'Home & work environment Adaptations',
      },
      {
        formUuid: '8d857fe5-b54e-4c4f-bc90-5983d75cf79c',
        encounterTypeUuid: '8d857fe5-b54e-4c4f-bc90-5983d75cf79c',
        display: 'Club foot treatment record tenotomy decision',
      },
      {
        formUuid: '7cdf30a9-8a2f-4070-87f6-a63e283c9326',
        encounterTypeUuid: '7cdf30a9-8a2f-4070-87f6-a63e283c9326',
        display: 'Club foot treatment record post tenotomy follow up',
      },
      {
        formUuid: 'f4fe97fa-bf78-4dbd-bbb5-5765fb8c6505',
        encounterTypeUuid: 'cd86dca4-b5a1-4381-ac7a-f191ca839f74',
        display: 'Club foot post tenotomy functional outcomes',
      },
      {
        formUuid: 'f984715f-2275-433c-9058-0db5dddd2522',
        encounterTypeUuid: '3b7f5af7-d53d-4df0-a2c5-53426cd9a498',
        display: 'Club foot treatment record, brace compliance follow up',
      },
      {
        formUuid: '5ce338a9-aad1-bb79-a96d-d99754135a5b',
        encounterTypeUuid: '790a93a8-aab6-49af-f98d-2e9f436f93a8',
        display: 'Prosthesis LL User Training Checklist',
      },
      {
        formUuid: 'fc408c13-c5d4-4c80-80d0-173e7b51bb7c',
        encounterTypeUuid: '986ae87c-d804-4e5d-8cbe-c4f18b37acb8',
        display: 'Orthosis LL user Training Checklist',
      },
      {
        formUuid: '3b6cd74b-6f97-4af4-a7c5-a84258e151ef',
        encounterTypeUuid: '3b6cd74b-6f97-4af4-a7c5-a84258e151ef',
        display: 'Drop Out / Abandon',
      },
      {
        formUuid: '3c07n00f-1623-4380-af4a-4cn68244cne3',
        encounterTypeUuid: '74c7c064-f5f8-4b2a-918e-421f45fc9aa8',
        display: 'Clinical Notes',
      },
      {
        formUuid: '7c098630-7b17-11e9-8881-9316420c0ec7',
        encounterTypeUuid: '712e4b8c-1688-44f4-8017-f4f4cd621509',
        display: 'Intermediate Wheelchair Fitting Checklist before delivery',
      },
      {
        formUuid: 'a0178dcc-c1d2-4ec3-b99e-8626c5e63b67',
        encounterTypeUuid: 'dd93f259-8bb5-4c58-97e3-029f0d7fbd61',
        display: 'Pre-Checkout for delivery',
      },
      {
        formUuid: 'c8469004-555d-4209-83b6-a99c488e7ab8',
        encounterTypeUuid: 'e03a15f0-1910-46fe-a47c-fa84afd7c9e9',
        display: 'Treatment Session record for other therapy type',
      },
      {
        formUuid: 'e7ab2fd0-7da5-422a-90d4-319b69d5d59a',
        encounterTypeUuid: '7e6d744c-ea4f-4996-800d-a4774becfd6f',
        display: 'Protective Helmet',
      },
    ],
  },
  {
    encounterTypeUuid: ['8236101f-a53c-425c-8c16-c6dd1e9ad5ef'],
    step: 'Service Follow up Assessment',
    requiredStates: [
      'b215fd8b-e5b4-4ebd-aece-62332f7ec14a', // ICRC:AWAITING_FOLLOWUP
      '53122285-ca77-4e18-9d69-f60347d31797', // ICRC:AWAITING_NEW_FOLLOWUP
    ],
    forms: [
      {
        display: 'Service Follow up Assessment',
        formUuid: '8236101f-a53c-425c-8c16-c6dd1e9ad5ef',
        encounterTypeUuid: '8236101f-a53c-425c-8c16-c6dd1e9ad5ef',
        isMandatory: true,
        getFormStatus(encounterTypeUuid, encounters, statusUuid) {
          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });
          let formStatus = null;
          encountersDesc.every((e) => {
            if (e.encounterType.uuid === '8236101f-a53c-425c-8c16-c6dd1e9ad5ef') {
              // Service Follow up Assessment
              // There a 'Service Follow up Assessment' already within this visit. Consider it as draft if not validated otherwise allow user to fill in another one
              if (isFormValidated(e)) {
                formStatus = isFormValidated(e) ? FORM_STATUS.NOT_DONE : FORM_STATUS.DRAFT;
              }
              return false;
            }
            return true;
          });
          return formStatus;
        },
      },
    ],
  },
  {
    encounterTypeUuid: ['33c8bedb-0fb4-4f40-bb58-16b22df3bcee'],
    step: 'Financial Capacity Assessment - Follow up',
    requiredStates: [
      '7e8cecae-d3ab-41f2-9c68-15f525234576', // ICRC:FOLLOWUP_DONE
      '6468f236-08df-4899-92a4-53a7b79b6606', // ICRC:REPAIR_FINANCE_APPROVAL_PENDING
      'fa36fb93-d841-43f0-a828-9edb0a5df5fc', // ICRC:REPAIR_SOCIO_ECON_PENDING
    ],
    forms: [
      {
        formUuid: '46633f0d-fb78-4c58-a720-3f503f24df3e',
        encounterTypeUuid: '33c8bedb-0fb4-4f40-bb58-16b22df3bcee',
        display: 'Financial Capacity Assessment Repair',
        isMandatory: true,
      },
      {
        formUuid: '3b07b00c-1623-4380-af4a-4bb68244e4e5',
        encounterTypeUuid: SOCIO_ECON_ASSASS_ENCTYPE_UUID,
        display: 'Socio-economic assessment',
        isBlocked(encounters, statusUuid) {
          // Repair finance approval pending
          if (statusUuid === '6468f236-08df-4899-92a4-53a7b79b6606') {
            return false;
          }
          let encounter = getEncounter('33c8bedb-0fb4-4f40-bb58-16b22df3bcee', encounters);
          return !encounter;
        },
        getFormStatus(encounterTypeUuid, encounters, statusUuid) {
          let formStatus = null;

          // Repair finance approval pending
          if (statusUuid === '6468f236-08df-4899-92a4-53a7b79b6606') {
            return FORM_STATUS.VALIDATED;
          }

          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });

          let encounter = encountersDesc.filter(function (encounter, i) {
            return encounter.encounterType.uuid === encounterTypeUuid;
          });

          if (encounter.length === 0) {
            return FORM_STATUS.NOT_DONE;
          }

          let obs = encounter[0].obs.filter((obs) => {
            return obs.concept.uuid === VALIDATED_BY_CONCEPT_UUID;
          });

          if (obs.length === 0) {
            return FORM_STATUS.DRAFT;
          } else {
            return FORM_STATUS.VALIDATED;
          }
        },
      },
      {
        formUuid: '3b07b00c-1623-4380-af4a-4bb68244e099',
        encounterTypeUuid: FINANCING_DECISION_ENCTYPE_UUID,
        display: 'Financing Decision',
        isBlocked(encounters, statusUuid) {
          let financialCapAssessEncounter = getEncounter('33c8bedb-0fb4-4f40-bb58-16b22df3bcee', encounters);

          let finCapDecRepairObs = financialCapAssessEncounter?.obs.filter((obs) => {
            return obs.concept.uuid === 'a48858e6-a8cf-4b03-a99d-f2d0204b08e4';
          })[0];

          let socioEconomicAssessEncounter = getEncounter(SOCIO_ECON_ASSASS_ENCTYPE_UUID, encounters);

          // Blocked if 'Financial Capacity Assessment - Follow up' not done or its decision was
          // 'Make socio-economic assessment' and there's no 'socio-economic assessment' encounter
          return (
            !financialCapAssessEncounter ||
            (finCapDecRepairObs?.value?.uuid === '10544f96-3a9a-11e9-b210-d663bd873d93' &&
              !socioEconomicAssessEncounter)
          );
        },
        getFormStatus(encounterTypeUuid, encounters, statusUuid) {
          // Order visits
          let encountersDesc = encounters.sort((a, b) => {
            return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
          });
          let formStatus = null;
          encountersDesc.every((e) => {
            if (e.encounterType.uuid === '8236101f-a53c-425c-8c16-c6dd1e9ad5ef') {
              // Service Follow up assessment
              // There a 'Service Follow up assessment' before any 'Financial Capacity Assessment'
              formStatus = FORM_STATUS.NOT_DONE;
              return false;
            }
            if (e.encounterType.uuid === FINANCING_DECISION_ENCTYPE_UUID) {
              // Financing Decision
              // There a 'Financing Decision' after last 'Service Follow up assessment'

              // TODO: This should be reviewed. Currently form will always be shown as draft because we want the user to
              //  edit it if answer was 'pending' even if it's validated. The user must change answer to approved in
              //  order to proceed.
              // if (isFormValidated(e)) {
              //   formStatus = isFormValidated(e) ? FORM_STATUS.VALIDATED : FORM_STATUS.DRAFT;
              // }
              formStatus = FORM_STATUS.DRAFT;
              return false;
            }
            return true;
          });
          return formStatus;
        },
      },
    ],
  },
  {
    encounterTypeUuid: ['07bc610a-7193-44d9-995b-b9a5440b15b1'],
    step: 'Services Follow-up Plan',
    requiredStates: [
      'b3338ff5-5e68-4fb0-af58-944366cc8a1a', // ICRC:REPAIR_APPROVED
    ],
    forms: [
      {
        formUuid: 'c225d79a-1d65-44d7-bf46-7d2736c0f792',
        encounterTypeUuid: '07bc610a-7193-44d9-995b-b9a5440b15b1',
        display: 'Service Follow-up Plan',
        isMandatory: true,
      },
      {
        formUuid: 'f984715f-2275-433c-9058-0db5dddd2522',
        encounterTypeUuid: '3b7f5af7-d53d-4df0-a2c5-53426cd9a498',
        display: 'Club foot treatment record, brace compliance follow up',
        isMandatory: false,
      },
    ],
    overrides(encounters) {
      let encountersDesc = encounters.sort((a, b) => {
        return new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();
      });

      let serviceFollowUpAssessmentEncounter = encountersDesc.filter(function (encounter, i) {
        return encounter.encounterType.uuid === '8236101f-a53c-425c-8c16-c6dd1e9ad5ef';
      });

      if (serviceFollowUpAssessmentEncounter.length === 0) {
        return null;
      }

      // Get whether "Renew Assistive Device" option was selected for "Walking aid"
      let waidRenewAssistiveDeviceObs = serviceFollowUpAssessmentEncounter[0].obs.filter((obs) => {
        return (
          (obs.concept.uuid === WALKING_AID_CONCEPT_UUID || obs.concept.uuid === ADL_PRODUCT_CONCEPT_UUID) &&
          obs.groupMembers?.find((m) => m.value?.uuid === RENEW_ASSISTIVE_DEVICE_CONCEPT_UUID)
        );
      });

      let isWalkingAidMeasurementCardDone = isFormSavedAndValidated('13458695-3b06-4d59-9508-d217aa21ea27', encounters);

      if (isWalkingAidMeasurementCardDone || waidRenewAssistiveDeviceObs.length === 0) {
        return null;
      } else {
        return {
          forms: [
            {
              formUuid: 'a52cdbd3-a1ec-4be9-a921-47f1902f4983',
              encounterTypeUuid: '13458695-3b06-4d59-9508-d217aa21ea27',
              display: 'Walking aid and ADL product card',
              isMandatory: true,
            },
          ],
          step: 'Walking aid and ADL product card',
        };
      }
    },
  },
  {
    encounterTypeUuid: [BASIC_SERVICE_PLAN_ENCTYPE_UUID],
    step: 'Final Assessment Outcome and Goal Setting',
    forms: [
      {
        display: 'Final Assessment Outcome and Goal Setting',
        formUuid: '5fa318a9-eade-ea79-a96e-d91754135a5c',
        encounterTypeUuid: '5ae338a9-df1e-2179-a96d-d58522a12a22',
        isMandatory: true,
      },
      {
        display: 'Intermediate Assessment Outcome and Goal Setting',
        formUuid: 'e8248157-56ef-4c00-a28a-193c6122b7df',
        encounterTypeUuid: INTERM_ASSASS_OUT_GOAL_ENCTYPE_UUID,
      },
      {
        display: 'Drop Out / Abandon',
        formUuid: '3b6cd74b-6f97-4af4-a7c5-a84258e151ef',
        encounterTypeUuid: '3b6cd74b-6f97-4af4-a7c5-a84258e151ef',
      },
      {
        display: 'Referral Form',
        formUuid: '7ce448a9-bge1-bb79-a96d-d88754134rrr',
        encounterTypeUuid: '510b6bb5-22a8-4d2d-ba17-f5c3949b1174',
      },
      {
        display: 'Clinical Note',
        formUuid: '3c07n00f-1623-4380-af4a-4cn68244cne3',
        encounterTypeUuid: '74c7c064-f5f8-4b2a-918e-421f45fc9aa8',
      },
    ],
  },
];
