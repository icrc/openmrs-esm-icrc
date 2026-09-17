import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { moduleName } from './constants';
import { configSchema } from './config-schema';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const menuConfigurableButton = getAsyncLifecycle(
  () => import('./app-menu-configurable-button/app-menu-configurable-button.component'),
  {
    featureName: 'app-menu-configurable-button',
    moduleName,
  },
);

export const menuAboutButton = getAsyncLifecycle(
  () => import('./app-menu-about-button/app-menu-about-button.component'),
  {
    featureName: 'app-menu-about-button',
    moduleName,
  },
);
