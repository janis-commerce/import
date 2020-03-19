'use strict';

const mockRequire = require('mock-require');
const path = require('path');
const fs = require('fs');
const { ServerlessHandler } = require('@janiscommerce/event-listener');
const EventListenerTest = require('@janiscommerce/event-listener-test');
const s3Wrapper = require('@janiscommerce/s3'); // REEMPLAZAR CUANDO SE PUBLIQUE STREAM
const { CreatedListener, Controller, ModelImport } = require('../lib/index');

const handler = (...args) => ServerlessHandler.handle(CreatedListener, ...args);

class FakeModel {}
const fakeModelPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', 'some-entity');

const fakeControllerPath = path.join(process.cwd(), process.env.MS_PATH || '', 'controllers', 'import', 'some-entity');

const modelImportPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', 'import');

const importData = {
	entity: 'some-entity',
	fileName: 'a-file-source',
	originalName: 'warehouses.csv',
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

const warehouses = [
	{
		name: 'warehouse-1',
		referenceId: 'warehouse-1-ref-id',
		index: '5e0a0619bcc3ce0007a18011',
		status: 'active'
	},
	{
		name: 'warehouse-2',
		referenceId: 'warehouse-2-ref-id',
		index: '5e0a0619bcc3ce0007a18012',
		status: 'active'
	},
	{
		name: 'warehouse-3',
		referenceId: 'warehouse-3-ref-id',
		index: '5e0a0619bcc3ce0007a18013',
		status: 'inactive'
	}
];

const generalBefore = () => {
	mockRequire(modelImportPath, ModelImport);
	mockRequire(fakeModelPath, FakeModel);
	mockRequire(fakeControllerPath, Controller);
};

const generalAfter = () => {
	mockRequire.stop(modelImportPath);
	mockRequire.stop(fakeModelPath);
	mockRequire.stop(fakeControllerPath);
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
				description: 'should return 200',
				session: true,
				before: sandbox => {
					generalBefore();
					sandbox.stub(ModelImport.prototype, 'getById').returns(importData);
					process.env.BUCKET = 'some-bucket-beta';
					const testStream = fs.createReadStream(path.join(__dirname, '/warehouses.csv'));
					sandbox.stub(s3Wrapper, 'getObject').returns({ createReadStream: () => testStream });
					sandbox.stub(Controller.prototype, 'save').returns(true);
				},
				event: importEvent,
				after: sandbox => {
					generalAfter();
					sandbox.assert.calledOnce(ModelImport.prototype.getById);
					sandbox.assert.calledWithExactly(ModelImport.prototype.getById, importId);
					sandbox.assert.calledOnce(s3Wrapper.getObject);
					sandbox.assert.calledWithExactly(s3Wrapper.getObject, {
						bucket: 'some-bucket-beta',
						key: importData.fileName
					});
					sandbox.assert.calledWithExactly(Controller.prototype.save, warehouses);
				},
				responseCode: 200
			}
		]);
	});
});
