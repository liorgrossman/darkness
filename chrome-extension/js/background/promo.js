//----------------------------------------------------------------------------------------------------------------------------------------------------
// Payment handler
//----------------------------------------------------------------------------------------------------------------------------------------------------
"use strict";

var PromoFactory = function() {

	// Global vailables
	var _appName = null;
	var _promoConfig = { lastLoaded: 0, spots: {} };

	// Constructor
	function Promo(appName) {
		_appName = appName;
		_loadFromStorage(function(success) {
			_retreivePromoConfig();
		});

	}

	// Load the promo config from storage to _promoConfig
	var _loadFromStorage = function(callback) {
		chrome.storage.local.get('promoConfig', function(results) {
			if (results['promoConfig']) {
				_promoConfig = results['promoConfig'];
				log("Found promo config in storage:", _promoConfig)
				callback(true);
			} else {
				log("Didn't find promo config in storage");
				callback(false);
			}
		})
	}

	// Update _promoConfig with the specific object and save it to storage
	var _setConfigAndsaveToStorage = function(json) {
		_promoConfig = json;
		_promoConfig.lastLoaded = (new Date()).getTime();
		chrome.storage.local.set({ 'promoConfig': _promoConfig }, function(results) {
			if (chrome.runtime.lastError) {
				logError("Error while saving promoConfig to storage:", chrome.runtime.lastError);
			}
		})
	}


	// Send an Ajax GET request
	var _sendHttpGetRequest = function(debug, url, callback) {
		var httpRequest = new XMLHttpRequest();
		var startTime = (new Date()).getTime();
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState == XMLHttpRequest.DONE) {
				var elapsed = (new Date()).getTime() - startTime;
				if (httpRequest.status == 200) {
					if (debug) log("GET request for " + url + " returned " + httpRequest.responseText.length + "b, took " + elapsed + "ms");
					callback(null, httpRequest.responseText);
				} else {
					if (debug) logEror("GET request for " + url + " had error: ", httpRequest.status);
					callback(httpRequest.status);
				}
			}
		};
		httpRequest.open('GET', url);
		httpRequest.send();
	};

	// Retreive the promo config remotely using Ajax
	var _retreivePromoConfig = function() {
		var url = "https://s3.amazonaws.com/lifehacklabs/common/configuration/promo.json";
		_sendHttpGetRequest(true, url, function(err, response) {
			if (err) {
				return logError("Error requesting promo.json:", err);
			}
			var json = null;
			try {
				json = JSON.parse(response);
			} catch (e) {
				return logError("Cannot parse promo.json response:", response);
			}
			log("Got promo:", json);
			_setConfigAndsaveToStorage(json);

		});
	}

	// Helper method: parse the date format 2017-03-16__06-59-11 as UTC time
	var _parseDateAsUtc = function(str) {
		var parts = str.replace('__', '-').split('-');
		var timestamp = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
		if (isNaN(timestamp)) {
			throw "String " + str + " cannot be parsed as a date";
		}
		var date = new Date(timestamp);
		return date;
	}

	// Get the promo config for the specific spot, for the current time
	Promo.prototype.get = function(spot) {
		log("Asking for promo for " + spot);
		var dates = _promoConfig.spots[spot];
		if (!dates) {
			log("Promo for " + spot + " not found");
			return null;
		}

		var currentConfig = dates['default'];

		var dateKeys = Object.keys(dates);
		for (var i in dateKeys) {
			var dateKey = dateKeys[i];
			var dateVal = dates[dateKey];
			if (dateKey != 'default') {
				var parts = dateKey.split(' to ');
				if (parts.length != 2) {
					logError("Invalid key:", dateKey);
				}
				try {
					var startDate = _parseDateAsUtc(parts[0]);
					var endDate = _parseDateAsUtc(parts[1]);
					var nowDate = new Date();

					var startTs = startDate.getTime();
					var endTs = endDate.getTime();
					var nowTs = nowDate.getTime();
					log("From", startDate.toISOString(), "to", endDate.toISOString(), "- now is", nowDate.toISOString());
					if (nowTs >= startTs && nowTs <= endTs) {
						log("Found date match!");
						return dateVal;
					} else {
						log("No match");
					}
				} catch (e) {
					logError("Error parsing dates:", e);
				}


			}
			console.log(dateKey);
		}
		return currentConfig;
	};

	// Important:
	return Promo;

}

// Get the construcor
var PromoConstructor = new PromoFactory();

var Promo = new PromoConstructor(CONFIG.appName);