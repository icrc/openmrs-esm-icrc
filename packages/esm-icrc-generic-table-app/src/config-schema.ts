import { Type } from '@openmrs/esm-framework';

export interface ConfigObject {
  headers: Array<GenericTableHeaderObject>;
  rows: Array<GenericTableRowObject>;
}

export interface GenericTableHeaderObject {
  show: boolean;
  key: string;
  title?: {
    key: string;
    default: string;
  };
}

export interface GenericTableRowObject {
  [prop: string]: string | TranslationObject;
}

export interface TranslationObject {
  key: string;
  default: string;
}

export const configSchema = {
  headers: {
    _type: Type.Array,
    _description: 'Headers of the generic table',
    _elements: {
      title: {
        key: {
          _type: Type.String,
          _default: null,
          _description: 'Key to be used for translation purposes.',
        },
        default: {
          _type: Type.String,
          _default: null,
          _description: 'Default text to be displayed if no translation is found.',
        },
      },
      show: {
        _type: Type.Boolean,
        _default: null,
        _description: 'Determines if the header will be shown.',
      },
      key: {
        _type: Type.String,
        _default: null,
        _description: 'Header identifier.',
      },
    },
    _default: null,
  },
  rows: {
    _type: Type.Array,
    _description: 'Headers of the generic table',
    //this sould have a generic element but there isn't an option on node_modules/@openmrs/esm-config/src/types.ts
    _default: null,
  },
};
