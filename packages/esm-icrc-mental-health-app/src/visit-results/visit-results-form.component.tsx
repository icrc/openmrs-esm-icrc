import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';
import { useSession } from '@openmrs/esm-framework';
import { useEncounterResult, useVisitResults } from './visit-results.resource';
import type { VisitResultsConfigObject } from './visit-results-config-schema';
import TableContent from './table-content/table-content.component';
import styles from './visit-results-form.scss';
import dayjs from 'dayjs';

const encountersAndObs = {
  encounterTypes: [
    '0c63150d-ff39-42e1-9048-834mh76p2s72',
    '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
    '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
    '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
    '790a93a8-fff6-49af-f98d-2e9f436f93a8',
    '790a93a8-fff6-49af-f98d-2e9f436f93a8',
    '6c39d93d-73c2-4388-whod-asf80508064b',
    '805f55bb-5f5c-475d-bd71-e9553d38bde9',
    '74c7c064-a5a5-4b2a-918e-421f45fc9aa8',
    '6d9df509-a22f-48aa-8a94-fc72ded71acc',
    'c877fdd2-6011-42e6-9474-bf4a9b8e2aba',
    '83458695-3b06-4d59-9508-d217aa21ea26',
    '07a7dd1c-7280-483a-a3bc-01be995293ac',
    '0c63150d-ff39-42e1-9048-834mh76p2s73',
  ],
  obsUuids: [
    'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
    '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
    'ade4addc-0a3a-4084-b333-c14961b1bf76',
    'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93',
    '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d',
    'e4e789b1-37bb-43e2-bb43-c0a7d5911945',
    '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
    'cce3a2fb-7d15-4d13-b7f0-545a284ef036',
    '93067c6e-3842-4044-b5ba-9f4d5e030b52',
    '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
    'e03ae430-0560-41bf-8db4-9a815bff84ac',
    '4e65fe4a-1270-46f8-bd14-2390d1d82124',
    '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
    'ff2f61cb-ce60-4ead-b3cc-e70727ced888',
    '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
    'bcf2b896-2e4d-4068-9787-5aef32bb9df4',
    '052d708e-2aca-4cb2-9305-e140177729e2',
    'dc44bdf0-b2e6-46f7-84a6-1f5cd0e8fe9c',
    '534107ae-c632-441a-90f7-152cc465272e',
    '3fe79807-3c83-4d1e-a93a-4db29f6989a3',
    '825f7642-d421-4693-8672-7061420184c8',
    '32b21959-2f14-4494-89b1-8697aca5b855',
    'f9ace37c-b680-4415-bc53-57afc32b152e',
    '13f85903-7653-4eeb-810d-9457160dead9',
    '125edf7d-6e25-44d7-ae0a-7ee7c7448e0e',
    '5ee97eeb-8486-4b13-ba23-1eb29fdf573c',
    '30c3c80f-eae6-40f0-aff5-eacda1286e55',
    '0b36102c-1247-4f71-920d-cba606d5e022',
    '65fc0a51-dc89-46fa-9955-7ca4b7a17002',
    '673eebb2-4e62-4600-9361-616e81cf479d',
    '85958712-afc3-4037-b3ce-26147307faaf',
    '912d15ba-7f8b-4598-8438-2efb92d63f91',
    'a102e695-c308-4a38-ab73-93c5c4d7bc2d',
    '9bc5eb8c-7c82-11e9-8f9e-2a86e4085a59',
    '9bc5ecea-7c82-11e9-8f9e-2a86e4085a59',
    '3a826502-6d4a-4e84-82e2-13deb0a5f958',
    '85958712-afc3-4037-b3ce-26147307faaf',
  ],
};

interface VisitResuultProps {
  patientUuid: string;
}

