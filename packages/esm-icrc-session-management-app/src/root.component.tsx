import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SessionManagement from './session-management-tabs/session-management.component';

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/session-management`}>
      <Routes>
        <Route path="/" element={<SessionManagement />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
