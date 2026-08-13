import { defineConfigSchema, getAsyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName, spaBasePath } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'recent activities',
  moduleName,
};
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: 'Recent Activities',
      parent: `${window.spaBase}/home`,
    },
  ]);
}

export const recentActivitiesLink = getAsyncLifecycle(() => import('./recent-activities-link.component'), options);
export const recentActivitiesWidget = getAsyncLifecycle(
  () => import('./recent-activities-tabs/recent-activities.component'),
  options,
);
export const root = getAsyncLifecycle(() => import('./root.component'), options);
