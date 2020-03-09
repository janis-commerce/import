'use strict';

const ApiTest = require('@janiscommerce/api-test');
const path = require('path');
const mockRequire = require('mock-require');
const { ApiGetUploadData } = require('../lib/index');


class FakeModel {}
const fakeModelPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', 'some-entity');

class FakeController {}
const fakeControllerPath = path.join(process.cwd(), process.env.MS_PATH || '', 'controllers', 'import', 'some-entity');

describe('API getUploadData', () => {

	context('When validating type and missing field  ', () => {
		ApiTest(ApiGetUploadData, '/api/getUploadData', [
			{
				description: 'Should return 400 if the required field \'entity\' is not passed',
				request: {
					data: { entity: undefined, fileName: 'some-file-name.xls' }
				},
				session: true,
				response: {
					code: 400
				}
			},
			{
				description: 'Should return 400 if the required field \'filename\' is not passed',
				request: {
					data: { entity: 'fakeEntity', fileName: undefined }
				},
				session: true,
				response: {
					code: 400
				}
			},
			{
				description: 'Should return 400 if the required field \'filename\' is not a valid file name',
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

		before(() => {
			// mockRequire(modelImportPath, ModelImport); todavía no hice esta validación
			mockRequire(fakeModelPath, FakeModel);
		});

		after(() => {
			mockRequire.stop(fakeModelPath);
		});


		ApiTest(ApiGetUploadData, '/api/getUploadData', [
			{
				description: 'Should return 400 if the entity model is not found in the corresponding data path',
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

		before(() => {
			// mockRequire(modelImportPath, ModelImport); todavía no hice esta validación
			mockRequire(fakeControllerPath, FakeController);
		});

		after(() => {
			mockRequire.stop(fakeControllerPath);
		});

		ApiTest(ApiGetUploadData, '/api/getUploadData', [
			{
				description: 'Should return 400 if the entity controller is not found in the corresponding data path',
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
});
