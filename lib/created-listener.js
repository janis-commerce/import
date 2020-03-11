'use strict';


const { EventListener } = require('@janiscommerce/event-listener');

// const S3 = require('@janiscommerce/s3');
const InstanceGetter = require('./helpers/instance-getter');

class CreatedListener extends EventListener {

	get mustHaveId() {
		return true;
	}

	get mustHaveClient() {
		return true;
	}

	async validate() {

		super.validate();

		if(!(process.env.BUCKET))
			throw new Error('Bucket is not defined.');

		this.bucket = process.env.BUCKET;
	}


	async process() {

		this.importModel = this.instanceGetter.getModel('import');
		const importData = await this.importModel.get(this.eventId);
		this.entityController = this.instanceGetter.getController(importData.entity);


		// const { body, length } = S3.getObject({
		// 	key: importData.fileName,
		// 	bucket: this.bucket
		// });

	}

	get	instanceGetter() {

		if(!this._instanceGetter)
			this._instanceGetter = this.session.getSessionInstance(InstanceGetter);

		return this._instanceGetter;
	}
}
module.exports = CreatedListener;
