'use strict';


const { EventListener } = require('@janiscommerce/event-listener');
const Validator = require('./helpers/validator.js');
const InstanceGetter = require('./helpers/instance-getter');
const FileFormatter = require('./utils/file-formatter');
const ImportGetObject = require('./helpers/import-get-object');

class CreatedListener extends EventListener {

	/**
	 * Returns true if the event must have id
	 *
	 * @readonly
	 * @memberof CreatedListener
	 */
	get mustHaveId() {
		return true;
	}

	/**
	 * Returns true if the event must have client
	 *
	 * @readonly
	 * @memberof CreatedListener
	 */
	get mustHaveClient() {
		return true;
	}

	/**
	 * Validates if the bucket is correctly defined
	 *
	 * @memberof CreatedListener
	 */
	async validate() {

		await super.validate();
		Validator.validateBucket();
	}

	/**
 	* Calls the import object to start procesing the file
 	*
 	* @memberof CreatedListener
 	*/
	async process() {

		await this.setImportData();

		ImportGetObject.setController(this.controller);
		const { extension } = FileFormatter.format(this.originalName);
		ImportGetObject.setParser(extension);

		ImportGetObject.call({
			bucket: process.env.BUCKET,
			key: this.fileName
		});
	}


	/**
	 * Gets from import model the import information.
	 *
	 * @memberof CreatedListener
	 */
	async setImportData() {

		const importModel = this.instanceGetter.getModel('import');

		const { fileName, entity, originalName } = await importModel.getById(this.eventId);

		this.fileName = fileName;
		this.originalName = originalName;
		this.entity = entity;
	}

	/**
	 * Returns an instance of the instance getter
	 *
	 * @readonly
	 * @memberof CreatedListener
	 */
	get instanceGetter() {

		if(!this._instanceGetter)
			this._instanceGetter = this.session.getSessionInstance(InstanceGetter);

		return this._instanceGetter;
	}

	/**
	 * Retruns an instance of the controller.
	 *
	 * @readonly
	 * @memberof CreatedListener
	 */
	get controller() {

		const controller = this.instanceGetter.getController(this.entity);
		const model = this.instanceGetter.getModel(this.entity);
		controller.setModel(model);
		return controller;
	}
}

module.exports = CreatedListener;
