/*jslint vars: true, node: true, browser: true, white: true */
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

test("initialization", function(assert) {
	var form = document.getElementById("autocomplete-form");
	var field = form.querySelector("input.autocomplete");
	simplete(field);
	var suggestions = field.nextSibling;

	assert.ok(field.parentNode.classList.contains("simplete"),
			"wrapping container");
	assert.ok(suggestions.classList.contains("suggestions"),
			"results container");
	assert.strictEqual(suggestions.childNodes.length, 0,
			"empty results container");
});
