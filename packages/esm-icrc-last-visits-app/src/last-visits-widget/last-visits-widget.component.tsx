import React, { useCallback, useEffect, useState } from 'react';
import { useConfig, getConfig, UserHasAccess, usePatient, Visit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './/last-visits-widget.scss';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { fetchAttachmentByVisit, useLastVisits } from './last-visits-widget.resource';
import { HtmlFormEntryForm, requiredPrivilege } from '../config-schema';
import { DocumentDownload } from '@carbon/icons-react';
import { launchFormEntryOrHtmlForms } from '../form-entry-interop';

import {
  DataTable,
  DataTableSkeleton,
  Link,
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
} from '@carbon/react';

interface ReportWidgetProps {}

const LastVisitWidget: React.FC<ReportWidgetProps> = () => {
  const { t } = useTranslation();
  const config = useConfig();
  const { lastVisits, isError, isLoading, isValidating } = useLastVisits();
  const patientUuid = usePatient().patientUuid;
  const headers = [
    {
      id: 0,
      header: t('from', 'From'),
      key: 'from',
    },
    {
      id: 1,
      header: t('to', 'To'),
      key: 'to',
    },
  ];

  const generateAttachmentURI = useCallback((attachmentId: string) => {
    const url = `${window.openmrsBase}/ws/attachments/download?view=complexdata.view.original&obs=${attachmentId}`;
    return url;
  }, []);

  const [htmlFormEntryFormsConfig, setHtmlFormEntryFormsConfig] = useState<Array<HtmlFormEntryForm> | undefined>([]);
  useEffect(() => {
    getConfig('@openmrs/esm-patient-forms-app').then((config) => {
      setHtmlFormEntryFormsConfig(config.htmlFormEntryForms as HtmlFormEntryForm[]);
    });
  });

  React.useEffect(() => {
    const abortController = new AbortController();
    if (lastVisits) {
      lastVisits.forEach((visit) => {
        fetchAttachmentByVisit(abortController, visit.id, patientUuid).then((response) => {
          if (response.status === 200) {
            visit.attachments = response.data.results.map((serverAttachment) => {
              return {
                name:
                  serverAttachment.comment ||
                  serverAttachment.bytesContentFamily + ' - ' + new Date(serverAttachment.dateTime).toDateString(),
                uuid: serverAttachment.uuid,
              };
            });
          }
        });
      });
    }
  }, [lastVisits, patientUuid]);

  const getFormConfig = (formUuid: string): HtmlFormEntryForm => {
    return htmlFormEntryFormsConfig?.find((formConfig) => {
      return formConfig.formUuid == formUuid;
    });
  };

  if (isLoading) {
    return (
      <UserHasAccess privilege={requiredPrivilege}>
        <DataTableSkeleton role="progressbar" />;
      </UserHasAccess>
    );
  }

  if (lastVisits?.length) {
    return (
      <UserHasAccess privilege={requiredPrivilege}>
        <div className={styles.lastVisitsWidgetContainer}>
          <CardHeader
            title={t('lastNumVisits', 'Last {{numberOfLastVisits}} visits', {
              numberOfLastVisits: config.numberOfLastVisits,
            })}
            children={undefined}
          />
          <div className={styles.container}>
            <DataTable rows={lastVisits} headers={headers}>
              {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
                <TableContainer {...getTableContainerProps()}>
                  <Table {...getTableProps()} size="sm" useZebraStyles={false}>
                    <TableHead>
                      <TableRow>
                        <TableExpandHeader id="expand" />
                        {headers.map((header, i) => (
                          <TableHeader key={i} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => (
                        <React.Fragment key={row.id}>
                          <TableExpandRow expandHeader="expand" {...getRowProps({ row })}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableExpandRow>
                          {row.isExpanded && (
                            <TableExpandedRow colSpan={headers.length + 1} className="demo-expanded-td">
                              <div className={styles.formsContainer}>
                                <div className={styles.formsHeader}>
                                  <h6>{t('completedForms', 'Completed forms')}</h6>
                                </div>
                                <div className={styles.formsBody}>
                                  {lastVisits[index].encounters.map((encounter, i) => (
                                    <div className={styles.form} key={i}>
                                      <div>{encounter.encounterDate}</div>
                                      <Link
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                          launchFormEntryOrHtmlForms(
                                            lastVisits[index] as unknown as Visit,
                                            encounter.formUuid,
                                            patientUuid,
                                            htmlFormEntryFormsConfig,
                                            encounter.uuid,
                                            encounter.name,
                                          );
                                        }}
                                        role="presentation"
                                        className={styles.formName}
                                      >
                                        {encounter.name}
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className={styles.attachmentsContainer}>
                                <div className={styles.attachmentsHeader}>
                                  <h6>{t('attachments', 'Attachments')}</h6>
                                </div>
                                <div className={styles.attachmentsBody}>
                                  {lastVisits[index].attachments.map((attachment, i) => (
                                    <div className={styles.attachment} key={i}>
                                      <div className={styles.attachmentIcon}>
                                        <DocumentDownload size={20} className={styles.attachmentIcon} />
                                      </div>
                                      <div className={styles.attachmentLink}>
                                        <Link href={generateAttachmentURI(attachment.uuid)}>{attachment.name}</Link>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableExpandedRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          </div>
        </div>
      </UserHasAccess>
    );
  }
  return (
    <UserHasAccess privilege={requiredPrivilege}>
      <EmptyState
        headerTitle={t('lastNumVisits', 'Last {numberOfLastVisits} visits', {
          numberOfLastVisits: config.numberOfLastVisits,
        })}
        displayText={t('visits', 'visits')}
      />
    </UserHasAccess>
  );
};

export default LastVisitWidget;
