import { Type } from '@openmrs/esm-framework';

export interface ConfigSchema {
  menuButtonsConfig: Array<MenuButtonConfig>;
}

export interface MenuButtonConfig {
  name: string;
  nameCode: string;
  url: string;
  requiredPrivilege?: string;
  serverGlobalProperty?: string;
  newTab?: boolean;
}

export const configSchema = {
  menuButtonsConfig: {
    _type: Type.Array,
    _description: 'Menu buttons configuration.',
    _default: [],
    _elements: {
      name: {
        _type: Type.String,
        _description: 'Name of the button.',
        _default: undefined,
      },
      nameCode: {
        _type: Type.String,
        _description: 'Name code for the the button.',
        _default: undefined,
      },
      url: {
        _type: Type.String,
        _description: 'URL to be called by the button',
        _default: undefined,
      },
      requiredPrivilege: {
        _type: Type.String,
        _description: 'Privilege required to see the button',
        _default: undefined,
      },
      serverGlobalProperty: {
        _type: Type.String,
        _description: 'Global property for the server',
        _default: undefined,
      },
      newTab: {
        _type: Type.Boolean,
        _description: 'Open resource in a new tab',
        _default: false,
      },
    },
  },
};
