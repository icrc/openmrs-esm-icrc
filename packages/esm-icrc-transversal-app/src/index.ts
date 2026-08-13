import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { transversalAppSchema as configSchema } from './config-schema';
import { moduleName } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'transversal-widget',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const markPatientDeceased = getAsyncLifecycle(
  () => import('./actions-buttons/mark-patient-deceased.component'),
  options,
);
export const downloadVisitButton = getAsyncLifecycle(
  () => import('./actions-buttons/download-patient-information.component'),
  options,
);
export const printPatientWristband = getAsyncLifecycle(
  () => import('./actions-buttons/print-patient-wristband.component'),
  options,
);
export const printPatientIdCard = getAsyncLifecycle(
  () => import('./actions-buttons/print-patient-id-card.component'),
  options,
);
export const transferPatient = getAsyncLifecycle(() => import('./actions-buttons/transfer-patient.component'), options);
export const locationTag = getAsyncLifecycle(() => import('./location-tag/location-tag.component'), {
  featureName: 'location-tag',
  moduleName,
});
export const materialMequest = getAsyncLifecycle(() => import('./actions-buttons/material-request.component'), options);
export const mergeVisitButton = getAsyncLifecycle(() => import('./actions-buttons/merge-visit.component'), options);
export const reportsWidget = getAsyncLifecycle(() => import('./reports-widget/reports-widget.component'), {
  featureName: 'reports-widget',
  moduleName,
});
export const transferPatientModal = getAsyncLifecycle(() => import('./transfer-patient/transfer-patient.component'), {
  featureName: 'transfer-patient',
  moduleName,
});
export const reportsPage = getAsyncLifecycle(() => import('./reports-widget/reports-widget.component'), options);

export const fastDataEntrySidebarLink = getAsyncLifecycle(
  () => import('./fast-data-entry/fast-data-entry-sidebar-link'),
  options,
);
