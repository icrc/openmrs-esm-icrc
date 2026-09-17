import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import styles from './generic-table.scss';

const GenericTableInterpretationForm: React.FC = () => {
  const { t } = useTranslation();
  const config = useConfig();

  return (
    <div>
      <DataTable rows={[]} headers={[]} size="sm">
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table {...getTableProps()} useZebraStyles className={styles.customRow}>
              <TableHead>
                <TableRow>
                  {config?.headers?.map((header) => (
                    <TableHeader
                      className={`${styles.tableHeader}`}
                      {...getHeaderProps({
                        header,
                      })}
                    >
                      {t(header?.title?.key, header?.title?.default)}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {config?.rows?.map((row, index) => (
                  <TableRow key={row?.id}>
                    {config?.headers?.map(({ key }) => (
                      <TableCell key={row?.id + key}>
                        {typeof row?.[key] === 'object' ? t(row?.[key]?.key, row?.[key]?.default) : row?.[key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default GenericTableInterpretationForm;
