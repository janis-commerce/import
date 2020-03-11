'use strict';


const { EventListener } = require('@janiscommerce/event-listener');

const S3 = require('@janiscommerce/s3');
const InstanceGetter = require('./helpers/instance-getter');
const Parser = require('./helpers/parser.js');

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

		const instanceGetter = this.session.getSessionInstance(InstanceGetter);
		this.importModel = instanceGetter.getModel('import');
		const { fileName, entity, originalName } = await this.importModel.get(this.eventId);
		this.entityController = instanceGetter.getController(entity);

		// no se como es esto para archivos muy grandes
		const { body } = S3.getObject({
			key: fileName,
			bucket: this.bucket
		});

		const parser = new Parser();

		// guardarlo en una variable, debe devolver un array de objetos y dsp mandarlos al controller.
		await parser.parseStream(body, originalName);

	}
}
module.exports = CreatedListener;
