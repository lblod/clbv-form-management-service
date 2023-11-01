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

export async function loadSiteTypes(siteId) {
  const adminUnitClassification = await getAdminUnitClassification(siteId);
  let filteredTypes = [];

    filteredTypes.push('f1381723dec42c0b6ba6492e41d6f5dd'); // Maatschappelijke zetel

    if (this.isWorshipAdministrativeUnit) {
      filteredTypes.push('dd0418307e7038c0c3809e3ec03a0932'); // Hoofdgebouw erediensten
    } else if (this.isMunicipality) {
      filteredTypes.push('57e8e5498ca84056b8a87631a26c90af'); // Gemeentehuis
      filteredTypes.push('fbec5e94aba343b0a7361aca8a0c7d79'); // Ander administratief adres
    } else if (this.isAgb || this.isApb || this.isIGS) {
      filteredTypes.push('dcc01338-842c-4fbd-ba68-3ca6f3af975c'); // CorrespondentieAddres
    } else if (this.isProvince) {
      filteredTypes.push('15f2683c61b74541b27b64b4365806c7'); // Provinciehuis
    } else if (this.isDistrict) {
      filteredTypes.push('db13a289b78e42d19d8d1d269b61b18f'); // Districtshuis
    }
}