'use strict';

const path = require('path');

class ApiGetUploadDataValidator {


	validateFileName(fileName) {

		const regex = /^([a-z_A-Z\-\s0-9.]+)+\.(xls|xlsx|csv)$/;

		if(!regex.test(fileName))
			throw new Error('The file name provided is not valid.');
	}


	validateModel(entity) {

		const modelPath = path.join(process.cwd(), process.env.MS_PATH || '', 'models', entity);

		try {
			this._getInstance(modelPath);
		} catch(e) {
			throw new Error(`Invalid Model ${entity}. Must be in ${modelPath}.`);
		}
	}

	validateController(entity) {

		const controllerPath = path.join(process.cwd(), process.env.MS_PATH || '', 'controllers', 'export', entity);

		try {
			this._getInstance(controllerPath);
		} catch(e) {
			throw new Error(`Invalid Controller ${entity}. Must be in ${controllerPath}.`);
		}
	}

	_getInstance(classPath) {

		// eslint-disable-next-line global-require, import/no-dynamic-require
		const TheClass = require(classPath);

		return this.session.getSessionInstance(TheClass);
	}
}

module.exports = ApiGetUploadDataValidator;
