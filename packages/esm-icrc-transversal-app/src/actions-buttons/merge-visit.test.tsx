import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import MergeVisitOverflowMenuItem from './merge-visit.component';

const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  return {
    useConfig: jest.fn(),
    navigate: jest.fn(),
    userHasAccess: jest.fn(() => true),
  };
});

describe('MergeVisitOverflowMenuItem', () => {
  it('should show "Merge Visits" view', () => {
    mockUseConfig.mockReturnValue({
      mergeVisits: {
        requiredPrivilege: '',
      },
    });

    render(<MergeVisitOverflowMenuItem patientUuid="some-patient-uuid" />);

    const actionButton = screen.getByRole('menuitem', { name: /Merge Visit/ });
    expect(actionButton).toBeInTheDocument();

    userEvent.click(actionButton);
  });
});
