import React from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { CheckmarkOutline, WarningAlt } from '@carbon/icons-react';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import styles from './table-content.scss';
import { Item } from './table-content-config-schema';

const TableContent: React.FC<any> = ({ item, config }: Item) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  return (
    <div className={layout === 'tablet' ? styles.tablet__tabContent : styles.desktop__tabContent}>
      {item.tab !== 'totalSessions' ? (
        <div className={styles.formCompleteLabel}>
          <span>{t('formCompleteness', 'Form Completeness')} -</span>
          <CheckmarkOutline size={20} className={styles.checkmarkOutlineIcon} />
          <span>{t('complete', 'Complete')}</span>
          <WarningAlt size={20} className={styles.warningAltIcon} />
          <span>{t('incomplete', 'Incomplete')}</span>
        </div>
      ) : null}

      {item.tables.map((table, index) =>
        item.tab === 'totalSessions' ? (
          table.data.length > 0 ? (
            <DataTable key={index} rows={table.data} headers={config?.sessionsHeaders}>
              {({ rows, headers, getHeaderProps, getTableProps }) => (
                <Table {...getTableProps()} useZebraStyles>
                  <TableHead>
                    <TableRow>
                      <TableHeader colSpan={4} className={`${styles.productiveHeading01} ${styles.text02}`}>
                        <div className={styles.contentCenter}>{t('totalNumberOf', 'Total Number of')}</div>
                      </TableHeader>
                    </TableRow>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          className={`${styles.productiveHeading01} ${styles.text02}`}
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                        >
                          <div className={styles.contentCenter}>{header.header?.content ?? header.header}</div>
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            <div className={styles.contentCenter}>{cell.value?.content ?? cell.value}</div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          ) : null
        ) : table.tableData.show ? (
          <>
            {<h3 className={styles.heading}>{table?.tableData?.label ?? table.tableData.label}</h3>}
            {table.data.length > 0 ? (
              <DataTable
                key={index}
                rows={table.data}
                headers={table?.tableData?.header ? config?.[table?.tableData?.header] : config.headers}
              >
                {({ rows, headers, getHeaderProps, getTableProps }) => (
                  <Table {...getTableProps()} useZebraStyles>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            className={`${styles.productiveHeading01} ${styles.text02}`}
                            {...getHeaderProps({
                              header,
                              isSortable: header.isSortable,
                            })}
                          >
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => (
                        <TableRow key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              <div className={styles.formCell}>
                                {table.data[index].hasOwnProperty('textAfterValue')
                                  ? table.data[index].textAfterValue.placement.includes(cell.info.header)
                                    ? (cell.value?.content ?? cell.value + table.data[index].textAfterValue.text)
                                    : (cell.value?.content ?? cell.value)
                                  : (cell.value?.content ?? cell.value)}
                                {cell.info.header === 'baseline' &&
                                table.data[index].hasOwnProperty('baselineComplete') &&
                                cell.value !== '-' ? (
                                  table.data[index].baselineComplete ? (
                                    <CheckmarkOutline size={20} className={styles.checkmarkOutlineIcon} />
                                  ) : (
                                    <WarningAlt size={20} className={styles.warningAltIcon} />
                                  )
                                ) : null}
                                {cell.info.header === 'finalFollowUp' &&
                                table.data[index].hasOwnProperty('finalFollowUpComplete') &&
                                cell.value !== '-' ? (
                                  table.data[index].finalFollowUpComplete ? (
                                    <CheckmarkOutline size={20} className={styles.checkmarkOutlineIcon} />
                                  ) : (
                                    <WarningAlt size={20} className={styles.warningAltIcon} />
                                  )
                                ) : null}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            ) : null}
          </>
        ) : null,
      )}
    </div>
  );
};

export default TableContent;
