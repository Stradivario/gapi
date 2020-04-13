import { DOCUMENTS } from '../../daemon-server/api-introspection/documents';
import { DocumentTypes } from '../../daemon-server/api-introspection/documentTypes';

export function importQuery(search: DocumentTypes) {
  let result;
  Object.keys(DOCUMENTS).filter(doc => {
    if (doc.indexOf(search) !== -1) {
      result = DOCUMENTS[doc];
    }
  });
  if (!result) {
    throw new Error(`Missing query: ${search}`);
  }
  return result;
}
