import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import MaterialRequestMenuItem from './material-request.component';

const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  return {
    useConfig: jest.fn(),
    navigate: jest.fn(),
    userHasAccess: jest.fn(() => true),
  };
});

describe('MaterialRequestMenuItem', () => {
  it('should show "Material Request" item', () => {
    mockUseConfig.mockReturnValue({
      materialRequest: {
        requiredPrivilege: '',
      },
    });

    render(<MaterialRequestMenuItem patientUuid="some-patient-uuid" />);

    const actionButton = screen.getByRole('menuitem', { name: /Material Request/ });
    expect(actionButton).toBeInTheDocument();

    userEvent.click(actionButton);
  });
});
