import { createContext, useContext } from 'react';

export interface VisitResultsContextShape {
  patientUuid: string;
  patient: fhir.Patient;
}

export const VisitResultsContext = createContext<VisitResultsContextShape>({
  patientUuid: undefined,
  patient: undefined,
});

export function useVisitResultsContext() {
  return useContext(VisitResultsContext);
}
