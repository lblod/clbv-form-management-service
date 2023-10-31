import { querySudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeString, sparqlEscapeUri } from 'mu';
import { PREFIXES } from '../config';
export async function loadSite(siteUri) {
  const queryResult = await querySudo(`
    ${PREFIXES}
    SELECT DISTINCT *
    WHERE {
      BIND(${sparqlEscapeUri(siteUri)} as ?s)
      ?s ?p ?o.
    }
  `)
  return queryResult.results.bindings;
}

export async function loadContacts(siteUri) {
  const queryResult = await querySudo(`
    ${PREFIXES}
    SELECT DISTINCT *
    WHERE {
      BIND(${sparqlEscapeUri(siteUri)} as ?site)
      ?site org:siteAddress ?s.
      ?s ?p ?o.
    }
  `)
  return queryResult.results.bindings;
}

export async function loadAddress(siteUri) {
  const queryResult = await querySudo(`
    ${PREFIXES}
    SELECT DISTINCT *
    WHERE {
      BIND(${sparqlEscapeUri(siteUri)} as ?site)
      ?site organisatie:bestaatUit ?s.
      ?s ?p ?o.
    }
  `)
  return queryResult.results.bindings;
}

export async function siteUriForId(siteId) {
  return (await querySudo(`
      ${PREFIXES}

      SELECT DISTINCT ?service
      WHERE {
        BIND( ${sparqlEscapeString(siteId)} as ?uuid)
        ?service a org:Site;
          mu:uuid ?uuid.
      }
      LIMIT 1
    `)).results.bindings[0]?.service?.value;

}