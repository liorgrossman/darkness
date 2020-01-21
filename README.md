# Darkness: Dark Themes for Popular Websites

<img alt="Darkness Logo" src="https://raw.githubusercontent.com/liorgrossman/darkness/master/assets/documentation/darkness-icon-48px.png?v=2" align="left" style="padding: 0 10px 5px 0; background-color: transparent">

**Darkness** is a browser extension for Chrome and Firefox that provides **dark themes** for many popular websites, such as Google, Facebook, Gmail and YouTube.

Using dark themes reduces the eye strain and fatigue caused by a bright screen, helps you sleep faster and better at night, and generally makes you awesome!

**[Pull requests are welcome! Help us improve Darkness by contributing fixes and new themes](./CONTRIBUTING.md)**

**Major contributors (10+ commits):** [Lior Grossman](http://liorgrossman.com/), [Theis Villumsen](https://folkmann.it/), [Nicolas Botello](http://nicolasbotello.com/), [Derek Bytheway](https://github.com/derekbtw/), [Matt Tayler](https://github.com/maylortaylor)

<div style="text-align:center">
<img alt="Screenshot" src="https://raw.githubusercontent.com/liorgrossman/darkness/master/assets/documentation/darkness-screenshot.png">
</div>

## Features
* Supports over 25 websites: Google, Facebook, YouTube, Gmail, Google Drive, Twitter, Facebook Messenger, Instagram, Reddit, Google Keep, Google Photos, Google Calendar, Dropbox, Quora, **GitHub, StackOverflow, Trello, JSFiddle** and others ([help us add more](./CONTRIBUTING.md))
* Select from 7 dark color themes: Iceberg, Tomorrow, Material, Dusk, Red Alert, Coffee, Matrix ([help us add more](./CONTRIBUTING.md))
* Written in JavaScript, uses SASS
* Self-hosted. Easy to install on Windows, Mac, Linux
* Also available on [Chrome Web Store](https://chrome.google.com/webstore/detail/darkness-beautiful-dark-t/imilbobhamcfahccagbncamhpnbkaenm) and [Firefox Add-on Store](https://addons.mozilla.org/en-US/firefox/addon/darkness-dark-themes/)



## Installation
####  Installing Darkness Developer Edition:
1. Fork the Darkness repository: https://github.com/liorgrossman/darkness/fork
1. Clone the fork on your machine:
	* If you use SSH: `git clone git@github.com:YOUR_GITHUB_USER/darkness.git`
 	* If you use HTTPS: `git clone https://github.com/YOUR_GITHUB_USER/darkness.git`
1. Go to the Darkness root directory: `cd darkness`
1. Add the original repository as a remote:
	* If you use SSH: `git remote add upstream git@github.com:liorgrossman/darkness.git`
 	* If you use HTTPS: `git remote add upstream https://github.com/liorgrossman/darkness.git`
1. Fetch the code: `git fetch upstream`
1. Run `npm install` from the same directory as package.json to install dependencies and compile all SCSS to CSS ([Node.js](https://nodejs.org/) required)

#### Loading it in Chrome:
1. Open Chrome and browse to [chrome://extensions](chrome://extensions)
1. If you've previously installed Darkness from Chrome Web Store, disable it
1. Check **Developer mode** in the top of the Extensions page
1. Click **Load unpacked**
1. Choose the sub-directory **darkness/chrome-extension** (where manifest.json resides)

#### Loading it in Firefox:
1. Run `gulp ff` to replicate and transform the **chrome-extension** directory to **firefox-extension**
1. Open Firefox and browse to [about:debugging](about:debugging)
1. If you've previously installed Darkness from Firefox Add-on store, disable it
1. Click **Load Temporary Add-on**
1. Choose the file **darkness/firefox-extension/manifest.json**

#### To keep Darkness up-to-date, please pull occasionally:
```bash
git checkout master
git pull upstream master
npm install
Firefox version only: gulp ff
```

## Contributing fixes and new themes
**Pull requests are welcome!**
Please see our [contribution guide](./CONTRIBUTING.md) to learn how to quickly improve and extend Darkness


## Be in touch
* Join the [Darkness Developers Community on Facebook](https://www.facebook.com/groups/darkness-developers)
* [Contact us](https://darkness.app/contact/)
* Check out our other projects: [Openbase](https://openbase.io/), [Wikiwand](https://www.wikiwand.com/), [BookAuthority](https://bookauthority.org/), [The Master List](https://themasterlist.org/) 

##  Misc
Darkness is licensed [GPLv3](./LICENSE). Privacy policy available [here](https://darkness.app/privacy/darkness-privacy-policy.pdf)
