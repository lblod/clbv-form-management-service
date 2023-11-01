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

      SELECT DISTINCT ?site
      WHERE {
        BIND( ${sparqlEscapeString(siteId)} as ?uuid)
        ?site a org:Site;
          mu:uuid ?uuid.
      }
      LIMIT 1
    `)).results.bindings[0]?.site?.value;

}

export async function loadSiteTypes(siteId) {
  const adminUnitClassification = await getAdminUnitClassification(siteId);
  let filteredTypes = [];

  filteredTypes.push('"f1381723dec42c0b6ba6492e41d6f5dd"'); // Maatschappelijke zetel

  if (isWorshipAdministrativeUnit(adminUnitClassification)) {
    filteredTypes.push('"dd0418307e7038c0c3809e3ec03a0932"'); // Hoofdgebouw erediensten
  } else if (isMunicipality(adminUnitClassification)) {
    filteredTypes.push('"57e8e5498ca84056b8a87631a26c90af"'); // Gemeentehuis
    filteredTypes.push('"fbec5e94aba343b0a7361aca8a0c7d79"'); // Ander administratief adres
  } else if (isAgbApbOrIGS(adminUnitClassification)) {
    filteredTypes.push('"dcc01338-842c-4fbd-ba68-3ca6f3af975c"'); // CorrespondentieAddres
  } else if (isProvince(adminUnitClassification)) {
    filteredTypes.push('"15f2683c61b74541b27b64b4365806c7"'); // Provinciehuis
  } else if (isDistrict(adminUnitClassification)) {
    filteredTypes.push('"db13a289b78e42d19d8d1d269b61b18f"'); // Districtshuis
  }

  const types = queryDatabaseTypes(filteredTypes);
  const metaTriples = generateMetaTriplesForSiteTypes(types);
  return metaTriples;
}

async function getAdminUnitClassification(siteId) {
  return (await querySudo(`
    ${PREFIXES}

    SELECT DISTINCT ?classificationUuid
    WHERE {
      ?adminUnit org:hasSite ?site.
      ?adminUnit org:classification ?classification.
      ?classification mu:uuid ?classificationUuid.
      ?site mu:uuid "${siteId}".
    }
    LIMIT 1
  `)).results.bindings[0]?.classificationUuid?.value;
}

function isWorshipAdministrativeUnit(classification) {
  return classification === '66ec74fd-8cfc-4e16-99c6-350b35012e86' || classification === 'f9cac08a-13c1-49da-9bcb-f650b0604054';
}

function isMunicipality(classification) {
  return classification === '5ab0e9b8a3b2ca7c5e000001';
}

function isAgbApbOrIGS(classification) {
  return classification === '36a82ba0-7ff1-4697-a9dd-2e94df73b721' || 
    classification === '80310756-ce0a-4a1b-9b8e-7c01b6cc7a2d' || 
    classification === 'b156b67f-c5f4-4584-9b30-4c090be02fdc' ||
    classification === 'd01bb1f6-2439-4e33-9c25-1fc295de2e71' ||
    classification === 'cd93f147-3ece-4308-acab-5c5ada3ec63d' ||
    classification === '4b8450cf-a326-4c66-9e63-b4ec10acc7f6';
}

function isProvince(classification) {
  return classification === '5ab0e9b8a3b2ca7c5e000000';
}

function isDistrict(classification) {
  return classification === '5ab0e9b8a3b2ca7c5e000003'
}

async function queryDatabaseTypes(siteTypesIds) {
  return (await querySudo(`
    ${PREFIXES}

    SELECT DISTINCT ?uri ?label
    WHERE {
      ?uri mu:uuid ?uuid.
      ?uri skos:prefLabel ?label.
      VALUES ?uuid {
        ${siteTypesIds.join(' ')}
      }
    }
    LIMIT 1
  `)).results.bindings.map((binding) => ({uri: binding.uri.value, label: binding.label.value}));
}

function generateMetaTriplesForSiteTypes(siteTypes) {
  return `
    <http://clbv-form-management-service/concept-schemes/sitetypes>
      a <http://www.w3.org/2004/02/skos/core#ConceptScheme>;
      <http://www.w3.org/2004/02/skos/core#prefLabel> "Metasyntactic variables"@en.
    
    ${siteTypes.map((type, index) => `
      ${type.uri} a skos:Concept, rdf:Class;
        skos:inScheme <http://clbv-form-management-service/concept-schemes/sitetypes>;
        skos:prefLabel "${type.label}"@en;
        order: ${index}.
    `)}
  `;
}