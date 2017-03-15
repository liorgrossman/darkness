//----------------------------------------------------------------------------------------------------------------------------------------------------
// User Stats Object
//----------------------------------------------------------------------------------------------------------------------------------------------------

// A high-performance wrapper for chrome.storage.sync for storing user statistics
var StatsFactory = function() {

	// Constants
	var SAVE_STATS_MIN_INTERVAL = 500; // 500ms

	// Generate a random 10-character alphanumeric string
	var getRandomId = function() {
		var randomPool = new Uint8Array(32); // 8 * 32 = 256 bits token
		crypto.getRandomValues(randomPool);
		var hex = '';
		for (var i = 0; i < randomPool.length; ++i) {
			hex += randomPool[i].toString(16);
		}
		// e.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
		return hex.substr(0, 10); // e.g. db18458e27
	};

	// Default stats for new users
	var DEFAULT_STATS = {
		// Date and version of first installation
		'installVer': chrome.runtime.getManifest().version,
		'installDate': (new Date()).getTime(),

		// User type: (r)egular or (p)ro
		'type': 'r',

		// userId (aka machineId) is used to anonymously identify the machine on operations like PayPal payments
		'userId': getRandomId(),

		// analyticsId is used to anonymously identify *unique* users when reporting analytics events
		'analyticsId': getRandomId()
	};

	// Class variables
	var _saveStatsTimeout = null;
	var _stats = {};


	// Internal method: save stats to cookie
	var _saveStatsToCookie = function(callback) {
		var statsToSave = {
			analyticsId: _stats.analyticsId,
			installDate: _stats.installDate,
			installVer: _stats.installVer,
			type: _stats.type
		}
		var statsJson = JSON.stringify(statsToSave);
		var cookie = {
			url: "http://lifehacklabs.org",
			name: "darkness_stats",
			value: statsJson,
			domain: "lifehacklabs.org",
			path: "/",
			expirationDate: 2051222400,
			/* Year 2035 */
		}
		chrome.cookies.set(cookie, function(cookieSet) {
			if (cookieSet) {
				log("Cookie set: ", cookieSet);
			} else {
				logWarn("Cookie set error: ", chrome.runtime.lastError);
			}
			if (callback) callback();
		})

	}

	// Internal method: load stats from chrome.storage
	var _loadStats = function(callback) {
		log('Loading stats from Chrome');
		var keysToGet = {
			'stats': DEFAULT_STATS
		};
		chrome.storage.sync.get(keysToGet, function(store) {
			// Uncomment this to test new user:
			// store = {};

			var isNewUser = false;
			if (!store || !store.stats || !store.stats.userId) {
				logWarn("Reseting to default stats:", DEFAULT_STATS);
				store.stats = DEFAULT_STATS;
				log('First-time user, set user ID to ' + store.stats['userId']);
				isNewUser = true;

			} else {
				log('Existing user with ID ' + store.stats['userId']);

			}
			_stats = store.stats;
			log('Stats loaded', _stats);
			if (isNewUser) {
				repEventByUser('users', 'new-users');
			}
			_saveStatsToCookie(function() {
				if (callback) callback();
			});
		});
	};

	// Internal method: Save stats to chrome.storage
	var _saveStats = function(callback) {
		// log('Saving stats to Chrome:', _stats);
		if (_saveStatsTimeout) {
			// Start the count again
			clearTimeout(_saveStatsTimeout);
		}

		_saveStatsTimeout = setTimeout(function() {
			var keysToSet = {
				'stats': _stats
			};
			chrome.storage.sync.set(keysToSet, function() {
				// log('Stats saved', _stats);
				_saveStatsTimeout = null;
				if (callback) callback();
			});
		}, SAVE_STATS_MIN_INTERVAL);
	};

	// Constructor
	function Stats(callback) {
		_loadStats(function() {
			_saveStats(function() {
				callback();
			});
		});
	}

	//------------------------------------------------------------------------------------------------------------------------------------------------
	// Global objects and functions
	//------------------------------------------------------------------------------------------------------------------------------------------------
	Stats.prototype.set = function(key, val) {
		_stats[key] = val;
		_saveStats();
		if (key == 'type') {
			_saveStatsToCookie();
		}
	};

	Stats.prototype.get = function(key) {
		// Migration of older users without analyticsId: create analyticsId on the fly
		if (key == 'analyticsId' && typeof(_stats[key]) == 'undefined') {
			Stats.prototype.set(key, getRandomId());
		}
		return _stats[key];
	};

	Stats.prototype.remove = function(key) {
		if (typeof(_stats[key]) != 'undefined') delete _stats[key];
		_saveStats();
	};

	Stats.prototype.resetAllStats = function(callback) {
		var oldStats = stats.getAllStatsClone();
		chrome.storage.sync.remove(['stats'], function() {
			if (chrome.runtime.lastError) {
				logError("Error deleting all stats:", chrome.runtime.lastError);
				callback(chrome.runtime.lastError, oldStats);
			} else {
				log("Deleted all stats. Old stats were: ", oldStats);
				// _loadSettings will reset all settings to default ones
				_loadStats(function() {
					_saveStats(function() {
						callback(null, oldStats);
					});
				});
			}
		});
	};

	Stats.prototype.getAllStatsClone = function() {
		return JSON.parse(JSON.stringify(_stats))
	};

	return Stats;
};

// Run the function that builds the class
var Stats = StatsFactory();