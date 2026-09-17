import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import { VisitResultsContext } from './visit-results.context';
import VisitResultsForm from './visit-results-form.component';

interface VisitResultsProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

export default function VisitResults({ basePath, patient, patientUuid }: VisitResultsProps) {
  return (
    <VisitResultsContext.Provider value={{ patient, patientUuid }}>
      <BrowserRouter basename={`${window.spaBase}${basePath}/encounters/notes`}>
        <Route path="/">
          <VisitResultsForm patientUuid={patientUuid} />
        </Route>
      </BrowserRouter>
    </VisitResultsContext.Provider>
  );
}
