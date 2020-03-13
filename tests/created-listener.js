'use strict';

const mockRequire = require('mock-require');
const path = require('path');
const { ServerlessHandler } = require('@janiscommerce/event-listener');
const EventListenerTest = require('@janiscommerce/event-listener-test');
const ImportGetObject = require('../lib/helpers/import-get-object');

const { CreatedListener, ModelImport } = require('../lib/index');

const handler = (...args) => ServerlessHandler.handle(CreatedListener, ...args);

class FakeController {}
const fakeControllerPath = path.join(process.cwd(), process.env.MS_PATH || '', 'controllers', 'import', 'some-entity');

const modelImportPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', 'import');

const importData = {
	entity: 'some-entity',
	fileName: 'a-file-source',
	originalName: 'a-file-source.xlsx',
	status: ModelImport.statuses.active
};

const importId = '5e0a0619bcc3ce0007a18011';

const importEvent = {
	service: 'sth',
	entity: 'import',
	event: 'created',
	id: importId,
	client: 'defaultClient'
};


describe('Created Import Listener', async () => {

	context('When validating event', async () => {

		await EventListenerTest(handler, [

			{
				description: 'should return 400 when the event has no client',
				session: true,
				event: { ...importEvent, client: undefined },
				responseCode: 400
			}, {
				description: 'should return 400 when the event has no id',
				session: true,
				event: { ...importEvent, id: undefined },
				responseCode: 400
			}, {
				description: 'should return 400 when the event has no id',
				session: true,
				before: sandbox => {
					mockRequire(modelImportPath, ModelImport);
					mockRequire(fakeControllerPath, FakeController);
					sandbox.stub(ModelImport.prototype, 'getById').returns(importData);
					process.env.BUCKET = 'some-bucket-beta';
					sandbox.stub(ImportGetObject, 'call').returns(true);
				},
				event: importEvent,
				after: sandbox => {
					mockRequire.stop(modelImportPath);
					mockRequire.stop(fakeControllerPath);
					sandbox.assert.calledOnce(ModelImport.prototype.getById);
					sandbox.assert.calledWithExactly(ModelImport.prototype.getById, importId);
					sandbox.assert.calledOnce(ImportGetObject.call);
					sandbox.assert.calledWithExactly(ImportGetObject.call, {
						bucket: 'some-bucket-beta',
						key: importData.fileName
					});
				},
				responseCode: 200
			}
		]);
	});
});
