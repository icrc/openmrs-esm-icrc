import React from 'react';
import { screen, render } from '@testing-library/react';
import { useConfig, useSession } from '@openmrs/esm-framework';
import {
  mockConfig,
  mockAdminSessionDataResponse,
  mockUser1SessionDataResponse,
  mockUser2SessionDataResponse,
  mockUser3SessionDataResponse,
} from '../../../../__mocks__/homepage-header.mock';
import HomepageHeader from './homepage-header.component';

const mockUseConfig = useConfig as jest.Mock;
const mockUseSession = useSession as jest.Mock;

test('renders homepage header for administrator', async () => {
  mockUseSession.mockReturnValue(mockAdminSessionDataResponse);
  renderHomepageHeader();

  expect(screen.getByText(/Administrator/i)).toBeInTheDocument();
  expect(screen.getByText(/Inpatient Ward/i)).toBeInTheDocument();
});

test('renders homepage header for a user with one privilege', async () => {
  mockUseSession.mockReturnValue(mockUser1SessionDataResponse);
  renderHomepageHeader();

  expect(screen.getByText(/Someone 1/i)).toBeInTheDocument();
  expect(screen.getByText(/Inpatient Ward/i)).toBeInTheDocument();
});

test('renders homepage header for a user with two privilege', async () => {
  mockUseSession.mockReturnValue(mockUser2SessionDataResponse);
  renderHomepageHeader();

  expect(screen.getByText(/Someone 1 | Someone 2/i)).toBeInTheDocument();
  expect(screen.getByText(/Inpatient Ward/i)).toBeInTheDocument();
});

test('should not render homepage header', async () => {
  mockUseSession.mockReturnValue(mockUser3SessionDataResponse);
  renderHomepageHeader();

  expect(screen.queryByText(/Inpatient Ward/i)).not.toBeInTheDocument();
});

function renderHomepageHeader() {
  mockUseConfig.mockReturnValue(mockConfig);
  render(<HomepageHeader />);
}
