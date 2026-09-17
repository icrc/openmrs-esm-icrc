import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { MainClusterPresentedSymptomsContext } from './main-cluster-presented-symptoms.context';
import MainClusterPresentedSymptomsTables from './main-cluster-presented-symptoms-tables.component';

interface MainClusterPresentedSymptomsProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

export default function MainClusterPresentedSymptoms({
  basePath,
  patient,
  patientUuid,
}: MainClusterPresentedSymptomsProps) {
  return (
    <MainClusterPresentedSymptomsContext.Provider value={{ patient, patientUuid }}>
      <BrowserRouter basename={`${window.spaBase}${basePath}/symptoms`}>
        <Routes>
          <Route path="/">
            <MainClusterPresentedSymptomsTables />
          </Route>
        </Routes>
      </BrowserRouter>
    </MainClusterPresentedSymptomsContext.Provider>
  );
}
