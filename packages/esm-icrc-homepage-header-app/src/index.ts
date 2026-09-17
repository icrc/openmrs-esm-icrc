import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName, spaBasePath } from './constants';
import { createDashboardLink } from './createDashboardLink.component';
import { dashboardMeta } from './dashboard.meta';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'homepage-header',
  moduleName,
};

function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

registerBreadcrumbs([
  {
    path: spaBasePath,
    title: 'Home',
    parent: `${window.spaBase}/homepage`,
  },
]);

export const homepageDashboardLink = getSyncLifecycle(createDashboardLink(dashboardMeta), options);
export const homepageLink = getAsyncLifecycle(() => import('./createDashboardLink.component'), options);
export const homepageWidget = getAsyncLifecycle(() => import('./homepage-page/homepage-page.component'), options);

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const homepageHeader = getAsyncLifecycle(() => import('./homepage-header/homepage-header.component'), options);
