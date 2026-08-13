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
  Button,
} from '@carbon/react';
import { Help, Checkmark, Printer } from '@carbon/react/icons';
import { useLayoutType, ConfigurableLink, showNotification, showToast, useConfig } from '@openmrs/esm-framework';
import { EmptyDataIllustration } from './empty';

import { useTodos, markTodoAsDone, fetchClinicalConsentURL, getTodoVisitID, markTodoAsAccepted } from './todo.resource';

import styles from './todo-table.scss';

const ToDoList = () => {
  const config = useConfig();

  const { todos, isLoading, mutate } = useTodos();

  const layout = useLayoutType();
  const { t } = useTranslation();

  const markTodoDone = async (todo) => {
    const handleResponse = (response) => {
      if (response.ok) {
        showToast({
          critical: true,
          kind: 'success',
          description: t('todoCompleted', 'Todo has been completed successfully'),
        });
        mutate();
      } else {
        response.json().then((err) => {
          showNotification({
            critical: true,
            kind: 'error',
            description: t('todoCompleteError', 'Unexpected error while completing todo'),
          });
          console.log(err); // eslint-disable-line no-console
        });
      }
    };

    return markTodoAsDone(todo).then(handleResponse);
  };

  const markTodoAccepted = async (todo) => {
    const handleResponse = (response) => {
      if (response.ok) {
        showToast({
          critical: true,
          kind: 'success',
          description: t('todoAccepted', 'Todo has been accepted successfully'),
        });
        mutate();
      } else {
        response.json().then((err) => {
          showNotification({
            critical: true,
            kind: 'error',
            description: t('todoAcceptedError', 'Unexpected error while accepting todo'),
          });
          console.log(err); // eslint-disable-line no-console
        });
      }
    };

    return markTodoAsAccepted(todo).then(handleResponse);
  };

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('dateTime', 'Date and time'),
        key: 'dateTime',
      },
      {
        id: 1,
        header: t('hsuDetails', 'HSU Details'),
        key: 'nameAndIdentifier',
      },
      {
        id: 2,
        header: t('todo', 'To Do'),
        key: 'todoName',
      },
      {
        id: 3,
        header: t('actions', 'Actions'),
        key: 'actions',
      },
    ],
    [t],
  );

  const PrintConsentButton = ({ todo }) => (
    <Button
      kind="ghost"
      className={styles.actionButton}
      href={fetchClinicalConsentURL(todo.patientId, getTodoVisitID(todo))}
      target="_blank"
      renderIcon={() => <Printer size={16} className="cds--btn__icon" />}
    >
      {t('print', 'Print')}
    </Button>
  );

  const AppointmentConfirmLabel = ({ todo }) => (
    <Button
      kind="ghost"
      className={styles.actionButton}
      renderIcon={() => <Checkmark size={16} className="cds--btn__icon" />}
      onClick={() => markTodoAccepted(todo.id)}
    >
      {t('accept', 'Accept')}
    </Button>
  );

  const getTodoActionButton = (todo) => {
    switch (todo.type) {
      case 'PRINT_CONSENT':
        return <PrintConsentButton todo={todo} />;
      case 'APPOINTMENT_CONFIRM':
        return <AppointmentConfirmLabel todo={todo} />;
    }
  };

  const tableRows = todos?.map((todo) => ({
    id: todo.id,
    dateTime: {
      content: (
        <span className={styles.statusContainer}>
          <span className={styles.startTime}>{todo.dateTime}</span>
        </span>
      ),
    },
    nameAndIdentifier: {
      content: (
        <div className={styles.nameAndIdentifierContainer}>
          <ConfigurableLink to={`\${openmrsSpaBase}/patient/${todo.patientId}/chart`}>
            {todo.patientName}
          </ConfigurableLink>
          <span className={styles.identifier}>{todo.patientIdentifier}</span>
        </div>
      ),
    },
    todoName: {
      content: <div className={styles.todoNameContainer}>{todo.serviceCategory}</div>,
    },
    actions: {
      content: (
        <span className={styles.serviceContainer}>
          {getTodoActionButton(todo)}
          {todo.completed ? null : (
            <Button
              kind="ghost"
              className={styles.actionButton}
              renderIcon={() => <Checkmark className="cds--btn__icon" />}
              onClick={() => markTodoDone(todo.id)}
            >
              {t('done', 'Done')}
            </Button>
          )}
        </span>
      ),
    },
  }));

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (todos?.length === 0) {
    return (
      <div className={styles.homeTodosContainer}>
        <Layer>
          <div className={styles.desktopHeading}>
            {config.title ? (
              <h4 className={styles.emptyHeading}>{config.title}</h4>
            ) : (
              <h4 className={styles.emptyHeading}>{t('appointmentsToConfirm', 'Appointments to be confirmed')}</h4>
            )}
          </div>
          <Tile className={styles.tile}>
            <div className={styles.emptyDataIllustration}>
              <EmptyDataIllustration />
            </div>
            <p className={styles.content}>{t('noTodosToDisplay', 'No Todo actions to display')}</p>
          </Tile>
        </Layer>
      </div>
    );
  }

  return (
    <div className={styles.homeTodosContainer}>
      <div className={styles.headerTodoContainer}>
        <div className={styles.desktopHeading}>
          {config.title ? (
            <h4>{config.title}</h4>
          ) : (
            <h4>
              {t('appointmentsToConfirm', 'Appointments to be confirmed')}({todos.length})
            </h4>
          )}

          <Help />
        </div>
      </div>
      <DataTable data-floating-menu-container headers={tableHeaders} rows={tableRows} size={'xs'} useZebraStyles={true}>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table {...getTableProps()} className={styles.todoTable}>
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
                      <p className={styles.content}>{t('noTodosToDisplay', 'No Todo actions to display')}</p>
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

export default ToDoList;
