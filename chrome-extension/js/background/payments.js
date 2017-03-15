//----------------------------------------------------------------------------------------------------------------------------------------------------
// Payment handler
//----------------------------------------------------------------------------------------------------------------------------------------------------
"use strict";

var PaymentsFactory = function() {

	// Global vailables
	var _appName = null;

	// Constructor
	function Payments(appName) {
		_appName = appName;
	}

	//----------------------------------------------------------------------------------------------------------------------------------------------------
	// Helper methods
	//----------------------------------------------------------------------------------------------------------------------------------------------------

	function _setType(type) {
		if (_appName == 'darkness')
			return stats.set('type', type);
		else
			return settings.set('type', type);
	}

	function _getType() {
		if (_appName == 'darkness')
			return stats.get('type');
		else
			return settings.get('type');
	}

	function _setOverride(override) {
		if (_appName == 'darkness')
			return settings.global.set('override', override);
		else
			return settings.set('override', override);
	}

	function _getOverride() {
		if (_appName == 'darkness')
			return settings.global.get('override');
		else
			return settings.get('override');
	}

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

	//----------------------------------------------------------------------------------------------------------------------------------------------------
	// Payments - All Platforms
	//----------------------------------------------------------------------------------------------------------------------------------------------------


	// PUBLIC FUNCTION: Load/reload the current user
	// This is called on application start
	var _paymentPeriodCheckInterval = null;
	Payments.prototype.reloadUser = function(callback) {
		log("Reload user");
		// Darkness Developer Edition users always have all Pro features on
		var alwaysPro = (_appName == 'darkness') && (ENVIRONMENT == 'development');
		if (alwaysPro || (_getOverride() && _getOverride() != '')) {
			console.log("reloadUser found Pro user");
			// Paid via PayPal
			_setType('p');
			if (callback) callback('p');
		} else {
			console.log("reloadUser found Normal user");
			// Check Google Payments
			_checkGooglePayments(function(err, type) {
				// if (ENVIRONMENT == 'staging') type = true;
				if (err) {
					logError('checkGooglePayments error: ', err);
				} else { // no error
					var pro = (type === true);
					_setType(pro ? 'p' : 'n');
					if (pro) {
						// No need to keep on checking with Google Payments
						_setOverride('google');
					}
				}
				if (callback) callback(type);
			});
		}

		// Check PayPal
		if (_paymentPeriodCheckInterval) clearInterval(_paymentPeriodCheckInterval);
		_paymentPeriodCheckInterval = setInterval(function() {
			_queryPayPalStatusPeriodically();
		}, 1000);

	};


	// PUBLIC FUNCTION: Keep calling reloadUser() until the user is marked as a 'Pro' user
	// Used when waiting for an upgrade payment to complete
	// Upon success or upon timeout, calls callback(type)
	var _reloadUserInterval = 500;
	Payments.prototype.reloadUserUntilPro = function(success, callback) {
		Payments.prototype.reloadUser(function() {
			var userType = _getType();
			if (success) {
				// Payment returned success
				if (userType == 'p') {
					// Pro user - return success
					callback({
						type: userType
					});
				} else {
					if (_reloadUserInterval < 20000) {
						// Non-pro user - keep trying
						log('Will call reload again in ' + _reloadUserInterval + 'ms');
						setTimeout(function() {
							Payments.prototype.reloadUserUntilPro(success, callback);
						}, _reloadUserInterval);
						_reloadUserInterval *= 2;
					} else {
						// Non-pro user - timeout
						log('I give up');
						callback({
							type: userType
						});
					}
				}
			} else {
				// Payment returned failure
				// Return failure immediately
				log('Reload called once due to failure');
				callback({
					type: userType
				});
			}
		});
	};


	// PUBLIC FUNCTION: Check the specified promo code with the servers
	Payments.prototype.checkPromoCode = function(code, sendResponse) {
		code = code.trim();
		if (code.indexOf('@') == -1) {
			code = parseInt(code) || 0;
		}
		var params = {
			'machineId': stats.get('userId'),
			'code': code,
			'token': Math.floor(Math.random() * 99999) + 1
		};
		log('Checking promo for ' + JSON.stringify(params));
		var onServerResponse = function(err, res) {
			if (err) {
				log('Promo server error: ' + code);
				repEvent('user-action', 'prmo-server-error', code);
				sendResponse({
					success: false,
					error: err.toString()
				});
			}
			if (res) {
				log(res);
				var success = res.success;
				var r = res.response;
				if (success) {
					var validResponse =
						hashStringToSignedInt32(r + "N79clEnJjx0PTrrpx759sFNfpMCJc") == 1281845216 &&
						hashStringToSignedInt32(r + "BUf6ffyyetwkRsmhklcOs") == 593006853 &&
						hashStringToSignedInt32(r + "KLzzTuPDoP5cXJ1iK3yrR8kzo1zC7YJTcw") == 803706031;
					if (validResponse) {
						log('Promo correct: ' + code);
						repEvent('errors', 'prmo-response-code-correct', code);
						_setOverride('prmo' + code);
						Payments.prototype.reloadUser(function() {
							sendResponse({
								success: true
							});
						})
					} else {
						log('Promo server invalid: ' + code);
						repEvent('errors', 'prmo-response-invalid-' + res.response.toString(), code);
						sendResponse({
							success: false,
							error: 'Invalid response detected: ' + res.response.toString()
						});
					}

				} else {
					log('Promo incorrect: ' + code);
					repEvent('errors', 'prmo-response-code-incorrect', code);
					sendResponse({
						success: false,
						error: 'PROMO-INCORRECT'
					});
				}
			} else {
				log('Promo server got no response: ' + code);
				repEvent('errors', 'prmo-response-no-response', code);
				sendResponse({
					success: false,
					error: 'No response received'
				});
			}
		};
		sendHttpPostRequest('http://lifehacklabs.org/api/' + _appName + '/check-promo-code', params, onServerResponse);
	};

	// PUBLIC FUNCTION: Get the SKU
	Payments.prototype.getSku = function() {
		var DEFAULT_SKU = "1";
		var installDate = stats.get('installDate') || 0;
		if (typeof(installDate) != 'number') return DEFAULT_SKU;
		var timeNow = (new Date()).getTime();
		var passedMs = timeNow - installDate;
		var passedDays = passedMs / 1000 / 3600 / 24;
		if (passedDays > 7) {
			return "2";
		}
		// if (ENVIRONMENT == "staging") return "2";
		return DEFAULT_SKU;
	}

	//----------------------------------------------------------------------------------------------------------------------------------------------------
	// Payments - Google Payments
	//----------------------------------------------------------------------------------------------------------------------------------------------------

	// Check Google Payments for the current user (based on the Chrome's user account)
	// Callback returns: errorString, paidBoolean
	var _checkGooglePayments = function(callback) {
		google.payments.inapp.getPurchases({
			'parameters': {
				'env': 'prod'
			},
			'success': function(res) {
				log('getPurchases success:', res);
				if (!res.response || typeof(res.response.details) != 'object') return callback('getPurchases no response', false);
				// Find valid purchases
				var valids = [];
				for (var i in res.response.details) {
					var item = res.response.details[i];
					log('getPurchases item:', item);
					if (item.state == "ACTIVE") {
						valids.push(item);
					}
				}
				// valids == {kind: "chromewebstore#payment", itemId: "imilbobhamcfahccagbncamhpnbkaenm", sku: "darkness_pro_monthly_1.99", createdTime: "1464616290111", state: "ACTIVE"}
				log("getPurchases valids:", valids);
				return callback(null, valids.length > 0);
			},
			'failure': function(res) {
				log('getPurchases failure:', res);
				return callback('getPurchases failure', false);

			}
		});
	};

	//----------------------------------------------------------------------------------------------------------------------------------------------------
	// Payments - PayPal
	//----------------------------------------------------------------------------------------------------------------------------------------------------

	// Paypal related variables
	var _paypalTransacationId = 'NONE';
	var _paypalTransactionResponse = null;

	// PUBLIC FUNCTION: Start a periodic check of PayPal to see if user has already paid
	// We pass a randomly-generated transactionId so we do not mix up 2 different clicks on the "Pay" button
	Payments.prototype.startPollingPayPal = function(callbackToNotifyClient, transactionId) {
		console.log("Start polling");
		_paypalTransacationId = transactionId;

		// Set stats for when polling had started
		// Polling will persist even if browser is restarted (since it's based on setInterval every second + status saved in chrome.storage)
		var now = (new Date()).getTime();
		stats.set('paypalOpenedTime', now);
		stats.set('paypalCheckedTime', now);

		// Notify the client side when the PayPal transaction is complete (success/failure)
		_notifyOnPayPalTransactionComplete(callbackToNotifyClient);
	};


	// Check if PayPal transaction is complete (success/failure) every second - invoke the callback when it is.
	var _notifyOnPayPalTransactionComplete = function(callbackToNotifyClient) {
		if (_paypalTransactionResponse) {
			// When we get a success, call callbackToNotifyClient() so the "waiting..." dialog is closed
			// If tab/browser is closed, no one will listen to callbackToNotifyClient(), which is OK since the "waiting" dialog is already gone
			callbackToNotifyClient(_paypalTransactionResponse);
		} else {
			var now = (new Date()).getTime();
			var paypalOpenedTime = stats.get('paypalOpenedTime') || 0;
			if (now - paypalOpenedTime > 1000 * 3600) { // 1 hour
				log('I give up');
				// Don't even send a response to client, keep the dialog open...
			} else {
				setTimeout(function() {
					_notifyOnPayPalTransactionComplete(callbackToNotifyClient);
				}, 1000);
			}
		}
	};

	// If there's an active PayPal transaction going on (as initiated by startPollingPayPal) - query the status periodically
	// This query is done every 3 seconds, gradually increasing to every 60 seconds, and fully stops after 48 hours
	// This function is called every 1 second, but in most cases it does nothing
	var _queryPayPalStatusPeriodically = function() {

		// If there's an active PayPal transaction (as initiated by startPollingPayPal)
		var paypalOpenedTime = stats.get('paypalOpenedTime');
		if (paypalOpenedTime) {
			var now = (new Date()).getTime();
			var paypalOpenedMillisecondsAgo = now - paypalOpenedTime;
			var paypalOpenedMinsAgo = Math.floor(paypalOpenedMillisecondsAgo / 1000 / 60);

			// Stop after 48 hours
			if (paypalOpenedMinsAgo > 60 * 48) {
				stats.remove('paypalOpenedTime');
				stats.remove('paypalCheckedTime');
				return;
			}

			// Calculate interval (3 seconds to 60 seconds)
			var howManySecondsBetweenChecks = paypalOpenedMinsAgo;
			howManySecondsBetweenChecks = Math.max(howManySecondsBetweenChecks, 3); // Not less than 3 seconds
			howManySecondsBetweenChecks = Math.min(howManySecondsBetweenChecks, 60); // Not more than 60 seconds
			howManySecondsBetweenChecks = howManySecondsBetweenChecks - 0.1; // To avoid inaccurate clock problems

			// Since this function runs every 1 second, check if it's time to send a query again?
			var paypalCheckedTime = stats.get('paypalCheckedTime');
			if (now - paypalCheckedTime > (howManySecondsBetweenChecks * 1000)) {
				_queryPayPalStatusNow();
			}
		}
	};

	// Query PayPal payment status for the current machine and current transaction
	var _queryPayPalStatusNow = function() {
		var now = (new Date()).getTime();
		stats.set('paypalCheckedTime', now);
		var machineId = stats.get('userId');
		var params = {
			'machineId': machineId,
			'transactionId': _paypalTransacationId
		};
		log('Checking IPN status for ' + JSON.stringify(params));
		var onServerResponse = function(err, res) {
			if (err) {
				repEvent('errors', 'payment-response-comm-error-' + err, machineId);
				return logError("Error communicating with server: " + err);
			}
			if (res) {
				if (res.error) {
					repEvent('errors', 'payment-response-server-error-' + res.error, machineId);
					return logError("Server returned error: " + res.error);
				}
				if (res.data) {
					if (res.data.custom_machine_id != machineId) {
						repEvent('errors', 'payment-response-incompatible-machine-id', machineId);
						return logError("Incompatible machineId returned: ", res.data.custom_machine_id, machineId);
					}

					// Save info from PayPal
					stats.set('firstName', res.data.first_name);
					stats.set('lastName', res.data.first_name);
					stats.set('email', res.data.payer_email);

					if (res.data.payment_status == 'Completed') {
						// Payment successful
						log("Payment done:", res.data);
						stats.set('upgradeDate', parseInt(res.data.timestamp));
						stats.set('ipnGuid', res.data.guid); // for future reference
						_setOverride('paypal');
						// Return a response to the client side
						// (_paypalTransactionResponse is checked periodically, and returned to client by _notifyOnPayPalTransactionComplete)
						_paypalTransactionResponse = {
							status: res.data.payment_status,
							reason: (res.data.reason_code || res.data.pending_reason || '')
						};
						// Stop polling
						stats.remove('paypalOpenedTime');
						stats.remove('paypalCheckedTime');
					} else {
						// Status != 'Completed'
						if (res.data.custom_transaction_id == _paypalTransacationId) {
							// A user's current payment transaction has failed
							log("This transaction has failed");
							// Return a response to the client side
							// (_paypalTransactionResponse is checked periodically, and returned to client by _notifyOnPayPalTransactionComplete)
							_paypalTransactionResponse = {
								status: res.data.payment_status,
								reason: (res.data.reason_code || res.data.pending_reason || '')
							};
							// Stop polling
							stats.remove('paypalOpenedTime');
							stats.remove('paypalCheckedTime');
						} else {
							// A user failed to pay in the past, but is currently trying to pay again
							log("Some previous transaction has failed, keep polling");
						}
					}
				} else {
					// No res.data = no payment ever done
					log("No payment done yet");
				}
			} else {
				// No res
				return logError("No data found in response", res);
			}
		};
		sendHttpPostRequest('http://lifehacklabs.org/api/' + _appName + '/check-user-paypal-status', params, onServerResponse);
	};


	// Important:
	return Payments;

}

// Get the construcor
var PaymentsConstructor = new PaymentsFactory();
// Run the constructor
var Payments = new PaymentsConstructor(CONFIG.appName);