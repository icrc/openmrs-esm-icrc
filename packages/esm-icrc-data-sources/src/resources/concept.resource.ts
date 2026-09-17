import { openmrsFetch } from '@openmrs/esm-framework';

const _v = 'custom:(uuid,name,conceptClass,setMembers)';

export function searchConcept(searchText: string, conceptClass: string = '', v: string = _v): Promise<any> {
  return openmrsFetch(
    `/ws/rest/v1/concept?name=${searchText}&class=${conceptClass}&searchType=fuzzy${v ? '&v=' + v : ''}`,
  )
    .then((response) => response.data.results)
    .catch((error) => {
      console.error('Error fetching concept:', error);
      throw error;
    });
}

export function getConceptByUuid(uuid: string, v: string = _v): Promise<any> {
  return openmrsFetch(`/ws/rest/v1/concept/${uuid}${v ? '?v=' + v : ''}`)
    .then((response) => response)
    .catch((error) => {
      console.error('Error fetching concept:', error);
      throw error;
    });
}
