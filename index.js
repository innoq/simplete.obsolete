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
// `options.minLength` is the minimum number of characters users must enter
// before a query is triggered
// `options.delay` is the debounce delay in milliseconds
// `options.onSelect` is invoked whenever a suggestion is selected by the
// user and passed both the value and the respective DOM node
// `options.itemSelector` is used to identify suggestions in the HTML response
// `options.selectedClass` is the class assigned to selected items
function Simplete(field, options) {
	this.field = field = field.jquery ? field : $(field);
	this.field.attr("autocomplete", "off");

	this.options = options = options || {};
	options.delay = options.delay || 250;
	options.minLength = options.minLength || 0;
	options.itemSelector = options.itemSelector || "li";
	options.selectedClass = options.selectedClass || "selected";

	var container = $('<div class="simplete" />');
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

		return self.onSelect(ev, this);
	});
}

Simplete.prototype.onSelect = function(ev, node) {
	// support for links -- XXX: special-casing
	var target = $(ev.target);
	if(target.is("a")) { // user clicked directly on link
		if(target.attr("href") !== undefined) {
			return; // let browser handling kick in
		}
	} else { // check whether selected item contains exactly one link
		var link = $("a", node);
		if(link.length === 1 && link.attr("href") !== undefined) {
			link[0].click(); // ends up triggering `onSelect` again
			return;
		}
	}

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
	var key = ev.which;

	if(!this.active) {
		if(key === 40) { // down
			this.load();
		}
		return;
	}

	switch(key) {
		case 13: // Enter
			var item = this.results.find("." + this.options.selectedClass);
			item.click(); // XXX: hacky?
			break;
		case 27: // ESC
			this.close();
			break;
		case 38: // up
			this.cycle(true);
			break;
		case 40: // down
			this.cycle();
			break;
		default:
			return; // avoid `.preventDefault` below
	}
	ev.preventDefault();
};

Simplete.prototype.load = function() {
	var field = this.field;
	if(this.field.val().length < this.options.minLength) {
		return;
	}
	var form = field.closest("form").addClass("pending");

	var method = field.attr("data-formmethod");
	var uri = field.attr("data-formaction");
	var scope = field.attr("data-scope") === "self" ? field : form;

	var req = $.ajax({
		type: method || form.attr("method") || "GET",
		url: uri || form.attr("action"),
		data: scope.serialize(),
		dataType: "html"
	});
	req.done(this.open.bind(this));
	//req.fail(function(xhr, status, err) {}) // TODO
	req.always(function() {
		form.removeClass("pending");
	});
};

Simplete.prototype.cycle = function(reverse) {
	var cls = this.options.selectedClass;
	var results = this.results.find(this.options.itemSelector);
	var item = results.filter("." + cls).removeClass(cls);

	var index = 0;
	if(item.length) {
		index = results.index(item);
		index = index === -1 ? 0 : index + (reverse ? -1 : 1);
	} else if(reverse) {
		index = -1;
	}
	item = results.eq(index).addClass(cls);
};

Simplete.prototype.open = function(html) {
	this.results.html(html).removeClass("hidden");
	this.active = true;
	switch(this.options.autoselect) {
		case "first":
			this.cycle();
			break;
		case "only":
			if(this.results.find(this.options.itemSelector).length === 1) {
				this.cycle();
			}
			break;
	}
};

Simplete.prototype.close = function() {
	this.results.empty().addClass("hidden");
	delete this.active;
};
