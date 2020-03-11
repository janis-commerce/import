'use strict';

const { API } = require('@janiscommerce/api');
const uuid = require('uuid/v4');
const mime = require('mime');
const S3 = require('@janiscommerce/s3');
const { uploadData: struct } = require('./helpers/structs');
const Validator = require('./helpers/validator');

class ApiGetUploadData extends API {


	/**
	 * Returns the struct used for validations
	 *
	 * @readonly
	 * @memberof ApiGetUploadData
	 */
	get struct() {
		return struct;
	}

	/**
	 * Validates if the entity to import allows imports and if the file name is valid.
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

	/**
	 *Set the bucket that will be use to store the file.
	 *
	 * @memberof ApiGetUploadData
	 */
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

	/**
	 * Returns the params needed to create the presigned post.
	 *
	 * @readonly
	 * @memberof ApiGetUploadData
	 */
	get params() {

		const expiration = 60;

		return {
			Bucket: this.bucket,
			Expires: expiration,
			Fields: { 'Content-Type': this.file.type, key: this.key }
		};
	}

	/**
	 * Returns the key needed in the params
	 *
	 * @readonly
	 * @memberof ApiGetUploadData
	 */
	get key() {

		const id = uuid();
		const path = `${this.bucket}/${this.session.clientCode}/imports/${this.data.entity}
		/${this.date.YY}/${this.date.MM}/${this.date.DD}/${id}.${this.file.extension}`;
		return `${path}${id}.${this.file.extension}`;
	}

	/**
	 * Returns the file's information
	 *
	 * @readonly
	 * @memberof ApiGetUploadData
	 */
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

	/**
	 * Returns the current date formatted.
	 *
	 * @readonly
	 * @memberof ApiGetUploadData
	 */
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
