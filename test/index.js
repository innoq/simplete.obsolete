/*jslint vars: true, node: true, white: true */
/*global simplete, QUnit */
"use strict";

var module = QUnit.module;
var test = QUnit.test;

module("Simplete");

test("API", function(assert) {
	assert.strictEqual(typeof simplete, "function",
			"global namespace (non-CommonJS usage)");
	assert.strictEqual(typeof simplete.Simplete, "function", "constructor");
	assert.strictEqual(typeof simplete.debounce, "function",
			"bonus for non-CommonJS users");
});
