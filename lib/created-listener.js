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

		super.validate();
		Validator.validateBucket();
	}


	async process() {

		await this.setImportInformation();

		ImportGetObject.setController(this.controller);
		const { type } = FileFormatter.format(this.originalName);
		ImportGetObject.setParser(type);

		ImportGetObject.call({
			bucket: this.bucket,
			key: this.fileName
		});
	}

	async setImportInformation() {

		const instanceGetter = this.session.getSessionInstance(InstanceGetter);
		this.importModel = instanceGetter.getModel('import');

		const { fileName, entity, originalName } = await this.importModel.get(this.eventId);

		this.fileName = fileName;
		this.originalName = originalName;
		this.controller = instanceGetter.getController(entity);

		this.bucket = process.env.BUCKET;
	}
}
module.exports = CreatedListener;
