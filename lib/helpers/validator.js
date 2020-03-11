'use strict';

const InstanceGetter = require('./instance-getter');

class ApiGetUploadDataValidator {

	/**
	 * Validates the file name.
	 * @param {string} fileName
	 */
	validateFileName(fileName) {

		const regex = /^([a-z_A-Z\-\s0-9.]+)+\.(xls|xlsx|csv)$/;

		if(!regex.test(fileName))
			throw new Error('The file name provided is not valid.');
	}

	/**
	 * Returns the an instance of the instance getter
	 *
	 * @readonly
	 */
	get	instanceGetter() {

		if(!this._instanceGetter)
			this._instanceGetter = this.session.getSessionInstance(InstanceGetter);

		return this._instanceGetter;
	}

	/**
	 * Validates if the entity model is in a specified path by trying to get it
	 * @param {string} entity
	 */
	validateModel(entity) {

		this.instanceGetter.getModel(entity);
	}

	/**
	 * Validates if the entity controller is in a specified path by trying to get it
	 * @param {string} entity
	 */
	validateController(entity) {

		this.instanceGetter.getController(entity);
	}
}

module.exports = ApiGetUploadDataValidator;
