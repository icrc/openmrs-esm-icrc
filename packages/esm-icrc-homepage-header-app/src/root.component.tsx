import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomepageComponent from './homepage-page/homepage-page.component';

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/home`}>
      <Routes>
        <Route path="/" element={<HomepageComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
