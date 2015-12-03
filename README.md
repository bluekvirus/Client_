Stage.js
===================
<img src="http://img.shields.io/bower/v/stage.js.svg?style=flat" alt="Current Version"></img> <img src="http://img.shields.io/badge/supports-Cordova-3B4854.svg?style=flat" alt="Supports Cordova"></img>

[Change Log](CHANGELOG.md) - What's changed?

To get version, type `app.stagejs` in the console. Example output:
```
app.stagejs (1.8.x-<commits> build <timestamp>)
```
You can compare this version number with the one you see on the [documentation site](http://bluekvirus.github.io/Stage.js/#navigate/Document) and see if an upgrade is recommended.

**Announcement**: We are working on a fully upgraded live demo site and updated version of documents for the v1 branch. We are also working on the v2 branch development. A complete feature listing is available. ([v2 plan](#whats-next)). Please note that v1 will not be abandoned even if v2 is released, they are different tech directions. v2 will be called `-ng`.

> <sup>\*</sup>LTS - Given that ECMAScript6 is coming and our goal of making a lightweight, time-saving and most importantly **easy** framework for both desktop web and hybrid application development, further improvements will be made directly into the v2 codebase without disturbing the v1 branch. The LTS version also serves as a benchmark for creating tests and for feature-list and feedback gathering. We have now successfully released 6 security products with complex configure panels/dashboards and excellent user flows & localizations through the v1 branch. More will come. 

This project produces **Stage.js** - an infrastructure for building modern web application client with different contexts (e.g a data-heavy administration app). In other words, we solve this problem for you:

<img src="implementation/static/resource/default/diagram/Diagram-1.png" alt="UI/UX Problems" class="center-block"></img>


Quick Start
------------
<a href="https://www.npmjs.org/package/stage-devtools"><img src="http://img.shields.io/npm/v/stage-devtools.svg?style=flat-square" alt="DevTools Version"></img></a> 

Use the devtools to get started quickly.
```
npm -g install stage-devtools
mkdir project
cd project
stagejs init
stagejs serve [--port <number>]
```
You can now start developing your app with Stage.js. Read the [command-line tool](https://www.npmjs.com/package/stage-devtools) for more.


Documentation
-------------
Again, as an application developer you are encouraged read this [documentation](http://bluekvirus.github.io/Stage.js/#navigate/Document)


What's next?
------------
[:crystal_ball: Preview current progress](https://github.com/bluekvirus/skeleton-webui).

2.0.0 Roadmap:
* AMD support; (:heavy_check_mark:)
* ECMAScript 5 & 6 support; (:heavy_check_mark:)
* Handshake mode support in app init,load & view init; (:heavy_check_mark:)
* Support reactive app building concept; (optional two-way bindings, MVVM) (:heavy_check_mark:)
* Global co-op events; (:heavy_check_mark:, back-ported)
* Merge Context, Regional, Widget, Editor and Canvas to be generic named Views; (:heavy_check_mark:, back-ported)
* Refine the navigation and layout region concepts; (:heavy_check_mark:)
* Remove deps on Backbone.js, Marionette.js, jQuery UI Core to have a lightweight core; (:heavy_check_mark:)
* Remove theming/templating deps on Bootstrap (free to choose your own); (:heavy_check_mark:)
* Remove optional charting deps on Raphael (free to choose your own); (:heavy_check_mark:)
* Keep [Cordova](https://cordova.apache.org/) hybrid HTML5 mobile app support (touch, gestures, ready-e); (:heavy_check_mark:)
* Keep i18n, data validators, async coordination support; (:heavy_check_mark:) 
* Put custom-made dev process pipeline onto Gulp; (:heavy_check_mark:)
* Test automation in BDD; (in progress)
* Data handling shortcuts in Views (data property, set()/get()/refresh());
* Websocket integration for messaging/notification & peer discovery; (:heavy_check_mark:, from v1)
* WebRTC integration for peer-to-peer data/stream sharing;
* Introduce state machine into Views;
* Introduce engine into App;
* Give View action listeners a choice to go background (Web Worker);


Optional:
* complete filter/sorter/pager in views (v1 has remote version only);
* form & input wrappers (already in v1);
* view to ui prompts (overlay already in v1, need notification, popover);
* view transition effects (already in v1);
* grid and cells (already in v1);
* tree and recursive views (already in v1);
* dev-server stack; (already in v1);


Contribute
----------
Fork/Clone the project and tweak the code locally, then contribute by making a pull request so you can push the change in.

###Prepare
After cloning the project, you should go to `/tools` and run these commands:
```
//1. prepare npm packages
npm install

//2. prepare bower packages
./lib-update.sh

//3. prepare default & doc site theme packs (under ./themeprep)
node run default
node run site

//4. fire up dev server
./start.sh
```
This should fire-up the development server. It will serve the `/implementation` folder as web root on the port define by `/tools/devserver/profile/default`. Please go check the content of this profile config file before starting. It has some nice middlewares and auto-change-detectors there you can switch on/off to make the development a lot easier.

###Develop, Demo & Tryout
Change code under `/implementation/js/src` to test and contribute your ideas to this framework.

You can also change the code under `/implementation/site`, it is the application for **Stage.js**'s documentation site.

Look closely to the `/implementation/index.html` file, it not only defines the loading sequence of all the src files but also defines which one goes to which build target in the build process.

###Modify theme
Please go check the `/implementation/themes/default` basic theme package and follow instructions in the `/less/main.less` over there. You can easily switch to use other base themes offered by [bootswatch](http://bootswatch.com/) (based on Bootstrap 3) to quickly build up your own.

You can always refresh existing theme or start a new one by using the theme-prep tool under `/implementation/tools/themeprep`.

###Commit Info
Use the following `git` command to see some brief info about repo commits
```
git log --abbrev-commit --pretty=oneline -n 5
git rev-list HEAD --count
```


Distribute
----------
###Build
```
//0. change version numbers
a. CHANGELOG.md and tools/libprep/bower.json
//numbers in README.md, HOWTO.md are updated automatically.

//1. [optional] update libs & bower release version
tools/lib-update.sh

//2. [optional] update themes (under tools/themeprep/)
//**Stop the devserver by using `./stop.sh` under `tools` first!**
node run 
node run site

//3. build distributions & doc site
tools/build.sh
```
**Important**: If you see any of the `*.less` file contains `@import url("...")` remove them before you compile the theme. Try to bring that piece to local code base. (e.g Host the web font yourself.)

###Deploy
See in `tools/build/dist` and `dist` for details. The shortcut command also builds the project site (as its github page).


License
-------
Copyright 2013 - 2015 Tim Lauv. 
Under the [MIT](http://opensource.org/licenses/MIT) License.

