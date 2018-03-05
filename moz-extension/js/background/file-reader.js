//----------------------------------------------------------------------------------------------------------------------------------------------------
// File reading and caching
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Cache for CSS/HTML files (used only in production, in development/staging the files are read from disk)
var FILE_CACHE = [];

// Read a file inside the Darkness directory using a local HTTP GET request
// Specify a filename in the format: themes/google-iceberg.css
var _readFileUsingHttp = function(debug, filename, callback) {
	// Return from cache if found (production only)
	if (ENVIRONMENT == 'production' && (typeof(FILE_CACHE[filename]) != 'undefined')) {
		return callback(null, FILE_CACHE[filename]);
	}

	// Convert 'themes/google-iceberg.css' to 'chrome-extension://imilbobhamcfahccagbncamhpnbkaenm/themes/facebook-iceberg.css'
	var url = chrome.extension.getURL(filename) + '?v=' + (new Date()).getTime();
	var httpRequest = new XMLHttpRequest();
	var startTime = (new Date()).getTime();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == XMLHttpRequest.DONE) {
			var elapsed = (new Date()).getTime() - startTime;
			if (httpRequest.status == 200) {
				if (debug) log("GET request for " + filename + " returned " + httpRequest.responseText.length + "b, took " + elapsed + "ms");
				callback(null, httpRequest.responseText);
			} else {
				if (debug) logError("GET request for " + filename + " had error: ", httpRequest.status);
				callback(httpRequest.status);
			}
		}
	};
	httpRequest.open('GET', url);
	httpRequest.send();
};

// Read a single file from disk (or from cache in production mode), save it to cache
var readFileFromDisk = function(debug, filename, callback) {
	_readFileUsingHttp(debug, filename, function(err, content) {
		if (err) {
			callback(err);
		} else {
			FILE_CACHE[filename] = content;
			callback(null, content)
		}
	});
};


// Read several files from disk (or from cache in production mode), save them to cache
var readFilesFromDisk = function(debug, files, cb) {
	if (files.length == 0) {
		return cb();
	}
	// Pick 1 file every time and read it
	var file = files.shift();
	readFileFromDisk(debug, file, function() {
		// Recursion
		readFilesFromDisk(debug, files, cb);
	});
};


// Read a single file from cache (return an empty string if not found in cache)
var readFileFromCache = function(filename) {
	if (typeof(FILE_CACHE[filename]) == 'undefined') {
		logError('Cannot find file ' + filename + ' in cache');
		return "";
	}
	var val = FILE_CACHE[filename];
	return val;
};