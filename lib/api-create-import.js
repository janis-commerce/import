'use strict';

const { API } = require('@janiscommerce/api');
const EventEmitter = require('@janiscommerce/event-emitter');
const Validator = require('./helpers/validator');
const { createImport: struct } = require('./helpers/structs');
const InstanceGetter = require('./helpers/instance-getter');

class ApiCreateImport extends API {

	/**
	 * Returns the struct used for validations
	 *
	 * @readonly
	 * @memberof ApiCreateImport
	 */
	get struct() {
		return struct;
	}

	/**
	 * Validates if the entity to import allows imports and if the file name is valid.
	 *
	 * @memberof ApiCreateImport
	 */
	async validate() {

		this.validator = this.session.getSessionInstance(Validator);
		this.validator.validateFileName(this.data.fileName);
		this.validator.validateController(this.data.entity);
		this.validator.validateModel(this.data.entity);
		this.validator.validateModel('import');
	}

	/**
	 * Saves import information and emits an event accordingly
	 *
	 * @memberof ApiCreateImport
	 */
	async process() {

		const importId = await this.saveImport();
		this.setBody({ id: importId });

		return EventEmitter.emit({
			entity: 'import',
			event: 'created',
			id: importId,
			client: this.session.clientCode
		});
	}

	/**
     * Saves import informtation in the import model
     *
     * @returns
     * @memberof ApiCreateImport
     */
	saveImport() {

		const instanceGetter = this.session.getSessionInstance(InstanceGetter);
		const modelImport = instanceGetter.getModel('import');
		const importData = {
			entity: this.data.entity,
			originalName: this.data.fileName,
			fileName: this.data.fileSource,
			status: modelImport.constructor.statuses.active
		};

		return modelImport.save(importData);
	}
}

module.exports = ApiCreateImport;
