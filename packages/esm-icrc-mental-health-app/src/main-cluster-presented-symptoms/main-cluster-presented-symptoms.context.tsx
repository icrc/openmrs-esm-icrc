import { createContext, useContext } from 'react';

export interface MainClusterPresentedSymptomsContextShape {
  patientUuid: string;
  patient: fhir.Patient;
}

export const MainClusterPresentedSymptomsContext = createContext<MainClusterPresentedSymptomsContextShape>({
  patientUuid: undefined,
  patient: undefined,
});

export function useMainClusterPresentedSymptomsContext() {
  return useContext(MainClusterPresentedSymptomsContext);
}
