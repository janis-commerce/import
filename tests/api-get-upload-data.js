'use strict';

const ApiTest = require('@janiscommerce/api-test');
// const path = require('path');
const { ApiGetUploadData } = require('../lib/index');


describe('API getUploadData', () => {

	context('When validating type and missing data  ', () => {
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
});
