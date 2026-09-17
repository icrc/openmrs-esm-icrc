import { defineConfigSchema, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'patient-mental-health',
  moduleName,
};

function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/encounter.+',
  });

  defineConfigSchema(moduleName, configSchema);
}

export const visitResultsNavButton = getAsyncLifecycle(
  () => import('./visit-results/visit-results-action-button.component'),
  options,
);

export const visitResultsFormWidget = getAsyncLifecycle(
  () => import('./visit-results/visit-results-form.component'),
  options,
);

export const mainClusterPresentedSymptomsWidget = getAsyncLifecycle(
  () => import('./main-cluster-presented-symptoms/main-cluster-presented-symptoms-tables.component'),
  options,
);

export const totalSessionsWidget = getAsyncLifecycle(
  () => import('./total-sessions-widget/total-sessions-widget.component'),
  options,
);
