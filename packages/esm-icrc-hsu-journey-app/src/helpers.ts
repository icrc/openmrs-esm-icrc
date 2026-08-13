interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formUiResource: string;
}

export function getExternalLink(
  htmlFormEntryForms: Array<HtmlFormEntryForm>,
  patientUuid: string,
  formUuid: string,
  visitUuid?: string,
  encounterUuid?: string,
) {
  if (visitUuid && htmlFormEntryForms) {
    const htmlForm = htmlFormEntryForms.find((form) => form.formUuid === formUuid);
    if (encounterUuid) {
      return getUrl(
        `\${openmrsBase}/htmlformentryui/htmlform/${'editHtmlFormWithStandardUi'}.page?patientId=${patientUuid}&visitId=${visitUuid}&encounterId=${encounterUuid}&definitionUiResource=${htmlForm?.formUiResource}`,
      );
    } else {
      return getUrl(
        `\${openmrsBase}/htmlformentryui/htmlform/${'enterHtmlFormWithStandardUi'}.page?patientId=${patientUuid}&visitId=${visitUuid}&definitionUiResource=${htmlForm?.formUiResource}`,
      );
    }
  }
}

function trimTrailingSlash(str: string) {
  return str.replace(/\/$/, '');
}

export function interpolateString(template: string, params: { [key: string]: string }): string {
  const names = Object.keys(params);
  return names.reduce((prev, curr) => prev.split('${' + curr + '}').join(params[curr]), template);
}

export function interpolateUrl(template: string, additionalParams?: { [key: string]: string }): string {
  const openmrsSpaBase = trimTrailingSlash(window.getOpenmrsSpaBase());
  return interpolateString(template, {
    openmrsBase: window.openmrsBase,
    openmrsSpaBase: openmrsSpaBase,
    ...additionalParams,
  }).replace(/^\/\//, '/');
}

export function getUrl(to: string): string {
  const openmrsSpaBase = trimTrailingSlash(window.getOpenmrsSpaBase());
  const target = interpolateUrl(to, undefined).replace(window.location.origin, '');
  const isSpaPath = target.startsWith(openmrsSpaBase);

  return target;
}
