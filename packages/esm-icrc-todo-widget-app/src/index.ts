import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { moduleName } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'homepage-todo-widget',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, {});
}

export const homepageTodo = getAsyncLifecycle(() => import('./todos/todo-table.component'), options);
