'use strict';

const { API } = require('@janiscommerce/api');
const { struct } = require('superstruct');
const uuid = require('uuid/v4');
const mime = require('mime');
const S3 = require('@janiscommerce/s3');
const Validator = require('./upload-validator');

const importStruct = struct.partial({
	entity: 'string',
	fileName: 'string'
});

class ApiGetUploadData extends API {


	/**
	 * Returns the struct used for validations
	 *
	 * @readonly
	 * @memberof ApiGetUploadData
	 */
	get struct() {
		return importStruct;
	}

	/**
	 * Validates it the entity to import allows imports and if the file name is valid.
	 *
	 * @memberof ApiGetUploadData
	 */
	async validate() {

		this.validator = this.session.getSessionInstance(Validator);
		this.validator.validateFileName(this.data.fileName);
		this.validator.validateController(this.data.entity);
		this.validator.validateModel(this.data.entity);
		this.validator.validateModel('import');
		this.setBucket();
	}

	setBucket() {

		if(!(process.env.BUCKET))
			throw new Error('Bucket is not defined.');

		this.bucket = process.env.BUCKET;
	}

	/**
	 * Generates the upload URL
	 *
	 * @memberof ApiGetUploadData
	 */
	async process() {

		try {
			const response = await S3.createPresignedPost(this.params);
			this.setBody(response);

		} catch(error) {
			throw new Error('S3 error.');
		}

	}

	get params() {

		const expiration = 60;

		return {
			Bucket: this.bucket,
			Expires: expiration,
			Fields: { 'Content-Type': this.file.type, key: this.key }
		};
	}


	get key() {

		const id = uuid();
		const path = `${this.bucket}/${this.session.clientCode}/imports/${this.data.entity}
		/${this.date.YY}/${this.date.MM}/${this.date.DD}/${id}.${this.file.extension}`;
		return `${path}${id}.${this.file.extension}`;
	}

	get file() {

		const { fileName } = this.data;
		const type = mime.getType(fileName);
		const extension = mime.getExtension(type);

		return {
			fileName,
			type,
			extension
		};
	}

	get date() {

		const date = new Date();

		return {
			YY: date.getFullYear(),
			MM: date.getMonth(),
			DD: date.getDay()
		};
	}
}

module.exports = ApiGetUploadData;
