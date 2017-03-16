//----------------------------------------------------------------------------------------------------------------------------------------------------
// This is the JS that loads and handles the settings panel.
// It is loaded lazily when the user clicks the moon icon.
//----------------------------------------------------------------------------------------------------------------------------------------------------
"use strict";

// Don't run twice
if (!DarknessSettingsLoader) {

	var DarknessSettingsLoaderFactory = (function() {

		// Extension configuration
		var ENVIRONMENT = '@@ENVIRONMENT@@'; //  // @@VARIABLES@@ are filled by the background script
		var PRINT_LOGS = (ENVIRONMENT != 'production') || document.location.href.indexOf('debug_darkness=1') > -1;
		var CONFIG = JSON.parse('@@CONFIG@@');
		var MACHINE_ID = '@@MACHINEID@@';

		// Currently shown theme & site keys
		var THEME = '@@THEME@@';
		var SITE = '@@SITE@@';
		var SITE_SUPPORT = '@@SITE_SUPPORT@@';
		var SKU = '@@SKU@@';
		var FUNNEL_PREFIX = 'funnel-';
		if (SKU != '1') FUNNEL_PREFIX = 'funnel-' +  SKU + '-';

		// Assets (CSS/JS/HTML) that need to be replaced every time the settings panel is opened - for development purposes
		var ASSETS = { 'CSS': '@@CSS@@', 'CSSOFF': '@@CSSOFF@@', 'HTML': '@@HTML@@', 'TYPE': '@@TYPE@@' };

		// ID of the injected elements
		var ID_SETTINGS_STYLE = 'drk_settings_style';
		var ID_SETTINGS_HTML = 'drk_settings_html';

		// User settings & stats
		var settings = JSON.parse('@@SETTINGS@@');
		var STATS = JSON.parse('@@STATS@@');

		// Determine the payment platform to use
		var PAYMENT_PLATFORM = 'paypal';
		if (location.hash.indexOf('darkness_force_payment=google') > -1) PAYMENT_PLATFORM = 'google';
		if (location.hash.indexOf('darkness_force_payment=paypal') > -1) PAYMENT_PLATFORM = 'paypal';


		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Helper Functions
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Hashing function: from string to a float between 0 and 1 (deterministic psuedo random)
		var hashStringToFloat = function(str) {
			var hash = 0,
				i, chr, len;
			if (str.length === 0) return hash;
			for (i = 0, len = str.length; i < len; i++) {
				chr = str.charCodeAt(i);
				hash = ((hash << 5) - hash) + chr;
				hash |= 0; // Convert to 32bit integer
			}
			return Math.abs(hash) / 2147483647;
		};

		// Helper: Log to console
		var log = function() {
			Array.prototype.unshift.call(arguments, '--> ');
			if (PRINT_LOGS) console.log.apply(console, arguments);
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

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Google's buy.js (Google Chrome in-app payments) - beautified
		// From: https://raw.githubusercontent.com/GoogleChrome/chrome-app-samples/master/samples/managed-in-app-payments/scripts/buy.js
		//--------------------------------------------------------------------------------------------------------------------------------------------
		(function() {
			var f = this,
				g = function(a, d) {
					var c = a.split("."),
						b = window || f;
					c[0] in b || !b.execScript || b.execScript("var " + c[0]);
					for (var e; c.length && (e = c.shift());) c.length || void 0 === d ? b = b[e] ? b[e] : b[e] = {} : b[e] = d
				};
			var h = function(a) {
				var d = chrome.runtime.connect("nmmhkkegccagdldgiimedpiccmgmieda", {}),
					c = !1;
				d.onMessage.addListener(function(b) {
					c = !0;
					"response" in b && !("errorType" in b.response) ? a.success && a.success(b) : a.failure && a.failure(b)
				});
				d.onDisconnect.addListener(function() {!c && a.failure && a.failure({ request: {}, response: { errorType: "INTERNAL_SERVER_ERROR" } }) });
				d.postMessage(a)
			};
			g("google.payments.inapp.buy", function(a) {
				a.method = "buy";
				h(a)
			});
			g("google.payments.inapp.consumePurchase", function(a) {
				a.method = "consumePurchase";
				h(a)
			});
			g("google.payments.inapp.getPurchases", function(a) {
				a.method = "getPurchases";
				h(a)
			});
			g("google.payments.inapp.getSkuDetails", function(a) {
				a.method = "getSkuDetails";
				h(a)
			});
		})();


		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Analytics (not active in Darkness Developers Edition)
		//--------------------------------------------------------------------------------------------------------------------------------------------

		var repEvent = function(category, action, label) {
			chrome.runtime.sendMessage({ action: 'repEvent', cat: category, act: action, lab: label });
		};

		var repEventByUser = function(category, action) {
			chrome.runtime.sendMessage({ action: 'repEventByUser', cat: category, act: action });
		};

		var repToFunnel = function(step) {
			chrome.runtime.sendMessage({ action: 'repToFunnel', step: step, sku: SKU });
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Payment
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Payment variables
		var dialogReason = 'unknown'; // Why was the upgrade dialog invoked? (for analytics)
		var dialogAmount = 0; // How much the user paid? (for analytics)

		// Payment Step 1: Called when a user clicks the "buy" button
		var buyClick = function() {
			if (PAYMENT_PLATFORM == 'paypal') {
				loadPayPalPaymentDialog();
			} else {
				loadGooglePaymentDialog();
			}
		};


		// Payment Step 2: Load PayPal's payment dialog for the specified product SKU
		var loadPayPalPaymentDialog = function() {
			var prod = ENVIRONMENT == 'production';

			// Where to submit the form to?
			var formAction = prod ? 'https://www.paypal.com/cgi-bin/webscr' : 'https://www.sandbox.paypal.com/cgi-bin/webscr';
			$('#drk_paypal_form').attr('action', formAction);

			// What's the PayPal button ID?
			var paypalButtonId = '';
			if (SKU == "1") paypalButtonId = prod ? 'Z9BBUN4PDFGKQ' : 'JFYWCRAJW64EN';
			if (SKU == "2") paypalButtonId = prod ? 'U59U55TCYJMHQ' : 'LMQAHVFLAGHK2';
			$('#drk_paypal_button_id').attr('value', paypalButtonId);

			// Add custom data to each PayPal transaction
			var now = new Date();
			var transactionId = 'tid_' + now.getFullYear() + '_' + ('0'+(now.getMonth()+1)).slice(-2) + '_' + now.getDate();
			if (ENVIRONMENT != 'production') transactionId += '_n' + Math.floor(Math.random()*10000);
			var custom = { dialog_reason: dialogReason, theme: THEME, site: SITE, machine_id: MACHINE_ID, transaction_id: transactionId };
			$('#drk_paypal_custom').attr('value', JSON.stringify(custom));

			// Hide upgrade dialog, and show "waiting" dialog instead
			$('.drk_get_pro.sku-'+SKU).removeClass('visible');
			$('.drk_pay_waiting').addClass('visible');

			// Submit the form
			$("#drk_paypal_form").trigger("submit");

			// Then start polling for PayPal's answer
			chrome.runtime.sendMessage({ action: "startPollingPayPal", transactionId: transactionId }, function(response) {
				log('background response', response);
				// Check if response from the IPN server is 'Completed'
				if (response.status == 'Completed') {
					onPayResponse(true, response);
				} else {
					var failureReason = response.status + '(' + response.reason + ')';
					onPayResponse(false, response, failureReason);
				}
			});
		};

		// Payment Step 2: Load Google Payment's payment dialog for the specified product SKU
		var loadGooglePaymentDialog = function(sku) {
			google.payments.inapp.buy({
				'parameters': { 'env': 'prod' }, // prod / sandbox / test
				'sku': sku,
				'success': function(buyResponse) {
					onPaySuccess(buyResponse);
				},
				'failure': function(buyResponse) {
					// Google Payment bug: it often returns failure even though payment was successful
					// Who do we know? If buyResponse contains checkoutOrderId it means the payment was successful
					if (buyResponse.checkoutOrderId && typeof(buyResponse.checkoutOrderId) == "string" &&
						buyResponse.checkoutOrderId.length > 3) {
						onPayResponse(true, buyResponse);
					} else {
						var failureReason = (buyResponse && buyResponse.response) ? buyResponse.response.errorType : JSON.stringify(buyResponse);
						onPayResponse(false, buyResponse, failureReason);
					}
				}
			});
		};


		// Payment Step 3: Called when a user payment has either succeeded or failed (any platform)
		var onPayResponse = function(success, buyResponse, failureReason) {
			log((success ? 'payment succeeded' : 'payment failed'), buyResponse);

			// Let the server know we have a response, and reload the user
			chrome.runtime.sendMessage({ action: "payResponse", success: success }, function(response) {
				log('background response from payResponse', response);
				ASSETS.TYPE = response.type;
				if (success) {
					// Payment platform declared success
					if (ASSETS.TYPE == 'p') { // Pro user (as expected)
						repToFunnel('paid');
						repEventByUser(FUNNEL_PREFIX + dialogReason, 'paid-all');
						repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'paid-all');
						repEventByUser(FUNNEL_PREFIX + dialogReason, 'paid-' + dialogAmount);
						repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'paid-' + dialogAmount);
						var daysSinceInstall = getDaysSinceInstall(STATS.installDate, true);
						repEvent('funnel-' + PAYMENT_PLATFORM, 'paid-days-since-install', daysSinceInstall);
						notifyUserOnPaymentFinished(true);
					} else { // Regular user (unexplained?!)
						var reason = 'UNEXPLAINED';
						repToFunnel('pay-fail-' + reason);
						repEventByUser(FUNNEL_PREFIX + dialogReason, 'pay-fail-' + reason);
						repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'pay-fail-' + reason);
						notifyUserOnPaymentFinished(false);
					}
				} else {
					// Payment platform declared failure
					if (ASSETS.TYPE == 'p') { // Pro user (unexplained?!)
						repToFunnel('paid');
						repEventByUser(FUNNEL_PREFIX + dialogReason, 'paid-all-UNEXPLAINED');
						repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'paid-all-UNEXPLAINED');
						repEventByUser(FUNNEL_PREFIX + dialogReason, 'paid-' + dialogAmount + '-UNEXPLAINED');
						repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'paid-' + dialogAmount + '-UNEXPLAINED');
						notifyUserOnPaymentFinished(true);
					} else { // Regular user (as expected)
						repToFunnel('pay-fail-' + failureReason);
						repEventByUser(FUNNEL_PREFIX + dialogReason, 'pay-fail-' + failureReason);
						repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'pay-fail-' + failureReason);
						notifyUserOnPaymentFinished(false);
					}
				}
			});
		};

		// Payment Step 3 (alternative): Called when a user submits a promo code
		var submitPromoCode = function() {
			var $dialog = $('.drk_get_pro.sku-'+SKU)
			var promo = $dialog.find('.drk_promo_input').val().trim();			
			$dialog.find('.drk_promo_submit').val('Checking...');
			// Ask the background to check with the code with the server
			chrome.runtime.sendMessage({ action: "checkPromoCode", promo: promo }, function(res) {
				if (res.success) {
					// Ask server to reload the user
					chrome.runtime.sendMessage({ action: "payResponse", success: true }, function(response) {
						log('background response from payResponse', response);
						ASSETS.TYPE = response.type;
						notifyUserOnPaymentFinished(true);
					});
				} else {
					if (res.error == 'PROMO-INCORRECT') {
						// Notify the user code is wrong
						$dialog.find('.drk_promo_submit').val('Not found');
						$dialog.find('.drk_promo_input').val('');
						setTimeout(function() {
							$dialog.find('.drk_promo_submit').val('Send');
						}, 2500);
					} else {
						$dialog.find('.drk_promo_submit').val('Send');
						var msg = "Error sending promo to server:\n\n" + res.error + "\n\nPlease copy this message and send it to support@lifehacklabs.org";
						alert(msg);
					}
				}
			});
		};

		// Payment Step 4: Notify the user when a payment is finished (close all existing dialogs, and open success/failure dialog)
		var notifyUserOnPaymentFinished = function(success) {
			log('pay finished', success, ASSETS.TYPE);

			// Hide all open dialogs
			$('.drk_get_pro.sku-'+SKU).removeClass('visible');
			$('.drk_pay_waiting').removeClass('visible');
			$('.drk_settings').removeClass('visible');

			// Show success/failure dialog
			if (success) {
				if (previewMode) revertAfterPreview(true);
				$('.drk_pay_success').addClass('visible');
			} else {
				$('.drk_pay_failed').addClass('visible');
			}
		};


		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Settings Panel UI
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Toggle the AddThis sharing box on/off (used when clicking the "Share Darkness" link)
		var shareOn = false;
		var toggleShare = function() {
			shareOn = !shareOn;
			log("Toggling share " + (shareOn ? "on" : "off"));
			if (shareOn) {
				// Analytics
				repEventByUser('user-action', 'share-btn-click');

				// Update the UI
				$('.addthis_sharing_toolbox, .drk_share_placeholder').addClass('on');
				$('.drk_share_btn').addClass('active');

				// Append the AddThis script lazily (otherwise it slows down stuff)
				$('body').append(
					'<div class="addthis_sharing_toolbox on" data-url="https://chrome.google.com/webstore/detail/imilbobhamcfahccagbncamhpnbkaenm"' +
					'data-title="Darkness: beautiful dark themes for Facebook, Google and more"></div>' +
					'<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-573b272154056eba"></script>'
				);

				// Place the AddThis box in it's placeholder
				var offset = $('.drk_share_placeholder').offset();
				var top = offset.top;
				var right = $(window).width() - offset.left - $('.drk_share_placeholder').width();
				$('.addthis_sharing_toolbox').css('right', right).css('top', top);

			} else {
				// Update the UI
				$('.addthis_sharing_toolbox, .drk_share_placeholder').removeClass('on');
				$('.drk_share_btn').removeClass('active');
			}
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Loading Themes
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Are we currently in preview mode?
		var previewMode = false;

		// Load the specified theme for the current website
		// This automatically handles preview mode on/off as necessary, and updates the background script
		var loadTheme = function(theme) {
			log("Loading theme " + theme + " for website " + SITE);
			THEME = theme; // Update global var immediately

			// Update settings panel UI
			$('.drk_theme_list li').removeClass('drk_active');
			$('.drk_theme_list li[data-theme="' + theme + '"]').addClass('drk_active');


			var previouslyInPreviewMode = previewMode; // previewMode is a global var

			// Decide whether to start preview mode
			previewMode = false;
			if (ASSETS.TYPE != 'p') {
				if (THEME != 'none' && CONFIG.sites[SITE].p) {
					dialogReason = 'pro-site';
					previewMode = true;
				} else if (THEME != 'none' && CONFIG.themes[THEME].p) {
					dialogReason = 'pro-theme';
					previewMode = true;
				}
			}
			log('previewMode', previewMode);

			// Set theme on background script and receive the CSS
			chrome.runtime.sendMessage({ action: "loadTheme", theme: theme }, function(response) {
				// Replace the CSS
				darknessLoader.replaceThemeCss(response.cssContent);
				if (previewMode) {
					// Preview mode on, don't save theme
					startPreviewMode();
				} else {
					// Preview mode off, save theme
					if (previouslyInPreviewMode) {
						revertAfterPreview(false);
					}
					settings.sites[SITE].theme = theme;
				}

			});
		};


		// Start theme preview mode
		var startPreviewMode = function() {
			previewMode = true;

			// Show preview mode UI (upgrade dialog, watermark, etc.)
			$('.drk_preview_mark').addClass('visible');
			$('.drk_get_pro.sku-'+SKU).addClass('visible');
			$('.drk_use_this_for_all_button').addClass('disabled');

			// Analytics
			repToFunnel('buy-dialog-shown');
			repEventByUser(FUNNEL_PREFIX + dialogReason, 'buy-dialog-shown');
			repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'buy-dialog-shown');
		};

		// Revert from preview mode to no preview
		// if switchToAllowedTheme, it will also revert back to an allowed theme
		// Otherwise, it will keep the theme as is
		var revertAfterPreview = function(switchToAllowedTheme) {
			previewMode = false;

			// Hide preview mode UI (upgrade dialog, watermark, etc.)
			$('.drk_preview_mark').removeClass('visible');
			$('.drk_get_pro.sku-'+SKU).removeClass('visible');
			$('.drk_use_this_for_all_button').removeClass('disabled');

			if (switchToAllowedTheme) {
				// Revert to an allowed theme for this website
				var defaultTheme = null;
				if (CONFIG.sites[SITE].p) {
					defaultTheme = 'none';
				} else {
					defaultTheme = settings.global.defaultTheme;
				}
				loadTheme(defaultTheme);
			}
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// DOM Injection
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Append or replace the STYLE in the HEAD with ASSETS.CSS
		var putStyleInHead = function() {
			var prev = document.getElementById(ID_SETTINGS_STYLE);
			if (prev) {
				prev.parentNode.removeChild(prev);
			}
			log(prev ? "Replacing STYLE" : "Appending STYLE");
			var s = document.createElement('style');
			s.type = 'text/css';
			s.setAttribute('id', ID_SETTINGS_STYLE);
			s.appendChild(document.createTextNode(ASSETS.CSS));
			document.head.appendChild(s);
		};

		// Append or replace the HTML in the BODY with ASSETS.HTML
		var putHtmlInBody = function() {
			var prev = document.getElementById(ID_SETTINGS_HTML);
			if (prev) {
				prev.parentNode.removeChild(prev);
			}
			log(prev ? "Replacing HTML" : "Appending HTML");
			var d = document.createElement('div');
			d.setAttribute('id', ID_SETTINGS_HTML);
			d.innerHTML = ASSETS.HTML;
			document.body.appendChild(d);
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Settings Panel User Interface
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Helper: gets a JS array of contributors for a theme from the configuration, and returns a nicely-formatted HTML string
		var buildLinksFromContributors = function(contributors) {
			var parts = [];
			for (var i in contributors) {
				var contributor = contributors[i];
				if (contributor.link)
					parts.push("<a href='" + contributor.link + "' target='_blank'>" + contributor.name + "</a>");
				else
					parts.push("<span>" + contributor.name + "</span>");
			}
			var html = parts.join(", ");
			return html;
		};

		// Fill and initialize all the elements of the settings panel
		var initializeSettingsPanelInterfaceElements = function() {
			var title = 'Darkness';
			if (ENVIRONMENT == 'development') title = 'Darkness Developer Edition';
			else if (ENVIRONMENT == 'staging') title = 'Darkness' + (ASSETS.TYPE == 'p' ? ' Pro' : '') + '*';
			else if (ENVIRONMENT == 'production') title = 'Darkness' + (ASSETS.TYPE == 'p' ? ' Pro' : '');
			$('.drk_app_name').html(title);
			$('.drk_settings .sku_replace').addClass('sku-'+SKU).removeClass('sku_replace');
			if (ENVIRONMENT == 'development')  { 
				// Darkness Development Edition users:
				$('.drk_upgrade_btn').remove(); // Hide upgrade button
				$('.drk_cross_promo_btn').addClass('hidden'); // Hide cross promotion
				$('.drk_rate_btn').addClass('hidden'); // Hide rate on CWS
			}
			else {				
				chrome.runtime.sendMessage({ action: 'getPromo', spot: 'darkness-settings-dialog' }, function(promo){
					if (promo) {
						$('.drk_cross_promo_btn').removeClass('hidden');
						$('.drk_cross_promo_btn span').html(promo.title);
					} else {
						$('.drk_cross_promo_btn').addClass('hidden');
						$('.drk_cross_promo_btn span').html('');
					}
				});
				
				if (ASSETS.TYPE == 'p') { 
					// Pro users:
					$('.drk_upgrade_btn').remove(); // Hide upgrade button
				} else { 
					// Regular users
					$('.drk_rate_btn').addClass('hidden'); // Hide rate on CWS
				}
			}

			// Fill website name, etc.
			$('.drk_website_name').html(CONFIG.sites[SITE].name);
			$('.drk_img_loader_small').attr('src', chrome.extension.getURL('images/loader-small.gif'));

			// Choose correct settings in the UI
			$('.drk_settings .drk_theme_list li[data-theme="' + THEME + '"]').addClass('drk_active');
			$('.drk_settings .drk_time[data-time="' + settings.global.enableAt + '"]').addClass('drk_active');

			// Fill the credits for this skin
			var siteInfo = CONFIG.sites[SITE];
			if (siteInfo.creators && siteInfo.creators.length > 0) {
				$('.drk_skin_creators_list').html(buildLinksFromContributors(siteInfo.creators));
			} else {
				$('.drk_skin_creators_list').html('Darkness');
			}
			if (siteInfo.topContributors && siteInfo.topContributors.length > 0) {
				$('.drk_skin_contributors_list').html(buildLinksFromContributors(siteInfo.topContributors));
				$('.drk_skin_contributors_line').addClass('visible');
			} else {
				$('.drk_skin_contributors_line').removeClass('visible');
			}
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Event Handlers for the Settings Panel
		//--------------------------------------------------------------------------------------------------------------------------------------------

		var loadSettingsPanelEventHandlers = function() {

			// Moon icon clicked
			$('.drk_settings_icon').unbind('click').click(function() {
				// Notify the DarknessLoader class (page.js)
				darknessLoader.onSettingsPanelVisiblityChanged(true);
				// Reload the settings panel with the most up-to-date user settings and assets (HTML, JS, CSS)
				reloadSettingsPanel();
			});

			// Theme clicked
			$('.drk_settings .drk_theme_list li').unbind('click').click(function() {
				var newTheme = $(this).data('theme');
				repEventByUser('user-action', 'theme-click-all');
				repEventByUser('user-action', 'theme-click-' + newTheme);
				loadTheme(newTheme);
			});

			// 24h / night only clicked (currently not available)
			$('.drk_settings .drk_time').unbind('click').click(function() {
				var time = $(this).data('time');
				// Analytics
				repEventByUser('user-action', 'set-time-all');
				repEventByUser('user-action', 'set-time-' + time);
				// Update the UI
				$('.drk_settings .drk_time').removeClass('drk_active');
				$('.drk_settings .drk_time[data-time="' + time + '"]').addClass('drk_active');
				// Change the settings
				chrome.runtime.sendMessage({ action: "setEnableAt", time: time }, function(newSettings) {
					settings = newSettings;
					darknessLoader.onSettingsEnableAtChanged(settings.global.enableAt);
				});

			});

			// Settings panel's x button clicked
			$('.drk_settings .drk_close').unbind('click').click(function(e) {
				if (previewMode) revertAfterPreview(true);

				// Should we enable themes now?
				var isTimeToEnableThemes = darknessLoader.isTimeToEnableThemes();
				if (isTimeToEnableThemes) {
					// Change it immediately
					darknessLoader.onSettingsPanelVisiblityChanged(false);
					deleteSettingsPanel();
				} else {
					// We're doing to disable the theme now (it's not night time)
					// Show a warning to to the user for 3 seconds
					$('.drk_night_time_warning').addClass('visible').delay(2500).fadeOut(500);
					setTimeout(function() {
						// Let darknessLoader know - it will disable the theme
						darknessLoader.onSettingsPanelVisiblityChanged(false);
						// Remove the warning
						$('.drk_night_time_warning').removeClass('visible');
						deleteSettingsPanel();

					}, 3000);
				}

				// Hotkeys - for developers only
				if (ENVIRONMENT != 'production') {
					if (e.altKey && e.shiftKey) {
						// Holding Alt+Shift while clicking on X will reset all user settings, and reload the settings panel
						log("Dev shortcut: resetting settings + reloading panel");
						chrome.runtime.sendMessage({ action: "resetAllSettings", theme: THEME }, function(err, res) {
							if (err)
								log("Error deleting all settings: ", err);
							else
								log("Deleted all settings", res);
							// This will replace both ASSETS and SETTINGS before loading the settings panel
							reloadSettingsPanel();
						});
					} else if (e.metaKey || e.ctrlKey) {
						// Holding Ctrl/Cmd while clicking on X will reload the settings panel (good for developing the settings panel)
						log("Dev shortcut: reloading panel");
						reloadSettingsPanel();
					}
				}

			});

			// Share button
			$('.drk_settings .drk_share_btn').unbind('click').click(function() {
				toggleShare();
			});

			// Send skin bug report button
			$('.drk_settings .drk_bug_report_btn').unbind('click').click(function() {
				repEventByUser('user-action', 'bug-report-btn-click');
				var to = 'Lifehack Labs Support <support@lifehacklabs.org>';
				var subj = 'Darkness Bug Report';
				var body = '[Please send your bug report in English]\n\n________\nSystem Information:\nDarkness Version: ' +
					chrome.runtime.getManifest().version +
					(ASSETS.TYPE == 'p' ? '[2]' : '[1]') + '\nCurrent Website: ' + SITE + '\nCurrent URL: ' + document.location.href +
					'\nCurrent Theme: ' + THEME;
				var url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent(subj) +
					'&body=' +
					encodeURIComponent(body);
				var win = window.open(url, '_blank');
				win.focus();
			});

			// Send feedback button
			$('.drk_settings .drk_feedback_btn').unbind('click').click(function(e) {
				repEventByUser('user-action', 'feedback-btn-click');
				var to = 'Lifehack Labs Support <support@lifehacklabs.org>';
				var subj = 'Darkness Feedback';
				if (e.altKey) {
					subj = 'Darkness System Report';
				}
				var body = '[Please send your feedback in English]\n\n________\nSystem Information (for bug reports):\nDarkness Version: ' +
					chrome.runtime.getManifest().version +
					(ASSETS.TYPE == 'p' ? '[2]' : '[1]') + '\nCurrent Website: ' + SITE + '\nCurrent URL: ' + document.location.href +
					'\nCurrent Theme: ' + THEME;
				if (e.altKey) {
					body += '\n\n________\nDebugging Information:\n' + JSON.stringify(settings);
					body += '\n\n' + JSON.stringify(STATS);
				}
				var url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent(subj) +
					'&body=' +
					encodeURIComponent(body);
				var win = window.open(url, '_blank');
				win.focus();
			});

			// Rate button
			$('.drk_settings .drk_rate_btn').unbind('click').click(function() {
				repEventByUser('user-action', 'rate-btn-click');
				var url = 'https://goo.gl/oMLASO';
				var win = window.open(url, '_blank');
				win.focus();
			});

			// Cross promotion button
			$('.drk_settings .drk_cross_promo_btn').unbind('click').click(function() {
				chrome.runtime.sendMessage({ action: 'getPromo', spot: 'darkness-settings-dialog' }, function(promo){
					if (promo && promo.url) {
						repEventByUser('user-action', 'cross-promo-btn-click');
						var win = window.open(promo.url, '_blank');
						win.focus();
					}
				});
			});

			// Vote button
			$('.drk_settings .drk_vote_btn').unbind('click').click(function() {
				repEventByUser('user-action', 'vote-btn-click');
				var url = 'https://goo.gl/a8cQF4';
				var win = window.open(url, '_blank');
				win.focus();
			});

			// Upgrade button
			$('.drk_settings .drk_upgrade_btn').unbind('click').click(function() {
				// Analytics
				repEventByUser('user-action', 'upgrade-btn-click');
				dialogReason = 'upgrade-btn';
				repToFunnel('buy-dialog-shown');
				repEventByUser(FUNNEL_PREFIX + dialogReason, 'buy-dialog-shown');
				repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'buy-dialog-shown');
				// Close all dialogs
				$('.drk_dialog').removeClass('visible');
				// Open upgrade dialog
				$('.drk_get_pro.sku-'+SKU).addClass('visible');
			});

			// Developer Button #1 ("Developer? Help us fix the CSS")
			$('.drk_settings .drk_developer_fix').unbind('click').click(function() {
				repEventByUser('user-action', 'dev-fix-btn-click');
				// Close all dialogs
				$('.drk_dialog').removeClass('visible');
				// Open developer dialog
				$('.drk_join_developers').addClass('visible');
			});

			// Developer Button #2 ("Develop skins for more website")
			$('.drk_settings .drk_developer_add').unbind('click').click(function() {
				repEventByUser('user-action', 'dev-add-btn-fix');
				// Close all dialogs
				$('.drk_dialog').removeClass('visible');
				// Open developer dialog
				$('.drk_join_developers').addClass('visible');
			});

			// "Use this skin for all websites" button
			$('.drk_settings .drk_use_this_for_all_button').unbind('click').click(function() {
				if (previewMode) return; // Impossible in preview mode
				repEventByUser('user-action', 'set-as-default-btn-click');

				// Build the HTML for the dialog
				var items = [];
				for (var siteKey in CONFIG.sites) {
					var site = CONFIG.sites[siteKey];
					var defTheme = site.p ? 'No Theme ' : CONFIG.themes[settings.global.defaultTheme].name;
					var themeName = defTheme + ' (by default)';
					if (settings.sites[siteKey] && settings.sites[siteKey].theme) {
						var themeKey = settings.sites[siteKey].theme;
						if (themeKey == 'none' || !themeKey)
							themeName = 'No Theme';
						else
							themeName = CONFIG.themes[themeKey].name;
					}
					items.push("<tr><td style='font-weight:400 !important'>" + site.name + ':&nbsp;&nbsp;</td><td>' + themeName + "</td></tr>");
				}
				var themeName = (THEME == 'none') ? 'No Theme' : CONFIG.themes[THEME].name;
				var themeInfo = "You are currently using the following themes:<br>\n<table>" + items.join("\n") +
					"</table>\n<br><br>\n<div class='centered'>Would you like to set " + themeName + " as the theme for all websites above?</div>";

				// Fill and show the dialog
				$('.drk_use_this_for_all_confirmation .drk_dialog_text').html(themeInfo);
				$('.drk_use_this_for_all_confirmation').addClass('visible');
			});
		};


		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Event Handlers for Upgrade & Payment Dialogs
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Helper method: close the currently active dialog
		var closeActiveDialog = function(e) {
			$(e.currentTarget).parents('.drk_dialog').removeClass('visible');
			if (previewMode) revertAfterPreview(true);
		};

		var loadUpgradeDialogEventHandlers = function() {

			// Buy button
			$('.drk_get_pro.sku-'+SKU+' .drk_buy_life').unbind('click').click(function() {
				// Analytics
				dialogAmount = '4.99life';
				if (SKU == 2) dialogAmount = '2.99life';
				repToFunnel('buy-now-clicked');
				repEventByUser(FUNNEL_PREFIX + dialogReason, 'buy-now-click-' + dialogAmount);
				repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'buy-now-click-' + dialogAmount);
				repEventByUser(FUNNEL_PREFIX + dialogReason, 'buy-now-click-all');
				repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'buy-now-click-all');
				// Trigger purchase dialog
				buyClick();
			});

			// Upgrade dialog -> Got promo?
			$('.drk_promo_link').unbind('click').click(function(e) {
				$('.drk_promo_link').removeClass('visible');
				$('.drk_promo_form').addClass('visible');
				$('.drk_promo_input').focus();
			});


			// Hide link
			$('.drk_hide_link').unbind('click').click(function(e) {
				repEventByUser('user-action', 'hide-upgrade-dialog-click');
				setTimeout(function() {
					revertAfterPreview(false);
				}, 500);
			});

			// Upgrade dialog -> Promo submitted by hitting Enter
			$('.drk_promo_input').keydown(function(e) {
				if (e.keyCode == 13) {
					submitPromoCode();
				}
			});

			// Upgrade dialog -> Promo submitted by clicking 'Send'
			$('.drk_promo_submit').unbind('click').click(function(e) {
				submitPromoCode();
			});

			// Why did you cancel payment dialog -> I don't want to upgrade
			$('.drk_cancel_dont_want').unbind('click').click(function(e) {
				closeActiveDialog(e);

				var cancelReason = 'dont-want';
				repToFunnel('pay-cancel-' + cancelReason);
				repEventByUser(FUNNEL_PREFIX + dialogReason, 'pay-cancel-' + cancelReason);
				repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'pay-cancel-' + cancelReason);
			});

			// Why did you cancel payment dialog -> PayPal/Google doesn't work for me
			$('.drk_cancel_payment_problem').unbind('click').click(function(e) {
				closeActiveDialog(e);

				var cancelReason = 'payment-problem';
				repToFunnel('pay-cancel-' + cancelReason);
				repEventByUser(FUNNEL_PREFIX + dialogReason, 'pay-cancel-' + cancelReason);
				repEventByUser(FUNNEL_PREFIX + PAYMENT_PLATFORM, 'pay-cancel-' + cancelReason);

				if (PAYMENT_PLATFORM == 'paypal' && SKU == 1) {
					// PayPal failed? Let user pay with Google Payments
					PAYMENT_PLATFORM = 'google';
					buyClick();
				} else {
					// PayPal AND Google failed? Send a support email
					var to = 'Lifehack Labs Support <support@lifehacklabs.org>';
					var paymentMethodName = PAYMENT_PLATFORM == 'paypal' ? 'PayPal' : 'Google Payment';
					var subj = 'Problem paying with ' + paymentMethodName;
					var body =
						"Please help us solve this problem by answering the following questions (in English, please):\n\n" +
						"1. Did the " + paymentMethodName + " window load properly? (If not, what error message did you receive?)\n\n" +
						"2. Can you please describe your problem with payment?\n\n" +
						"3. Is there any other payment platform you would prefer instead?\n\n" +
						'Darkness version: ' + chrome.runtime.getManifest().version + (ASSETS.TYPE == 'p' ? '[2]' : '[1]');
					var url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent(subj) +
						'&body=' +
						encodeURIComponent(body);
					var win = window.open(url, '_blank');
				}
			});
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Event Handlers for other dialogs
		//--------------------------------------------------------------------------------------------------------------------------------------------

		var loadOtherDialogsEventHandlers = function() {

			// X button clicked (for all dialogs)
			$('.drk_dialog_close').unbind('click').click(function(e) {
				$(e.currentTarget).parents('.drk_dialog').removeClass('visible');
			});


			// X button clicked (for Upgrade Dialog)
			$('.drk_get_pro.sku-'+SKU+' .drk_dialog_close').unbind('click').click(function(e) {
				$('.drk_promo_form').removeClass('visible');
				$('.drk_promo_link').addClass('visible');
				closeActiveDialog(e);
			});

			// Developers Dialog -> "Join us" click
			$('.drk_join_developers .drk_join_developers_community_btn').unbind('click').click(function() {
				repEventByUser('user-action', 'dev-dialog-github-click');
				var url;
				if (ENVIRONMENT == 'development') {
					url = 'https://goo.gl/zTEwPP'; // CONTRIBUTING.md on GitHub
				} else {
					url = 'https://goo.gl/ECly1c'; // Darkness on GitHub
				}
				var win = window.open(url, '_blank');
				win.focus();
			});

			// Use this theme for all websites (currently not in use) -> Yes
			$('.drk_use_this_for_all_confirmation .drk_yes').unbind('click').click(function(e) {
				// Ask the background script to set this theme for all websites
				chrome.runtime.sendMessage({ action: "setThemeForAllWebsites", theme: THEME }, function(newSettings) {
					// Reload settings from background script
					settings = newSettings;
				});
				closeActiveDialog(e);
			});
		};

		//--------------------------------------------------------------------------------------------------------------------------------------------
		// Settings Panel Initialization
		//--------------------------------------------------------------------------------------------------------------------------------------------

		// Delete the settings panel from UI
		var deleteSettingsPanel = function() {
			$('.drk_settings, .addthis_sharing_toolbox').remove();
		};


		// Reload the settings panel
		var reloadSettingsPanel = function() {
			loadAndShowSettingsPanel();
		};


		// Loads and shows the settings panel (incl. analytics, filling the UI elements, event handlers, etc.)
		var loadAndShowSettingsPanel = function() {
			log("Loading settings panel");
			var onlyAskDevelopers = SITE_SUPPORT == 'ask-developers';

			// Send analytics
			if (onlyAskDevelopers) {
				repEvent('user-action', 'dev-icon-clicked', SITE);
			} else {
				repToFunnel('settings-opened');
				repEventByUser('user-action', 'settings-opened');
			}

			// Hide while we build the UI
			$('.drk_settings').removeClass('visible');

			// Load latest user settings
			chrome.runtime.sendMessage({ action: "getSettings" }, function(response) {
				settings = response.newSettings;
				var newTheme = response.newTheme;
				log("Got new settings from background: ", settings, newTheme);

				// If user switched to another theme on Tab A, then clicked the moon icon on an old Tab B,
				// Tab B will change to the new theme upon clicking the moon icon
				loadTheme(newTheme);

				// Load latest assets (HTML, JS, CSS)
				chrome.runtime.sendMessage({ action: "getAssetsForSettingsPanel" }, function(assets) {
					log("Got assets:", assets);

					// Replace ASSETS and load HTML and CSS from ASSETS
					ASSETS = assets;
					putStyleInHead();
					putHtmlInBody();

					// Fill all the UI elements and settings
					initializeSettingsPanelInterfaceElements();

					// Wire event handlers
					loadSettingsPanelEventHandlers();
					loadUpgradeDialogEventHandlers();
					loadOtherDialogsEventHandlers();

					if (onlyAskDevelopers) {
						// Show the developers dialog
						$('.drk_join_developers').addClass('visible');
					} else {
						// Show the settings dialog
						$('.drk_settings').addClass('visible');
					}
				});
			});

		};

		// Constructor
		function DarknessSettingsLoader() {
			log("Loading darkness settings in " + ENVIRONMENT + " mode. Payment platform is: " + PAYMENT_PLATFORM);
			loadAndShowSettingsPanel();
		}

		return DarknessSettingsLoader;
	});
	var DarknessSettingsLoader = DarknessSettingsLoaderFactory();
	new DarknessSettingsLoader();
}