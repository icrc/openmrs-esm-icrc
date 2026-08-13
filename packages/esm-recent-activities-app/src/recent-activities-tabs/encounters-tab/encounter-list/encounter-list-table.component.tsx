import React, { CSSProperties, useMemo, useState } from 'react';
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
import styles from './encounter-list-table.scss';
import EncounterListRow from './encounter-list-row.component';
import { useTranslation } from 'react-i18next';
import { useUserProperty } from '../../../api/hooks';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';

interface EncounterListTableProps {}

const EncounterListTable: React.FC<EncounterListTableProps> = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const userId = useSession()?.user.uuid;
  const { property } = useUserProperty(userId, 'lastEncounters');

  const defaultHeaders: Array<any> = [
    { key: 'encounterDatetime', header: t('datetime', 'Datetime') },
    { key: 'patient', header: t('patient', 'Patient') },
    { key: 'encounterType', header: t('encounterType', 'Encounter Type') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  return (
    <div>
      <DataTable rows={[]} headers={defaultHeaders}>
        {({ rows, headers, getHeaderProps, getTableProps, getTableContainerProps }: any) => {
          return property ? (
            <TableContainer style={{ backgroundColor: 'transparent' }} {...getTableContainerProps()}>
              <Table {...getTableProps()} useZebraStyles>
                <colgroup>
                  <col span={1} style={{ width: '25%' }} />
                  <col span={1} style={{ width: '25%' }} />
                  <col span={1} style={{ width: '25%' }} />
                  <col span={1} style={{ width: '25%' }} />
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
                  {property?.split(',')?.map((row, index) => (
                    <EncounterListRow encounterUuid={row} key={index} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Layer>
              <Tile className={styles.emptyState}>
                <EmptyDataIllustration />
                <p className={styles.emptyStateContent}>
                  {t('emptyRecentEncounters', 'There are no recent encounters for this user')}
                </p>
              </Tile>
            </Layer>
          );
        }}
      </DataTable>
    </div>
  );
};

export default EncounterListTable;
