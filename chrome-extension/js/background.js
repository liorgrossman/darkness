//----------------------------------------------------------------------------------------------------------------------------------------------------
// Main background script for Darkness
// The majority of business logic is here
// However, there are several helper scripts loaded before background.js, please refer to manifest.json -> "background"
//----------------------------------------------------------------------------------------------------------------------------------------------------
"use strict";

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Business logic of themes and websites
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Determine if the specified URL is a supported website
// If so, returns the site key (as defined in config), e.g. facebook, google, youtube, etc.
// If not, returns null
var getSiteKeyForUrl = function(url) {
	var urlParts = parseUrl(url);
	if (urlParts.protocol != 'http:' && urlParts.protocol != 'https:') {
		// log("Unsupported protocol " + urlParts.protocol + ", skipping");
		return null;
	}
	if (urlParts.port != '' && urlParts.protocol != ':80' && urlParts.protocol != ':443') {
		// log("Unsupported port " + urlParts.port + ", skipping");
		return null;
	}
	for (var siteKey in CONFIG.sites) {
		if (urlParts.hostname.match(CONFIG.sites[siteKey].hostRegExp)) {
			log("Supported hostname " + urlParts.hostname + " - recognized as " + siteKey);
			if (CONFIG.sites[siteKey].pathRegExp) {
				if (urlParts.pathname.match(CONFIG.sites[siteKey].pathRegExp)) {
					log("Supported path " + urlParts.pathname);
					return siteKey;
				}
			} else {
				var themeSupport = CONFIG.sites[siteKey].support;
				// Default: full support. Always skin this website
				var returnedSiteKey = siteKey;
				if (themeSupport == 'ask-developers') {
					// In production mode ask developers to join us, in development mode there's no need
					returnedSiteKey = (ENVIRONMENT == 'development') ? null : siteKey;
				} else if (themeSupport == 'in-development') {
					// In production mode don't skin this website, in development mode do
					returnedSiteKey = (ENVIRONMENT == 'development') ? siteKey : null;
				}
				log("Returning site key: " + returnedSiteKey);
				return returnedSiteKey;
			}
		}
	}
	// log("Unsupported hostname " + urlParts.hostname + ", skipping");
	return null;
};

// Determine which theme should be shown for the specified website, based in user preferences
// Set 'debug' to true for debug printing
// If 'canPreview' is true, it will allow pro themes to be displayed to non-pro users.
// If 'canPreview' is false, pro themes will not be displayed to non-pro users, but the default/none theme will be used instead.
// Returns null or a string: 'none', 'iceberg', 'material', etc.
var whichThemeForSite = function(debug, siteKey, canPreview) {
	var themeKey = null;
	if (CONFIG.sites[siteKey]) {
		var themeFromSettings = settings.sites.get(siteKey, 'theme');
		if (themeFromSettings) {
			// Has user settings
			if (debug) log('Which theme for ' + siteKey + '?' + ' User settings says ' + themeFromSettings);
			themeKey = themeFromSettings;
		} else {
			// No user settings, use default
			var defaultTheme = CONFIG.sites[siteKey].p ? 'none' : settings.global.get('defaultTheme');
			if (debug) log('Which theme for ' + siteKey + '?' + ' No user settings. Default says ' + defaultTheme);
			themeKey = defaultTheme;
		}
	} else {
		if (debug) log('Which theme for ' + siteKey + '?' + ' Site not recognized. No theme.');
		themeKey = null;
	}

	if (!canPreview) {
		// If non-pro user, and a theme is set
		if (stats.get('type') != 'p' && themeKey != null && themeKey != 'none') {
			if (CONFIG.sites[siteKey].p) {
				// Pro website? Set back to none
				if (debug) log('Preview mode off. Resetting theme back to none');
				themeKey = 'none';
			} else if (CONFIG.themes[themeKey].p) {
				themeKey = CONFIG.defaultTheme;
				// Pro theme? Set back to default theme
				if (debug) log('Preview mode off. Resetting theme back to default: ' + themeKey);
			}
		}
	}
	return themeKey;
};


