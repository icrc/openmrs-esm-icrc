import { superUserRole } from '@icrc/esm-icrc-homepage-header-app/src/constants';

export const mockAdminSessionDataResponse = {
  user: {
    roles: [{ display: superUserRole }],
  },
  sessionLocation: {
    display: 'Inpatient Ward',
  },
};

export const mockUser1SessionDataResponse = {
  user: {
    roles: [{ display: 'Role 1' }],
    privileges: [{ display: 'Someone 1 privilege' }],
  },
  sessionLocation: {
    display: 'Inpatient Ward',
  },
};

export const mockUser3SessionDataResponse = {
  user: {
    roles: [{ display: 'Role 1' }],
    privileges: [{ display: 'No one privilege' }],
  },
  sessionLocation: {
    display: 'Inpatient Ward',
  },
};

export const mockUser2SessionDataResponse = {
  user: {
    roles: [{ display: 'Role 1' }],
    privileges: [{ display: 'Someone 1 privilege' }, { display: 'Someone 2 privilege' }],
  },
  sessionLocation: {
    display: 'Inpatient Ward',
  },
};

export const mockConfig = {
  addHomeFor: false,
  homepagesHeaderConfig: [
    {
      title: 'Someone 1',
      titleLabel: 'someone1',
      requiredPrivilege: 'Someone 1 privilege',
    },
    {
      title: 'Someone 2',
      titleLabel: 'someone2',
      requiredPrivilege: 'Someone 2 privilege',
    },
  ],
};
