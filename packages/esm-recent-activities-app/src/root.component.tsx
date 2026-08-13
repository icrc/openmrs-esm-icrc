import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RecentActivitiesList from './recent-activities-tabs/recent-activities.component';

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/recent-activities`}>
      <Routes>
        <Route path="/" element={<RecentActivitiesList />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
