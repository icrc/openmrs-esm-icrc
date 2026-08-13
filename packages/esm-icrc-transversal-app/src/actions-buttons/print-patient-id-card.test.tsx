import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import PrintIdCardMenuItem from './print-patient-id-card.component';

const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  return {
    useConfig: jest.fn(),
    navigate: jest.fn(),
    userHasAccess: jest.fn(() => true),
  };
});

describe('PrintIdCardMenuItem', () => {
  it('should show "Print HSU ID Card" item', () => {
    mockUseConfig.mockReturnValue({
      printPatientIdCard: {
        requiredPrivilege: '',
      },
    });

    render(<PrintIdCardMenuItem patientUuid="some-patient-uuid" />);

    const actionButton = screen.getByRole('menuitem', { name: /Print HSU ID Card/ });
    expect(actionButton).toBeInTheDocument();

    userEvent.click(actionButton);
  });
});
