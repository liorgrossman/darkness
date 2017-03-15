//----------------------------------------------------------------------------------------------------------------------------------------------------
// Payment handler
//----------------------------------------------------------------------------------------------------------------------------------------------------
"use strict";

var PromoFactory = function() {

	// Global vailables
	var _appName = null;

	// Constructor
	function Promo(appName) {
		_appName = appName;
	}

	Promo.prototype.get = function() {
		return {
			title: 'Check out our beautiful "new tab" extension',
			url: 'https://goo.gl/Natio5'
		}
	};

	// Important:
	return Promo;

}

// Get the construcor
var PromoConstructor = new PromoFactory();

