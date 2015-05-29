/*jslint vars: true, node: true, white: true */
"use strict";

var $ = require("jquery");
var debounce = require("uitil/debounce");

module.exports = exports = function(field, options) {
	new Simplete(field, options);
};

exports.Simplete = Simplete;
exports.debounce = debounce; // for non-CommonJS users

// `options.autoselect` is either "first" or "only", pre-selecting the first
// entry either always or only if there's only a single result
// `options.delay` is the debounce delay in milliseconds
// `options.onSelect` is invoked whenever a suggestion is selected by the
// user and passed both the value and the respective DOM node
// `options.itemSelector` is used to identify suggestions in the HTML response
// `options.selectedClass` is the class assigned to selected items
function Simplete(field, options) {
	this.field = field = field.jquery ? field : $(field);

	this.options = options = options || {};
	options.delay = options.delay || 250;
	options.itemSelector = options.itemSelector || "li";
	options.selectedClass = options.selectedClass || "selected";

	this.form = field.closest("form");

	var container = $("<div />");
	this.results = $('<div class="suggestions hidden" />').appendTo(container);
	container.insertBefore(field).prepend(field);
	this.close();

	var self = this;
	field.on("focus input", debounce(options.delay, this.load.bind(this))).
		on("blur", function(ev) {
			if(!self.selecting) { // see "mousedown" handler
				self.close();
			}
			delete self.selecting;
		}).
		on("keydown", this.onKeydown.bind(this));
	this.results.on("mousedown click", options.itemSelector, function(ev) {
		// "blur" fires before "click", but after "mousedown" - so we use that
		// to avoid closing the dialog before the click could be registered
		if(ev.type === "mousedown") { // suppress blur
			self.selecting = true;
			return;
		}

		self.onSelect(ev, this);
	});
}

Simplete.prototype.onSelect = function(ev, node) {
	var el = $(node);
	var value = el.attr("data-value"); // TODO: configurable?
	if(value === undefined) { // XXX: YAGNI?
		value = el.text().trim();
	}

	this.field.val(value).focus();
	// move cursor to end
	var field = this.field[0];
	if(field.setSelectionRange) {
		field.setSelectionRange(value.length, value.length);
	}

	var notify = this.options.onSelect;
	if(notify) {
		notify(value, node);
	}

	this.close();
};

Simplete.prototype.onKeydown = function(ev) {
	var key = ev.keyCode;

	if(!this.active) {
		if(key === 40) { // down
			this.load();
		}
		return;
	}

	switch(key) {
		case 13: // Enter
			this.results.find("." + this.options.selectedClass).click(); // XXX: hacky?
			break;
		case 27: // ESC
			this.close();
			break;
		case 38: // up
			this.select(true);
			break;
		case 40: // down
			this.select();
			break;
		default:
			return; // avoid `.preventDefault` below
	}
	ev.preventDefault();
};

Simplete.prototype.load = function() {
	var form = this.form.addClass("pending");
	var req = $.ajax({
		type: form.attr("method") || "GET",
		url: form.attr("action"),
		data: form.serialize(),
		dataType: "html"
	});
	req.done(this.open.bind(this));
	//req.fail(function(xhr, status, err) {}) // TODO
	req.always(function() {
		form.removeClass("pending");
	});
};

Simplete.prototype.select = function(reverse) { // TODO: rename
	var cls = this.options.selectedClass;
	var item = this.results.find("." + cls);
	item = item.length ?
		item.removeClass(cls)[reverse ? "prev" : "next"]() :
		this.results.
			find(this.options.itemSelector)[reverse ? "last" : "first"]();
	item.addClass(cls);
};

Simplete.prototype.open = function(html) {
	this.results.html(html).removeClass("hidden");
	this.active = true;
	switch(this.options.autoselect) {
		case "first":
			this.select();
			break;
		case "only":
			if(this.results.find(this.options.itemSelector).length === 1) {
				this.select();
			}
			break;
	}
};

Simplete.prototype.close = function() {
	this.results.empty().addClass("hidden");
	delete this.active;
};
