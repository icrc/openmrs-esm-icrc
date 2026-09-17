import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Dropdown,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  Button,
  DatePicker,
  DatePickerInput,
  DataTableSkeleton,
} from '@carbon/react';
import { Edit, TrashCan, UserMultiple, UserFollow } from '@carbon/react/icons';
import {
  ConfigurableLink,
  UserHasAccess,
  formatDate,
  isDesktop,
  navigate,
  parseDate,
  showModal,
  showSnackbar,
  useLayoutType,
  showToast,
  launchWorkspace2,
} from '@openmrs/esm-framework';
import SessionsListRow from './sessions-row.component';
import { useGroupSessions } from '../../../api/hooks';
import { GroupSession, HtmlFormEntryForm } from '../../../types';
import { deleteSession } from '../../../api/sessions.resource';
import styles from './sessions-list-table.scss';
import SessionDetailsEditModal from '../../SessionDetailsEditModal';
import AddPatient2SessionModal from './add-group-modal/AddPatient2SessionModal';

interface SessionsListTableProps {}

const SessionsListTable: React.FC<SessionsListTableProps> = React.memo(() => {
  const { t } = useTranslation();

  const [fromDate, setFromDate] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('fromDate');
    return from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  });

  const [toDate, setToDate] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('toDate');
    return to ? new Date(to) : new Date();
  });

  const [dateFilter, setDateFilter] = useState(t('last30Days', 'Last 30 Days'));

  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  const { groupSessions, setGroupSessions, error, isLoading, mutateGroupSessions } = useGroupSessions(fromDate, toDate);

  const desktopLayout = isDesktop(useLayoutType());
  const [filter, setFilter] = useState('');

  const [editSessionModalOpen, setEditSessionModalOpen] = useState(false);
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<GroupSession>();

  const updateURLParams = useCallback((fromDate, toDate) => {
    const params = new URLSearchParams(window.location.search);
    if (fromDate && toDate) {
      params.set('fromDate', fromDate.toISOString());
      params.set('toDate', toDate.toISOString());
    }
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setIsSessionsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      setGroupSessions([]);
      showToast({
        critical: true,
        kind: 'error',
        description: 'Unexpected error',
        title: t('errorFetchingGroupSessions', 'Unable to fetch sessions'),
      });
    }
  }, [error, setGroupSessions, t]);

  const editSessionModalHandleCancel = useCallback(() => {
    setCurrentSession(null);
    setEditSessionModalOpen(false);
  }, []);

  const addPatient2SessionModalHandleCancel = useCallback(() => {
    setCurrentSession(null);
    setAddPatientModalOpen(false);
  }, []);

  const addPatientModalPostSubmit = useCallback(() => {
    setCurrentSession(null);
    setAddPatientModalOpen(false);
    setIsSessionsLoading(true);
    mutateGroupSessions();
  }, [mutateGroupSessions]);

  const handleDateChange = useCallback(
    (dates) => {
      const [start, end] = dates;
      if ((start && end && start.getTime() != fromDate.getTime()) || end.getTime() != toDate.getTime()) {
        setFromDate(start);
        setToDate(end);
        updateURLParams(start, end);
        setDateFilter(t('customDateRange', 'Custom Date Range'));
        setIsSessionsLoading(true);
      }
    },
    [fromDate, toDate, t, updateURLParams],
  );

  const handleSessionUpdate = useCallback(() => {
    setCurrentSession(null);
    setEditSessionModalOpen(false);
    setIsSessionsLoading(true);
    mutateGroupSessions();
  }, [mutateGroupSessions]);

  const encounterTypes = useMemo(
    () => [...new Set(groupSessions.map((session) => session.encounterTypeName))].sort(),
    [groupSessions],
  );

  const handleDeleteSession = useCallback(
    (session: GroupSession) => {
      const close = showModal('delete-session-modal', {
        sessionName: session.name || '',
        sessionPatients: session.encounters.map((e) => e.patientName) || '',
        close: () => close(),
        onConfirmation: () => {
          const abortController = new AbortController();
          deleteSession(session.id ?? session.name, abortController)
            .then(() => {
              const updatedSessions = groupSessions.filter((s) => s.name !== session.name);
              setGroupSessions(updatedSessions);
              showSnackbar({
                isLowContrast: true,
                title: t('groupSessionDeleted', 'Group session deleted'),
                subtitle: t('groupSessionSuccessfullyDeleted', 'Group session successfully deleted'),
                kind: 'success',
              });
            })
            .catch((e) => {
              showSnackbar({
                isLowContrast: false,
                title: t('error', 'Error'),
                subtitle: t('groupSessionFailedDeleting', "Group session couldn't be deleted"),
                kind: 'error',
              });
            });
          close();
        },
      });
    },
    [groupSessions, setGroupSessions, t],
  );

  const handleDeleteEncounter = (sessionId: string, encounterId: string) => {
    const updatedSessions = groupSessions.filter((session) => {
      if (session.id === sessionId) {
        session.encounters = session.encounters.filter((encounter) => encounter.id !== encounterId);
        return session.encounters.length > 0;
      }
      return true;
    });
    setGroupSessions(updatedSessions);
  };

  async function handleEditEncounter(session, encounter) {
    await navigate({
      to: `\${openmrsSpaBase}/patient/${encounter?.patientUuid}/chart`,
    });

    setTimeout(() => {
      launchWorkspace2('patient-form-entry-workspace', {
        form: {
          uuid: session.formUuid,
          name: session.encounterTypeName,
          display: session.encounterTypeName,
        },
        encounterUuid: encounter.id,
      });
    }, 500);
  }

  const filteredRows = useMemo(() => {
    if (!filter || filter === t('all', 'All')) {
      return groupSessions;
    } else {
      return groupSessions?.filter((session) => session.encounterTypeName === filter);
    }
  }, [filter, groupSessions, t]);

  const tableHeaders = useMemo(
    () => [
      { key: 'datetime', header: t('date', 'Date') },
      { key: 'name', header: t('name', 'Name') },
      { key: 'cohortNameRaw', header: 'cohortName', isHidden: true },
      { key: 'cohortName', header: t('cohortName', 'Cohort Name') },
      { key: 'practitioner', header: t('practionerName', 'Practitioner Name') },
      { key: 'encounterTypeName', header: t('encounterType', 'Encounter Type') },
      { key: 'details', header: t('sessionDetails', 'Session Details') },
      { key: 'counter', header: '' },
      { key: 'actions', header: '' },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      filteredRows?.map((session) => ({
        id: session.id ?? session.name,
        cohortNameRaw: session.cohortName, // Plain text version of cohort name to enable keyword matching in table search
        cohortName: session.cohortName ? (
          <ConfigurableLink to={`\${openmrsSpaBase}/home/patient-lists/${session.cohortUuid}`}>
            {session.cohortName}
          </ConfigurableLink>
        ) : (
          t('unknown', 'Unknown')
        ),
        name: session.name,
        practitioner: session.practitioner,
        encounterTypeName: session.encounterTypeName,
        details: session.details,
        counter: (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <UserMultiple size={16} /> {session.encounters.length}
          </div>
        ),
        actions: (
          <UserHasAccess privilege={session.editPrivilege}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                kind="ghost"
                hasIconOnly
                renderIcon={Edit}
                iconDescription={t('editSessionDetails', 'Edit session details')}
                size={16}
                tooltipPosition="left"
                onClick={() => {
                  setCurrentSession(session);
                  setEditSessionModalOpen(true);
                }}
              />
              <Button
                kind="ghost"
                hasIconOnly
                renderIcon={UserFollow}
                iconDescription={t('addPatientToSession', 'Add patient to session')}
                size={16}
                tooltipPosition="left"
                onClick={() => {
                  setCurrentSession(session);
                  setAddPatientModalOpen(true);
                }}
              />
              <Button
                kind="ghost"
                hasIconOnly
                renderIcon={TrashCan}
                iconDescription={t('removeGroupList', 'Remove group session')}
                size={16}
                tooltipPosition="left"
                onClick={() => handleDeleteSession(session)}
              />
            </div>
          </UserHasAccess>
        ),
        datetime: session?.datetime ? formatDate(parseDate(session.datetime), { mode: 'wide', time: false }) : '',
      })),
    [filteredRows, handleDeleteSession, t],
  );

  const handleEncounterTypeChange = ({ selectedItem }) => setFilter(selectedItem);

  const handleFilter = ({ rowIds, headers, cellsById, inputValue, getCellId }) =>
    rowIds.filter((rowId) =>
      headers.some(({ key }) => {
        const cellId = getCellId(rowId, key);
        const filterableValue = cellsById[cellId].value;
        return ('' + filterableValue).toLowerCase().includes(inputValue.toLowerCase());
      }),
    );

  const handleDateFilterChange = (selectedItem) => {
    setDateFilter(selectedItem);
    const now = new Date();
    let startDate;
    let endDate = now;

    switch (selectedItem) {
      case t('currentYear', 'Current Year'):
        startDate = new Date(now.getFullYear(), 0, 1); // Start of the current year
        endDate = new Date(); // Today's date
        break;

      case t('last30Days', 'Last 30 Days'):
        startDate = new Date(now.setDate(now.getDate() - 30)); // 30 days ago
        endDate = new Date(); // Today's date
        break;

      case t('last90Days', 'Last 90 Days'):
        startDate = new Date(now.setDate(now.getDate() - 90)); // 90 days ago
        endDate = new Date(); // Today's date
        break;

      case t('last180Days', 'Last 180 Days'):
        startDate = new Date(now.setDate(now.getDate() - 180)); // 180 days ago
        endDate = new Date(); // Today's date
        break;

      case t('last365Days', 'Last 365 Days'):
        startDate = new Date(now.setDate(now.getDate() - 365)); // 365 days ago
        endDate = new Date(); // Today's date
        break;

      case t('thisMonth', 'This Month'):
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of this month
        endDate = new Date(); // Today's date
        break;

      case t('lastMonth', 'Last Month'):
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Start of last month
        endDate = new Date(now.getFullYear(), now.getMonth(), 0); // End of last month
        break;

      case t('thisQuarter', 'This Quarter'):
        const currentQuarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), currentQuarterStartMonth, 1); // Start of this quarter
        endDate = new Date(); // Today's date
        break;

      case t('lastQuarter', 'Last Quarter'):
        const lastQuarterStartMonth = Math.floor((now.getMonth() - 3) / 3) * 3;
        startDate = new Date(now.getFullYear(), lastQuarterStartMonth, 1); // Start of last quarter
        endDate = new Date(now.getFullYear(), lastQuarterStartMonth + 3, 0); // End of last quarter
        break;

      case t('thisYear', 'This Year'):
        startDate = new Date(now.getFullYear(), 0, 1); // Start of this year
        endDate = new Date(); // Today's date
        break;

      case t('lastYear', 'Last Year'):
        startDate = new Date(now.getFullYear() - 1, 0, 1); // Start of last year
        endDate = new Date(now.getFullYear() - 1, 11, 31); // End of last year
        break;

      default:
        return;
    }

    setFromDate(startDate);
    setToDate(endDate);
    updateURLParams(startDate, endDate);
    setIsSessionsLoading(true);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'left', gap: '1rem' }}>
        <Dropdown
          id="date-filter"
          titleText={t('filterByDate', 'Filter by Date')}
          label={t('selectDateFilter', 'Select Date Filter')}
          style={{ width: '200px' }}
          selectedItem={dateFilter}
          items={[
            t('customDateRange', 'Custom Date Range'),
            t('last30Days', 'Last 30 Days'),
            t('last90Days', 'Last 90 Days'),
            t('last180Days', 'Last 180 Days'),
            t('last365Days', 'Last 365 Days'),
            t('thisMonth', 'This Month'),
            t('lastMonth', 'Last Month'),
            t('thisQuarter', 'This Quarter'),
            t('lastQuarter', 'Last Quarter'),
            t('thisYear', 'This Year'),
            t('lastYear', 'Last Year'),
          ]}
          onChange={({ selectedItem }) => handleDateFilterChange(selectedItem)}
        />
        <DatePicker datePickerType="range" onChange={handleDateChange} value={[fromDate, toDate]}>
          <DatePickerInput
            id="date-picker-input-id-start"
            placeholder="dd/mm/yyyy"
            labelText={t('fromDate', 'From')}
            value={fromDate ? new Date(fromDate).toLocaleDateString() : ''}
            size="md"
            dateFormat="d/m/Y"
            minDate={toDate}
          />
          <DatePickerInput
            id="date-picker-input-id-finish"
            placeholder="dd/mm/yyyy"
            labelText={t('toDate', 'To')}
            value={toDate ? new Date(toDate).toLocaleDateString() : ''}
            dateFormat="d/m/Y"
            size="md"
          />
        </DatePicker>
      </div>
      {isSessionsLoading && (
        <div style={{ paddingTop: '32px' }}>
          <DataTableSkeleton
            {...{ columnCount: 6, showHeader: false, showToolbar: false }}
            headers={tableHeaders.filter((col) => !col.isHidden)}
            aria-label="sample table"
          />
        </div>
      )}
      {!isSessionsLoading && (
        <DataTable
          filterRows={handleFilter}
          headers={tableHeaders}
          rows={tableRows}
          overflowMenuOnHover={desktopLayout}
          size={desktopLayout ? 'sm' : 'lg'}
          useZebraStyles
          key="sessions-table"
        >
          {({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getExpandHeaderProps,
            getTableProps,
            getToolbarProps,
            onInputChange,
          }) => (
            <>
              {currentSession && (
                <>
                  <SessionDetailsEditModal
                    isOpen={editSessionModalOpen}
                    onPostCancel={editSessionModalHandleCancel}
                    session={currentSession}
                    handleSessionUpdate={handleSessionUpdate}
                  />
                  <AddPatient2SessionModal
                    isOpen={addPatientModalOpen}
                    onPostCancel={addPatient2SessionModalHandleCancel}
                    onPostSubmit={addPatientModalPostSubmit}
                    session={currentSession}
                  />
                </>
              )}
              <TableContainer className={styles.tableContainer}>
                <TableToolbar {...getToolbarProps()}>
                  <TableToolbarContent>
                    <div className={styles.filterContainer}>
                      <Dropdown
                        id="serviceFilter"
                        initialSelectedItem={t('all', 'All')}
                        label=""
                        titleText={t('filterByEncounterType', 'Filter by encounter type') + ':'}
                        type="inline"
                        items={[t('all', 'All'), ...encounterTypes]}
                        onChange={handleEncounterTypeChange}
                        size={desktopLayout ? 'sm' : 'lg'}
                      />
                    </div>
                    <TableToolbarSearch
                      className={styles.search}
                      expanded
                      onChange={onInputChange}
                      placeholder={t('searchThisList', 'Search this list')}
                    />
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                      {headers
                        .filter((header) => !header.isHidden)
                        .map((header, i) => (
                          <TableHeader
                            className={styles.tableHeader}
                            key={`${header.key}-${i}`}
                            {...getHeaderProps({ header })}
                            style={i === 0 ? { width: '150px' } : {}}
                          >
                            {header.header}
                          </TableHeader>
                        ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!isSessionsLoading &&
                      rows.map((row, index) => {
                        const selectedSession = groupSessions.find((gs) =>
                          gs.id ? gs.id === row.id : gs.name === row.id,
                        );
                        return (
                          selectedSession && (
                            <React.Fragment key={`${row.id}-${index}`}>
                              <TableExpandRow {...getRowProps({ row })}>
                                {headers
                                  .filter((header) => !header.isHidden)
                                  .map((header, index) => {
                                    const cell = row.cells.find((c) => c.info.header === header.key);
                                    return <TableCell key={`${cell?.id}-${index}`}>{cell?.value}</TableCell>;
                                  })}
                              </TableExpandRow>
                              {row.isExpanded ? (
                                <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                                  <SessionsListRow
                                    session={selectedSession}
                                    onActions={{
                                      onDeleteEncounter: handleDeleteEncounter,
                                      onEditEncounter: handleEditEncounter,
                                    }}
                                  />
                                </TableExpandedRow>
                              ) : (
                                <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                              )}
                            </React.Fragment>
                          )
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>

              {!isSessionsLoading && error == null && rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noGroupSessionsToDisplay', 'No group sessions to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
              {!isSessionsLoading && error ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>
                        {t('errorFetchingGroupSessions', 'Error fetching group sessions')}
                      </p>
                      <p className={styles.helper}>{t(error.message, 'Try again later')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </>
          )}
        </DataTable>
      )}
    </>
  );
});

export default SessionsListTable;
