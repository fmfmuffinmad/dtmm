require("@babel/register")({
	presets: ["@babel/preset-env"]
});

module.exports = require('./dtmm/tracker.js/index.js');  