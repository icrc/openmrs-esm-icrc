import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';
import { moduleName } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'hcd-dashboard',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, {});
}

export const hcdDashboardDetailsWidget = getAsyncLifecycle(
  () => import('./hcd-dashboard/hcd-dashboard.component'),
  options,
);

export const hcdDashboardSummaryDashboard = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
    moduleName,
    icon: 'omrs-icon-report',
  }),
  options,
);
