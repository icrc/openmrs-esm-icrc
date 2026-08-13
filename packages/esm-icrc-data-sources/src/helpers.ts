export const toSentenceCase = (str) =>
  str.toLowerCase().replace(/(^|\.\s+|\!\s+|\?\s+)(\w)/g, (match) => match.toUpperCase());

export function conceptMapper(concept) {
  return (
    concept && {
      value: concept.uuid,
      label: toSentenceCase(concept.name.display),
    }
  );
}
