import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useSession } from '@openmrs/esm-framework';
import { transferPatient } from '../../api/transfer-patient';
import TransferPatient from './transfer-patient.component';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock('../../api/transfer-patient', () => ({
  transferPatient: jest.fn(),
}));

jest.mock('../location-picker', () => ({
  LocationPicker: jest.fn(({ onChange }) => (
    <div>
      <input
        type="text"
        placeholder="Search for a location"
        onChange={(e) => onChange({ uuid: 'new-location-uuid', name: e.target.value })}
      />
      <button
        onClick={() =>
          onChange({
            uuid: 'new-location-uuid',
            name: 'New Location',
          })
        }
      >
        Select Location
      </button>
    </div>
  )),
}));

const mockCloseModal = jest.fn();

describe('TransferPatient Component', () => {
  const mockSession = {
    user: { uuid: 'user-uuid' },
    sessionLocation: { uuid: 'location-uuid', display: 'Default Location' },
  };

  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key, fallback) => (typeof fallback === 'string' ? fallback : key),
    });
    (useSession as jest.Mock).mockReturnValue(mockSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', () => {
    render(<TransferPatient closeModal={mockCloseModal} patientUuid="patient-uuid" />);

    expect(screen.getByRole('heading', { name: /Transfer Patient/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('selects a location and submits the transfer', async () => {
    (transferPatient as jest.Mock).mockResolvedValueOnce(undefined);

    render(<TransferPatient closeModal={mockCloseModal} patientUuid="patient-uuid" />);

    fireEvent.change(screen.getByPlaceholderText(/Search for a location/i), {
      target: { value: 'New Location' },
    });

    fireEvent.click(screen.getByText(/Select Location/i));

    fireEvent.click(screen.getByRole('button', { name: /transferAllPatientDataTo/i }));

    await waitFor(() => {
      expect(transferPatient).toHaveBeenCalledWith('patient-uuid', 'new-location-uuid', expect.any(AbortController));
      expect(showSnackbar).toHaveBeenCalledWith({
        title: 'Successfully transferred',
        kind: 'success',
        isLowContrast: true,
        subtitle: expect.stringContaining('Patient successfully transferred to {{location}}.'),
      });
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('shows error snackbar on transfer failure', async () => {
    (transferPatient as jest.Mock).mockRejectedValueOnce(new Error('Transfer failed'));

    render(<TransferPatient closeModal={mockCloseModal} patientUuid="patient-uuid" />);

    fireEvent.change(screen.getByPlaceholderText(/Search for a location/i), {
      target: { value: 'New Location' },
    });

    fireEvent.click(screen.getByText(/Select Location/i));

    fireEvent.click(screen.getByRole('button', { name: /transferAllPatientDataTo/i }));

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith({
        title: 'Error',
        kind: 'error',
        subtitle: expect.stringContaining('An error occurred while trying to transfer the patient to {{location}}.'),
      });
    });
  });
});
