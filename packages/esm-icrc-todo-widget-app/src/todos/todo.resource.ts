import { useMemo } from 'react';
import useSWR from 'swr';

import { openmrsFetch } from '@openmrs/esm-framework';
import { Todo } from '../types';
import { getTodo } from '../helpers';

const PRINT_CONSENT_FORM_URL = '/openmrs/htmlformentryui/htmlform/enterHtmlFormWithStandardUi.page?';
const CLINICAL_CONSENT_FORM_URL = 'icrc:htmlforms/transversal/addClinicalConsent.xml';

const getAttributeByName = (todo, attributeTypeValue) => {
  return todo.attributes.find((attribute) => attribute.attributeType == attributeTypeValue);
};

export const getTodoVisitID = (todo) => {
  const visitAttribute = getAttributeByName(todo, 'VisitID');
  return visitAttribute ? visitAttribute.value : '';
};

export const fetchClinicalConsentURL = (patientUUId, visitUUId) =>
  `${PRINT_CONSENT_FORM_URL}patientId=${patientUUId}&visitId=${
    visitUUId ? visitUUId : ''
  }&definitionUiResource=${CLINICAL_CONSENT_FORM_URL}`;

export function useTodos() {
  const apiUrl = `/ws/rest/v1/assignedaction`;
  const { data, error, isValidating, mutate } = useSWR<{ data: Array<Todo> }, Error>(apiUrl, openmrsFetch);

  const todoData = data?.data?.map((todo) => getTodo(todo));

  const results = useMemo(
    () => ({
      todos: todoData?.length ? todoData : [],
      isLoading: !data && !error,
      isError: error,
      isValidating,
      mutate,
    }),
    [data, error, isValidating, mutate, todoData],
  );
  return results;
}

const markAsDoneUrl = (todoUuid: string) => `/ws/rest/v1/assignedaction/${todoUuid}/complete`;

export const markTodoAsDone = (todoUuid) => {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return openmrsFetch(markAsDoneUrl(todoUuid), options);
};

const markAsAcceptedUrl = (todoUuid: string) => `/ws/rest/v1/assignedaction/${todoUuid}/accept`;

export const markTodoAsAccepted = (todoUuid) => {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return openmrsFetch(markAsAcceptedUrl(todoUuid), options);
};
