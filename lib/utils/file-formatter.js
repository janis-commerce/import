'use strict';

const mime = require('mime');


class FileFormatter {

	/**
	 * Returns the file's information
	 *
	 * @readonly
	 * @memberof FileFormatter
	 */
	static format(fileName) {

		const type = mime.getType(fileName);
		const extension = mime.getExtension(type);

		return {
			fileName,
			type,
			extension
		};
	}
}

module.exports = FileFormatter;
