'use strict';

const ApiTest = require('@janiscommerce/api-test');
const path = require('path');
const mockRequire = require('mock-require');
const EventEmitter = require('@janiscommerce/event-emitter');
const { ApiCreateImport, ModelImport } = require('../lib/index');


class FakeModel {}
const fakeModelPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', 'some-entity');

class FakeController {}
const fakeControllerPath = path.join(process.cwd(), process.env.MS_PATH || '', 'controllers', 'import', 'some-entity');

const modelImportPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', 'import');

const importData = { entity: 'some-entity', fileName: 'some-file-name.xls', fileSource: 'a-file-source' };

const session = true;

describe('API createImport', () => {

	context('When validating', () => {

		const response = { code: 400 };


		ApiTest(ApiCreateImport, '/api/import', [
			{
				description: 'Should return 400 if the required field \'entity\' is not passed',
				request: { data: { entity: undefined, ...importData } },
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'entity\' is not a string',
				request: {
					data: { entity: 123, fileName: 'some-file-name.xls', fileSource: 'a-file-source' }
				},
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'filename\' is not passed',
				request: { data: { fileName: undefined, ...importData } },
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a string',
				request: { data: { fileName: 123, ...importData } },
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a valid',
				request: { data: { fileName: 'some-file-name.pdf', ...importData } },
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'fileSource\' is not passed',
				request: {
					data: { fileSource: undefined, ...importData }
				},
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a string',
				request: {
					data: { fileSource: 123, ...importData }
				},
				session,
				response
			}, {
				description: 'Should return 400 if the entity controller is not found in the corresponding data path',
				before: () => {
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(modelImportPath, ModelImport);
				},
				after: () => {
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(modelImportPath);
				},
				request: {
					data: importData
				},
				session,
				response
			}, {
				description: 'Should return 400 if the entity model is not found in the corresponding data path',
				before: () => {
					mockRequire(fakeControllerPath, FakeController);
					mockRequire(modelImportPath, ModelImport);
				},
				after: () => {
					mockRequire.stop(fakeControllerPath);
					mockRequire.stop(modelImportPath);
				},
				request: {
					data: { entity: 'some-entity', fileName: 'some-file-name.xls', fileSource: 'a-file-source' }
				},
				session,
				response
			}, {
				description: 'Should return 400 if the entity import is not found in the corresponding data path',
				before: () => {
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(fakeControllerPath, FakeController);
				},
				after: () => {
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(fakeControllerPath);
				},
				request: {
					data: { entity: 'some-entity', fileName: 'some-file-name.xls', fileSource: 'a-file-source' }
				},
				session,
				response
			}]
		);
	});


	context('When processing ', () => {

		const before = () => {
			mockRequire(fakeModelPath, FakeModel);
			mockRequire(fakeControllerPath, FakeController);
			mockRequire(modelImportPath, ModelImport);
		};

		const after = () => {
			mockRequire.stop(fakeModelPath);
			mockRequire.stop(fakeControllerPath);
			mockRequire.stop(modelImportPath);
		};

		const importToSave = {
			entity: importData.entity,
			fileName: importData.fileSource,
			originalName: importData.fileName,
			status: ModelImport.statuses.active
		};

		const importToSaveId = '5e0a0619bcc3ce0007a18011';

		const eventToEmit = {
			entity: 'import',
			event: 'created',
			id: importToSaveId,
			client: 'defaultClient'
		};

		ApiTest(ApiCreateImport, '/api/import', [
			{
				description: 'Should return 500 if the entity import fails. Should not emit event',
				before: sandbox => {
					before();
					sandbox.stub(ModelImport.prototype, 'save').rejects(Error('DB ERROR'));
					sandbox.stub(EventEmitter, 'emit').returns(true);
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnce(ModelImport.prototype.save);
					sandbox.assert.calledWithExactly(ModelImport.prototype.save, importToSave);
					sandbox.assert.notCalled(EventEmitter.emit);
					after();
				},
				request: { data: importData },
				session,
				response: { code: 500 }
			}, {
				description: 'Should return 500 if event emitter fails',
				before: sandbox => {
					before();
					sandbox.stub(ModelImport.prototype, 'save').returns(importToSaveId);
					sandbox.stub(EventEmitter, 'emit').rejects(Error('EVENT EMITTER FAILS'));
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnce(ModelImport.prototype.save);
					sandbox.assert.calledWithExactly(ModelImport.prototype.save, importToSave);
					sandbox.assert.calledOnce(EventEmitter.emit);
					sandbox.assert.calledWithExactly(EventEmitter.emit, eventToEmit);
					after();
				},
				request: { data: importData },
				session,
				response: { code: 500 }
			}, {
				description: 'Should return 200 if everything is ok',
				before: sandbox => {
					before();
					sandbox.stub(ModelImport.prototype, 'save').returns(importToSaveId);
					sandbox.stub(EventEmitter, 'emit').returns(true);
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnce(ModelImport.prototype.save);
					sandbox.assert.calledWithExactly(ModelImport.prototype.save, importToSave);
					sandbox.assert.calledOnce(EventEmitter.emit);
					sandbox.assert.calledWithExactly(EventEmitter.emit, eventToEmit);
					after();
				},
				request: { data: importData },
				session,
				response: { code: 200 }
			}
		]);
	});
});
