const PREFIXES = `
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX lblodgeneriek: <https://data.lblod.info/vocabularies/generiek/>
  PREFIX org: <http://www.w3.org/ns/org#>
  PREFIX code: <http://lblod.data.gift/vocabularies/organisatie/>
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX generiek: <https://data.vlaanderen.be/ns/generiek#>
  PREFIX ere: <http://data.lblod.info/vocabularies/erediensten/>
  PREFIX organisatie: <https://data.vlaanderen.be/ns/organisatie#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
`;

const APPLICATION_GRAPH = process.env.MU_APPLICATION_GRAPH;


export {
  PREFIXES,
  APPLICATION_GRAPH
};

