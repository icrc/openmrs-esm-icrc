import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HsuJourney from './hsu-journey/hsu-journey.component';

const hsuJourney = ({ basePath, patientUuid }) => {
  return (
    <BrowserRouter basename={window.spaBase}>
      <Routes>
        <Route path="/hsu-journey/:patientUuid" element={<HsuJourney basePath={basePath} patient={patientUuid} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default hsuJourney;
