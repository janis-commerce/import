'use strict';

const mime = require('mime');

const Exceljs = require('exceljs');

class Parser {

	parseStream(stream, fileName) {

		const type = mime.getType(fileName);
		const extension = mime.getExtension(type);

		if(extension === 'csv')
			return this.parseCSV(stream);

		if(extension === 'xlsx')
			return this.parseXLSX(stream);

		throw (new Error('SOME PARSE ERROR')); // ne se si debería llegar a este error
	}

	parseCSV(stream) {
		return this.exceljs.csv.read(stream); // no se si existe este metodos pero sería algo así

	}

	parseXLSX(stream) {
		return this.exceljs.xlsx.read(stream); // no se si existe este metodos pero sería algo así
	}

	get exceljs() {

		if(!this._exceljs)
			this._exceljs = new Exceljs.Workbook();

		return this._exceljs();

	}
}

module.exports = Parser;
