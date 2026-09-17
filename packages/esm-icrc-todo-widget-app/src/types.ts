import { OpenmrsResource } from '@openmrs/esm-framework';

export interface Attribute {
  attributeType: string;
  dataType: string;
  uuid: string;
  value: string | {};
}

export interface Todo {
  markedDone: boolean;
  type: string;
  encounterId?: string | number;
  uuid: string;
  patient: {
    identifier: string;
    name: string;
    uuid: string;
  };
  attributes: Array<Attribute>;
}
