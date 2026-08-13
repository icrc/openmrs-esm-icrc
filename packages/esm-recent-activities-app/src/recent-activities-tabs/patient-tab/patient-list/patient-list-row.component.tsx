import React, { CSSProperties, useMemo } from 'react';
import { TableCell, TableRow, DefinitionTooltip, Tag, InlineLoading } from '@carbon/react';
import { usePatient, ExtensionSlot, formatDatetime, parseDate, formatDate, navigate } from '@openmrs/esm-framework';
import styles from './patient-list-table.scss';
import { useTranslation } from 'react-i18next';

interface PatientListRowProps {
  patientUuid: string;
}

const PatientListRow: React.FC<PatientListRowProps> = ({ patientUuid }) => {
  const { patient } = usePatient(patientUuid);
  const { t } = useTranslation();
  const patientName = `${patient?.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`;
  const patientPhotoSlotState = React.useMemo(() => ({ patientUuid, patientName }), [patientUuid, patientName]);

  return patient ? (
    <TableRow>
      <TableCell
        key={`${patientUuid}-photo`}
        onClick={() => navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` })}
      >
        <div className={styles.patientInfo}>
          <div className={styles.flexRow}>
            <ExtensionSlot name="patient-photo-slot" state={patientPhotoSlotState} />
          </div>
          <span className={styles.patientName}>{patientName}</span>
        </div>
      </TableCell>
      <TableCell className={`${styles.tableCell} ${styles.gender} `} key={`${patientUuid}-gender`}>
        {t(patient?.gender, patient?.gender)}
      </TableCell>
      <TableCell className={styles.tableCell} key={`${patientUuid}-identifier`}>
        <div className={styles.identifiers}>
          {patient?.identifier?.length
            ? patient?.identifier.map(({ value, type }) => (
                <span className={styles.identifierTag}>
                  <Tag key={value} className={styles.tag} type="gray" title={type.text}>
                    {type.text}
                  </Tag>
                  {value}
                </span>
              ))
            : ''}
        </div>
      </TableCell>
      <TableCell className={styles.tableCell} key={`${patientUuid}-birthDate`}>
        {formatDate(parseDate(patient.birthDate), { mode: 'wide', time: false })}
      </TableCell>
      <TableCell className={styles.tableCell} key={`${patientUuid}-deceased`}>
        {patient?.deceasedDateTime && (
          <DefinitionTooltip
            className={styles.definitionToolTip}
            align="bottom-left"
            definition={
              <div role="tooltip" className={styles.tooltipPadding}>
                <h6 className={styles.heading}>{t('deceasedDate', 'Deceased Date')}</h6>
                <span>
                  <span>{formatDatetime(parseDate(patient?.deceasedDateTime), { mode: 'wide' })}</span>
                </span>
              </div>
            }
          >
            <Tag type="red">{t('deceased', 'Deceased')}</Tag>
          </DefinitionTooltip>
        )}
      </TableCell>
    </TableRow>
  ) : (
    <div className={styles.loading}>
      <InlineLoading />
    </div>
  );
};

export default PatientListRow;
