/*jslint vars: true, browser: true, white: true */
/*global jQuery */
(function($) {

"use strict";

// post-process server responses in order to simulate dynamic server responses
$.ajaxSetup({ dataFilter: filterResults });
// simulate network latency
if(document.location.hostname === "localhost") {
	console.warn("[Simplete demo] simulating network latency");
	$.ajax = simulateLatency($.ajax);
}

$(".autocomplete").each(function(i, field) {
	simplete(field);
});

// inevitably, this is tightly coupled to the server response
function filterResults(html) {
	var wrapper = $("<div />").html(html);
	var lists = wrapper.find("ul");
	var error = wrapper.find("p.alert");

	var query = this.url.split("query=")[1]; // XXX: brittle
	query = decodeURIComponent(query.toLowerCase()).
		replace(/\+/g, " "); // XXX: should not be necessary
	if(query) {
		// discard non-matching suggestions
		lists.children().each(function(i, suggestion) {
			suggestion = $(suggestion);
			if(suggestion.text().toLowerCase().indexOf(query) === -1) {
				suggestion.remove();
			}
		});
		// discard empty lists (incl. category headings)
		lists.filter(":not(:has(li))"). // `:empty` includes text nodes
			prev("h3").remove().end().
			remove();
	}
	// discard placeholder element (normally this distinction would happen
	// server-side)
	var placeholder = lists.children().length ? error : lists;
	placeholder.remove();

	return wrapper.html();
}

function simulateLatency(ajax) {
	return function() {
		var lag = Math.random() * 1000 / 2;
		var req = ajax.apply(this, arguments);

		["done", "always"].forEach(function(prop) {
			var handler = req[prop];
			req[prop] = function(fn) {
				return handler.call(req, fn && defer(fn, lag));
			};
		});

		return req;
	};
}

function defer(fn, delay) {
	return function() {
		var self = this;
		var args = arguments;
		setTimeout(function() {
			fn.apply(self, args);
		}, delay);
	};
}

}(jQuery));
