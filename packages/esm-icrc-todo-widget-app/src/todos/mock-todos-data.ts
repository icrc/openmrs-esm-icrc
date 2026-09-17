import { parseDate, formatDatetime } from '@openmrs/esm-framework';

export const mockTodos = [
  {
    completed: false,
    dateCreated: 1572879146000,
    patient: {
      name: 'Patient One',
      identifier: '10000X',
      uuid: '6b42e575-2e44-40c1-a14c-8637cbb3d21b',
    },
    attributes: [
      {
        uuid: '0458d18d-b779-4141-b1a2-a7977f49c391',
        attributeType: 'Appointment',
        dataType: 'Appointment',
        value: {
          uuid: '609cd7a8-84a0-42a0-a7ec-13551acbd928',
          date: 1576132200000,
          service: {
            id: 2,
            uuid: 'f6d752bf-34ea-48d0-8815-47cb93080eac',
            colour: '#006400',
            name: 'Cardiology (R)',
          },
        },
      },
    ],
    type: 'APPOINTMENT_CONFIRM',
    encounterId: 37,
    uuid: '1ab4a2c8-1cf5-46d8-8d7a-3be35c4d8b75',
  },
  {
    completed: true,
    dateCreated: 1572584857000,
    patient: {
      name: 'Patient Two',
      identifier: '103450X',
      uuid: '6b42e575-2e44-40c1-a14c-8637cbb3d21f',
    },
    attributes: [
      {
        uuid: 'dcfb79f5-e443-483a-92c5-72942e9f581e',
        attributeType: 'Service Category',
        dataType: 'Concept',
        value: {
          name: 'Prostheses',
          uuid: '84b2d351-393a-4cff-8c3c-f5785c05f9ce',
        },
      },
      {
        uuid: '90a45c11-0829-40e2-97d9-b51deea4831d',
        attributeType: 'VisitID',
        dataType: 'VisitID',
        value: '3479bf97-b842-4f94-a424-253297e4dc5e',
      },
    ],
    type: 'PRINT_CONSENT',
    uuid: 'da6d1694-2eda-4ada-944e-10ccac16c1d4',
  },
];
