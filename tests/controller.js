'use strict';

const assert = require('assert');
const { Controller } = require('../lib/index');

class Model {
	save(array) {
		return array;
	}
}

const entitiesToSave = [{ fakeAttribute: true }, { fakeAttribute: false }];

describe('Models', () => {

	describe('save', () => {

		const controller = new Controller();
		before(() => {
			const model = new Model();
			controller.setModel(model);
		});

		it('Should save an array', () => {
			assert.strictEqual(controller.save(entitiesToSave), entitiesToSave);
		});
	});

});
