import { openmrsFetch } from '@openmrs/esm-framework';

export interface GlobalProperties {
  results: Array<GlobalProperty>;
}

export interface GlobalProperty {
  uuid: string;
  property: string;
  value: string;
  description: string;
}

export function fetchGlobalProperty(abortController: AbortController, propertyKey: string) {
  const customRepresentation = 'custom:(uuid,property,value,description)';
  const url = `/ws/rest/v1/systemsetting?&v=${customRepresentation}&q=${propertyKey}`;

  return openmrsFetch<GlobalProperties>(url, {
    signal: abortController.signal,
  });
}
