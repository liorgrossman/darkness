//----------------------------------------------------------------------------------------------------------------------------------------------------
// Darkness Configuration
//----------------------------------------------------------------------------------------------------------------------------------------------------

var GOOGLE_HOST_REGEXP = '^(www|encrypted)\.google\.(com|[a-z][a-z]|co\.[a-z][a-z]|com\.[a-z][a-z])$';

var CONFIG = {
	appName: 'darkness',
	defaultTheme: 'iceberg',

	// List of Darkness themes
	themes: {
		'iceberg': {
			key: 'iceberg',
			name: 'Iceberg'
		},
		'base16tomorrow': {
			key: 'base16tomorrow',
			name: 'Base16 Tomorrow'
		},
		'material': {
			key: 'material',
			name: 'Material Design'
		},
		'dusk': {
			key: 'dusk',
			name: 'Dusk'
		},
		'redalert': {
			key: 'redalert',
			name: 'Red Alert'
		},
		'coffee': {
			key: 'coffee',
			name: 'Coffee'
		},
		'matrix': {
			key: 'matrix',
			name: 'matrix'
		},
		'youtubedark': {
			key: 'youtubedark',
			name: 'YouTube Dark'
		}
	},

	// List of websites supported by Darkness
	sites: {

		//--------------------------------------------------------------------
		// Fully implemented skins (support: 'full')
		//--------------------------------------------------------------------
		'google': {
			key: 'google', // Must be the same as the object key
			name: 'Google',
			support: 'full',
			hostRegExp: new RegExp(GOOGLE_HOST_REGEXP, 'i'),
			pathRegExp: new RegExp('^/(search|webhp)?$'), // pathRegExp is optional and unnecessary for most websites
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Lior Grossman', link: 'https://liorgrossman.com' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{ name: 'Itay Klein', link: 'https://itiktech.blogspot.co.il/' },
				{ name: 'Arseny Gurevich', link: 'https://www.facebook.com/Arseny.Gurevich' }
			]
		},
		'quora': {
			key: 'quora', // Must be the same as the object key
			name: 'Quora',
			support: 'full',
			hostRegExp: new RegExp('^www\.quora\.com$', 'i'),
			creators: [ //
				{ name: 'Abhishek Bhasker', link: 'https://Abhinickz.github.io' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'facebook': {
			key: 'facebook', // Must be the same as the object key
			name: 'Facebook',
			support: 'full',
			hostRegExp: new RegExp('^(www|web|beta|apps|upload)\.facebook\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Marco Cazzaro', link: 'https://www.marcocazzaro.com/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{ name: 'Itamar Ostricher', link: 'https://www.ostricher.com/' },
				{ name: 'Oded Noam', link: 'https://www.odednoam.com/' },
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			]
		},
		'messenger': {
			key: 'messenger', // Must be the same as the object key
			name: 'Messenger',
			support: 'full',
			hostRegExp: new RegExp('^(www|web|beta)\.messenger\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Nicolas Botello', link: 'https://nicolasbotello.com/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{ name: 'Lior Grossman', link: 'https://liorgrossman.com' },
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			]
		},
		'instagram': {
			key: 'instagram', // Must be the same as the object key
			name: 'Instagram',
			support: 'full',
			hostRegExp: new RegExp('^www\.instagram\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'gmail': {
			key: 'gmail', // Must be the same as the object key
			name: 'Gmail',
			support: 'full',
			hostRegExp: new RegExp('^mail\.google\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Damian Schmidt', link: 'https://iristormdesign.com/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{ name: 'Alon Diamant', link: 'https://www.alondiamant.com/' },
				{ name: 'Gilad Sasson', link: 'https://www.nekuda.co.il/en/' },
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			]
		},
		'googleinbox': {
			key: 'googleinbox', // Must be the same as the object key
			name: 'Inbox',
			support: 'full',
			hostRegExp: new RegExp('^inbox\.google\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'googledrive': {
			key: 'googledrive', // Must be the same as the object key
			name: 'Google Drive',
			support: 'full',
			hostRegExp: new RegExp('^drive\.google\.com$', 'i'),
			creators: [
				{ name: 'Derek Bytheway', link: 'https://github.com/derekbtw/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			]
		},
		'googledocs': {
			key: 'googledocs', // Must be the same as the object key
			name: 'Google Docs',
			support: 'full',
			hostRegExp: new RegExp('^docs\.google\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'googlecalendar': {
			key: 'googlecalendar', // Must be the same as the object key
			name: 'Google Calendar',
			support: 'full',
			hostRegExp: new RegExp('^calendar\.google\.com$', 'i'),
			creators: [
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'googlecontacts': {
			key: 'googlecontacts', // Must be the same as the object key
			name: 'Google Contacts',
			support: 'full',
			hostRegExp: new RegExp('^contacts\.google\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'googlekeep': {
			key: 'googlekeep', // Must be the same as the object key
			name: 'Google Keep',
			support: 'full',
			hostRegExp: new RegExp('^keep\.google\.com$', 'i'),
			creators: [
				{ name: 'Maylor Taylor', link: 'https://github.com/maylortaylor/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'youtube': {
			key: 'youtube', // Must be the same as the object key
			name: 'YouTube',
			support: 'full',
			hostRegExp: new RegExp('^www\.youtube\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Kevin Mata' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{ name: 'Mayrun Digmi', link: 'https://www.mayrundigmi.com/' },
				{ name: 'Lior Grossman', link: 'https://liorgrossman.com' },
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			]
		},
		'github': {
			key: 'github', // Must be the same as the object key
			name: 'GitHub',
			support: 'full',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^(gist\.|)github\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' },
				{ name: 'Nicolas Botello', link: 'https://nicolasbotello.com/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{ name: 'Lior Grossman', link: 'https://liorgrossman.com' }
			]
		},
		'twitter': {
			key: 'twitter', // Must be the same as the object key
			name: 'Twitter',
			support: 'full',
			hostRegExp: new RegExp('^twitter\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{ name: 'Lior Grossman', link: 'https://liorgrossman.com' }
			]
		},
		'coinmarketcap': {
			key: 'coinmarketcap', // Must be the same as the object key
			name: 'CoinMarketCap',
			support: 'full',
			hostRegExp: new RegExp('^coinmarketcap\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Maylor Taylor', link: 'https://github.com/maylortaylor/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'discover': {
			key: 'discover', // Must be the same as the object key
			name: 'Discover',
			support: 'full',
			hostRegExp: new RegExp('^www\.discover\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Maylor Taylor', link: 'https://github.com/maylortaylor/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'discovercard': {
			key: 'discovercard', // Must be the same as the object key
			name: 'DiscoverCard',
			support: 'full',
			hostRegExp: new RegExp('^card\.discover\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Maylor Taylor', link: 'https://github.com/maylortaylor/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'stackoverflow': {
			key: 'stackoverflow', // Must be the same as the object key
			name: 'StackOverflow',
			support: 'full',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^stackoverflow\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Nicolas Botello', link: 'https://nicolasbotello.com/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'trello': {
			key: 'trello', // Must be the same as the object key
			name: 'Trello',
			support: 'full', // Show a call to action for developers to join our community (don't show it in dev mode)
			siteForDevelopers: true,
			hostRegExp: new RegExp('^trello\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{ name: 'John Evans', link: 'https://github.com/jhevans' }
			]
		},
		'dropbox': {
			key: 'dropbox', // Must be the same as the object key
			name: 'Dropbox',
			support: 'full',
			hostRegExp: new RegExp('^www\.dropbox\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'oldreddit': {
			key: 'oldreddit', // Must be the same as the object key
			name: 'Reddit',
			support: 'full',
			hostRegExp: new RegExp('^(www|old)\.reddit\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'jsfiddle': {
			key: 'jsfiddle', // Must be the same as the object key
			name: 'JSFiddle',
			support: 'full',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^jsfiddle\.net$', 'i'),
			creators: [
				{ name: 'Derek Bytheway', link: 'https://github.com/derekbtw/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'cloudflare': {
			key: 'cloudflare', // Must be the same as the object key
			name: 'Cloudflare',
			support: 'full',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^www\.cloudflare\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'hackernews': {
			key: 'hackernews', // Must be the same as the object key
			name: 'Hacker News',
			support: 'full',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^news\.ycombinator\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Łukasz Wójcik', link: 'https://www.lukaszwojcik.net/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'darkness': {
			key: 'darkness', // Must be the same as the object key
			name: 'Darkness Website',
			support: 'full',
			hostRegExp: new RegExp('^(darkness.app|local.darkness.com)$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Lior Grossman', link: 'https://liorgrossman.com' },
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'googlephotos': {
			key: 'googlephotos', // Must be the same as the object key
			name: 'Google Photos',
			support: 'full',
			hostRegExp: new RegExp('^photos\.google\.com$', 'i'),
			creators: [
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
    },

		//--------------------------------------------------------------------
		// Skins that still need additional work (support: 'in-development')
		//--------------------------------------------------------------------
		'linkedin': {
			key: 'linkedin', // Must be the same as the object key
			name: 'LinkedIn',
			support: 'in-development',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^www\.linkedin\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Łukasz Wójcik', link: 'https://www.lukaszwojcik.net/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'googletranslate': {
			key: 'googletranslate', // Must be the same as the object key
			name: 'Google Translate',
			support: 'in-development',
			hostRegExp: new RegExp('^translate\.google\.(.*)$', 'i'),
			creators: [
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'wikipedia': {
			key: 'wikipedia', // Must be the same as the object key
			name: 'Wikipedia',
			support: 'in-development',
			hostRegExp: new RegExp('^.+\.wikipedia\.org$', 'i'),
			creators: [
				{ name: 'Derek Bytheway', link: 'https://github.com/derekbtw/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'twitch': {
			key: 'twitch', // Must be the same as the object key
			name: 'Twitch',
			support: 'in-development',
			hostRegExp: new RegExp('^www\.twitch\.tv$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Theis Villumsen', link: 'https://folkmann.it/' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'amazon': {
			key: 'amazon', // Must be the same as the object key
			name: 'Amazon',
			support: 'in-development', // This skin still requires further improvement, help us by improving it!
			hostRegExp: new RegExp('\.amazon\.(co.uk|com|es|de|co.jp)$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Guillermo Muela', link: 'https://github.com/Gmuela' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'mint': {
			key: 'mint', // Must be the same as the object key
			name: 'Mint',
			support: 'in-development', // This skin still requires further improvement, help us by improving it!
			hostRegExp: new RegExp('^www\.mint\.com', 'i'),
			creators: [
				{ name: 'EJ Seay', link: 'https://github.com/earlseay' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'craigslist': {
			key: 'craigslist', // Must be the same as the object key
			name: 'Craigslist ',
			support: 'in-development', // This skin still requires further improvement, help us by improving it!
			hostRegExp: new RegExp('craigslist\.*$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'EJ Seay', link: 'https://github.com/earlseay' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'martinfowler': {
			key: 'martinfowler', // Must be the same as the object key
			name: 'MartinFowler.com',
			support: 'in-development',
			hostRegExp: new RegExp('martinfowler\.com$', 'i'),
			creators: [
				{ name: 'Hosam Aly', link: 'https://github.com/hosamaly' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},
		'paypal': {
			key: 'paypal', // Must be the same as the object key
			name: 'PayPal',
			support: 'in-development',
			hostRegExp: new RegExp('^(.+)?paypal\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{ name: 'Bartosz Zalewski', link: 'https://github.com/reveur404' }
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
			]
		},

		//--------------------------------------------------------------------
		// Ask developers for help on the following websites
		//--------------------------------------------------------------------
		'cloudcraft': {
			key: 'cloudcraft', // Must be the same as the object key
			name: 'Cloudcraft',
			support: 'ask-developers',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^cloudcraft\.co$', 'i')
		},
		'bitbucket': {
			key: 'bitbucket', // Must be the same as the object key
			name: 'Bitbucket',
			support: 'ask-developers',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^bitbucket\.org$', 'i')
		},
		'gitlab': {
			key: 'gitlab', // Must be the same as the object key
			name: 'GitLab',
			support: 'ask-developers',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^gitlab\.com$', 'i')
		},
		'serverfault': {
			key: 'serverfault', // Must be the same as the object key
			name: 'Server Fault',
			support: 'ask-developers',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^serverfault\.com$', 'i')
		},
		'askubuntu': {
			key: 'askubuntu', // Must be the same as the object key
			name: 'Ask Ubuntu',
			support: 'ask-developers',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^askubuntu\.com$', 'i')
		},
		'w3schools': {
			key: 'w3schools', // Must be the same as the object key
			name: 'W3Schools',
			support: 'ask-developers',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^www\.w3schools\.com$', 'i')
		},
		'codepen': {
			key: 'codepen', // Must be the same as the object key
			name: 'Codepen',
			support: 'ask-developers',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^codepen\.io$', 'i')
		},
		'jsbin': {
			key: 'jsbin', // Must be the same as the object key
			name: 'JS Bin',
			support: 'ask-developers',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^jsbin\.com$', 'i')
		},
		'box': {
			key: 'box', // Must be the same as the object key
			name: 'Box',
			support: 'ask-developers',
			hostRegExp: new RegExp('^www\.box\.com$', 'i')
		},
		'fontawesome': {
			key: 'fontawesome', // Must be the same as the object key
			name: 'Font Awesome',
			support: 'ask-developers',
			siteForDevelopers: true,
			hostRegExp: new RegExp('^fontawesome\.com$', 'i')
		},
		'overleaf': {
			key: 'overleaf', // Must be the same as the object key
			name: 'Overleaf',
			support: 'ask-developers',
			hostRegExp: new RegExp('^overleaf\.com$', 'i')
		},
		'slack': {
			key: 'slack', // Must be the same as the object key
			name: 'Slack',
			support: 'ask-developers',
			hostRegExp: new RegExp('^(.+)?slack\.com$', 'i')
		},
		'googlescript': {
			key: 'googlescript', // Must be the same as the object key
			name: 'Google Script',
			support: 'ask-developers',
			hostRegExp: new RegExp('script\.google\.com$', 'i')
		}
	}
};
