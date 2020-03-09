'use strict';

const { API } = require('@janiscommerce/api');
const { struct } = require('superstruct');
const Validator = require('./api-get-upload-data-validator');

const importStruct = struct.partial({
	entity: 'string',
	fileName: 'string'
});

class ApiGetUploadData extends API {


	/**
	 * Returns the struct used for validations
	 *
	 * @readonly
	 * @memberof ApiGetUploadData
	 */
	get struct() {
		return importStruct;
	}

	// /**
	//  * Generates the upload URL
	//  *
	//  * @memberof ApiGetUploadData
	//  */
	// async process() {
	// 	await super.process();
	// }

	/**
	 * Validates it the entity to import allows imports and if the file name is valid.
	 *
	 * @memberof ApiGetUploadData
	 */
	async validate() {
		console.log('llega aca');
		this.validator = this.session.getSessionInstance(Validator);
		this.validator.validateFileName(this.data.fileName);
		this.validator.validateModel(this.data.entity);
		this.validator.validateController(this.data.entity);
	}

}

module.exports = ApiGetUploadData;
