import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');
const options = {
  featureName: 'generic-table',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const genericWidgetInterpretationTable = getAsyncLifecycle(
  () => import('../../esm-icrc-generic-table-app/src/generic-table/generic-table.component'),
  options,
);
