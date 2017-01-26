//----------------------------------------------------------------------------------------------------------------------------------------------------
// Set the environment
//----------------------------------------------------------------------------------------------------------------------------------------------------
var ENVIRONMENT = 'development';

// Important - don't touch this:
if (chrome.runtime.id == 'imilbobhamcfahccagbncamhpnbkaenm') ENVIRONMENT = 'production'; // Chrome Web Store version

// Local testing versions
if (chrome.runtime.id == 'koobfbhnpdijhobcdllfkmlgngbpgjep') ENVIRONMENT = 'development'; // Local version (development)
if (chrome.runtime.id == 'blbbhmfjigkmkkobabbgppbhaaeehfjn') ENVIRONMENT = 'staging'; // Local testing version before deploying (staging)

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Global vars
//----------------------------------------------------------------------------------------------------------------------------------------------------
var PRINT_LOGS = true;
var settings; // An object with user settings (e.g. themes selected)
var stats; // An object with user stats (e.g. install time, install version)

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Helper functions
//----------------------------------------------------------------------------------------------------------------------------------------------------
// Get tab name: helper method for debug prints
var getTabName = function(tab) {
	return '"' + tab.url.substr(0, 35).replace('https://', '').replace('http://', '') + '...' + '"';
};

// Logging helpers
var log = function() {
	if (PRINT_LOGS) console.log.apply(console, arguments);
};
var logWarn = function() {
	if (PRINT_LOGS) console.warn.apply(console, arguments);
};
var logError = function() {
	if (PRINT_LOGS) console.error.apply(console, arguments);
};
var logTime = function() {
	if (PRINT_LOGS) console.time.apply(console, arguments);
};
var logTimeEnd = function() {
	if (PRINT_LOGS) console.timeEnd.apply(console, arguments);
};

// Parse the specified URL into host, path, hash, etc.
var parseUrl = function(url) {
	var parser = document.createElement('a');
	parser.href = url;
	return parser;
	// e.g. {protocol: "http:", host: "abc.com:3000", hostname: "abc.com", port: "3000", pathname: "/path/", search: "?search=test", hash: "#hash"}
};

// Send an HTTP POST request expecting a JSON response
var sendHttpPostRequest = function(url, params, callback) {
	var kvps = [];
	for (var k in params) {
		var v = params[k];
		kvps.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
	}
	var paramsString = kvps.join("&");

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var resp = null;
				// JSON.parse does not evaluate the attacker's scripts.
				try {
					var resp = JSON.parse(xhr.responseText);
				} catch (e) {
					callback("Error parsing response as JSON: " + e.toString() + "\nResponse is: " + xhr.responseText.toString());
				}
				if (resp) callback(null, resp);
			} else {
				callback("Status " + xhr.status + ", Text: " + xhr.statusText + ", Response: " + xhr.responseText);
			}
		}
	};
	
	xhr.send(paramsString);
};

// Hashing function: from string to 32bit signed integer
var hashStringToSignedInt32 = function(str) {
	var hash = 0,
		i, chr, len;
	if (str.length === 0) return hash;
	for (i = 0, len = str.length; i < len; i++) {
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit signed integer
	}
	return hash;
};