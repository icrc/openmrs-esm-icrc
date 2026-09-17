import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { moduleName } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'esm-icrc-hsu-journey-app-overview-widget',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, {});
}

export const hsuJourneyWidget = getAsyncLifecycle(() => import('./hsu-journey/hsu-journey.component'), options);
export const hsuJourney = getAsyncLifecycle(() => import('./root.component'), options);
