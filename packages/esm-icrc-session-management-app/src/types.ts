export interface Session {
  id: string;
  name: string;
  details: string;
  cohortUuid: string;
  cohortName: string;
  datetime: string;
  practitioner: string;
  encounterTypeUuid: string;
  encounterTypeName: string;
  editPrivilege: string;
  formUuid: string;
}

export interface GroupSession extends Session {
  encounters?: Array<MappedEncounter>;
}

export interface MappedEncounter {
  id: string;
  datetime: string;
  patientUuid: string;
  patientName: string;
  patientBirthdate: string;
  patientIdentifier: string;
  encounterType: string;
  visitUuid: string;
  visitType: string;
  visitTypeUuid?: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
}

export interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formUiResource: string;
  formUiPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
  formEditUiPage: 'editHtmlFormWithSimpleUi' | 'editHtmlFormWithStandardUi';
}
