'use strict';

const InstanceGetter = require('./instance-getter');

class ApiGetUploadDataValidator {


	/**
	 * Validates if the entity has it corresponding import controller and model
	 *
	 * @param {string} entity
	 * @memberof ApiGetUploadDataValidator
	 */
	validateEntity(entity) {
		this.instanceGetter.getModel(entity);
		this.instanceGetter.getController(entity);
	}

	/**
	 * Validates if exists import model
	 *
	 * @memberof ApiGetUploadDataValidator
	 */
	validateImportModel() {
		this.instanceGetter.getModel('import');
	}


	/**
	 * Validates the file name.
	 * @param {string} fileName
	 * @memberof ApiGetUploadDataValidator
	 */
	validateFileName(fileName) {

		const regex = /^([a-z_A-Z\-\s0-9.]+)+\.(xls|xlsx|csv)$/;

		if(!regex.test(fileName))
			throw new Error('The file name provided is not valid.');
	}


	/**
	 * Validates if exists a valid bucket
	 *
	 * @memberof ApiGetUploadDataValidator
	 */
	static validateBucket() {

		if(!(process.env.BUCKET))
			throw new Error('Bucket is not defined.');
	}

	/**
	 * Returns the an instance of the instance getter
	 *
	 * @readonly
	 * @memberof ApiGetUploadDataValidator
	 */
	get	instanceGetter() {

		if(!this._instanceGetter)
			this._instanceGetter = this.session.getSessionInstance(InstanceGetter);

		return this._instanceGetter;
	}
}

module.exports = ApiGetUploadDataValidator;
