'use strict';

// const {GetObjectStream} = require("@janiscommerce/s3")
const Excel = require('exceljs');
const csvParser = require('csv-parser');
// reemplazar por librería cuando se apruebe
const GetObjectStream = require('./get-object-stream');


class ImportGetObjectStream extends GetObjectStream {

	/**
	 * Returns the parser to use
	 *
	 * @readonly
	 * @static
	 * @memberof ImportGetObjectStream
	 */
	static get parsers() {
		return [[this.parser]];
	}

	/**
	 * Returns per how many rows should be the stream processed
	 *
	 * @readonly
	 * @static
	 * @memberof ImportGetObjectStream
	 */
	static get bufferSize() {
		return 10; // modificar este número por el tamaño de página?
	}

	/**
	 * Saves the objects into the entity model calling the controller
	 *
	 * @static
	 * @param {Array} buffer
	 * @memberof ImportGetObjectStream
	 */
	static async processBuffer(buffer) {
		await this.controller.save(buffer);
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

		if(type === 'csv') {
			console.log('llega aca');
			this.parser = csvParser;
		}
		if(type === 'xlsx') {
			// habría que cambiarlo
			const workbook = new Excel.Workbook();
			this.parser = workbook.xlsx.createInputStream; // esto no anda jej
		}
		// 	ANALIZAR EL CASO EN QUE NO HAYA UN PARSER PARA ESE TIPO
	}
}

module.exports = ImportGetObjectStream;
