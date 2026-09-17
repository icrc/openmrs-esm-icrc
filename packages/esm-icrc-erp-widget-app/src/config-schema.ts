import { Type } from '@openmrs/esm-framework';

export interface ConfigSchema {
  erpStartedGlobalProperty: string;
}

export const configSchema = {
  erpStartedGlobalProperty: {
    _type: Type.String,
    _description: 'Global property indicating whether ERP module is started.',
    _default: 'erp.started',
  },
};