const VisitResultsForm: React.FC<VisitResuultProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const session = useSession();
  const [currentSessionProviderUuid, setCurrentSessionProviderUuid] = React.useState('');
  const [currentSessionLocationUuid, setCurrentSessionLocationUuid] = React.useState('');

  const closureFormDateTimes = useEncounterResult(patientUuid, '95458795-3o06-4l59-9508-c217aa21ea26');

  //Data structure  EncounterTypes (Forms ex: DASS-21) -> observations (of each form ex: Depression, Anxiety, Stress) -> Each line represents a encounter (Form filled)
  const encounters = useVisitResults(patientUuid, encountersAndObs.encounterTypes, encountersAndObs.obsUuids);

  useEffect(() => {
    if (session && !currentSessionLocationUuid && !currentSessionProviderUuid) {
      setCurrentSessionLocationUuid(session?.sessionLocation?.uuid);
      setCurrentSessionProviderUuid(session?.currentProvider?.uuid);
    }
  }, [currentSessionLocationUuid, currentSessionProviderUuid, session]);

  const tabs: Array<any> = React.useMemo(() => {
    filterEncounters(encounters);

    // [encounterType][observation][length - 1] -> Baseline
    // [encounterType][observation][0] -> Final Follow-up
    function getFirstCellValue(encounterType: string, observation: string): string {
      const length = encounters?.encounters[encounterType][observation]?.length;

      if (length > 0) {
        if (encounters?.encounters[encounterType][observation]?.[length - 1].value >= 0) {
          return encounters?.encounters[encounterType][observation]?.[length - 1].value;
        } else {
          return '-';
        }
      } else {
        return '-';
      }
    }

    function getLastCellValue(encounterType: string, observation: string): string {
      const length: number = encounters?.encounters[encounterType][observation]?.length ?? 0;

      if (length > 1) {
        if (encounters?.encounters[encounterType][observation]?.[0].value >= 0) {
          return encounters?.encounters[encounterType][observation]?.[0].value;
        } else {
          return '-';
        }
      } else {
        return '-';
      }
    }

    function calculateTotal(
      encounterType: string,
      observations: Array<string>,
      type: 'baseline' | 'finalFollowUp' | 'difference',
    ): string {
      let length = 0;

      let total = 0;

      if (type === 'baseline') {
        observations.map((observation: string) => {
          length = encounters?.encounters[encounterType][observation]?.length;
          length > 0
            ? (total += encounters?.encounters[encounterType][observation]?.[length - 1].value)
            : (total = null);
        });
      }

      if (type === 'finalFollowUp') {
        observations.map((observation: string) => {
          length = encounters?.encounters[encounterType][observation]?.length;
          length > 1 ? (total += encounters?.encounters[encounterType][observation]?.[0].value) : (total = null);
        });
      }

      //Final Follow-up  - Baseline
      if (type === 'difference') {
        observations.map((observation: string) => {
          length = encounters?.encounters[encounterType][observation]?.length;
          length > 1 ? (total += encounters?.encounters[encounterType][observation]?.[0].value) : (total = null);
        });

        observations.map((observation: string) => {
          length = encounters?.encounters[encounterType][observation]?.length;
          length > 1
            ? (total -= encounters?.encounters[encounterType][observation]?.[length - 1].value)
            : (total = null);
        });
      }

      return typeof total === 'number' && !Number.isNaN(total) ? total.toFixed(2).toString() : '-';
    }

    function calculateDifference(encounterType: string, observation: string): string {
      const length = encounters?.encounters[encounterType][observation]?.length;
      let difference = 0;

      //Check if don't have a value and return '-' in such case
      if (
        length <= 1 ||
        (isEmpty(encounters?.encounters[encounterType][observation]?.[length - 1]?.value) &&
          isEmpty(encounters?.encounters[encounterType][observation]?.[0]?.value))
      )
        return '-';

      const baseline = encounters?.encounters[encounterType][observation]?.[length - 1].value
        ? encounters?.encounters[encounterType][observation]?.[length - 1].value
        : 0;
      const finalFollowUp = encounters?.encounters[encounterType][observation]?.[0].value
        ? encounters?.encounters[encounterType][observation]?.[0].value
        : 0;

      difference = finalFollowUp - baseline;

      return difference.toFixed(2).toString();
    }

    function isEmpty(value: any) {
      return value == null || value == undefined || value?.length === 0;
    }

    function formatDate_dd_mm_yyyy(_date: string) {
      return dayjs(_date).format('DD-MM-YYYY');
    }

    function showTable(encounterType: string, observations: Array<string>) {
      for (let ob of observations) {
        if (isEmpty(encounters?.encounters[encounterType][ob]) === false) return true;
      }

      return false;
    }

    function filterEncounters(_encounters: any) {
      let encountersFiltered = _encounters;

      encountersAndObs.encounterTypes.map((_encounterType) => {
        encountersAndObs.obsUuids.map((observation) => {
          if (
            _encounters.encounters[_encounterType]?.[observation] &&
            _encounters.encounters[_encounterType]?.[observation].length > 0 &&
            !isEmpty(closureFormDateTimes?.closureForms)
          ) {
            _encounters.encounters[_encounterType]?.[observation].map((data) => {
              if (
                new Date(data.dateTime).getTime() <=
                new Date(
                  closureFormDateTimes.closureForms?.[closureFormDateTimes.closureForms.length - 1].encounterDatetime,
                ).getTime()
              ) {
                //remove the obs that don't belong to the latest session
                encountersFiltered.encounters[_encounterType][observation] = encountersFiltered.encounters[
                  _encounterType
                ]?.[observation].filter((item) => item.dateTime !== data.dateTime);
              }
            });
          }
        });
      });
    }

    function checkFormCompleteness(
      encounterType: string,
      observation: string,
      type: 'finalFollowUp' | 'baseline',
    ): boolean {
      const length = encounters?.encounters[encounterType][observation]?.length;
      if (length > 0) {
        if (type === 'finalFollowUp') {
          return encounters?.encounters[encounterType][observation]?.[0].complete;
        } else if (type === 'baseline') {
          return encounters?.encounters[encounterType][observation]?.[length - 1].complete;
        }
      }
    }

    function getDate(encounterType: string, observation: string, type: 'baseline' | 'finalFollowUp' | 'difference') {
      let length = 0;
      let baselineDate = '-';
      let finalFollowUpDate = '-';
      let dateDifference = '-';

      switch (type) {
        case 'baseline':
          length = encounters?.encounters[encounterType][observation]?.length;

          length > 0
            ? (baselineDate = formatDate_dd_mm_yyyy(
                encounters?.encounters[encounterType][observation]?.[length - 1].dateTime,
              ))
            : null;
          return baselineDate;

        case 'finalFollowUp':
          length = encounters?.encounters[encounterType][observation]?.length;
          length > 1
            ? (finalFollowUpDate = formatDate_dd_mm_yyyy(
                encounters?.encounters[encounterType][observation]?.[0].dateTime,
              ))
            : null;
          return finalFollowUpDate;

        case 'difference':
          length = encounters?.encounters[encounterType][observation]?.length;
          if (length > 1) {
            //Final Follow-up form date
            let date1 = new Date(encounters?.encounters[encounterType][observation]?.[0].dateTime.split('T')[0]);
            //Baseline form date
            let date2 = new Date(
              encounters?.encounters[encounterType][observation]?.[length - 1].dateTime.split('T')[0],
            );

            let Difference_In_Time = date1.getTime() - date2.getTime();

            dateDifference = (Difference_In_Time / (1000 * 3600 * 24)).toString();
          }
          return dateDifference;
      }
    }

    function measureOfImprovementAndChange(
      encounterType: string,
      observations: Array<string>,
      type: 'baseline' | 'finalFollowUp' | 'difference',
      measureType: 'measureOfImprovement' | 'clinicallySignificantChange',
    ) {
      let message = '';

      if (measureType === 'measureOfImprovement') {
        if (parseFloat(calculateTotal(encounterType, observations, type)) > 0) {
          message = t('increasedSeverity', 'Increased Severity');
        } else if (parseFloat(calculateTotal(encounterType, observations, type)) == 0) {
          message = t('noChange', 'No Change');
        } else {
          message = t('improvement', 'Improvement');
        }
      }

      if (measureType === 'clinicallySignificantChange') {
        Math.abs(parseFloat(calculateTotal(encounterType, observations, type))) >= 8.54
          ? (message = t('yes', 'Yes'))
          : (message = t('no', 'No'));
      }

      return message;
    }

    return [
      {
        tab: 'levelOfDistress',
        tables: [
          {
            tableData: {
              label: t('DASS-21', 'DASS-21'),
              show: showTable('790a93a8-bfb6-49ab-b98d-2e9b436f93a8', [
                'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                'ade4addc-0a3a-4084-b333-c14961b1bf76',
              ]),
            },
            data: [
              {
                id: '1',
                scale: t('DASS-21Total', 'DASS-21 (TOTAL)'),
                baseline: calculateTotal(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  [
                    'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                    '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                    'ade4addc-0a3a-4084-b333-c14961b1bf76',
                  ],
                  'baseline',
                ),
                baselineComplete: checkFormCompleteness(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                  'baseline',
                ),
                finalFollowUp: calculateTotal(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  [
                    'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                    '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                    'ade4addc-0a3a-4084-b333-c14961b1bf76',
                  ],
                  'finalFollowUp',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                  'finalFollowUp',
                ),
                difference: calculateTotal(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  [
                    'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                    '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                    'ade4addc-0a3a-4084-b333-c14961b1bf76',
                  ],
                  'difference',
                ),
              },
              {
                id: '2',
                scale: t('DASS-21Depression', 'DASS-21 (Depression)'),
                baseline: getFirstCellValue(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                ),
                finalFollowUp: getLastCellValue(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                ),
                difference: calculateDifference(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                ),
                show: !isEmpty(
                  encounters?.encounters['790a93a8-bfb6-49ab-b98d-2e9b436f93a8'][
                    'c2dd2547-0c78-4a83-9d68-bc2fa352a21a'
                  ],
                ),
              },
              {
                id: '3',
                scale: t('DASS-21Anxiety', 'DASS-21 (Anxiety)'),
                baseline: getFirstCellValue(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                ),
                finalFollowUp: getLastCellValue(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                ),
                difference: calculateDifference(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                ),
                show: !isEmpty(
                  encounters?.encounters['790a93a8-bfb6-49ab-b98d-2e9b436f93a8'][
                    '77a0c0d5-c206-4f8d-a8d7-540197ff94c4'
                  ],
                ),
              },
              {
                id: '4',
                scale: t('DASS-21Stress', 'DASS-21 (Stress)'),
                baseline: getFirstCellValue(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'ade4addc-0a3a-4084-b333-c14961b1bf76',
                ),
                finalFollowUp: getLastCellValue(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'ade4addc-0a3a-4084-b333-c14961b1bf76',
                ),
                difference: calculateDifference(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'ade4addc-0a3a-4084-b333-c14961b1bf76',
                ),
                show: !isEmpty(
                  encounters?.encounters['790a93a8-bfb6-49ab-b98d-2e9b436f93a8'][
                    'ade4addc-0a3a-4084-b333-c14961b1bf76'
                  ],
                ),
              },
            ],
          },
          {
            tableData: {
              header: 'DASS_21_Scale',
              show: showTable('790a93a8-bfb6-49ab-b98d-2e9b436f93a8', [
                'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                'ade4addc-0a3a-4084-b333-c14961b1bf76',
              ]),
            },
            data: [
              {
                id: '39',
                scale: 'DASS-21',
                baselineDate: getDate(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                  'baseline',
                ),
                finalFollowUpDate: getDate(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                  'finalFollowUp',
                ),
                dateDifference: getDate(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                  'difference',
                ),
                measureOfImprovement: measureOfImprovementAndChange(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  [
                    'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                    '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                    'ade4addc-0a3a-4084-b333-c14961b1bf76',
                  ],
                  'difference',
                  'measureOfImprovement',
                ),
                clinicallySignificantChange: measureOfImprovementAndChange(
                  '790a93a8-bfb6-49ab-b98d-2e9b436f93a8',
                  [
                    'c2dd2547-0c78-4a83-9d68-bc2fa352a21a',
                    '77a0c0d5-c206-4f8d-a8d7-540197ff94c4',
                    'ade4addc-0a3a-4084-b333-c14961b1bf76',
                  ],
                  'difference',
                  'clinicallySignificantChange',
                ),
                textAfterValue: { text: ` ${t('days', 'days')}`, placement: ['dateDifference'] },
              },
            ],
          },
          {
            tableData: {
              label: t('CRIES-8', 'CRIES-8'),
              show: showTable('74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8', [
                '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93',
                '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d',
              ]),
            },
            data: [
              {
                id: '5',
                scale: t('CRIES-8Total', 'CRIES-8 (TOTAL)'),
                baseline: getFirstCellValue(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                baselineComplete: checkFormCompleteness(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                show: !isEmpty(
                  encounters?.encounters['74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8'][
                    '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6'
                  ],
                ),
              },
              {
                id: '6',
                scale: t('CRIES-8Intrusion', 'CRIES-8 (Intrusion)'),
                baseline: getFirstCellValue(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93',
                ),
                finalFollowUp: getLastCellValue(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93',
                ),
                difference: calculateDifference(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93',
                ),
                show: !isEmpty(
                  encounters?.encounters['74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8'][
                    'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93'
                  ],
                ),
              },
              {
                id: '7',
                scale: t('CRIES-8Avoidance', 'CRIES-8 (Avoidance)'),
                baseline: getFirstCellValue(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d',
                ),
                finalFollowUp: getLastCellValue(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d',
                ),
                difference: calculateDifference(
                  '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8',
                  '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d',
                ),
                show: !isEmpty(
                  encounters?.encounters['74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8'][
                    '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d'
                  ],
                ),
              },
            ],
          },
          {
            tableData: {
              label: t('CRIES-13', 'CRIES-13'),
              show: showTable('74c7c564-b6b6-4b2a-918e-421f45fe9aa8', [
                '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93',
                '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d',
                'e4e789b1-37bb-43e2-bb43-c0a7d5911945',
              ]),
            },
            data: [
              {
                id: '8',
                scale: t('CRIES-13Total', 'CRIES-13 (TOTAL)'),
                baseline: getFirstCellValue(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                baselineComplete: checkFormCompleteness(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                show: !isEmpty(
                  encounters?.encounters['74c7c564-b6b6-4b2a-918e-421f45fe9aa8'][
                    '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6'
                  ],
                ),
              },
              {
                id: '9',
                scale: t('CRIES-13Intrusion', 'CRIES-13 (Intrusion)'),
                baseline: getFirstCellValue(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93',
                ),
                finalFollowUp: getLastCellValue(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93',
                ),
                difference: calculateDifference(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93',
                ),
                show: !isEmpty(
                  encounters?.encounters['74c7c564-b6b6-4b2a-918e-421f45fe9aa8'][
                    'f4bf6cf6-9058-47b9-802b-9ecfaae2eb93'
                  ],
                ),
              },
              {
                id: '10',
                scale: t('CRIES-13Avoidance', 'CRIES-13 (Avoidance)'),
                baseline: getFirstCellValue(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d',
                ),
                finalFollowUp: getLastCellValue(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d',
                ),
                difference: calculateDifference(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d',
                ),
                show: !isEmpty(
                  encounters?.encounters['74c7c564-b6b6-4b2a-918e-421f45fe9aa8'][
                    '0894c256-8e1b-4bdd-baa1-a10fd47f7a4d'
                  ],
                ),
              },
              {
                id: '11',
                scale: t('CRIES-13Arousal', 'CRIES-13 (Arousal)'),
                baseline: getFirstCellValue(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  'e4e789b1-37bb-43e2-bb43-c0a7d5911945',
                ),
                finalFollowUp: getLastCellValue(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  'e4e789b1-37bb-43e2-bb43-c0a7d5911945',
                ),
                difference: calculateDifference(
                  '74c7c564-b6b6-4b2a-918e-421f45fe9aa8',
                  'e4e789b1-37bb-43e2-bb43-c0a7d5911945',
                ),
                show: !isEmpty(
                  encounters?.encounters['74c7c564-b6b6-4b2a-918e-421f45fe9aa8'][
                    'e4e789b1-37bb-43e2-bb43-c0a7d5911945'
                  ],
                ),
              },
            ],
          },
          {
            tableData: {
              label: t('IES-R', 'IES-R'),
              show: showTable('790a93a8-fff6-49af-f98d-2e9f436f93a8', ['cce3a2fb-7d15-4d13-b7f0-545a284ef036']),
            },
            data: [
              {
                id: '12',
                scale: t('IES-RTotal', 'IES-R (Total)'),
                baseline: getFirstCellValue(
                  '790a93a8-fff6-49af-f98d-2e9f436f93a8',
                  'cce3a2fb-7d15-4d13-b7f0-545a284ef036',
                ),
                baselineComplete: checkFormCompleteness(
                  '790a93a8-fff6-49af-f98d-2e9f436f93a8',
                  'cce3a2fb-7d15-4d13-b7f0-545a284ef036',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  '790a93a8-fff6-49af-f98d-2e9f436f93a8',
                  'cce3a2fb-7d15-4d13-b7f0-545a284ef036',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '790a93a8-fff6-49af-f98d-2e9f436f93a8',
                  'cce3a2fb-7d15-4d13-b7f0-545a284ef036',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  '790a93a8-fff6-49af-f98d-2e9f436f93a8',
                  'cce3a2fb-7d15-4d13-b7f0-545a284ef036',
                ),
                show: !isEmpty(
                  encounters?.encounters['790a93a8-fff6-49af-f98d-2e9f436f93a8'][
                    'cce3a2fb-7d15-4d13-b7f0-545a284ef036'
                  ],
                ),
              },
            ],
          },
        ],
      },
      {
        tab: 'levelOfFunctioning',
        tables: [
          {
            tableData: {
              label: 'WHODAS 2.0',
              show: showTable('6c39d93d-73c2-4388-whod-asf80508064b', ['93067c6e-3842-4044-b5ba-9f4d5e030b52']),
            },
            data: [
              {
                id: '13',
                scale: 'WHODAS 2.0 (Total)',
                baseline: getFirstCellValue(
                  '6c39d93d-73c2-4388-whod-asf80508064b',
                  '93067c6e-3842-4044-b5ba-9f4d5e030b52',
                ),
                baselineComplete: checkFormCompleteness(
                  '6c39d93d-73c2-4388-whod-asf80508064b',
                  '93067c6e-3842-4044-b5ba-9f4d5e030b52',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  '6c39d93d-73c2-4388-whod-asf80508064b',
                  '93067c6e-3842-4044-b5ba-9f4d5e030b52',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '6c39d93d-73c2-4388-whod-asf80508064b',
                  '93067c6e-3842-4044-b5ba-9f4d5e030b52',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  '6c39d93d-73c2-4388-whod-asf80508064b',
                  '93067c6e-3842-4044-b5ba-9f4d5e030b52',
                ),
                show: !isEmpty(
                  encounters?.encounters['6c39d93d-73c2-4388-whod-asf80508064b'][
                    '93067c6e-3842-4044-b5ba-9f4d5e030b52'
                  ],
                ),
              },
            ],
          },
          {
            tableData: {
              label: 'ProQOL',
              show: showTable('805f55bb-5f5c-475d-bd71-e9553d38bde9', [
                '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
                'e03ae430-0560-41bf-8db4-9a815bff84ac',
                '4e65fe4a-1270-46f8-bd14-2390d1d82124',
              ]),
            },
            data: [
              {
                id: '14',
                scale: 'ProQOL (Total)',
                baseline: calculateTotal(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  [
                    '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
                    'e03ae430-0560-41bf-8db4-9a815bff84ac',
                    '4e65fe4a-1270-46f8-bd14-2390d1d82124',
                  ],
                  'baseline',
                ),
                baselineComplete: checkFormCompleteness(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
                  'baseline',
                ),
                finalFollowUp: calculateTotal(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  [
                    '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
                    'e03ae430-0560-41bf-8db4-9a815bff84ac',
                    '4e65fe4a-1270-46f8-bd14-2390d1d82124',
                  ],
                  'finalFollowUp',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
                  'finalFollowUp',
                ),
                difference: calculateTotal(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  [
                    '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
                    'e03ae430-0560-41bf-8db4-9a815bff84ac',
                    '4e65fe4a-1270-46f8-bd14-2390d1d82124',
                  ],
                  'difference',
                ),
              },
              {
                id: '15',
                scale: 'ProQOL (Compassion)',
                baseline: getFirstCellValue(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
                ),
                finalFollowUp: getLastCellValue(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
                ),
                difference: calculateDifference(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  '15f51ad0-c0fd-419e-89d8-2077eb867ed7',
                ),
                show: !isEmpty(
                  encounters?.encounters['805f55bb-5f5c-475d-bd71-e9553d38bde9'][
                    '15f51ad0-c0fd-419e-89d8-2077eb867ed7'
                  ],
                ),
              },
              {
                id: '16',
                scale: 'ProQOL (Burn-out)',
                baseline: getFirstCellValue(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  'e03ae430-0560-41bf-8db4-9a815bff84ac',
                ),
                finalFollowUp: getLastCellValue(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  'e03ae430-0560-41bf-8db4-9a815bff84ac',
                ),
                difference: calculateDifference(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  'e03ae430-0560-41bf-8db4-9a815bff84ac',
                ),
                show: !isEmpty(
                  encounters?.encounters['805f55bb-5f5c-475d-bd71-e9553d38bde9'][
                    'e03ae430-0560-41bf-8db4-9a815bff84ac'
                  ],
                ),
              },
              {
                id: '17',
                scale: 'ProQOL (Trauma/Compassion Fatigue)',
                baseline: getFirstCellValue(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  '4e65fe4a-1270-46f8-bd14-2390d1d82124',
                ),
                finalFollowUp: getLastCellValue(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  '4e65fe4a-1270-46f8-bd14-2390d1d82124',
                ),
                difference: calculateDifference(
                  '805f55bb-5f5c-475d-bd71-e9553d38bde9',
                  '4e65fe4a-1270-46f8-bd14-2390d1d82124',
                ),
                show: !isEmpty(
                  encounters?.encounters['805f55bb-5f5c-475d-bd71-e9553d38bde9'][
                    '4e65fe4a-1270-46f8-bd14-2390d1d82124'
                  ],
                ),
              },
            ],
          },
          {
            tableData: {
              label: 'SRQ-20',
              show: showTable('74c7c064-a5a5-4b2a-918e-421f45fc9aa8', ['8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6']),
            },
            data: [
              {
                id: '18',
                scale: 'SRQ-20 (Total)',
                baseline: getFirstCellValue(
                  '74c7c064-a5a5-4b2a-918e-421f45fc9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                baselineComplete: checkFormCompleteness(
                  '74c7c064-a5a5-4b2a-918e-421f45fc9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  '74c7c064-a5a5-4b2a-918e-421f45fc9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '74c7c064-a5a5-4b2a-918e-421f45fc9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  '74c7c064-a5a5-4b2a-918e-421f45fc9aa8',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                show: !isEmpty(
                  encounters?.encounters['74c7c064-a5a5-4b2a-918e-421f45fc9aa8'][
                    '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6'
                  ],
                ),
              },
            ],
          },
          {
            tableData: {
              label: t('functionalityScaleAfrica', 'Functionality Scale - Africa'),
              show: showTable('6d9df509-a22f-48aa-8a94-fc72ded71acc', [
                'ff2f61cb-ce60-4ead-b3cc-e70727ced888',
                '912d15ba-7f8b-4598-8438-2efb92d63f91',
                'a102e695-c308-4a38-ab73-93c5c4d7bc2d',
              ]),
            },
            data: [
              {
                id: '19',
                scale: t('functionalityScaleChild', 'Functionality Scale (Child)'),
                baseline: getFirstCellValue(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'ff2f61cb-ce60-4ead-b3cc-e70727ced888',
                ),
                baselineComplete: checkFormCompleteness(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'ff2f61cb-ce60-4ead-b3cc-e70727ced888',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'ff2f61cb-ce60-4ead-b3cc-e70727ced888',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'ff2f61cb-ce60-4ead-b3cc-e70727ced888',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'ff2f61cb-ce60-4ead-b3cc-e70727ced888',
                ),
                show: !isEmpty(
                  encounters?.encounters['6d9df509-a22f-48aa-8a94-fc72ded71acc'][
                    'ff2f61cb-ce60-4ead-b3cc-e70727ced888'
                  ],
                ),
              },
              {
                id: '20',
                scale: t('functionalityScaleMan', 'Functionality Scale (Man)'),
                baseline: getFirstCellValue(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  '912d15ba-7f8b-4598-8438-2efb92d63f91',
                ),
                baselineComplete: checkFormCompleteness(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  '912d15ba-7f8b-4598-8438-2efb92d63f91',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  '912d15ba-7f8b-4598-8438-2efb92d63f91',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  '912d15ba-7f8b-4598-8438-2efb92d63f91',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  '912d15ba-7f8b-4598-8438-2efb92d63f91',
                ),
                show: !isEmpty(
                  encounters?.encounters['6d9df509-a22f-48aa-8a94-fc72ded71acc'][
                    '912d15ba-7f8b-4598-8438-2efb92d63f91'
                  ],
                ),
              },
              {
                id: '21',
                scale: t('functionalityScaleWoman', 'Functionality Scale (Woman)'),
                baseline: getFirstCellValue(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'a102e695-c308-4a38-ab73-93c5c4d7bc2d',
                ),
                baselineComplete: checkFormCompleteness(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'a102e695-c308-4a38-ab73-93c5c4d7bc2d',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'a102e695-c308-4a38-ab73-93c5c4d7bc2d',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'a102e695-c308-4a38-ab73-93c5c4d7bc2d',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  '6d9df509-a22f-48aa-8a94-fc72ded71acc',
                  'a102e695-c308-4a38-ab73-93c5c4d7bc2d',
                ),
                show: !isEmpty(
                  encounters?.encounters['6d9df509-a22f-48aa-8a94-fc72ded71acc'][
                    'a102e695-c308-4a38-ab73-93c5c4d7bc2d'
                  ],
                ),
              },
            ],
          },
          {
            tableData: {
              label: t('functionalityScaleAsia', 'Functionality Scale - Asia'),
              show: showTable('c877fdd2-6011-42e6-9474-bf4a9b8e2aba', ['8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6']),
            },
            data: [
              {
                id: '22',
                scale: t('functionalityScaleAsiaTotal', 'Functionality Scale - Asia (Total)'),
                baseline: getFirstCellValue(
                  'c877fdd2-6011-42e6-9474-bf4a9b8e2aba',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                baselineComplete: checkFormCompleteness(
                  'c877fdd2-6011-42e6-9474-bf4a9b8e2aba',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  'c877fdd2-6011-42e6-9474-bf4a9b8e2aba',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  'c877fdd2-6011-42e6-9474-bf4a9b8e2aba',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  'c877fdd2-6011-42e6-9474-bf4a9b8e2aba',
                  '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6',
                ),
                show: !isEmpty(
                  encounters?.encounters['c877fdd2-6011-42e6-9474-bf4a9b8e2aba'][
                    '8b7044b2-ced4-4ba5-a9b1-b7f4994fcec6'
                  ],
                ),
              },
            ],
          },
        ],
      },
      {
        tab: 'levelOfCoping',
        tables: [
          {
            tableData: {
              label: t('briefCOPE', 'Brief COPE'),
              show: showTable('83458695-3b06-4d59-9508-d217aa21ea26', [
                'bcf2b896-2e4d-4068-9787-5aef32bb9df4',
                '052d708e-2aca-4cb2-9305-e140177729e2',
                '65fc0a51-dc89-46fa-9955-7ca4b7a17002',
                'dc44bdf0-b2e6-46f7-84a6-1f5cd0e8fe9c',
                '534107ae-c632-441a-90f7-152cc465272e',
                '673eebb2-4e62-4600-9361-616e81cf479d',
                '3fe79807-3c83-4d1e-a93a-4db29f6989a3',
                '825f7642-d421-4693-8672-7061420184c8',
                '32b21959-2f14-4494-89b1-8697aca5b855',
                'f9ace37c-b680-4415-bc53-57afc32b152e',
                '13f85903-7653-4eeb-810d-9457160dead9',
                '125edf7d-6e25-44d7-ae0a-7ee7c7448e0e',
                '5ee97eeb-8486-4b13-ba23-1eb29fdf573c',
                '30c3c80f-eae6-40f0-aff5-eacda1286e55',
                '0b36102c-1247-4f71-920d-cba606d5e022',
              ]),
            },
            data: [
              {
                id: '23',
                scale: t('briefCOPETotal', 'Brief COPE (Total)'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'bcf2b896-2e4d-4068-9787-5aef32bb9df4',
                ),
                baselineComplete: checkFormCompleteness(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'bcf2b896-2e4d-4068-9787-5aef32bb9df4',
                  'baseline',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'bcf2b896-2e4d-4068-9787-5aef32bb9df4',
                ),
                finalFollowUpComplete: checkFormCompleteness(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'bcf2b896-2e4d-4068-9787-5aef32bb9df4',
                  'finalFollowUp',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'bcf2b896-2e4d-4068-9787-5aef32bb9df4',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    'bcf2b896-2e4d-4068-9787-5aef32bb9df4'
                  ],
                ),
              },
              {
                id: '24',
                scale: t('selfDistraction', 'Self-distraction'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '052d708e-2aca-4cb2-9305-e140177729e2',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '052d708e-2aca-4cb2-9305-e140177729e2',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '052d708e-2aca-4cb2-9305-e140177729e2',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '052d708e-2aca-4cb2-9305-e140177729e2'
                  ],
                ),
              },
              {
                id: '25',
                scale: t('activeCoping', 'Active Coping'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '65fc0a51-dc89-46fa-9955-7ca4b7a17002',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '65fc0a51-dc89-46fa-9955-7ca4b7a17002',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '65fc0a51-dc89-46fa-9955-7ca4b7a17002',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '65fc0a51-dc89-46fa-9955-7ca4b7a17002'
                  ],
                ),
              },
              {
                id: '26',
                scale: t('denial', 'Denial'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'dc44bdf0-b2e6-46f7-84a6-1f5cd0e8fe9c',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'dc44bdf0-b2e6-46f7-84a6-1f5cd0e8fe9c',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'dc44bdf0-b2e6-46f7-84a6-1f5cd0e8fe9c',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    'dc44bdf0-b2e6-46f7-84a6-1f5cd0e8fe9c'
                  ],
                ),
              },
              {
                id: '27',
                scale: t('substanceUse', 'Substance use'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '534107ae-c632-441a-90f7-152cc465272e',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '534107ae-c632-441a-90f7-152cc465272e',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '534107ae-c632-441a-90f7-152cc465272e',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '534107ae-c632-441a-90f7-152cc465272e'
                  ],
                ),
              },
              {
                id: '28',
                scale: t('useOfEmotionalSupport', 'Use of emotional support'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '673eebb2-4e62-4600-9361-616e81cf479d',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '673eebb2-4e62-4600-9361-616e81cf479d',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '673eebb2-4e62-4600-9361-616e81cf479d',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '673eebb2-4e62-4600-9361-616e81cf479d'
                  ],
                ),
              },
              {
                id: '29',
                scale: t('useOfInstrumentSupport', 'Use of instrument support'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '3fe79807-3c83-4d1e-a93a-4db29f6989a3',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '3fe79807-3c83-4d1e-a93a-4db29f6989a3',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '3fe79807-3c83-4d1e-a93a-4db29f6989a3',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '3fe79807-3c83-4d1e-a93a-4db29f6989a3'
                  ],
                ),
              },
              {
                id: '30',
                scale: t('behavioralDisengagement', 'Behavioral disengagement'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '825f7642-d421-4693-8672-7061420184c8',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '825f7642-d421-4693-8672-7061420184c8',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '825f7642-d421-4693-8672-7061420184c8',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '825f7642-d421-4693-8672-7061420184c8'
                  ],
                ),
              },
              {
                id: '31',
                scale: t('venting', 'Venting'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '32b21959-2f14-4494-89b1-8697aca5b855',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '32b21959-2f14-4494-89b1-8697aca5b855',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '32b21959-2f14-4494-89b1-8697aca5b855',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '32b21959-2f14-4494-89b1-8697aca5b855'
                  ],
                ),
              },
              {
                id: '32',
                scale: t('positiveReframing', 'Positive reframing'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'f9ace37c-b680-4415-bc53-57afc32b152e',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'f9ace37c-b680-4415-bc53-57afc32b152e',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  'f9ace37c-b680-4415-bc53-57afc32b152e',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    'f9ace37c-b680-4415-bc53-57afc32b152e'
                  ],
                ),
              },
              {
                id: '33',
                scale: t('planning', 'Planning'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '13f85903-7653-4eeb-810d-9457160dead9',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '13f85903-7653-4eeb-810d-9457160dead9',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '13f85903-7653-4eeb-810d-9457160dead9',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '13f85903-7653-4eeb-810d-9457160dead9'
                  ],
                ),
              },
              {
                id: '34',
                scale: t('humor', 'Humor'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '125edf7d-6e25-44d7-ae0a-7ee7c7448e0e',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '125edf7d-6e25-44d7-ae0a-7ee7c7448e0e',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '125edf7d-6e25-44d7-ae0a-7ee7c7448e0e',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '125edf7d-6e25-44d7-ae0a-7ee7c7448e0e'
                  ],
                ),
              },
              {
                id: '35',
                scale: t('acceptance', 'Acceptance'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '5ee97eeb-8486-4b13-ba23-1eb29fdf573c',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '5ee97eeb-8486-4b13-ba23-1eb29fdf573c',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '5ee97eeb-8486-4b13-ba23-1eb29fdf573c',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '5ee97eeb-8486-4b13-ba23-1eb29fdf573c'
                  ],
                ),
              },
              {
                id: '36',
                scale: t('religion', 'Religion'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '30c3c80f-eae6-40f0-aff5-eacda1286e55',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '30c3c80f-eae6-40f0-aff5-eacda1286e55',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '30c3c80f-eae6-40f0-aff5-eacda1286e55',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '30c3c80f-eae6-40f0-aff5-eacda1286e55'
                  ],
                ),
              },
              {
                id: '37',
                scale: t('selfBlame', 'Self-blame'),
                baseline: getFirstCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '0b36102c-1247-4f71-920d-cba606d5e022',
                ),
                finalFollowUp: getLastCellValue(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '0b36102c-1247-4f71-920d-cba606d5e022',
                ),
                difference: calculateDifference(
                  '83458695-3b06-4d59-9508-d217aa21ea26',
                  '0b36102c-1247-4f71-920d-cba606d5e022',
                ),
                show: !isEmpty(
                  encounters?.encounters['83458695-3b06-4d59-9508-d217aa21ea26'][
                    '0b36102c-1247-4f71-920d-cba606d5e022'
                  ],
                ),
              },
            ],
          },
        ],
      },
    ];
  }, [closureFormDateTimes.closureForms, encounters, t]);

  const config: VisitResultsConfigObject = {
    title: t('visitResultTable', 'Visit Result Table'),
    headers: [
      { key: 'scale', header: t('scale', 'Scale') },
      { key: 'baseline', header: t('baseline', 'Baseline') },
      {
        key: 'finalFollowUp',
        header: t('finalFollowUp', 'Final Follow-up'),
      },
      {
        key: 'difference',
        header: t('difference', 'Difference'),
      },
    ],
    sessionsHeaders: [
      { key: 'individual', header: t('individualSessions', 'Individual Sessions') },
      { key: 'group', header: t('groupSessions', 'Group Sessions') },
      {
        key: 'family',
        header: t('familySessions', 'Family Sessions'),
      },
      {
        key: 'total',
        header: t('totalSessions', 'Sessions'),
      },
    ],
    DASS_21_Scale: [
      { key: 'scale', header: t('scale', 'Scale') },
      { key: 'baselineDate', header: t('baselineDate', 'Baseline Date') },
      {
        key: 'finalFollowUpDate',
        header: t('finalFollowUpDate', 'Final Follow-up Date'),
      },
      {
        key: 'dateDifference',
        header: t('dateDifference', 'Date Diff'),
      },
      {
        key: 'measureOfImprovement',
        header: t('measureOfImprovement', 'Measure Of Improvement'),
      },
      {
        key: 'clinicallySignificantChange',
        header: t('clinicallySignificantChange', 'Clinically Significant Change'),
      },
    ],
  };

  return (
    <>
      <Form className={styles.form}>
        <Tabs className={styles.tabs}>
          <TabList className={styles.tabsList}>
            <Tab id="visit-result-tab level-distress-tab" className={styles.visitResultTab}>
              {t('levelOfDistress', 'Level of Distress')}
            </Tab>
            <Tab id="visit-result-tab level-functioning-tab" className={styles.visitResultTab}>
              {t('levelOfFunctioning', 'Level Of Functioning')}
            </Tab>
            <Tab id="visit-result-tab level-coping-tab" className={styles.visitResultTab}>
              {t('levelOfCoping', 'Level Of Coping')}
            </Tab>
          </TabList>
          <TabPanels>
            {tabs.map((item: any, index: number) => (
              <>
                {item.tab === 'levelOfDistress' ? (
                  <TabPanel>
                    <TableContent item={item} config={config}></TableContent>
                  </TabPanel>
                ) : item.tab === 'levelOfFunctioning' ? (
                  <TabPanel>
                    <TableContent item={item} config={config}></TableContent>
                  </TabPanel>
                ) : item.tab === 'levelOfCoping' ? (
                  <TabPanel>
                    <TableContent item={item} config={config}></TableContent>
                  </TabPanel>
                ) : null}
              </>
            ))}
          </TabPanels>
        </Tabs>
      </Form>
    </>
  );
};

export default VisitResultsForm;
