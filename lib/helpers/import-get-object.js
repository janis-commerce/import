'use strict';

// const {GetObjectStream} = require("@janiscommerce/s3")
const Excel = require('exceljs');

class GetObjectStream { } // reemplazar por require cuando se apurebe


class ImportGetObjectStream extends GetObjectStream {

	/**
	 * returns the parser to use
	 *
	 * @readonly
	 * @static
	 * @memberof ImportGetObjectStream
	 */
	static get parsers() {
		return [this.parser];
	}

	/**
	 * return per how many rows should be the stream processed
	 *
	 * @readonly
	 * @static
	 * @memberof ImportGetObjectStream
	 */
	static get bufferSize() {
		return 10;
	}

	/**
	 * Saves the objects into the entity model calling the controller
	 *
	 * @static
	 * @param {Array} buffer
	 * @memberof ImportGetObjectStream
	 */
	static async processBuffer(buffer) {
		this.controller.save(buffer);
		return buffer;
	}

	/**
	 * Sets the entity controller.
	 *
	 * @static
	 * @param {Object} controller
	 * @memberof ImportGetObjectStream
	 */
	static setController(controller) {
		this.controller = controller;
	}

	/**
	 * Sets the parser according to the file type
	 *
	 * @static
	 * @param {String} type
	 * @memberof ImportGetObjectStream
	 */
	static setParser(type) {

		const workbook = new Excel.Workbook();

		if(type === 'csv')
			this.parser = workbook.csv.createInputStream;

		if(type === 'xlsx')
			this.parser = workbook.xlsx.createInputStream;
		// 	ANALIZAR EL CASO EN QUE NO HAYA UN PARSER PARA ESE TIPO
	}
}

module.exports = ImportGetObjectStream;
