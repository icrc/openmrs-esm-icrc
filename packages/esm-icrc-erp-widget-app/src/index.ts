import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'homepage-stock-maintenance-widget',
  moduleName,
};

function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const stockAndMaintainance = getAsyncLifecycle(
  () => import('./stock-and-maintainance/events.component.conditional.wrapper'),
  options,
);
