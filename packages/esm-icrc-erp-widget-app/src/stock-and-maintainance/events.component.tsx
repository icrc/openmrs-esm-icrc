import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { WarningFilled } from '@carbon/react/icons';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import { EmptyDataIllustration } from './empty';

import { useInventories, useMaintenances } from './events.resource';

import styles from './events.scss';
import { fetchGlobalProperty } from '@icrc/esm-icrc-transversal-app/src/reports-widget/reports-widget.resource';

const StockMaintenanceTable = () => {
  const { maintenances, isLoading: isLoadingMaintenances } = useMaintenances();

  const { inventories, isLoading: isLoadingInventories } = useInventories();

  const events = [...inventories, ...maintenances];

  const isloading = isLoadingInventories || isLoadingMaintenances;

  const layout = useLayoutType();
  const { t } = useTranslation();

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: '',
        key: 'icon',
      },
      {
        id: 1,
        header: t('event', 'Event'),
        key: 'name',
      },
      {
        id: 2,
        header: t('from', 'From'),
        key: 'fromDate',
      },
      {
        id: 3,
        header: t('to', 'To'),
        key: 'toDate',
      },
    ],
    [t],
  );

  const tableRows = events?.map((event, i) => ({
    id: i,
    icon: (
      <div className={styles.warningIcon}>
        <WarningFilled />
      </div>
    ),
    name: {
      content: (
        <span className={styles.statusContainer}>
          <span className={styles.eventName}>{event.name}</span>
        </span>
      ),
    },
    fromDate: {
      content: <div className={styles.dateTime}>{event.fromDateTime}</div>,
    },
    toDate: {
      content: <div className={styles.dateTime}>{event.toDateTime}</div>,
    },
  }));

  if (isloading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (events?.length === 0) {
    return (
      <div className={styles.homeStockMaintenanceContainer}>
        <Layer>
          <div className={styles.desktopHeading}>
            <h4 className={styles.emptyHeading}>{t('stockAndMaintenanceEvents', 'Stock And Maintenance Events')}</h4>
          </div>
          <Tile className={styles.tile}>
            <EmptyDataIllustration />
            <p className={styles.content}>{t('noEventsToDisplay', 'No events to display')}</p>
          </Tile>
        </Layer>
      </div>
    );
  }

  return (
    <div className={styles.homeStockMaintenanceContainer}>
      <div className={styles.headerStockMaintenanceContainer}>
        <div className={styles.desktopHeading}>
          <h4>{t('stockAndMaintenanceEvents', 'Stock And Maintenance Events')}</h4>
        </div>
      </div>
      <DataTable data-floating-menu-container headers={tableHeaders} rows={tableRows} size={'xs'} useZebraStyles={true}>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table {...getTableProps()} className={styles.StockMaintenanceTable}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.id}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  return (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Layer>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noEventsToDisplay', 'No events to display')}</p>
                    </div>
                  </Tile>
                </Layer>
              </div>
            ) : null}
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default StockMaintenanceTable;
