# Darkness: Dark Themes for Popular Websites

<img alt="Darkness Logo" src="https://raw.githubusercontent.com/liorgrossman/darkness/master/assets/documentation/darkness-icon-48px.png?v=2" align="left" style="padding: 0 10px 5px 0; background-color: transparent">

**Darkness** is a browser extension for Chrome and Firefox that provides **dark themes** for popular websites such as Google, Facebook, Gmail and YouTube.

Using dark themes reduces the eye strain and fatigue caused by a bright screen, helps you sleep faster and better at night, and generally makes you awesome!

**Major contributors (10+ commits):** [Lior Grossman](http://liorgrossman.com/), [Theis Villumsen](https://folkmann.it/), [Nicolas Botello](http://nicolasbotello.com/), [Derek Bytheway](https://github.com/derekbtw/)

**[Join our growing developers community on Facebook](https://www.facebook.com/groups/darkness-developers) to stay in the loop!**


<div style="text-align:center">
<img alt="Screenshot" src="https://raw.githubusercontent.com/liorgrossman/darkness/master/assets/documentation/darkness-screenshot.png">
</div>

## Features
* Supports over 20 websites: Google, Facebook, YouTube, Gmail, Inbox, Google Docs, Google Photos, Google Keep, Google Calendar and Contacts, Dropbox, Twitter, Reddit, Quora, Facebook Messenger, **StackOverflow, GitHub, Trello, CloudFlare, ShareLaTeX** and others ([help us add more](./CONTRIBUTING.md))
* Select from 5 dark color themes: Iceberg, Tomorrow, Material Design, Dusk, Red Alert ([help us add more](./CONTRIBUTING.md))
* Written in JavaScript, uses SASS
* Self-hosted. Easy to install on Windows, Mac, Linux
* Also available on [Chrome Web Store](https://chrome.google.com/webstore/detail/darkness-beautiful-dark-t/imilbobhamcfahccagbncamhpnbkaenm) and [Firefox Add-on Store](https://addons.mozilla.org/en-US/firefox/addon/darkness-dark-themes/)



## Installation
####  Installing Darkness Developer Edition:
1. Recommended: [join our developers community](https://www.facebook.com/groups/darkness-developers) to discuss and ask questions
1. Fork the Darkness repo: https://github.com/liorgrossman/darkness/fork
1. Clone your fork locally:
	* If you use SSH: `git clone git@github.com:YOUR_GITHUB_USER/darkness.git`
 	* or using HTTPS: `git clone https://github.com/YOUR_GITHUB_USER/darkness.git`
1. Go to the root Darkness directory: `cd darkness`
1. Set up a the original repo as a remote:
	* If you use SSH: `git remote add upstream git@github.com:liorgrossman/darkness.git`
 	* or using HTTPS: `git remote add upstream https://github.com/liorgrossman/darkness.git`
1. Get the code: `git fetch upstream`
1. [Install Node.js](https://nodejs.org/), unless you already have it installed
1. Install packages and compile all SCSS files to CSS: `npm install` (run it from the same directory as package.json)

#### Loading it in Chrome:
1. Open Chrome and browse to [chrome://extensions](chrome://extensions)
1. If you already Darkness installed Darkness from Chrome Web Store, disable it
1. Check **Developer mode** in the top of the Extensions page
1. Click **Load unpacked extension...**
1. Choose the sub-directory **darkness/darkness-chrome** (where manifest.json resides)

#### Loading it in Firefox:
1. Run `gulp ff` to transform the **darkness-chrome** directory to **darkness-firefox**
1. Open Firefox and browse to [about:debugging](about:debugging)
1. If you already Darkness installed Darkness from Firefox Add-on store, disable it
1. Click **Load Temporary Add-on**
1. Choose the file **darkness/darkness-firefox/manifest.json**

#### To keep Darkness up-to-date, please pull occasionally:
```bash
git checkout master
git pull upstream master
npm install
```
If you use it on Firefox, also run: `gulp ff`

## Contributing fixes and new themes
**Pull requests are welcome!**
Please see our [contribution guide](./CONTRIBUTING.md) to quickly improve and extend Darkness


## Be in touch
* Join the [Darkness Developers Community on Facebook](https://www.facebook.com/groups/darkness-developers)
* Contact us at: support@darkness.app
* Check out our other projects: [BookAuthority](https://bookauthority.org/) and [Select New Tab](https://chrome.google.com/webstore/detail/select-beautiful-photos-f/gidbhaipbdimcjbjkpnhkdhghpbghena)

##  Misc
Darkness is licensed [GPLv3](./LICENSE). Please read our privacy policy [here](https://darkness.app/privacy/darkness-privacy-policy.pdf)