// Replace the theme of the specified tab (website), send the CSS of the theme back to the client
var replaceThemeAndGetCss = function(tab, themeToDisplay, callback) {
	// Get site key, quit if unsupported website
	var siteKey = getSiteKeyForUrl(tab.url);
	if (!siteKey) return;

	// Save the theme to user settings
	settings.sites.set(siteKey, 'theme', themeToDisplay);

	// Make sure this theme is allowed for user
	var allowedTheme = whichThemeForSite(true, siteKey, false); // preview mode == false
	settings.sites.set(siteKey, 'theme', allowedTheme);

	// Send the theme's CSS back to the client (regardless of allowed or not)
	var cssFilename = getThemeCssFilename(siteKey, themeToDisplay);
	log("Calling readFileFromDisk for " + cssFilename);
	readFileFromDisk(true, cssFilename, function() {
		var cssContent = getPageCssContent(siteKey, themeToDisplay);
		callback(cssContent);
	});
};


// Set the specified theme for all websites
var setThemeForAllWebsites = function(theme) {
	for (var siteKey in CONFIG.sites) {
		settings.sites.set(siteKey, 'theme', theme);
	}
};


//----------------------------------------------------------------------------------------------------------------------------------------------------
// Messaging between background script <-> client side content script
//----------------------------------------------------------------------------------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		log("Message from " + (sender.tab ? "content script " + getTabName(sender.tab) : "the extension") + ":", request);
		switch (request.action) {

			// ===== USER SETTINGS =====

			case 'loadTheme':
				// Load the specified theme, then return the CSS that the client needs to inject to show that theme
				replaceThemeAndGetCss(sender.tab, request.theme, function(cssContent) {
					sendResponse({ 'cssContent': cssContent });
				});
				return true; // Don't call sendResponse automatically - tell Chrome we wish to call it later (async)

			case 'setThemeForAllWebsites':
				// Set the specified theme as the theme for all websites
				setThemeForAllWebsites(request.theme);
				sendResponse(settings.getAllSettingsClone());
				return false;

			case 'resetAllSettings':
				// Reset all user settings to default
				settings.resetAllSettings(function(err, oldSettings) {
					stats.resetAllStats(function(err, oldStats) {
						sendResponse(err, oldSettings);
					});
				});
				return true; // Don't call sendResponse automatically - tell Chrome we wish to call it later (async)

			case 'setEnableAt':
				// Set at what times of the day are themes enabled (currently not in use)
				settings.global.set('enableAt', request.time);
				sendResponse(settings.getAllSettingsClone());
				return false;

			case 'getSettings':
				// Get the most recent settings from the background script to the client side
				var siteKey = getSiteKeyForUrl(sender.tab.url);
				var themeKey = siteKey ? whichThemeForSite(true, siteKey, false) : 'none';
				sendResponse({ newSettings: settings.getAllSettingsClone(), newTheme: themeKey });
				return false;

				// ===== ANALYTICS =====

			case 'repToFunnel':
				// Report a step in the funnel of Darkness Pro
				repToFunnel(request.step, request.sku);
				return false;

			case 'repEventByUser':
				// Report an event by unique user
				repEventByUser(request.cat, request.act);
				return false;

			case 'repEvent':
				// Report an event
				repEvent(request.cat, request.act, request.lab);
				return false;

				// ===== MISC =====

			case 'openSettings':
				// Load the settings dialog, by injecting settings.js into the active tab
				injectSettingsScriptToTab(sender.tab);
				return false;

			case 'getAssetsForSettingsPanel':
				// Reload settings.css, settings.html etc., send them back to client for live replacement (useful when developing the settings panel)
				getAssetsForSettingsPanel(function(assets) {
					sendResponse(assets);
				});
				return true; // Don't call sendResponse automatically - tell Chrome we wish to call it later (async)
			case 'getPromo':
				// Get the promo settings
				var promo = Promo.get(request.spot);
				sendResponse(promo);
				return false;

				// ===== Payments =====

			case 'startPollingPayPal':
				// User just clicked "Pay with PayPal", start polling for PayPal response periodally
				// Notify the client side upon success, failure, or timeout
				Payments.startPollingPayPal(sendResponse, request.transactionId);
				return true; // Don't call sendResponse automatically - tell Chrome we wish to call it later (async)

			case 'payResponse':
				// Client side notifies background when PayPal / Google Payment is complete (either success or failure)
				// This will reload the user until it's pro (or timeout), let the client know the user type, and let the client send analytics
				Payments.reloadUserUntilPro(request.success, sendResponse);
				return true; // Don't call sendResponse automatically - tell Chrome we wish to call it later (async)

			case 'checkPromoCode':
				// Check the specified promo code with Darkness' servers
				Payments.checkPromoCode(request.promo, sendResponse);
				return true; // Don't call sendResponse automatically - tell Chrome we wish to call it later (async)

				// ===== Default =====

			default:
				// ERROR: Unsupported message
				logError('Message action not recognized: ' + request.action);
				return false;
		}
	});


