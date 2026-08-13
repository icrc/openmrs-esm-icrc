import { createContext, useContext } from 'react';

export interface TotalSessionsWidgetContext {
  patientUuid: string;
  patient: fhir.Patient;
}

export const TotalSessionsWidget = createContext<TotalSessionsWidgetContext>({
  patientUuid: undefined,
  patient: undefined,
});

export function useTotalSessionsWidgetContext() {
  return useContext(TotalSessionsWidget);
}
