import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import TransferPatient from './transfer-patient.component';

const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  return {
    useConfig: jest.fn(),
    navigate: jest.fn(),
    userHasAccess: jest.fn(() => true),
  };
});

describe('TransferPatientMenuItem', () => {
  it('should show "Transfer Patient" item', () => {
    mockUseConfig.mockReturnValue({
      transferPatient: {
        requiredPrivilege: '',
      },
    });

    render(<TransferPatient patientUuid="some-patient-uuid" />);

    const actionButton = screen.getByRole('menuitem', { name: /Transfer Patient/ });
    expect(actionButton).toBeInTheDocument();

    userEvent.click(actionButton);
  });
});
