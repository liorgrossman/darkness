//----------------------------------------------------------------------------------------------------------------------------------------------------
// User Settings Object
//----------------------------------------------------------------------------------------------------------------------------------------------------

var SettingsFactory = function() {

	// Constants
	var SAVE_SETTINGS_MIN_INTERVAL = 500;

	// Default settings for new users
	var DEFAULT_SETTINGS = {
		sites: {},
		global: {
			'defaultTheme': CONFIG.defaultTheme,
			'enableAt': 'always',
			'enabled': true
		}
	};

	// Class variables
	var _saveSettingsTimeout = null;
	var _settings = {};

	// Internal method: load settings from chrome.storage
	var _loadSettings = function(callback) {
		log('Loading settings from Chrome');
		var keysToGet = {
			'settings': DEFAULT_SETTINGS
		};
		chrome.storage.sync.get(keysToGet, function(store) {
			if (!store.settings) {
				logWarn("Reseting to default settings");
				store.settings = DEFAULT_SETTINGS;
			}
			_settings = store.settings;
			log('Settings loaded', _settings);
			if (callback) callback();
		});
	};

	// Internal method: save settings to chrome.storage
	var _saveSettings = function(callback) {
		// log('Saving settings to Chrome:', _settings);
		if (_saveSettingsTimeout) {
			// Start the count again
			clearTimeout(_saveSettingsTimeout);
		}

		_saveSettingsTimeout = setTimeout(function() {
			var keysToSet = {
				'settings': _settings
			};
			chrome.storage.sync.set(keysToSet, function() {
				// log('Settings saved', _settings);
				_saveSettingsTimeout = null;
				if (callback) callback();
			});
		}, SAVE_SETTINGS_MIN_INTERVAL);
	};

	// Constructor
	function Settings(callback) {
		_loadSettings(function() {
			_saveSettings(function() {
				callback();
			});
		});
	}

	//------------------------------------------------------------------------------------------------------------------------------------------------
	// Global objects and functions
	//------------------------------------------------------------------------------------------------------------------------------------------------
	Settings.prototype.global = {
		remove: function(key) {
			if (typeof(_settings['global'][key]) != 'undefined') delete _settings['global'][key];
			_saveSettings();
		},
		set: function(key, val) {
			_settings['global'][key] = val;
			_saveSettings();
		},
		get: function(key) {
			return _settings['global'][key];
		}
	};
	Settings.prototype.sites = {
		set: function(site, key, val) {
			if (!_settings['sites'][site]) return null;
			_settings['sites'][site][key] = val;
			_saveSettings();
		},
		get: function(site, key) {
			if (!_settings['sites'][site]) _settings['sites'][site] = {};
			return _settings['sites'][site][key];
		}
	};
	Settings.prototype.resetAllSettings = function(callback) {
		var oldSettings = settings.getAllSettingsClone();
		chrome.storage.sync.remove(['settings'], function() {
			if (chrome.runtime.lastError) {
				logError("Error deleting all settings:", chrome.runtime.lastError);
				callback(chrome.runtime.lastError, oldSettings);
			} else {
				log("Deleted all settings. Old settings were: ", oldSettings);
				// _loadSettings will reset all settings to default ones
				_loadSettings(function() {
					_saveSettings(function() {
						callback(null, oldSettings);
					});
				});
			}
		});
	};
	Settings.prototype.getAllSettingsClone = function() {
		return JSON.parse(JSON.stringify(_settings))
	};

	return Settings;
};

// Run the function that builds the class
var Settings = SettingsFactory();