import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { lastVisitsAppSchema } from './config-schema';
import { moduleName } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, lastVisitsAppSchema);
}

export const lastVisits = getAsyncLifecycle(() => import('./last-visits-widget/last-visits-widget.component'), {
  featureName: 'last-visits-widget',
  moduleName,
});
