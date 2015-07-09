exports.ajax = function(context) {
	return function(settings) {
		return {
			done: function(fn) {
				setTimeout(function() {
					fn(context.results);
				}, 1);
			},
			always: function(fn) {
				setTimeout(function() {
					fn();
				}, 1);
			}
		}
	};
};
