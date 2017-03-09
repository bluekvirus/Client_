/*
 * Main application definition.
 *
 * Usage
 * -----------------------
 * ###How to start my app?
 * 
 * 1. app.setup({config});
 * 2. app.run([hybrid ready e]);
 * 
 * Suggested additional events are:
 *   	app:error - app.onError ==> window.onerror in hybrid mode.
 *    	app:login - app.onLogin [not-defined]
 *     	app:logout - app.onLogout [not-defined]
 *      app:server-push - app.onServerPush [not-defined]
 * You can define them in a fn through app.addInitializer(fn(options));
 * 
 * 
 * Global vars
 * ------------
 * $window
 * $document
 * $body
 * $head
 * Application/app
 *
 * 
 * Global coop events
 * ------------
 * 'ws-data-[channel]'
 * 'poll-data-[e]'
 * 'reusable-registered'
 * 'context-switched'
 * 'window-resized'
 * 'window-scroll'
 * 
 *
 * @author Tim Lauv
 * @created 2014.02.17
 * @updated 2015.08.03
 * @updated 2016.03.31
 */

;(function(app){

	//setup configures, navigation mechanisms (both ctx switch and #history) and 1st(main) view.
	app.setup = function(config){
		
		//0. Re-run app.setup will only affect app.config variable.
		if(app.config) {
			_.extend(app.config, config);
			return;
		}

		//1. Configure.
		app.config = _.extend({

			//------------------------------------------app.mainView-------------------------------------------
			//mainView has limited ability as a generic view (supports data/action, but can not be form, canvas or having co-ops)
			template: undefined,
			layout: undefined, //honored only if template is undefined, also indicates app.config.fullScreen = true
			//e.g:: have a unified layout as template.
			/**
			 * ------------------------
			 * |		top 	      |
			 * ------------------------
			 * | left | center | right|
			 * |	  |        |      |
			 * |	  |        |      |
			 * |	  |        |      |
			 * |	  |        |      |
			 * ------------------------
			 * |		bottom 	      |
			 * ------------------------		 
			 * 
			 * == --> layout: ['1:#top', ['5', ['1:left', '4:center', '1:right']], '1:.bottom, .bottom2, .bottom3']
			 */
			data: undefined,
			actions: undefined,
			navRegion: 'contexts', //alias: contextRegion
			//---------------------------------------------------------------------------------------------
			defaultView: undefined, //alias: defaultContext, this is the context (name) the application will sit on upon loading.
			icings: {}, //various fixed overlaying regions for visual prompts ('name': {top, bottom, height, left, right, width})
						//alias -- curtains			
			fullScreen: false, //this will put <body> to be full screen sized (window.innerHeight).
	        websockets: [], //websocket paths to initialize with (single path with multi-channel prefered).
	        baseAjaxURI: '', //modify this to fit your own backend apis. e.g index.php?q= or '/api',
			csrftoken: {
				header: 'X-CSRFToken', //http header to use to include the csrftoken val
				cookie: 'csrftoken' //cookie name to look for the csrftoken val
			},	        
	        viewTemplates: 'static/template', //this is assisted by the build tool, combining all the *.html handlebars templates into one big json.
			viewSrcs: undefined, //set this to enable reusable view dynamic loading.
			i18nResources: 'static/resource', //this the the default location where our I18N plugin looks for locale translations.
			i18nTransFile: 'i18n.json', //can be {locale}.json
			i18nLocale: '', //if you really want to force the app to certain locale other than browser preference. (Still override-able by ?locale=.. in url)
			rapidEventDelay: 200, //in ms this is the rapid event delay control value shared within the application (e.g window resize, app.throttle, app.debounce).
			timeout: 5 * 60 * 1000, //general communication timeout (ms). for app.remote and $.fileupload atm.
			//------------------------------------------3rd-party options----------------------------------
			marked: {
				gfm: true,
				tables: true,
				breaks: true,
				pedantic: false, //don't use original markdown.pl choices
				sanitize: true,
				smartLists: true,
				smartypants: false //don't be too smart on the punctuations
			},
			hljs: {
				languages: ['c', 'python', 'javascript', 'html', 'css']
			}
		}, config);
		
		//2. Global App Events Listener Dispatcher
		app.Util.addMetaEvent(app, 'app');

		//3. Setup the application with content routing (navigation).
		// - use app:navigate (path) at all times when navigate between contexts & views.
		app.onNavigate = function(options, silent){
			if(!app.available()) {
				app.trigger('app:locked', options);
				return;
			}

			var path = '', opt = options || '';
			if(_.isString(opt)){
				path = opt;
			}else {
				//backward compatibility 
				path = opt.path || _.string.rtrim([opt.context || app.currentContext.name, opt.module || opt.subpath].join('/'), '/');
			}

			//inject context config before navigate (e.g app.navigate({path: ..., viewConfig: {}}, [silent]))
			app._navViewConfig = app._navViewConfig || opt.ctxConfig || opt.viewConfig;

			if(silent || app.hybridEvent)
				navigate(path);//hybrid app will navigate using the silent mode. (sync mode, no #hashchange)
			else
				//note that, this will in turn call app.navigate() again which triggers a silent app:navigate again.
				window.location.hash = 'navigate/' + path;
				//wait for #hashchange to be captured by BB.History() --> BB.Router (async mode, app.coop()s might not work immediately)
		};

		app.onContextGuardError = function(error, ctxName){
			console.error('DEV:Context-Guard-Error:', ctxName, error);
		};

		//---navigation worker---
			function navigate(path){
				path = _.compact(String(path).split('/'));
				if(path.length <= 0) throw new Error('DEV::Application::navigate() Navigation path empty...');

				var context = path.shift();

				if(!context) throw new Error('DEV::Application::navigate() Empty context/view name...');
				var TargetContext = app.get(context, 'Context', true); //fallback to use view if context not found.
				if(!TargetContext) throw new Error('DEV::Application::navigate() You must have the required context/view ' + context + ' defined...');			
				if(!app.currentContext || app.currentContext.name !== context) {
					
					//re-create target context upon switching
					var targetCtx = TargetContext.create(), guardError;
					app.Util.addMetaEvent(targetCtx, 'context');//patch in 'context:e' meta events for backward compatibility.

					//allow context to guard itself (e.g for user authentication)
					if(targetCtx.guard) guardError = targetCtx.guard();
					if(guardError) {
						app.trigger('app:context-guard-error', guardError, targetCtx.name);
						app.trigger('app:navigation-aborted', targetCtx.name);
						return;
					}
					//allow context to check/do certain stuff before navigated to
					targetCtx.trigger('view:before-navigate-to');

					//save your context state within onNavigateAway()
					if(app.currentContext) app.currentContext.trigger('view:navigate-away'); 
					//prepare and show this new context					
					var navRegion = app.config.navRegion || app.config.contextRegion;
					var targetRegion = app.mainView.getRegion(navRegion);
					if(!targetRegion) throw new Error('DEV::Application::navigate() You don\'t have region \'' + navRegion + '\' defined');		
					
					//note that 'ready' is guaranteed to happen after region enter/exit effects
					targetCtx.once('ready', function(){
						app.currentContext = targetCtx;
						//fire a notification to app as meta-event. (e.g menu view item highlighting)
						app.trigger('app:context-switched', app.currentContext.name);
						app.coop('context-switched', app.currentContext.name, {ctx: app.currentContext, subpath: path.join('/')});
						//notify regional views in the context (views further down in the nav chain)
						app.currentContext.trigger('view:navigate-chain', path); //see layout.js
					});
					targetRegion.show(targetCtx);
					//note that 'view:navigate-to' triggers after '(view:show -->) region:show';
				}else
					//notify regional views in the context (with old flag set to true)
					app.currentContext.trigger('view:navigate-chain', path, true); //see layout.js

			}
		//-----------------------

		//4 Put up Main View and activate Routing (href = #navigate/...) AFTER running all the initializers user has defined.
		app.on("app:initialized", function(options){

			//a. Put main template into position.
			app.addRegions({
				'region-app': '[region="app"]'
			});
			//Warning: calling ensureEl() on the app region will not work like regions in layouts.
			//(Bug??: the additional <div> under the app region is somehow inevitable atm...)
			app.trigger('app:before-mainview-ready');
			if(app.config.template || !app.config.layout)
				app.mainView = app.mainView || app.view({
					name: 'Main',
					data: app.config.data,
					actions: app.config.actions,
					//put default template here so we can squeeze in app.config.navRegion as a region dynamically.
					template: app.config.template || ('<div region="' + (app.config.navRegion || app.config.contextRegion) + '"></div>'),
				}, true);
			else
				app.mainView = app.mainView || app.view({
					name: 'Main',
					data: app.config.data,
					actions: app.config.actions,
					layout: app.config.layout,
				}, true);
			app.mainView.onReady = function(){
				app.trigger('app:mainview-ready');
			};
			app.getRegion('region-app').show(app.mainView).$el.css({height: '100%', width: '100%'});

			//b. Create the fixed overlaying regions according to app.config.icings (like a cake, yay!)
			var icings = {};
			_.each(_.extend({}, app.config.icings, app.config.curtains), function(cfg, name){
				if(name === 'app') return;

				var irUID = _.uniqueId('app-icing-');
				$body.append($('<div id="' + irUID + '" style="position:fixed"></div>').css(cfg).hide()); //default on hidden
				icings[['icing', 'region', name].join('-')] = '#' + irUID;
			});
			app.mainView.addRegions(icings);
			app.icing = function(name, flag){
				var ir = app.mainView.getRegion(['icing', 'region', name].join('-'));
				ir.ensureEl(app.mainView);
				if(flag === false)
					ir.$el.hide();
				else
					ir.$el.show();
				return ir;
			}; 
			app.curtain = app.icing; //alias: curtain()

			//c. init client page router and history:
			var Router = Backbone.Marionette.AppRouter.extend({
				appRoutes: {
					'navigate/*path' : 'navigateTo', //navigate to a context and signal it about *module (can be a path for further navigation within)
				},
				controller: {
					navigateTo: function(path){
						app.navigate(path, true); //will skip updating #hash since the router is triggered by #hash change.
					},
				}
			});

			app.router = new Router();
			if(Backbone.history)
				Backbone.history.start();

			//d. Auto navigate to init context (view that gets put in mainView's navRegion)
			app.config.defaultContext = app.config.defaultView || app.config.defaultContext;
			if(!window.location.hash && app.config.defaultContext)
				app.navigate(app.config.defaultContext);
		});

		return app;
	};

	/**
	 * Define app init function upon doc.ready
	 * -----------------------------------------
	 * We support using stage.js in a hybrid app
	 * 
	 */
	app.run = function(hybridEvent){

		hybridEvent = (hybridEvent === true) ? 'deviceready' : hybridEvent;

		//called upon doc.ready
		function kickstart(){

			//1. Check if we need 'fast-click' on mobile plateforms
			if(Modernizr.mobile)
				FastClick.attach(document.body);

			//2. Track window resize
			function trackScreenSize(e, silent){
				var screenSize = {h: $window.height(), w: $window.width()};
				if(!validScreenSize(screenSize)) return;

				////////////////cache the screen size/////////////
				app.screenSize = screenSize;
				//////////////////////////////////////////////////
				if(app.config.fullScreen){
					$body.height(screenSize.h);
					$body.width(screenSize.w);
				}
				if(!silent){
					app.trigger('app:resized', screenSize);
					app.coop('window-resized', screenSize);
				}
			}
			function validScreenSize(size){
				return size.h > 0 && size.w > 0;
			}
			$window.on('resize', app.debounce(trackScreenSize));
			//check screen size, trigger app:resized and get app.screenSize ready.
			app._ensureScreenSize = function(done){
				trackScreenSize(); 
				if(!app.screenSize) _.delay(app._ensureScreenSize, app.config.rapidEventDelay/4, done);
				else done();
			};
			//align $body with screen size if app.config.fullScreen = true
			if(app.config.layout)
				app.config.fullScreen = true;
			if(app.config.fullScreen){
				$body.css({
					overflow: 'hidden',
					margin: 0,
					padding: 0					
				});
			}

			//3. Track window scroll
			function trackScroll(){
				var top = $window.scrollTop();
				app.trigger('app:scroll', top);
				app.coop('window-scroll', top);
			}
			$window.on('scroll', app.throttle(trackScroll));

			//4 Load Theme css & View templates & i18n translations
			var theme = app.uri(window.location.toString()).search(true).theme || app.config.theme;
			//4.0 Dynamic theme (skipped)
			if(theme){
				console.warn('DEV::Application::theme is now deprecated, please use theme css directly in <head>');
			}

			//4.1 Inject template pack
			app.addInitializer(function(){
				//based on path in app.config.viewTemplates
				return app.inject.tpl('all.json');
			});

			//4.2 Activate i18n
			app.addInitializer(function(){
				return I18N.init({
					locale: app.config.i18nLocale,
					resourcePath: app.config.i18nResources,
					translationFile: app.config.i18nTransFile
				});
			});

			//5 Register websockets
			_.each(app.config.websockets, function(wspath){
				app.ws(wspath); //we don't wait for websocket hand-shake
			});

			//6. Start the app --> pre init --> initializers --> post init(router setup)
			app._ensureScreenSize(function(){
				app.start();				
			});

		}

		//hook up desktop/mobile doc.ready respectively.
		if(hybridEvent){
			//Mobile development
			app.hybridEvent = hybridEvent; //window.cordova is probably true.
			window.onerror = function(errorMsg, target, lineNum){
				app.trigger('app:error', {
					errorMsg: errorMsg,
					target: target,
					lineNum: lineNum
				});
			};
		    app.onError = function(eMsg, target, lineNum){
		    	//override this to have remote debugging assistant
		        console.error(eMsg, target, lineNum);
		    };
			//!!VERY IMPORTANT!! Disable 'touchmove' on non .scrollable elements
			document.addEventListener("touchmove", function(e) {
			  if (!e.target.classList.contains('scrollable')) {
			    // no more scrolling
			    e.preventDefault();
			  }
			}, false);
			document.addEventListener(hybridEvent, function(){
				$document.ready(kickstart);
			}, false);
		}else
			$document.ready(kickstart);

		return app;

	};

})(Application);



