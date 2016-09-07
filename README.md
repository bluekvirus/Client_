Stage.js
===================
<img src="http://img.shields.io/bower/v/stage.js.svg?style=flat" alt="Current Version"></img> <img src="http://img.shields.io/badge/supports-Cordova-3B4854.svg?style=flat" alt="Supports Cordova"></img>

[Change Log](CHANGELOG.md) - What's changed?

To get version, type `app.stagejs` in the console. Example output:
```
app.stagejs (1.9.x-<commits> build <timestamp>)
```
You can compare this version number with the one you see on the [documentation site](http://bluekvirus.github.io/Stage.js/#navigate/Document) and see if an upgrade is recommended.

**Announcement**: We are working on a fully upgraded live demo/document site for the v1 branch. We are also working on the v2 branch development. A complete feature listing is available. ([v2 plan](#whats-next)). Please note that v1 will **NOT be abandoned** even if v2 is released, they are different tech directions. v2 will be called `-ng`.

> <sup>\*</sup>The v1 branch serves as a benchmark for creating tests for features and for feedback gathering. We have now successfully released 6 web/cloud products offering intuitive control panels, complex monitoring dashboards, online/offline reports and excellent user interactions with full localization support through the v1 branch. More will come. 

This project produces **Stage.js** - an infrastructure for building modern web application client with different contexts (e.g a data-heavy administration app). In other words, we solve this problem for you:

<img src="implementation/static/resource/default/diagram/Diagram-1.png" alt="UI/UX Problems" class="center-block"></img>


Quick Start
------------
<a href="https://www.npmjs.org/package/stage-devtools"><img src="http://img.shields.io/npm/v/stage-devtools.svg?style=flat-square" alt="DevTools Version"></img></a> 

Use the devtools to get started quickly.
```
1. Prep

npm -g install stage-devtools
stagejs env

2. Start

mkdir <project dir>
cd <project dir>
stagejs init
stagejs theme
stagejs serve [--port <number>]
```
You can now start developing your app with Stage.js. Read the [command-line devtool](https://www.npmjs.com/package/stage-devtools) for more.


Documentation
-------------
Again, as an application developer you are encouraged read this [documentation](http://bluekvirus.github.io/Stage.js/#navigate/Document)


Contribute
----------
Fork/Clone the project and tweak the code locally, then contribute by making a pull request so you can push the change in.

###Prepare
After cloning the project, you should go to `/tools` and run these commands:
```
0. Check your development environment

stagejs env

1. Prepare npm packages

npm install

2. Prepare bower packages

./lib-update.sh

3. Prepare doc site theme packs (under ./themeprep)

node run site
node run site --fonts fontawesome

4.a Fire up dev server (background logging by forever)

./start.sh

or
4.b Fire up dev server (foreground logging by nodemon)

npm start
```
This should fire-up the development server. It will serve the `/implementation` folder as web root on the port define by `/tools/devserver/profile/default`. Please go check the content of this profile config file before starting. It has some nice middlewares and auto-change-detectors there you can switch on/off to make the development a lot easier.

###Develop, Demo & Test
Change code under `/implementation/js/src` to test and contribute your ideas to this framework.

You can also change the code under `/implementation/site`, it is the application for **Stage.js**'s documentation site and it also holds all the tests and demos.

Look closely to the `/implementation/index.html` file, it not only defines the loading sequence of all the src files but also defines which one goes to which build target in the build process.

###Modify theme
Please go check the `/implementation/themes/default` basic theme package and follow instructions in the `/less/main.less` over there. You can easily switch to use other base themes offered by [bootswatch](http://bootswatch.com/) (based on Bootstrap 3) to quickly build up your own.

You can always refresh existing theme or start a new one by using the theme-prep tool under `/implementation/tools/themeprep`. Note that this is the same as using the command-line tool `stagejs theme <name>` in your own projects. But since this is the framework project itself, the command-line tool can not be of assistance here.

###Checking commit history
Use the following `git` command to see some brief history about repo commits
```
git log --abbrev-commit --pretty=oneline -n 5
git rev-list HEAD --count
```


Distribute
----------
###Build
```
0. Change version numbers

CHANGELOG.md
tools/libprep/bower.json
(README.md, HOWTO.md are updated automatically.)

1.a Update libs & bower release version

tools/lib-update.sh

or
1.b Update bower release version only

tools/libprep/node run.js all

2. [optional] Update themes
(Stop the devserver by using `./stop.sh` under `tools` first!)

node tools/themeprep/run 
node tools/themeprep/run site

3. Build distributions & doc site

tools/build.sh
```
**Important**: If you see any of the `*.less` file contains `@import url("...")` remove them before you compile the theme. Try to bring that piece to local code base. (e.g Host the web font yourself.)

###Deploy
See in `tools/build/dist` and `dist` for details. The shortcut command also builds the project site (as its github page).


What's next?
------------
[:crystal_ball: Preview current progress](https://github.com/bluekvirus/Stage.js-ng/tree/master/libs/vendor/stagejsv2).

2.0.0 Roadmap:
* AMD support; (:heavy_check_mark:)
* ECMAScript6 (2015-2016) support; (:heavy_check_mark:)
* Build a lightweight framework core from scratch; (:heavy_check_mark:)
* Handshake (Full-Async) mode for view init; (:heavy_check_mark:)
* Support optional reactive view building; (two-way bindings through MVVM) (:heavy_check_mark:)
* Remove theming/templating deps on Bootstrap (easy to hook your own); (:heavy_check_mark:)
* Port custom-made DevOps process pipeline onto Gulp; (:heavy_check_mark:)
* Introduce data engine to App (auto polling and server-push channel handling); (:heavy_check_mark:)
* WebRTC integration for peer-to-peer data/stream sharing; (in progress)
* Introduce state machine into Views;
* Give View action listeners a choice to go background (Web Worker);

Optional:
* complete filter/sort/pagination in views (v1 has remote version only);


License
-------
Copyright 2013 - 2016 Tim Lauv. 
Under the [MIT](http://opensource.org/licenses/MIT) License.

