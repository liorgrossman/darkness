//----------------------------------------------------------------------------------------------------------------------------------------------------
// This minimal JS is the Darkness Loader.
// It is injected to pages on supported websites only, upon page load, to load the most basic Darkness functionality.
// It doesn't include the settings panel or any 3rd party libraries like jQuery to avoid a performance overhead.
//----------------------------------------------------------------------------------------------------------------------------------------------------
"use strict";

if (!DarknessLoader) { // Don't load twice

	// Global function to assist with setting YouTube internal theme to be Dark/Light
	// We use this when loading the page (in page.js), and when the user switches theme (in settings.js)
	var DarknessSetYouTubeTheme = function(THEME, isUserTriggered) {
		// Helper function
		var getCookie = function(name) {
			var value = "; " + document.cookie;
			var parts = value.split("; " + name + "=");
			if (parts.length == 2) return parts.pop().split(";").shift();
		};

		// Check for <HTML style> to determine whether it's the old or new YouTube design
		const htmlStyle = document.documentElement.getAttribute("style");
		if (!htmlStyle || !htmlStyle.indexOf('Roboto') == -1) {
			return; // Old YouTube design, don't run this function
		}

		const noTheme = THEME == 'none';
		if (!isUserTriggered && noTheme) {
			// If user selected 'None', and it's just a page refresh, don't do anything
			// This is in order to allow users to use YouTube's built-in dark theme, without reverting it to light theme
			// on every pageview.
			return;
		}

		// Update YouTube's PREF (preferences) cookie to set YouTube Theme to Dark/Light
		// If no dark theme is selected, set f6=1004 (YouTube built-in light theme)
		// If dark theme is selected, set f6=1404 (YouTube built-in dark theme)
		var pref = getCookie('PREF') || ""; // Old cookie value
		var newPref = ""; // New cookie value
		const YT_THEME_NUMBER = noTheme ? '1004' : '1404';
		if (pref.match(/f6=\d+/)) {
			// f6 exists in PREF cookie, modify the f6
			newPref = pref.replace(/f6=\d+/, 'f6=' + YT_THEME_NUMBER);
		}
		else {
			if (pref != "") {
				// PREF cookie exists but no f6 found, add f6
				newPref = pref + "&f6=" + YT_THEME_NUMBER;
			} else {
				// PREF cookie doesn't exist, set it
				newPref = "f6=" + YT_THEME_NUMBER;
			}
		}
		var expires = new Date();
		expires.setTime(Date.now() + (365*24*3600*1000)); // 1 year
		var cookieSettingString = "PREF=" + newPref + ";domain=youtube.com;path=/;expires=" + expires.toUTCString();
		document.cookie = cookieSettingString;

		// Update the DOM elements to immediately apply YouTube Theme to be Dark/Light
		// <HTML>
		if (noTheme) {
			document.documentElement.removeAttribute("style");
			document.documentElement.setAttribute("style", "font-size: 10px;font-family: Roboto, Arial, sans-serif; background-color: #fafafa;");
		} else {
			document.documentElement.setAttribute("style", "font-size: 10px; font-family: Roboto, Arial, sans-serif; background-color: rgb(19, 19, 19);");
		}
		// <BODY>
		if (document.body) {
			if (noTheme) {
				document.body.removeAttribute("dark");
			} else {
				document.body.setAttribute("dark", "true");
			}
		}
	
		// <ytd-app> - wrapper of the entire app
		var ytdApps = document.getElementsByTagName("ytd-app");
		if (ytdApps && ytdApps.length == 1) {
			if (noTheme) {
				ytdApps[0].setAttribute("style", "--ytd-app-scroll-offset:0; --yt-swatch-primary:rgb(255,255,255); --yt-swatch-primary-darker:rgb(230,230,230); --yt-swatch-text:rgba(17,17,17,0.4); --yt-swatch-input-text:rgba(17,17,17,1); --yt-swatch-textbox-bg:rgba(255,255,255,1); --yt-swatch-icon-color:rgba(136,136,136,1);");
			} else {
				ytdApps[0].setAttribute("style", "--ytd-app-scroll-offset:0; --yt-swatch-primary:rgb(35,35,35); --yt-swatch-primary-darker:rgb(32,32,32); --yt-swatch-text:rgb(255,255,255); --yt-swatch-important-text:rgb(255,255,255); --yt-swatch-input-text:rgba(255,255,255,1); --yt-swatch-textbox-bg:rgba(19,19,19,1); --yt-swatch-logo-override:rgb(255,255,255); --yt-swatch-icon-color:rgba(136,136,136,1);");
			}
		} 
		// <ytd-masthead> - global header/toolbar
		var ytdMastHead = document.getElementsByTagName("ytd-masthead");
		if (ytdMastHead && ytdMastHead.length == 1) {
			if (noTheme) {
				ytdMastHead[0].setAttribute("style", "--yt-swatch-primary:rgb(255,255,255); --yt-swatch-primary-darker:rgb(230,230,230); --yt-swatch-text:rgba(17,17,17,0.4); --yt-swatch-input-text:rgba(17,17,17,1); --yt-swatch-textbox-bg:rgba(255,255,255,1); --yt-swatch-icon-color:rgba(136,136,136,1);");
			} else {
				ytdMastHead[0].setAttribute("style", "--yt-swatch-primary:rgb(35,35,35); --yt-swatch-primary-darker:rgb(32,32,32); --yt-swatch-text:rgb(255,255,255); --yt-swatch-important-text:rgb(255,255,255); --yt-swatch-input-text:rgba(255,255,255,1); --yt-swatch-textbox-bg:rgba(19,19,19,1); --yt-swatch-logo-override:rgb(255,255,255); --yt-swatch-icon-color:rgba(136,136,136,1);");
			}
		} 
	}


	var DarknessLoader = (function() {

		// Constants
		var ENVIRONMENT = '@@ENVIRONMENT@@'; // @@VARIABLES@@ are filled by the background script
		var PRINT_LOGS = (ENVIRONMENT != 'production') || document.location.href.indexOf('debug_darkness=1') > -1;

		// ID of the injected elements
		var ID_FOR_INJECTED_DIV = 'drk_page_html';
		var ID_FOR_SETTINGS_ICON = 'drk_settings_icon';
		var ID_FOR_INJECTED_STYLE = 'drk_style_theme';

		// Various assets provided by the background scripts
		var ASSETS = { 'CSS': '@@CSS@@', 'CSSOFF': '@@CSSOFF@@', 'HTML': '@@HTML@@', 'TYPE': '@@TYPE@@', 'PROMO': '@@PROMO@@' };
		var SITE = '@@SITE@@';
		var THEME = '@@THEME@@';
		var SITE_SUPPORT = '@@SITE_SUPPORT@@';
		var settings = JSON.parse('@@SETTINGS@@'); // User settings

		// Variables
		var currentlyEnabled = false; // Is theming enabled? Initialized by constructor to be true
		var settingsPanelVisible = false; // true when settings panel is opened by user, false when closed

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Helper Functions
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Helper: log to console
		var log = function() {
			Array.prototype.unshift.call(arguments, '--> ');
			if (PRINT_LOGS) console.log.apply(console, arguments);
		};

		// Helper: call the callback immediately when the specified element (either 'head' or 'body') is available in the DOM
		var onElementReady = function(elementName, callback) {
			// Route #1: element is already here
			if (document[elementName]) {
				return callback('document');
			}

			// Sub-helper: clean up watchers before existing, so we don't call callback twice
			var documentObserver, onDocumentReady;
			var cleanup = function() {
				if (documentObserver) documentObserver.disconnect();
				if (onDocumentReady) document.removeEventListener('readystatechange', onDocumentReady);
			};

			// Method 2: watch using observer
			documentObserver = new MutationObserver(function(mutations) {
				for (var i in mutations) {
					var mutation = mutations[i];
					if (mutation.target.nodeName.toLowerCase() == elementName) {
						cleanup();
						setTimeout(function() {
							callback('observer');
						}, 0);
						break;
					}
				}
			});
			documentObserver.observe(document, { childList: true, subtree: true });

			// Method 3: readyState is already complete
			if (document.readyState == 'complete') {
				return callback('readyState');
			}

			// Method 4: watch for readyState changes
			onDocumentReady = function() {
				if (document.readyState == 'complete') {
					cleanup();
					return callback('readyState');
				}
			};
			document.addEventListener('readystatechange', onDocumentReady);
		};

		// Helper: show a message in the bottom of the screen. Nicer than alert()
		var showAlert = function(msg) {
			// msg can be safely assigned to innerHTML because showAlert is only called internally with predetermined texts
			document.getElementsByClassName('drk_settings_global_msg_text')[0].innerHTML = msg;
			document.getElementsByClassName('drk_settings_global_msg_close')[0].onclick = function(e) {
				e.stopPropagation();
				document.getElementsByClassName('drk_settings_global_msg')[0].className +=
					document.getElementsByClassName('drk_settings_global_msg')[0].className.replace('visible', '');
			};
			document.getElementsByClassName('drk_settings_global_msg')[0].className += ' visible';
		};


		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Injection into DOM
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Append the Darkness <STYLE> with the CSS to the head
		// This usually includes page.css along with the skin CSS
		var appendStyleToHead = function(method) {
			var prev = document.getElementById(ID_FOR_INJECTED_STYLE);
			if (prev) {
				return log("NOT appending STYLE using " + method);
			}
			log("Appending STYLE using " + method);
			var s = document.createElement('style');
			s.type = 'text/css';
			s.setAttribute('id', ID_FOR_INJECTED_STYLE);
			s.appendChild(document.createTextNode(currentlyEnabled ? ASSETS.CSS : ASSETS.CSSOFF));
			document.head.appendChild(s);
		};

		// Change the existing Darkness <STYLE> to the specified CSS
		var replaceStyleWithCss = function(css) {
			var styleElement = document.getElementById(ID_FOR_INJECTED_STYLE);
			var textNode = styleElement.firstChild;
			textNode.nodeValue = css;
		};

		// Replace the theme CSS (public method, used by the settings dialog)
		DarknessLoader.prototype.replaceThemeCss = function(css) {
			ASSETS.CSS = css;
			replaceStyleWithCss(ASSETS.CSS);
		};

		// Switch the style on/off
		var switchStyleOff = function() {
			currentlyEnabled = false;
			replaceStyleWithCss(ASSETS.CSSOFF);
		};
		var switchStyleOn = function() {
			currentlyEnabled = true;
			replaceStyleWithCss(ASSETS.CSS);
		};

		// Append the Darkness HTML with the moon icon to the body
		var appendHtmlToBody = function(method) {
			var prev = document.getElementById(ID_FOR_INJECTED_DIV);
			if (prev) {
				return log("NOT appending HTML using " + method);
			}
			log("Appending HTML using " + method);
			document.body.setAttribute('data-drk-type', ASSETS.TYPE);
			document.body.setAttribute('data-drk-promo', ASSETS.PROMO);
			document.body.setAttribute('data-drk-site', SITE);
			document.body.setAttribute('data-drk-site-support', SITE_SUPPORT);
			var d = document.createElement('div');
			d.setAttribute('id', ID_FOR_INJECTED_DIV);
			d.setAttribute('class', SITE);
			// Append the HTML of the moon icon, provided directly from the background script
			d.innerHTML = ASSETS.HTML;
			document.body.appendChild(d);
		};


		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Time-of-day methods (not in use)
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// CURRENTLY NOT IN USE:
		// Is it time to enable themes now? Takes into consideration time of day
		DarknessLoader.prototype.isTimeToEnableThemes = function() {
			if (settings.global.enableAt == 'always') {
				return true;
			} else {
				var time = new Date();
				var hours = time.getHours(); // 0-23
				var MORNING_HOUR = 7;
				var NIGHT_HOUR = 19;
				var shouldBeEnabled = false;
				if (hours >= NIGHT_HOUR || hours < MORNING_HOUR) shouldBeEnabled = true;
				// if (time.getSeconds() % 20 < 10) shouldBeEnabled = false;
				return shouldBeEnabled;
			}
		};

		// CURRENTLY NOT IN USE:
		// Is it time to enable themes now? Takes into consideration time of day + is settings panel open
		var shouldEnableThemesNow = function() {
			if (settingsPanelVisible) {
				return true;
			} else {
				return DarknessLoader.prototype.isTimeToEnableThemes();
			}
		};

		// CURRENTLY NOT IN USE:
		// Determine whether to enable themes now (by time of day + settings panel open) then enable/disable themes it if necessary
		var enableOrDisableThemesNow = function(debug) {
			var shouldBeEnabled = shouldEnableThemesNow();
			if (debug) log("Enable or disable themes now?", shouldBeEnabled);
			if (currentlyEnabled && !shouldBeEnabled) {
				// Turn it off
				switchStyleOff();
			} else if (!currentlyEnabled && shouldBeEnabled) {
				// Turn it on
				switchStyleOn();
			}
		};

		// CURRENTLY NOT IN USE:
		// Enable/disable themes by time of day
		var initPeriodicTimeCheck = function() {
			setInterval(function() {
				enableOrDisableThemesNow(false);
			}, 1000 * 10);
		};

		// Public method, called by settings.js when user changes time settings
		DarknessLoader.prototype.onSettingsEnableAtChanged = function(enableAt) {
			settings.global.enableAt = enableAt;
			enableOrDisableThemesNow(true);
		};

		// Called when the settings panel is shown or hidden
		DarknessLoader.prototype.onSettingsPanelVisiblityChanged = function(visible) {
			settingsPanelVisible = visible;
			enableOrDisableThemesNow(true);
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Initialization
		//--------------------------------------------------------------------------------------------------------------------------------------------

		var findConflictsWithOtherExtensions = function() {
			if (document.querySelector("html").getAttribute('hc') && document.querySelector("html").getAttribute('hc') != '') {
				showAlert(
					"The Darkness chrome extension cannot function properly with Google's 'High Contrast' extension enabled. Please disable the 'High Contrast' extension, then reload the page.");
			}
			if (SITE == 'youtube' && document.getElementById('darkstyle_css')) {
				showAlert(
					"The Darkness chrome extension cannot function properly with the 'Dark Skin for Youtube' extension enabled. Please disable the 'Dark Skin for Youtube' extension, then reload the page.");
			}
			if (document.querySelector("html").getAttribute('hv') && document.querySelector("html").getAttribute('hv') != 'a0') {
				showAlert(
					"The Darkness chrome extension cannot function properly with the 'Hacker Vision' extension enabled. Please go to the 'Hacker Vision' settings and disable it for current site, then reload the page.");
			}
			if (document.getElementById('dark-reader-style') && document.getElementById('dark-reader-style').innerHTML.trim().length > 0) {
				showAlert(
					"The Darkness chrome extension cannot function properly with the 'Dark Reader' extension enabled. Please go to 'Dark Reader' settings and disable it for current site, then reload the page.");
			}
			if (document.querySelector("html").className.match('cye-enabled')) {
				showAlert(
					"The Darkness chrome extension cannot function properly with the 'Care your Eyes' extension enabled. Please go to 'Care your eye' settings and disable it for current site, then reload the page.");
			}
		};

		// Constructor
		function DarknessLoader() {
			currentlyEnabled = shouldEnableThemesNow();
			log("Loading darkness in " + ENVIRONMENT + " mode. Currently enabled?", currentlyEnabled);
	
			onElementReady('head', function(method) {
				log("HEAD is ready - via " + method);
				if (SITE === 'youtube') {
					DarknessSetYouTubeTheme(THEME, false);			
				}
				// If document is ready and there is still no head, create it
				if (!document.head) {
					var head = document.createElement('head');
					document.documentElement.insertBefore(head, document.documentElement.firstElementChild);
				}
				// Append the Darkness CSS (themes, etc.)
				appendStyleToHead(method);
			});

			onElementReady('body', function(method) {
				log("BODY is ready - via " + method);
				if (SITE === 'youtube') {
					setTimeout(function() {
						DarknessSetYouTubeTheme(THEME, false);
					}, 1000);
				}
				// Append the Darkness HTML (moon icon)
				appendHtmlToBody(method);
				setTimeout(function() {
					findConflictsWithOtherExtensions();
				}, 500);
				var onSettingsIconClick = function() {
					log("Settings icon click from page.js");
					// Unbind click event, next click will be handles by settings.js
					document.getElementById(ID_FOR_SETTINGS_ICON).removeEventListener('click', onSettingsIconClick);
					// Trigger opening of the settings panel
					darknessLoader.onSettingsPanelVisiblityChanged(true);
					chrome.runtime.sendMessage({ action: "openSettings" }, function(response) {});
				};
				// Upon click on icon, open the settings panel
				document.getElementById(ID_FOR_SETTINGS_ICON).addEventListener('click', onSettingsIconClick)
			});
			initPeriodicTimeCheck();
		}

		return DarknessLoader;
	})();


	// Initialize the loader
	var darknessLoader = new DarknessLoader();

}