import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import PrintWristbandMenuItem from './print-patient-wristband.component';

const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  return {
    useConfig: jest.fn(),
    navigate: jest.fn(),
    userHasAccess: jest.fn(() => true),
  };
});

describe('PrintWristbandMenuItem', () => {
  it('should show "Print Wristband" item', () => {
    mockUseConfig.mockReturnValue({
      printPatientWristband: {
        requiredPrivilege: '',
      },
    });

    render(<PrintWristbandMenuItem patientUuid="some-patient-uuid" />);

    const actionButton = screen.getByRole('menuitem', { name: /Print Wristband/ });
    expect(actionButton).toBeInTheDocument();

    userEvent.click(actionButton);
  });
});
