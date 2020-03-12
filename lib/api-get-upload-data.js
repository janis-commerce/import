'use strict';

const { API } = require('@janiscommerce/api');
const uuid = require('uuid/v4');
const S3 = require('@janiscommerce/s3');
const FileFormatter = require('./utils/file-formatter');
const { uploadData: struct } = require('./utils/structs');
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

		Validator.validateBucket();
		this.validator = this.session.getSessionInstance(Validator);
		this.validator.validateFileName(this.data.fileName);
		this.validator.validateEntity(this.data.entity);
		this.validator.validateImportModel();
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

		this.bucket = process.env.BUCKET;
		this.file = FileFormatter.format(this.data.fileName);

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
