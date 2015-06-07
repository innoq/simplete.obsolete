/*jslint vars: true, node: true, browser: true, white: true */
"use strict";

// required for PhantomJS v1.9
if(!Function.prototype.bind) {
	Function.prototype.bind = function(ctx) {
		var fn = this;
		return function() {
			return fn.apply(fn, arguments);
		}
	}
}
