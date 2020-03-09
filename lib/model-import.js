'use strict';

const Model = require('@janiscommerce/model');


class ModelImport extends Model {

	static get table() {
		return 'imports';
	}
}

module.exports = ModelImport;