//----------------------------------------------------------------------------------------------------------------------------------------------------
// Settings Panel Initialization (initialized lazily only when clicking the moon icon)
//----------------------------------------------------------------------------------------------------------------------------------------------------


// Load all the necessary assets (JS/CSS/HTML files) to display the settings panel
// This is useful for development, when you want those files to reload each time the moon icon is clicked
var getAssetsForSettingsPanel = function(callback) {
	// First, load all files from disk to cache
	var filesToPreload = ["js/settings.js", "style-css/cleanslate.css", "icons/css/fontello.css", "style-css/settings.css", "html/settings.html"];
	readFilesFromDisk(true, filesToPreload, function() {

		// Load all CSS files from cache and concatenate (extremely quick, from memory)
		var cssFiles = [readFileFromCache("style-css/cleanslate.css"), readFileFromCache("icons/css/fontello.css"), readFileFromCache(
			"style-css/settings.css")];
		var cssContent = cssFiles.join("\n");
		// Fix relative URLS in fontello.css to work correctly in extension
		cssContent = cssContent.replace(/\.\.\/font\/fontello/g, chrome.extension.getURL('icons/font/fontello'));

		// Load other files from cache (extremely quick, from memory)
		var htmlContent = readFileFromCache("html/settings.html");
		var noThemeCssContent = readFileFromCache("style-css/page.css");

		// Return all the assets
		// This should an exact match of "var ASSETS" in settings.js (client side)
		var args = { 'CSS': cssContent, 'CSSOFF': noThemeCssContent, 'HTML': htmlContent, 'TYPE': stats.get('type') };
		callback(args);
	});
};

// Load the specified file and replace all placeholders before injecting it to the client side
var getCodeForInjection = function(filename, replacements) {
	var code = readFileFromCache(filename);
	// Replace all placeholders
	for (var key in replacements) {
		if (replacements.hasOwnProperty(key)) {
			var val = replacements[key];
			// Encode \ to \\, ' to \', trim all unnecessary white space and line breaks
			val = val.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/[\t\n\r]+/g, ' ');
			// Replace @@PLACEHOLDER@@ with value
			code = code.replace('@@' + key + '@@', val);
		}
	}
	return code;
};

// Inject settings.js with its the variables to the tab. This is the starting point of showing the settings panel.
var injectSettingsScriptToTab = function(tab) {
	// Get the current site and theme
	var siteKey = getSiteKeyForUrl(tab.url);
	var themeKey = siteKey ? whichThemeForSite(true, siteKey, false) : null;
	if (!themeKey) return;

	log("Injecting settings script");
	// Load all stuff that needs to be inside "var ASSETS" in settings.js
	getAssetsForSettingsPanel(function(args) {
		// Add additional variables that are used by settings.js
		args['SKU'] = Payments.getSku();
		args['MACHINEID'] = stats.get('userId')
		args['ENVIRONMENT'] = ENVIRONMENT;
		args['THEME'] = themeKey;
		args['SITE'] = siteKey;
		args['SITE_SUPPORT'] = CONFIG.sites[siteKey].support;
		args['SETTINGS'] = JSON.stringify(settings.getAllSettingsClone());
		args['STATS'] = JSON.stringify(stats.getAllStatsClone());
		args['CONFIG'] = JSON.stringify(CONFIG);

		// Prepare settings.js for injection
		var code = getCodeForInjection("js/settings.js", args);

		// Inject jQuery
		chrome.tabs.executeScript(tab.id, {
			file: 'libs/jquery-2.2.3.min.js',
			runAt: 'document_start',
			allFrames: false // not in iframes
		}, function() {
			log("Loaded jQuery");
			// Inject settings.js
			chrome.tabs.executeScript(tab.id, {
				code: code,
				runAt: 'document_start',
				allFrames: false // not in iframes
			});
		});
	})
};


