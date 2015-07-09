/*jslint vars: true, node: true, browser: true, white: true */
/*global simplete, QUnit */
"use strict";

var ajax = require("./util").ajax;

var module = QUnit.module;
var test = QUnit.test;

module("Simplete async");

module("Simplete async", {
	beforeEach: function() {
		this.ajax = jQuery.ajax;
		jQuery.ajax = ajax(this);

		var self = this;
		self.ximplete = subclass(simplete.Simplete, function() {
			var _load = this.load;
			this.load = function() {
				var res = _load.apply(this, arguments);
				self.onLoad && self.onLoad.apply(this, arguments);
				return res;
			};

			var _open = this.open;
			this.open = function() {
				var res = _open.apply(this, arguments);
				self.onOpen && self.onOpen.apply(this, arguments);
				return res;
			};
		})
	},
	afterEach: function() {
		jQuery.ajax = this.ajax;
	}
});

test("suggestions", function(assert) {
	var form = document.getElementById("autocomplete-form");
	var field = form.querySelector("input.autocomplete");

	var doneFocus = assert.async();
	this.onLoad = function() {
		assert.ok(form.classList.contains("pending"), "requests pending");
		doneFocus();
	};

	var doneResponse = assert.async();
	this.onOpen = function() {
		setTimeout(function() { // give `always` a chance to kick in -- XXX: brittle
			assert.notOk(form.classList.contains("pending"), "no more requests pending");
			doneResponse();
		}, 10);
	};

	this.ximplete(field);
	var suggestions = field.nextSibling;

	assert.notOk(form.classList.contains("pending"), "no requests pending");
	field.focus();
});

// create a customizable clone
function subclass(constructor, beforeInit) {
	return function() {
		var obj = Object.create(constructor.prototype);
		obj.__sub = true; // XXX: DEBUG
		beforeInit.call(obj);
		constructor.apply(obj, arguments);
		return obj;
	};
}
