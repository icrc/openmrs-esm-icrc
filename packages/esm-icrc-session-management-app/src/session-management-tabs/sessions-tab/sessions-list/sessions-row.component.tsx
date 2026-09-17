import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './sessions-list-table.scss';
import { DataTable, TableContainer, Table, TableHead, TableBody, TableCell, TableRow } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import EncounterListRow from './encounter-row.component';
import { GroupSession } from '../../../types';

interface SessionsListRowProps {
  session: GroupSession;
  onActions: any;
}

const SessionsListRow: React.FC<SessionsListRowProps> = ({ session, onActions }) => {
  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());

  const defaultHeaders = useMemo(
    () => [
      { id: 1, key: 'patientName', header: t('patient', 'Patient') },
      { id: 2, key: 'patientIdentifier', header: t('identifier', 'Identifier') },
      { id: 3, key: 'patientBirthdate', header: t('birthDate', 'Birthdate') },
      { id: 4, key: 'actions', header: t('actions', 'Actions') },
    ],
    [t],
  );

  return (
    <DataTable
      rows={[]}
      headers={defaultHeaders}
      overflowMenuOnHover={desktopLayout}
      size={desktopLayout ? 'sm' : 'lg'}
      key="encounters-table"
    >
      {({ headers, getHeaderProps, getTableProps, getTableContainerProps }) =>
        session.encounters.length > 0 ? (
          <TableContainer style={{ backgroundColor: 'transparent' }} {...getTableContainerProps()}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header, i) => (
                    <TableCell key={`${header.key}-${i}`} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody className={styles.tableBody}>
                {session.encounters.map((row, index) => (
                  <EncounterListRow
                    encounter={row}
                    session={session}
                    onActions={onActions}
                    key={`${row.id}-encounter`}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null
      }
    </DataTable>
  );
};

export default SessionsListRow;
