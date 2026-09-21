import { getAsyncLifecycle } from '@openmrs/esm-framework';

const moduleName = '@icrcpriv/diop-esm-icrc-contextual-info-app';

const options = {
  featureName: 'ICRC contextual information',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /\.json$/, 'lazy');

export const workflowMessage = getAsyncLifecycle(() => import('./workflow-message.component'), options);