//----------------------------------------------------------------------------------------------------------------------------------------------------
// Page Initialization (initialized for all supported sites upon load)
//----------------------------------------------------------------------------------------------------------------------------------------------------

// The the CSS filename of the specified theme for the specified site
var getThemeCssFilename = function(siteKey, themeKey) {
	if (themeKey == 'none') {
		return 'themes-css/none.css';
	} else {
		return 'themes-css/' + siteKey + '-' + themeKey + '.css';
	}
};

// Get the CSS content for the specified page (page.css + theme CSS)
var getPageCssContent = function(siteKey, themeKey) {
	var cssFilename = getThemeCssFilename(siteKey, themeKey);
	var cssContent = "";
	cssContent += readFileFromCache("style-css/page.css") + "\n";
	cssContent += readFileFromCache(cssFilename) + "\n";
	return cssContent;
};

// Inject page.js to the tab to initialize Darkness
var injectPageJsToTab = function(tab, siteKey, themeKey) {
	log("Injecting loader script");

	// Analytics
	repToFunnel('pageview', Payments.getSku());
	if (Math.random() < 0.01) repEventByUser('pageviews-x100', siteKey + '-' + themeKey);

	// Load all the assets
	var htmlContent = readFileFromCache("html/page.html");
	var cssContent = getPageCssContent(siteKey, themeKey);
	var noThemeCssContent = readFileFromCache("style-css/page.css");

	// All the arguments required by page.js
	var code = getCodeForInjection("js/page.js", {
		'HTML': htmlContent,
		'CSS': cssContent,
		'CSSOFF': noThemeCssContent,

		'SETTINGS': JSON.stringify(settings.getAllSettingsClone()),
		'TYPE': stats.get('type'),
		'SITE': siteKey,
		'SITE_SUPPORT': CONFIG.sites[siteKey].support,

		'ENVIRONMENT': ENVIRONMENT,
		'MACHINEID': stats.get('userId')
	});

	// Inject it to page
	chrome.tabs.executeScript(tab.id, {
		code: code,
		runAt: 'document_start',
		allFrames: false // not to iframes inside
	});
};

// Initialize Darkness on the specified tab
// startUpRetroactiveLoad == true : Darkness retroactively initializes all tabs with supported sites that were already loaded in Chrome
// startUpRetroactiveLoad == false: a user actively navigates to a supported site when Darkness is on
var initializeTab = function(tab, startUpRetroactiveLoad) {
	var siteKey = getSiteKeyForUrl(tab.url);
	var themeKey = siteKey ? whichThemeForSite(true, siteKey, false) : null;

	if (!startUpRetroactiveLoad) {
		// Send analytics
		repVisitedTabAnonymously(tab);
		repTopThemes(siteKey, themeKey);
	}

	if (!themeKey) return log('Not initializing tab'); // Quit if site is not supported

	// Inject page.js to the tab
	injectPageJsToTab(tab, siteKey, themeKey);
};

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Initialization Helpers
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Called every time a tab is updated
var onTabUpdate = function(tabId, info, tab) {
	if (info.status == 'loading') {
		log("=========================");
		log("Tab updated: " + getTabName(tab) + ", status: " + info.status);
		initializeTab(tab, false);
	}
};

// Called every time a tab is replaced
var onTabReplace = function(addedTabId, replacedTabId) {
	logWarn("Tab " + replacedTabId + " replaced with " + addedTabId);
	chrome.tabs.get(addedTabId, function(tab) { return initializeTab(tab, false); });
};

// Listen to all tab events to recognize user navigation to a supported website
var addTabListeners = function() {
	if (!chrome.tabs.onUpdated.hasListener(onTabUpdate)) {
		chrome.tabs.onUpdated.addListener(onTabUpdate);
	}
	if (!chrome.tabs.onReplaced.hasListener(onTabReplace)) {
		chrome.tabs.onReplaced.addListener(onTabReplace);
	}
};

