'use strict';

const assert = require('assert');
const { ModelImport } = require('../lib/index');

describe('Models', () => {

	describe('Import', () => {

		describe('Getters', () => {

			it('Should return the correct table', () => {
				assert.strictEqual(ModelImport.table, 'imports');
			});
		});
	});
});
