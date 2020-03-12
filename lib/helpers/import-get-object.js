'use strict';

// const {GetObjectStream} = require("@janiscommerce/s3")

class GetObjectStream { } // reemplazar por require cuando se apurebe

class ImportGetObjectStream extends GetObjectStream {

	// Parse the incoming data before process rows
	static get parsers() {
		return [this.parser];
	}

	// Manage the buffer rows size
	static get bufferSize() {
		return 10;
	}

	// Process the buffered rows and return and array to continue.
	static async processBuffer(buffer) {
		this.controller.save(buffer);
	}

	static setController(controller) {
		this.controller = controller;
	}

	static setParser(type) {
		if(type === 'csv')
			this.parser = 'UN PARSER DE CSV';

		if(type === 'xlsx')
			this.parser = 'UN PARSER DE xlsx';
	}
}

module.exports = ImportGetObjectStream;
