module.exports = {
	entry: "./index.js",
	output: {
		// expose as global variable
		libraryTarget: "var",
		library: "simplete",
		// bundle location
		path: __dirname + "/dist",
		filename: "simplete.js"
	},
	externals: { // excluded from bundle
		"jquery": "jQuery"
	}
};