// Retroactively initialize all existing tabs (e.g. when Darkness is first installed)
var retroactivelyInitExistingTabs = function() {
	chrome.windows.getAll({
		populate: true
	}, function(windows) {

		// For all windows
		for (var i = 0; i < windows.length; i++) {
			var currentWindow = windows[i];

			// For all tabs in that window
			for (var j = 0; j < currentWindow.tabs.length; j++) {
				var currentTab = currentWindow.tabs[j];

				// Only initialize http or https pages, not ftp://, chrome:// etc.
				if (currentTab.url.match(/(http|https):\/\//gi)) {
					initializeTab(currentTab, true);
				}
			}
		}
	});
};

// Loads all assets (JS/CSS/HTML) from disk to cache
var loadAllAssetsToCache = function(debug, callback) {

	// Get keys of all supported sites & themes
	var themeKeys = [],
		siteKeys = [];
	for (var i in CONFIG.themes) themeKeys.push(CONFIG.themes[i].key);
	for (i in CONFIG.sites) siteKeys.push(CONFIG.sites[i].key);
	if (debug) {
		log("Found themes: ", themeKeys);
		log("Found sites: ", siteKeys);
	}

	// Which files should we load?
	var filesToLoad = ["js/page.js", "style-css/page.css", "html/page.html"];
	var alreadyIncluded = {};
	// Add the active theme for each website (e.g. facebook-iceberg, google-monokai, etc.)
	for (i in siteKeys) {
		var selectedTheme = whichThemeForSite(debug, siteKeys[i], false);
		var filename = getThemeCssFilename(siteKeys[i], selectedTheme);
		if (!alreadyIncluded[filename]) {
			alreadyIncluded[filename] = true;
			filesToLoad.push(filename);
		}
	}

	// Load all files from disk to cache
	readFilesFromDisk(debug, filesToLoad, function() {
		callback();
	});
};


// Initialize Darkness' configuration
var initializeConfiguration = function() {
	// Chrome runtime configuration setup
	chrome.runtime.setUninstallURL("http://lifehacklabs.org/darkness/extension/uninstalled");

	chrome.runtime.onInstalled.addListener(function(details) {
		log("Chrome invoked onInstalled: ", details);
		if (details && details.reason == "install") {
			chrome.tabs.create({ url: "http://lifehacklabs.org/darkness/extension/thank-you" }, function(tab) {
				log("Thank you page opened");
			});
		}
	});

	// Define which themes are free
	for (var i in CONFIG.themes) {
		var key = CONFIG.themes[i].key;
		CONFIG.themes[i].p = (key != 'iceberg');
	}
	for (i in CONFIG.sites) {
		var key = CONFIG.sites[i].key;
		CONFIG.sites[i].p = (key != 'google' && key != 'facebook');
	}
};


//----------------------------------------------------------------------------------------------------------------------------------------------------
//  Initialization
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Initialize the background script
var initializeBackgroundScript = function() {
	log("Loading background script in " + ENVIRONMENT + " mode");
	initializeConfiguration();

	// Initialize analytics: part 1
	initializeAnalyticsOnStart();

	// Load user settings & stats
	settings = new Settings(function() {
		stats = new Stats(function() {
			// On staging environment, reset to free user so it can be easily tested
			if (ENVIRONMENT == 'staging') settings.global.remove('override');

			// Load the user
			Payments.reloadUser(function() {

				// Initialize analytics: part 2
				initializeAnalyticsAfterLoad();

				// Load all assets (JS/HTML/CSS) from disk to cache
				loadAllAssetsToCache(true, function() {
					// Load darkenss to all future tabs
					addTabListeners();
					// Load darkness to all existing tabs
					retroactivelyInitExistingTabs();
				});

				setInterval(function() {
					// In dev/staging mode, reload all CSS/HTML files every second, to allow easy live development
					// without the need to reload the extension on every change
					if (ENVIRONMENT != 'production') {
						loadAllAssetsToCache(false, function() {});
					}
				}, 1000)
			});


		});
	});
};

initializeBackgroundScript();