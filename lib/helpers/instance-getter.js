'use strict';

const path = require('path');

class InstanceGetter {

	getModel(entity) {

		const modelPath = this._getPath(['models', entity]);

		try {
			return this._getInstance(modelPath);
		} catch(e) {
			throw new Error(`Invalid Model ${entity}. Must be in ${modelPath}.`);
		}
	}

	getController(entity) {

		const controllerPath = this._getPath(['controllers', 'import', entity]);

		try {
			return this._getInstance(controllerPath);
		} catch(e) {
			throw new Error(`Invalid Controller ${entity}. Must be in ${controllerPath}.`);
		}
	}

	_getPath(relativePath) {

		return path.join(process.cwd(), process.env.MS_PATH || '', ...relativePath);
	}

	_getInstance(classPath) {

		// eslint-disable-next-line global-require, import/no-dynamic-require
		const TheClass = require(classPath);
		return this.session.getSessionInstance(TheClass);
	}
}

module.exports = InstanceGetter;
