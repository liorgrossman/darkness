//----------------------------------------------------------------------------------------------------------------------------------------------------
// Darkness Configuration
//----------------------------------------------------------------------------------------------------------------------------------------------------

var GOOGLE_HOST_REGEXP = '^(www|encrypted)\.google\.(com|[a-z][a-z]|co\.[a-z][a-z]|com\.[a-z][a-z])$';

var CONFIG = {
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
		}
	},

	// List of websites supported by Darkness
	sites: {
		'google': {
			key: 'google', // Must be the same as the object key
			name: 'Google',
			support: 'full',
			hostRegExp: new RegExp(GOOGLE_HOST_REGEXP, 'i'),
			pathRegExp: new RegExp('^/(search|webhp)?$'), // pathRegExp is optional and unnecessary for most websites
			creators: [ // Who wrote the 80%+ of the skin?
				{name: 'Lior Grossman', link: 'http://liorgrossman.com'}
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{name: 'Itay Klein', link: 'http://itiktech.blogspot.co.il/'},
				{name: 'Arseny Gurevich', link: 'https://www.facebook.com/Arseny.Gurevich'}

			]
		},
		'facebook': {
			key: 'facebook', // Must be the same as the object key
			name: 'Facebook',
			support: 'full',
			hostRegExp: new RegExp('^(www|web|beta)\.facebook\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{name: 'Marco Cazzaro', link: 'http://www.marcocazzaro.com/'}
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{name: 'Itamar Ostricher', link: 'http://www.ostricher.com/'},
				{name: 'Oded Noam', link: 'http://www.odednoam.com/'}
			]
		},
		'gmail': {
			key: 'gmail', // Must be the same as the object key
			name: 'Gmail',
			support: 'full',
			hostRegExp: new RegExp('^mail\.google\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{name: 'Damian Schmidt', link: 'http://iristormdesign.com/'}
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{name: 'Alon Diamant', link: 'http://www.alondiamant.com/'},
				{name: 'Gilad Sasson', link: 'http://www.nekuda.co.il/en/'}

			]
		},
		'youtube': {
			key: 'youtube', // Must be the same as the object key
			name: 'YouTube',
			support: 'full',
			hostRegExp: new RegExp('^www\.youtube\.com$', 'i'),
			creators: [ // Who wrote the 80%+ of the skin?
				{name: 'Kevin Mata'}
			],
			topContributors: [ // Top 3 contributors of fixes & improvements, excluding the creator
				{name: 'Mayrun Digmi', link: 'http://www.mayrundigmi.com/'},
				{name: 'Lior Grossman', link: 'http://liorgrossman.com'}
			]
		},
		'github': {
			key: 'github', // Must be the same as the object key
			name: 'GitHub',
			support: 'ask-developers',
			hostRegExp: new RegExp('^github\.com$', 'i')
		},
		'stackoverflow': {
			key: 'stackoverflow', // Must be the same as the object key
			name: 'StackOverflow',
			support: 'ask-developers',
			hostRegExp: new RegExp('^stackoverflow\.com$', 'i')
		},
		'trello': {
			key: 'trello', // Must be the same as the object key
			name: 'Trello',
			support: 'ask-developers',
			hostRegExp: new RegExp('^trello\.com$', 'i')
		}
	}
};
