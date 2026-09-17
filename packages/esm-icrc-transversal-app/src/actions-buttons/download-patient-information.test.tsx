import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import DownloadPatientInformationOverflowMenuItem from './download-patient-information.component';

const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  return {
    useConfig: jest.fn(),
    navigate: jest.fn(),
    userHasAccess: jest.fn(() => true),
  };
});
describe('DownloadPatientInformationOverflowMenuItem', () => {
  it('should download patient history form', () => {
    mockUseConfig.mockReturnValue({
      downloadPatientInformation: {
        requiredPrivilege: '',
      },
    });

    render(<DownloadPatientInformationOverflowMenuItem patientUuid="some-patient-uuid" />);

    const actionButton = screen.getByRole('menuitem', { name: /Download Patient Information/ });
    expect(actionButton).toBeInTheDocument();

    userEvent.click(actionButton);
  });
});
