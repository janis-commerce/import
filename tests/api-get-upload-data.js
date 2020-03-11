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

const importData = { entity: 'some-entity', fileName: 'some-file-name.xls' };

const session = true;

const before = () => {
	process.env.BUCKET = 'some-bucket-beta';
};

describe('API getUploadData', () => {

	const response = { code: 400 };

	context('When validating', () => {
		ApiTest(ApiGetUploadData, '/api/import', [
			{
				description: 'Should return 400 if the required field \'entity\' is not passed',
				before,
				request: { data: { entity: undefined, ...importData } },
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'entity\' is not a string',
				before,
				request: { data: { entity: 123, ...importData } },
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'filename\' is not passed',
				before,
				request: { data: { fileName: undefined, ...importData } },
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a string',
				before,
				request: { data: { fileName: 123, ...importData } },
				session,
				response
			}, {
				description: 'Should return 400 if the required field \'filename\' is not a valid',
				before,
				request: { data: { fileName: 'some-file-name.pdf', ...importData } },
				session,
				response
			}, {
				description: 'Should return 400 if the entity controller is not found in the corresponding data path',
				before: () => {
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(modelImportPath, ModelImport);
					before();
				},
				after: () => {
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(modelImportPath);
				},
				request: { data: importData },
				session,
				response
			}, {
				description: 'Should return 400 if the entity model is not found in the corresponding data path',
				before: () => {
					mockRequire(fakeControllerPath, FakeController);
					mockRequire(modelImportPath, ModelImport);
					before();
				},
				after: () => {
					mockRequire.stop(fakeControllerPath);
					mockRequire.stop(modelImportPath);
				},
				request: { data: importData },
				session,
				response
			}, {
				description: 'Should return 400 if the entity import is not found in the corresponding data path',
				before: () => {
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(fakeControllerPath, FakeController);
					before();
				},
				after: () => {
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(fakeControllerPath);
				},
				request: { data: importData },
				session,
				response
			}, {
				description: 'Should return 400 if bucket is not defined',
				request: { data: importData },
				session,
				before: () => {
					delete (process.env.BUCKET);
					mockRequire(fakeModelPath, FakeModel);
					mockRequire(fakeControllerPath, FakeController);
					mockRequire(modelImportPath, ModelImport);
				},
				after: () => {
					mockRequire.stop(fakeModelPath);
					mockRequire.stop(fakeControllerPath);
					mockRequire.stop(modelImportPath);
				},
				response: { code: 400 }
			}
		]);
	});

	context('When processing', () => {

		const beforeProcessing = () => {
			mockRequire(fakeModelPath, FakeModel);
			mockRequire(fakeControllerPath, FakeController);
			mockRequire(modelImportPath, ModelImport);
			process.env.BUCKET = 'some-bucket-beta';
		};

		const after = () => {
			mockRequire.stop(fakeModelPath);
			mockRequire.stop(fakeControllerPath);
			mockRequire.stop(modelImportPath);
		};

		ApiTest(ApiGetUploadData, '/api/import', [{
			description: 'Should return 500 if S3 rejects',
			request: { data: importData },
			session,
			before: sandbox => {
				beforeProcessing();
				sandbox.stub(S3, 'createPresignedPost').rejects(new Error('S3 internal error'));
			},
			after: (response, sandbox) => {
				sandbox.assert.calledOnce(S3.createPresignedPost);
				after();
			},
			response: { code: 500 }
		}, {
			description: 'Should return 200 if everything is ok',
			request: { data: importData },
			session,
			before: sandbox => {
				beforeProcessing();
				sandbox.stub(S3, 'createPresignedPost').resolves({ url: 'URL', fields: {} });
			},
			after: (response, sandbox) => {
				sandbox.assert.calledOnce(S3.createPresignedPost);
				after();
			},
			response: { code: 200 }
		}]);
	});
});
