//----------------------------------------------------------------------------------------------------------------------------------------------------
// Google Analytics (for production, not activated in Developer Edition)
// This is used to collect anonymous analytics to understand how Darkness is used by users, and further improve the product
// No user identifying info is sent, and no data is ever sold
//----------------------------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Initialization
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Initializer #1: right when background script is loaded
var initializeAnalyticsOnStart = function() {
	// Not on developer edition
	if (ENVIRONMENT != 'development') {

		// Google Universal Analytics loader
		(function(i, s, o, g, r, a, m) {
			i['GoogleAnalyticsObject'] = r;
			i[r] = i[r] || function() {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date();
			a = s.createElement(o),
				m = s.getElementsByTagName(o)[0];
			a.async = 1;
			a.src = g;
			m.parentNode.insertBefore(a, m)
		})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga'); // Note: https protocol here
		ga('create', 'UA-76391501-2', 'auto');

		// Initialize analytics to work properly in a background script
		ga('set', 'checkProtocolTask', function() {}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
		ga('require', 'displayfeatures');

		// Set a different campaignSource for staging and for production (to avoid polluting the production analytics)
		// No analytics are sent in Darkness Developer Edition
		ga('set', 'campaignSource', (ENVIRONMENT == 'staging' ? 'dev' : 'prod'));
	}
};

// Initializer #2: after all settings are loaded
var initializeAnalyticsAfterLoad = function() {
	// Anonymously report extension is alive every 24h
	repUserActive();
	setInterval(function() { repUserActive() }, 1000 * 60 * 5); // 5 minutes

	// Anonymously report current domain randomally. No user identifying info is sent
	setInterval(function() { repCurrentDomainAnonymously() }, 1000 * 60); // 1 minute
};

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Private helpers methods
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Print analytics debug prints?
var DEBUG_ANALYTICS = false;

// Private helper method: report a pageview to Google Analytics
var _reportPageview = function(path, title) {
	var analyticsLoaded = typeof(ga) != 'undefined';
	if (DEBUG_ANALYTICS) logWarn((analyticsLoaded ? 'Sending pageview:' : 'Not sending pageview:'), path);
	if (analyticsLoaded) {
		ga('send', { hitType: 'pageview', page: path, title: title });
	}
};

// Private helper method: report an event to Google Analytics
var _reportEvent = function(category, action, label, value) {
	var analyticsLoaded = typeof(ga) != 'undefined';
	if (DEBUG_ANALYTICS) logWarn((analyticsLoaded ? 'Sending event:' : 'Not sending event:'), category, action, label, value);
	if (analyticsLoaded) {
		if (ga) ga('send', 'event', category, action, label, value);
	}
};

// Given the specified install date, how many days have passed since the user installed Darkness?
var getDaysSinceInstall = function(installDate, humanReadable) {
	if (typeof(installDate) != 'number') return "Unknown";
	var timeNow = (new Date()).getTime();
	var passedMs = timeNow - installDate;
	if (passedMs < 0) return "Negative";
	var passedDays = passedMs / 1000 / 3600 / 24;
	if (humanReadable) {
		if (passedDays < 3) {
			return Math.round(passedDays * 10) / 10;
		} else {
			return Math.round(passedDays);
		}
	} else {
		var passedDaysRounded = Math.round(passedDays * 100) / 100;
		return passedDaysRounded;
	}
};

// Private helper method: report that a user is active anonymously (used to count daily active users)
var _reportUserActiveInternal = function() {
	repEventByUser('users', 'daily-actives');
	if (stats.get('type') == 'p') repEventByUser('users', 'daily-actives-pro');

	var installDate = stats.get('installDate') || 0;
	var daysSinceInstall = getDaysSinceInstall(installDate, true);
	
	if (stats.get('type') == 'p') {
		repEvent('users', 'user-days-pro', daysSinceInstall);
	}
	else {
		repEvent('users', 'user-days-free', daysSinceInstall);
	}

	stats.set('lastDailyReport', (new Date()).getTime());
};

// Private helper method: report a statistic anonymously (no user identifying info is sent, not even the random ID)
var _reportAnonymousStats = function(action, label) {
	_reportEvent("stats", action, label);
};

// Private helper method: get a host (domain) from a URL
var _getHostByUrl = function(url) {
	var url = parseUrl(url);
	var hostname = url.hostname;
	var googleRegExp = new RegExp(GOOGLE_HOST_REGEXP, 'i');
	if (hostname.match(googleRegExp)) {
		hostname = 'Google';
	}
	return hostname;
};

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Public methods
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Statistically and anonymously report the top visited domains by # of pageviews (so we know what sites to support next)
var repVisitedTabAnonymously = function(tab) {
	var EVERY_N_CALLS = 1000; // Send a statistical sample
	if (Math.random() * EVERY_N_CALLS <= 1) {
		if (tab) {
			var host = _getHostByUrl(tab.url);
			_reportAnonymousStats('top-sites-visited-all', host); // No user identifying info is sent
		}
	}
};

// Statistically and anonymously report the top visited domains by time spent (so we know what sites to support next)
var repCurrentDomainAnonymously = function() {
	var EVERY_N_CALLS = 1000; // Send a statistical sample
	if (Math.random() * EVERY_N_CALLS <= 1) {
		// Get the domain of the current tab
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			if (tabs[0]) {
				var tab = tabs[0];
				var host = _getHostByUrl(tab.url);
				_reportAnonymousStats('top-sites-time-all', host); // No user identifying info is sent
			}
		});
	}
};

// Report statistics for which themes are most popular for each website
var repTopThemes = function(siteKey, themeKey) {
	var EVERY_N_CALLS = 100; // Send a statistical sample
	if (Math.random() * EVERY_N_CALLS <= 1) {
		_reportAnonymousStats('top-themes-x100b-' + siteKey, themeKey); // No user identifying info is sent
	}
};

// Send keep-alive to analytics every 24 hours (to know how many daily active users we have)
var repUserActive = function() {
	var lastDailyReport = stats.get('lastDailyReport');
	if (lastDailyReport) {
		var elapsed = (new Date()).getTime() - lastDailyReport;
		var elapsedHours = elapsed / 3600 / 1000;
		elapsedHours = Math.floor(elapsedHours * 1000) / 1000; // Round for display
		if (elapsedHours >= 24) {
			log("More than 24h (" + elapsedHours + "h) since last report, reporting now");
			_reportUserActiveInternal();
		} else {
			log("Less than 24h (" + elapsedHours + "h) since last report, not reporting");
		}
	} else {
		log("User never reported, report now");
		repEventByUser('users', 'installed');
		_reportUserActiveInternal();
	}
};

// Report an event
var repEvent = function(category, action, label) {
	_reportEvent(category, action, label);
};

// Report an event, use the random analyticsId to find how many *unique* users invoked an event
var repEventByUser = function(category, action) {
	_reportEvent(category, action, stats.get('analyticsId')); // Dedicated random ID that is not associated with anything else
};

// Report a step in the funnel of Darkness Pro
var repToFunnel = function(step, sku) {
	var folder = "pro-funnel";
	if (sku != "1") {
		folder = "pro-funnel-" + sku;
	}
	_reportPageview('/' + folder + '/' + step, step);
};