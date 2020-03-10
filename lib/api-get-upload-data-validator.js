'use strict';

const path = require('path');

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
	 * 	Validates if the entity has a model and an import controller
	 * @param {string} entity
	 */
	validateEntity(entity) {

		this.validateModel(entity);
		this.validateController(entity);
	}

	/**
	 * Validates if there is an import model
	 * @memberof ApiGetUploadDataValidator
	 */
	validateModelImport() {

		this.validateModel('import');
	}

	/**
	 * Validates if the entity model is in a specified path
	 * @param {string} entity
	 */
	validateModel(entity) {

		const modelPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', entity);

		try {
			this._getInstance(modelPath);
		} catch(e) {
			throw new Error(`Invalid Model ${entity}. Must be in ${modelPath}.`);
		}
	}

	/**
	 * Validates if the entity controller is in a specified path
	 * @param {string} entity
	 */
	validateController(entity) {

		const controllerPath = path.join(process.cwd(), process.env.MS_PATH || '', 'controllers', 'import', entity);

		try {
			this._getInstance(controllerPath);
		} catch(e) {
			throw new Error(`Invalid Controller ${entity}. Must be in ${controllerPath}.`);
		}
	}

	/**
	 * 	Gets an entity acording to it path
	 * @param {string} classPath
	 */
	_getInstance(classPath) {

		// eslint-disable-next-line global-require, import/no-dynamic-require
		const TheClass = require(classPath);

		return this.session.getSessionInstance(TheClass);
	}
}


module.exports = ApiGetUploadDataValidator;
