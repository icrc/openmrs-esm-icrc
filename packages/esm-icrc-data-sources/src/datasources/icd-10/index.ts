import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getConceptByUuid, searchConcept } from '../../resources';
import { conceptMapper } from '../../helpers';

const DIAGNOSIS_CONCEPT_CLASS = '8d4918b0-c2cc-11de-8d13-0010c6dffd0f';
const IC10_MAPPING_PATTERN = 'icd-10-who';

function resolveConcept(uuid: string) {
  return from(getConceptByUuid(uuid)).pipe(map((data: any) => conceptMapper(data.data)));
}

export function findDiagnoses(searchText: string): Observable<any[]> {
  return searchText
    ? from(
        searchConcept(
          searchText,
          DIAGNOSIS_CONCEPT_CLASS,
          'custom:(uuid,name:(name,display),conceptClass:(uuid,display),mappings:(display),setMembers)',
        ),
      ).pipe(
        map((results: any[]) =>
          results
            .filter((concept: any) =>
              concept.mappings?.some((m: any) => m.display.toLowerCase().includes(IC10_MAPPING_PATTERN)),
            )
            .map(conceptMapper),
        ),
      )
    : of([]);
}

// ICD-10 Datasource object
export const icd10diagnosisDataSource = {
  resolveSelectedValue: resolveConcept.bind(this),
  searchOptions: findDiagnoses.bind(this),
};

export default icd10diagnosisDataSource;
