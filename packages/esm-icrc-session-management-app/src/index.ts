import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName, spaBasePath } from './constants';
import { createDashboardLink } from './createDashboardLink.component';
import { dashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'session management',
  moduleName,
};
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  // Ensure FDE cfg is loaded
  defineConfigSchema('@openmrs/esm-fast-data-entry-app', {});

  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: 'Session Management',
      parent: `${window.spaBase}/home`,
    },
  ]);
}

export const sessionManagementDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);
export const sessionManagementLink = getAsyncLifecycle(() => import('./createDashboardLink.component'), options);
export const sessionManagementWidget = getAsyncLifecycle(
  () => import('./session-management-tabs/session-management.component'),
  options,
);
export const deleteSessionModal = getAsyncLifecycle(
  () => import('./session-management-tabs/sessions-tab/delete-session-modal.component'),
  {
    featureName: 'delete-session-modal',
    moduleName,
  },
);
export const root = getAsyncLifecycle(() => import('./root.component'), options);
