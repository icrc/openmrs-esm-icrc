import { parseDate, formatDatetime } from '@openmrs/esm-framework';

const getAttributeByName = (todo, attributeTypeValue) => {
  return todo.attributes.find((attribute) => attribute.attributeType == attributeTypeValue);
};

const getTodoDate = (todo) => {
  if (todo.type === 'PRINT_CONSENT') {
    return todo.dateCreated;
  }
  const appointmentAttribute = getAttributeByName(todo, 'Appointment');
  return appointmentAttribute ? appointmentAttribute.value.date : '';
};

const getServiceCategory = (todo) => {
  if (!todo.attributes || todo.attributes.length === 0) {
    return '';
  }
  const serviceCategoryAttributeName = todo.type === 'PRINT_CONSENT' ? 'Service Category' : 'Appointment';

  const serviceCategory = getAttributeByName(todo, serviceCategoryAttributeName);

  return serviceCategory ? serviceCategory.value : '';
};

const getServiceCategoryName = (todo) => {
  const serviceCategoryValue = getServiceCategory(todo);
  return serviceCategoryValue.service ? serviceCategoryValue.service.name : serviceCategoryValue.name;
};

export const getTodo = (todo) => {
  let formattedTodo = {
    id: todo.uuid,
    patientId: todo.patient.uuid,
    patientName: todo.patient.name,
    patientIdentifier: todo.patient?.identifier,
    dateTime: formatDatetime(parseDate(getTodoDate(todo)), { mode: 'standard', year: false }),
    serviceCategory: getServiceCategoryName(todo),
    type: todo.type,
    attributes: todo.attributes,
    completed: todo.completed,
  };
  return formattedTodo;
};
