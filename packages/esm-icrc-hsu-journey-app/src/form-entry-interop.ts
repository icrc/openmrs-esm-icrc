import { launchWorkspace, Visit, navigate, launchWorkspace2 } from '@openmrs/esm-framework';
import isEmpty from 'lodash-es/isEmpty';
import { HtmlFormEntryForm, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';

export function launchFormEntryOrHtmlForms(
  visit: Visit | undefined,
  formUuid: string,
  patient: any,
  htmlFormEntryForms: Array<HtmlFormEntryForm>,
  encounterUuid?: string,
  formName?: string,
) {
  if (visit) {
    const htmlForm = htmlFormEntryForms?.find((form) => form.formUuid === formUuid);
    if (isEmpty(htmlForm)) {
      launchFormEntry(formUuid, encounterUuid, formName);
    } else {
      if (encounterUuid) {
        navigate({
          to: `\${openmrsBase}/htmlformentryui/htmlform/${'editHtmlFormWithStandardUi'}.page?patientId=${patient.id}&visitId=${visit.uuid}&encounterId=${encounterUuid}&definitionUiResource=${htmlForm.formUiResource}&returnUrl=${window.location.href}`,
        });
      } else {
        navigate({
          to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.formUiPage}.page?patientId=${patient.id}&visitId=${visit.uuid}&definitionUiResource=${htmlForm.formUiResource}&returnUrl=${window.location.href}`,
        });
      }
    }
  } else {
    launchStartVisitPrompt();
  }
}

export function launchFormEntry(formUuid: string, encounterUuid?: string, formName?: string) {
  launchWorkspace2('patient-form-entry-workspace', {
    form: {
      uuid: formUuid,
      name: formName,
      display: formName,
    },
    encounterUuid,
  });
}
