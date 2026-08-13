import React from 'react';
import { screen, render } from '@testing-library/react';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import MarkPatientDeceasedMenuItem from './mark-patient-deceased.component';

const mockUsePatient = usePatient as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  return {
    useConfig: jest.fn(),
    usePatient: jest.fn(),
    userHasAccess: jest.fn(() => true),
  };
});

describe('MarkPatientDeceasedMenuItem', () => {
  it('should mark patient as deceased', () => {
    mockUseConfig.mockReturnValue({
      markPatientDeceased: {
        requiredPrivilege: '',
      },
    });

    mockUsePatient.mockReturnValue({
      deceasedDateTime: undefined,
    });
    render(<MarkPatientDeceasedMenuItem patientUuid="some-patient-uuid" patient={{ deceasedDateTime: undefined }} />);

    const actionButton = screen.getByRole('menuitem', { name: /Mark HSU deceased/ });
    expect(actionButton).toBeInTheDocument();
  });
});
