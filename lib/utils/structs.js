
'use strict';

const { struct } = require('superstruct');

const uploadData = struct.partial({
	entity: 'string',
	fileName: 'string'
});


const createImport = struct.partial({
	entity: 'string',
	fileName: 'string',
	fileSource: 'string'
});

module.exports = {
	uploadData,
	createImport
};
