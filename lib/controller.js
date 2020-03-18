'use strict';

class Controller {

	/**
     *  Sets the model
     *
     * @param {Object} model
     * @memberof Controller
     */
	setModel(model) {
		this.model = model;
	}

	/**
     *
     *
     * @param {Array} entities
     * @returns
     * @memberof Controller
     */
	save(entities) {
		return this.model.save(entities);
	}

	// SE PUEDE HACER UN PRE O POST SAVE HOOK
}

module.exports = Controller;
