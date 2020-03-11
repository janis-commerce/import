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

describe('API createImport', () => {

	context('When validating type and missing field  ', () => {
		ApiTest(ApiCreateImport, '/api/import', [
			{
				description: 'Should return 400 if the required field \'entity\' is not passed',
				request: {
					data: { entity: undefined, fileName: 'some-file-name.xls', fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'entity\' is not a string',
				request: {
					data: { entity: 123, fileName: 'some-file-name.xls', fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'filename\' is not passed',
				request: {
					data: { entity: 'fakeEntity', fileName: undefined, fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a string',
				request: {
					data: { entity: 'fakeEntity', fileName: 123, fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a valid',
				request: {
					data: { entity: 'fakeEntity', fileName: 'some-file-name.pdf', fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'fileSource\' is not passed',
				request: {
					data: { entity: 'fakeEntity', fileName: 'some-file-name.xls', fileSource: undefined }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a string',
				request: {
					data: { entity: 'fakeEntity', fileName: 'some-file-name.xls', fileSource: 123 }
				},
				session: true,
				response: {
					code: 400
				}
			}
		]);
	});

	context('When entity controller does not exist  ', () => {

		ApiTest(ApiCreateImport, '/api/import', [
			{
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
					data: { entity: 'some-entity', fileName: 'some-file-name.xls', fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 400
				}
			}
		]);
	});

	context('When entity model does not exist  ', () => {

		ApiTest(ApiCreateImport, '/api/import', [
			{
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
				session: true,
				response: {
					code: 400
				}
			}
		]);
	});

	context('When import model does not exist  ', () => {

		ApiTest(ApiCreateImport, '/api/import', [
			{
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
				session: true,
				response: {
					code: 400
				}
			}
		]);
	});

	context('When processing  ', () => {

		ApiTest(ApiCreateImport, '/api/import', [
			{
				description: 'Should return 500 if the entity import fails. Should not emit event',
				before: sandbox => {
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(fakeControllerPath, FakeController);
					mockRequire(modelImportPath, ModelImport);
					sandbox.stub(ModelImport.prototype, 'save').rejects(Error('DB ERROR'));
					sandbox.stub(EventEmitter, 'emit').returns(true);
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnce(ModelImport.prototype.save);
					sandbox.assert.calledWithExactly(ModelImport.prototype.save, {
						entity: 'some-entity',
						fileName: 'a-file-source',
						originalName: 'some-file-name.xls',
						status: ModelImport.statuses.active
					});
					sandbox.assert.notCalled(EventEmitter.emit);
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(fakeControllerPath);
					mockRequire.stop(modelImportPath);
				},
				request: {
					data: { entity: 'some-entity', fileName: 'some-file-name.xls', fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 500
				}
			}, {
				description: 'Should return 500 if event emitter fails',
				before: sandbox => {
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(fakeControllerPath, FakeController);
					mockRequire(modelImportPath, ModelImport);
					sandbox.stub(ModelImport.prototype, 'save').returns('5e0a0619bcc3ce0007a18011');
					sandbox.stub(EventEmitter, 'emit').rejects(Error('EVENT EMITTER FAILS'));
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnce(ModelImport.prototype.save);
					sandbox.assert.calledWithExactly(ModelImport.prototype.save, {
						entity: 'some-entity',
						fileName: 'a-file-source',
						originalName: 'some-file-name.xls',
						status: ModelImport.statuses.active
					});
					sandbox.assert.calledOnce(EventEmitter.emit);
					sandbox.assert.calledWithExactly(EventEmitter.emit, {
						entity: 'import',
						event: 'created',
						id: '5e0a0619bcc3ce0007a18011',
						client: 'defaultClient'
					});
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(fakeControllerPath);
					mockRequire.stop(modelImportPath);
				},
				request: {
					data: { entity: 'some-entity', fileName: 'some-file-name.xls', fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 500
				}
			}, {
				description: 'Should return 200 if everything is ok',
				before: sandbox => {
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(fakeControllerPath, FakeController);
					mockRequire(modelImportPath, ModelImport);
					sandbox.stub(ModelImport.prototype, 'save').returns('5e0a0619bcc3ce0007a18011');
					sandbox.stub(EventEmitter, 'emit').returns(true);
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnce(ModelImport.prototype.save);
					sandbox.assert.calledWithExactly(ModelImport.prototype.save, {
						entity: 'some-entity',
						fileName: 'a-file-source',
						originalName: 'some-file-name.xls',
						status: ModelImport.statuses.active
					});
					sandbox.assert.calledOnce(EventEmitter.emit);
					sandbox.assert.calledWithExactly(EventEmitter.emit, {
						entity: 'import',
						event: 'created',
						id: '5e0a0619bcc3ce0007a18011',
						client: 'defaultClient'
					});
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(fakeControllerPath);
					mockRequire.stop(modelImportPath);
				},
				request: {
					data: { entity: 'some-entity', fileName: 'some-file-name.xls', fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 200
				}
			}
		]);
	});
});
