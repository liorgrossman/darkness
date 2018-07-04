# Contriburing to Darkness
Please help us **improve existing skins and create new ones**. Pull requests are welcome!



## Getting started
1. If you haven't yet, [install Darkness locally](./README.md#installation)
1. Open Chrome and use Darkness regularly (e.g. open [Google](https://www.google.com/) and switch to a dark theme)
1. Run `npm start` to watch and auto-compile all SCSS files to CSS in real-time
1. Edit any SCSS or JS file you wish inside the **chrome-extension** directory
1. Refresh the tab (e.g. Google) to see the changes you've made

Note that development and debugging should be done on Chrome. To test your changes on Firefox, run `gulp ff` and [install Darkness on Firefox](./README.md#installation).

## How do I...
#### Fix or improve an existing skin
Edit `/themes/websites/[KEY].scss` (e.g. `/themes/websites/youtube.scss`)


#### Add a skin for an new website (e.g. BBC, Google Drive)
Just run `gulp skin:create --key=[KEY]` where [KEY] is lowercase and alphanumeric (e.g. bbc, googledrive).

Then follow the instructions:

1. Edit `/js/background/config.js` and add your website to CONFIG.sites, use [KEY] as a key
1. Browse to `chrome://extensions/` and reload the Darkness extension
1. Edit your new skin: `/themes/websites/[KEY].scss`
1. Don't forget to run `npm start` to **watch SCSS files** and compile them in real-time.


#### Fix or improve a color theme
Edit `/themes/themes/[THEME].scss` (e.g. `/themes/themes/material.scss`)


#### Create a new color theme (in addition to Monokai, Tomorrow, etc.)
Open `/themes/themes/THEME-TEMPLATE.scss` in your code editor and follow the instructions.

## How to push code back to Darkness?
1. Please test your changes locally in Chrome
1. Commit and push:
```bash
cd darkness
git add .
git commit -m "Description of Changes"
git push origin master
```
3. Go to [GitHub](https://github.com) and navigate to **your fork of Darkness**. 
1. Click the **New pull request** button (above the file list)
1. Click the **Create pull request** button.
1. Add a description for your pull request and click **Create pull request**

## Advanced usage
#### Compiling SASS files manually
* To compile all SASS files now: `gulp sass:compile`
* To watch all SASS files and compile in real-time: `gulp sass:watch` (alias: `npm start`)
* To clean up all .css and .css.map files: `gulp sass:cleanup`

#### Git Configuration
After [installling Darkness locally](./README.MD), the 1st remote is **origin**, which points to your fork on GitHub (use it to push and pull).
The 2nd remote that is added by you is **upstream** that points to the original Darkness repo (use it to fetch and make pull requests). [See diagram](http://i.stack.imgur.com/cEJjT.png).
