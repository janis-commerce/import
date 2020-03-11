'use strict';

const ApiTest = require('@janiscommerce/api-test');
const path = require('path');
const mockRequire = require('mock-require');
const S3 = require('@janiscommerce/s3');
const { ApiGetUploadData, ModelImport } = require('../lib/index');


class FakeModel {}
const fakeModelPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', 'some-entity');

class FakeController {}
const fakeControllerPath = path.join(process.cwd(), process.env.MS_PATH || '', 'controllers', 'import', 'some-entity');

const modelImportPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', 'import');

describe('API getUploadData', () => {

	context('When validating type and missing field  ', () => {
		ApiTest(ApiGetUploadData, '/api/import', [
			{
				description: 'Should return 400 if the required field \'entity\' is not passed',
				before: () => {
					process.env.BUCKET = 'some-bucket-beta';
				},
				request: {
					data: { entity: undefined, fileName: 'some-file-name.xls' }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'entity\' is not a string',
				before: () => {
					process.env.BUCKET = 'some-bucket-beta';
				},
				request: {
					data: { entity: 123, fileName: 'some-file-name.xls' }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'filename\' is not passed',
				before: () => {
					process.env.BUCKET = 'some-bucket-beta';
				},
				request: {
					data: { entity: 'fakeEntity', fileName: undefined }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a string',
				before: () => {
					process.env.BUCKET = 'some-bucket-beta';
				},
				request: {
					data: { entity: 'fakeEntity', fileName: 123, fileSource: 'a-file-source' }
				},
				session: true,
				response: {
					code: 400
				}
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a valid',
				before: () => {
					process.env.BUCKET = 'some-bucket-beta';
				},
				request: {
					data: { entity: 'fakeEntity', fileName: 'some-file-name.pdf' }
				},
				session: true,
				response: {
					code: 400
				}
			}
		]);
	});

	context('When entity controller does not exist  ', () => {

		ApiTest(ApiGetUploadData, '/api/import', [
			{
				description: 'Should return 400 if the entity controller is not found in the corresponding data path',
				before: () => {
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(modelImportPath, ModelImport);
					process.env.BUCKET = 'some-bucket-beta';
				},
				after: () => {
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(modelImportPath);
				},
				request: {
					data: { entity: 'some-entity', fileName: 'some-file-name.xls' }
				},
				session: true,
				response: {
					code: 400
				}
			}
		]);
	});

	context('When entity model does not exist  ', () => {

		ApiTest(ApiGetUploadData, '/api/import', [
			{
				description: 'Should return 400 if the entity model is not found in the corresponding data path',
				before: () => {
					mockRequire(fakeControllerPath, FakeController);
					mockRequire(modelImportPath, ModelImport);
					process.env.BUCKET = 'some-bucket-beta';
				},
				after: () => {
					mockRequire.stop(fakeControllerPath);
					mockRequire.stop(modelImportPath);
				},
				request: {
					data: { entity: 'some-entity', fileName: 'some-file-name.xls' }
				},
				session: true,
				response: {
					code: 400
				}
			}
		]);
	});

	context('When import model does not exist  ', () => {

		ApiTest(ApiGetUploadData, '/api/import', [
			{
				description: 'Should return 400 if the entity import is not found in the corresponding data path',
				before: () => {
					process.env.BUCKET = 'some-bucket-beta';
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(fakeControllerPath, FakeController);
				},
				after: () => {
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(fakeControllerPath);
				},
				request: {
					data: { entity: 'some-entity', fileName: 'some-file-name.xls' }
				},
				session: true,
				response: {
					code: 400
				}
			}
		]);
	});

	context('When processing', () => {

		before(() => {
			mockRequire(fakeModelPath, FakeModel);
			mockRequire(fakeControllerPath, FakeController);
			mockRequire(modelImportPath, ModelImport);
		});

		after(() => {
			mockRequire.stop(fakeModelPath);
			mockRequire.stop(fakeControllerPath);
			mockRequire.stop(modelImportPath);
		});

		ApiTest(ApiGetUploadData, '/api/import', [{
			description: 'Should return 500 if S3 rejects',
			request: { data: { fileName: 'test.csv', entity: 'some-entity' } },
			session: true,
			before: sandbox => {
				process.env.BUCKET = 'some-bucket-beta';
				sandbox.stub(S3, 'createPresignedPost').rejects(new Error('S3 internal error'));
			},
			after: (response, sandbox) => {

				sandbox.assert.calledOnce(S3.createPresignedPost);
			},
			response: { code: 500 }
		}, {
			description: 'Should return 400 if bucket is not defined',
			request: { data: { fileName: 'test.csv', entity: 'some-entity' } },
			session: true,
			before: sandbox => {
				delete (process.env.BUCKET);
				sandbox.stub(S3, 'createPresignedPost').returns(true);
			},
			after: (response, sandbox) => {
				process.env.BUCKET = 'some-bucket-beta';
				sandbox.assert.notCalled(S3.createPresignedPost);
			},
			response: { code: 400 }
		}, {
			description: 'Should return 200 if everything is ok',
			request: { data: { fileName: 'test.csv', entity: 'some-entity' } },
			session: true,
			before: sandbox => {
				process.env.BUCKET = 'some-bucket-beta';
				sandbox.stub(S3, 'createPresignedPost').resolves({ url: 'URL', fields: {} });
			},
			after: (response, sandbox) => {
				sandbox.assert.calledOnce(S3.createPresignedPost);
			},
			response: { code: 200 }
		}]);
	});
});
