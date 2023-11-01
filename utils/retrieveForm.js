import fs from 'fs';
import fse from 'fs-extra';
import { bindingsToNT } from '../utils/bindingsToNT';
import { siteUriForId, loadSite, loadAddress, loadContacts, loadSiteTypes } from './commonQueries';

export async function retrieveForm(adminUnitId, siteId, formId) {
  let form = fs.readFileSync(`/config/${formId}/form.ttl`, 'utf8');
  const metaFile = fse.readJsonSync(`/config/${formId}/form.json`);
  const results = [];
  let siteUri = await siteUriForId(siteId);
  if(siteUri) {
    results.push(await loadSite(siteUri));
    results.push(await loadAddress(siteUri));
    results.push(await loadContacts(siteUri));
  }
  const sourceBindings = results
        .reduce((acc, b) => [...acc, ...b]);

  const source = bindingsToNT(sourceBindings).join("\r\n");

  const metaTriples = [];
  metaTriples.push(await loadSiteTypes(adminUnitId));
  
  const meta = metaTriples
    .reduce((acc, b) => [...acc, ...b]);

  return { form, source, meta, siteId };
}