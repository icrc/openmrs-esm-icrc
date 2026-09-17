import React, { useMemo } from 'react';
import {
  DataTable,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Layer,
} from '@carbon/react';
import { useLayoutType, isDesktop, useSession } from '@openmrs/esm-framework';
import styles from './patient-list-table.scss';
import PatientListRow from './patient-list-row.component';
import { useTranslation } from 'react-i18next';
import { useUserProperty } from '../../../api/hooks';
import { EmptyDataIllustration, EmptyState } from '@openmrs/esm-patient-common-lib';

interface PatientListTableProps {}

const PatientListTable: React.FC<PatientListTableProps> = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const userId = useSession()?.user.uuid;
  const { property } = useUserProperty(userId, 'lastPatients');

  const defaultHeaders: Array<any> = useMemo(
    () => [
      { key: 'photo', header: t('photoName', 'Photo/Name') },
      { key: 'gender', header: t('gender', 'Gender') },
      { key: 'identifier', header: t('identifier', 'Identifier') },
      { key: 'birthDate', header: t('birthDate', 'Birthdate') },
      { key: 'deceased', header: t('tags', 'Tags') },
    ],
    [t],
  );

  return (
    <div>
      <DataTable rows={[]} headers={defaultHeaders}>
        {({ rows, headers, getHeaderProps, getTableProps, getTableContainerProps }: any) => {
          return property ? (
            <TableContainer style={{ backgroundColor: 'transparent' }} {...getTableContainerProps()}>
              <Table {...getTableProps()} useZebraStyles>
                <colgroup>
                  <col span={1} style={{ width: '30%' }} />
                  <col span={1} style={{ width: '10%' }} />
                  <col span={1} style={{ width: '25%' }} />
                  <col span={1} style={{ width: '15%' }} />
                  <col span={1} style={{ width: '10%' }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        className={isDesktop(layout) ? styles.desktopHeader : styles.tabletHeader}
                        key={header.key}
                        {...getHeaderProps({ header })}
                        isSortable
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody className={styles.tableBody}>
                  {property?.split(',')?.map((row) => (
                    <PatientListRow patientUuid={row} key={row} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Layer>
              <Tile className={styles.emptyState}>
                <EmptyDataIllustration />
                <p className={styles.emptyStateContent}>
                  {`${t('emptyRecentPatients', 'There are no recent patients for this user')}`}
                </p>
              </Tile>
            </Layer>
          );
        }}
      </DataTable>
    </div>
  );
};

export default PatientListTable;
