import { app, errorHandler, uuid } from 'mu';
import { retrieveForm } from './utils/retrieveForm';
import { updateForm } from './utils/updateForm';

app.get('/semantic-forms/:adminUnitId/:siteId/form/:formId', async function(req, res) {
  const siteId = req.params["siteId"];
  const formId = req.params["formId"];
  const adminUnitId = req.params["adminUnitId"];

  try {
    const bundle = await retrieveForm(adminUnitId, siteId, formId);

    return res.status(200).json(bundle);
  } catch (e) {
    console.error(e);
    if (e.status) {
      return res.status(e.status).set('content-type', 'application/json').send(e);
    }
    const response = {
      status: 500,
      message: `Something unexpected went wrong while submitting semantic-form for "${uuid}".`
    };
    return res.status(response.status).set('content-type', 'application/json').send(response.message);
  }
});

app.put('/semantic-forms/:adminUnitId/:siteId/form/:formId', async function(req, res) {
  const delta = req.body;
  try {
    await updateForm(delta, req.headers['mu-session-id']);
    return res.sendStatus(200);
  } catch (e) {
    console.error(e);
    if (e.status) {
      return res.status(e.status).set('content-type', 'application/json').send(e);
    }
    const response = {
      status: 500,
      message: `Something unexpected went wrong while submitting semantic-form for "${uuid}".`
    };
    return res.status(response.status).set('content-type', 'application/json').send(response.message);
  }
});