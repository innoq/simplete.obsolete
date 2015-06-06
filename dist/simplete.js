var simplete =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint vars: true, node: true, white: true */
	"use strict";

	var $ = __webpack_require__(1);
	var debounce = __webpack_require__(2);

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
		this.field.attr("autocomplete", "off");

		this.options = options = options || {};
		options.delay = options.delay || 250;
		options.itemSelector = options.itemSelector || "li";
		options.selectedClass = options.selectedClass || "selected";

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

				 // support for links -- XXX: special-casing
				var link = item.children();
				if(link.length === 1 && link.is("a")) {
					item = link[0].click(); // XXX: hacky?
					return;
				}

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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = jQuery;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// adapted from StuffJS (https://github.com/bengillies/stuff-js)
	module.exports = function(delay, fn) {
		var timer;
		return function() {
			var self = this;
			var args = arguments;
			if(timer) {
				clearTimeout(timer);
				timer = null;
			}
			timer = setTimeout(function() {
				fn.apply(self, args);
				timer = null;
			}, delay);
		};
	};


/***/ }
/******/ ]);