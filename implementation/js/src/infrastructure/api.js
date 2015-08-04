;(function(app){

	/**
	 * Universal app object creation api entry point
	 * ----------------------------------------------------
	 * @deprecated Use the detailed apis instead.
	 */
	app.create = function(type, config){
		console.warn('DEV::Application::create() method is deprecated, use methods listed in ', app._apis, ' for alternatives');
	};

	/**
	 * Detailed api entry point
	 * ------------------------
	 * If you don't want to use .create() there you go:
	 */
	_.extend(app, {

		model: function(data){
			return new Backbone.Model(data);
		},

		collection: function(data){
			return new Backbone.Collection(data);
		},

		//pass in [name,] options to define (named will be registered)
		//pass in [name] to get
		//pass in [name,] options, instance to create (named will be registered again)
		view: function(name /*or options*/, options /*or instance*/){
			if(_.isString(name)){
				if(_.isBoolean(options) && options) return app.Core.Regional.create(name);
				if(_.isPlainObject(options)) return app.Core.Regional.register(name, options);
			}

			if(_.isPlainObject(name)){
				var instance = options;
				options = name;
				var Def = options.name ? app.Core.Regional.register(options) : Backbone.Marionette[options.type || 'Layout'].extend(options);

				if(_.isBoolean(instance) && instance) return new Def();
				return Def;
			}

			return app.Core.Regional.get(name);
		},

		//pass in [name,] options to register (always requires a name)
		//pass in [name] to get
		context: function(name /*or options*/, options){
			if(!options) {
				if(_.isString(name) || !name)
					return app.Core.Context.get(name);
				else
					options = name;
			}
			else
				_.extend(options, {name: name});
			return app.Core.Context.register(options);
		},

		//pass in name, factory to register
		//pass in name, options to create
		//pass in [name] to get
		widget: function(name, options /*or factory*/){
			if(!options) return app.Core.Widget.get(name);
			if(_.isFunction(options))
				//register
				return app.Core.Widget.register(name, options);
			return app.Core.Widget.create(name, options);
			//you can not register the definition when providing name, options.
		},

		//pass in name, factory to register
		//pass in name, options to create
		//pass in [name] to get
		editor: function(name, options /*or factory*/){
			if(!options) return app.Core.Editor.get(name);
			if(_.isFunction(options))
				//register
				return app.Core.Editor.register(name, options);
			return app.Core.Editor.create(name, options);
			//you can not register the definition when providing name, options.
		},

		//@deprecated---------------------
		regional: function(name, options){
			options = options || {};
			if(_.isString(name))
				_.extend(options, {name: name});
			else
				_.extend(options, name);
			console.warn('DEV::Application::regional() method is deprecated, use .view() instead for', options.name);
			return app.view(options, !options.name);
		},
		//--------------------------------
		
		has: function(name, type){
			if(type)
				return app.Core[type] && app.Core[type].has(name);

			_.each(['Context', 'Regional', 'Widget', 'Editor'], function(t){
				if(!type && app.Core[t].has(name))
					type = t;
			});

			return type;
		},

		get: function(name, type){
			if(!name)
				return {
					'Context': app.Core.Context.get(),
					'View': app.Core.Regional.get(),
					'Widget': app.Core.Widget.get(),
					'Editor': app.Core.Editor.get()
				};

			if(type)
				return app.Core[type] && app.Core[type].get(name);

			var Reusable;
			_.each(['Context', 'Regional', 'Widget', 'Editor'], function(t){
				if(!Reusable)
					Reusable = app.Core[t].get(name);
			});

			if(Reusable)
				return Reusable;
			else {
				//see if we have app.viewSrcs set to load the View def dynamically
				if(app.config && app.config.viewSrcs){
					var path = name.split('/');
					name = path.pop();
					if(path.length) path = path.join('/');
					else path = null;
					$.ajax({
						url: _.compact([app.config.viewSrcs, path, _.string.slugify(name)]).join('/') + '.js',
						dataType: 'script',
						async: false
					}).done(function(){
						//console.log('View injected', name, 'from', app.viewSrcs, path);
						Reusable = true;
					}).fail(function(jqXHR, settings, e){
						console.warn('DEV::Application::get() Can NOT load View definition for', name, '[', e, ']');
					});
				}
			}
			if(Reusable)
				return this.get(name, type);
			return Reusable;
		},

		coop: function(event, options){
			app.trigger('app:coop', event, options);
			app.trigger('app:coop:' + event, options);
			return app;
		},

		lock: function(topic){
			return app.Core.Lock.lock(topic);
		},

		unlock: function(topic){
			return app.Core.Lock.unlock(topic);
		},

		available: function(topic){
			return app.Core.Lock.available(topic);
		},

		download: function(ticket){
			return app.Util.download(ticket);
		},

		inject: {
			js: function(){
				return app.Util.inject.apply(null, arguments);
			},

			tpl: function(){
				return app.Util.Tpl.remote.load.apply(app.Util.Tpl.remote, arguments);
			},

			css: function(){
				return loadCSS.apply(null, arguments);
			}
		},

		navigate: function(options, silent){
			return app.trigger('app:navigate', options || app.config.defaultContext, silent);
		}	

	});

	//editor rules
	app.editor.validator = app.editor.rule = function(name, fn){
		if(!_.isString(name)) throw new Error('DEV::Validator:: You must specify a validator/rule name to use.');
		return app.Core.Editor.addRule(name, fn);
	};

	//alias
	app.page = app.context;
	app.area = app.regional;

	/**
	 * Universal remote data interfacing api entry point
	 * -------------------------------------------------
	 * @returns jqXHR object (use promise pls)
	 */
	app.remote = function(options){
		options = options || {};
		if(options.payload)
			return app.Core.Remote.change(options);
		else
			return app.Core.Remote.get(options);
	};

	/**
	 * API summary
	 */
	app._apis = [
		'model', 'collection',
		'context - @alias:page', 'regional - @alias:area',
		'view',
		'widget', 'editor', 'editor.validator - @alias:editor.rule',
		'remote',
		'lock', 'unlock', 'available',
		'download',
		'create - @deprecated'
	];

})(Application);