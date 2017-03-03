/**
 * Override M.TemplateCache to hookup our own template-builder.js util
 *
 * @author Tim Lauv
 * @created 2014.02.25
 * @updated 2016.03.24
 * @updated 2017.03.02
 */
;(function(app){

	_.extend(Backbone.Marionette.TemplateCache, {
		// Get the specified template by id. Either
		// retrieves the cached version, or loads it
		// through cache.load
		get: function(templateId, asHTMLText, reload) {
		    var cachedTemplate = this.templateCaches[templateId] || this.make(templateId);
		    return cachedTemplate.load(asHTMLText, reload); //-> cache.loadTemplate()
		},

		//+ split out a make cache function from the original mono get()
		//used in a. app.inject.tpl/app.Util.Tpl.remote
		//consulted in b. cache.loadTemplate
		make: function(templateId, rawTemplate) {
			var cachedTemplate = new Marionette.TemplateCache(templateId);
			this.templateCaches[templateId] = cachedTemplate;
			cachedTemplate.rawTemplate = rawTemplate;
			return cachedTemplate;
		}

	});

	_.extend(Backbone.Marionette.TemplateCache.prototype, {

		// Internal method to load the template
		// Modified to take 2 more arguments asHTMLText, reload;
		load: function(asHTMLText, reload) {

		    // Guard clause to prevent loading this template more than once
		    if (reload) {
		    	this.rawTemplate = '';
		    	this.compiledTemplate = undefined;
		    }

		    // Find/Load the template
		    this.rawTemplate = this.rawTemplate || this.loadTemplate(this.templateId);
		    if (asHTMLText)
		        return this.rawTemplate; //return as txt

		    // and compile then return as fn
		    if (!this.compiledTemplate)
		    	this.compiledTemplate = this.compileTemplate(this.rawTemplate);

		    return this.compiledTemplate;
		},

		//1 Override the default raw-template retrieving method 
		//(invoked by M.TemplateCache.get() by cache.load() if the cache doesn't have cache.compiledTemplate)
		//We allow both #id or @*.html/.md(remote) and template html string(or string array) as parameter.
		//This method is only invoked with a template cache miss. So clear your cache if you have changed the template. (app.Util.Tpl.cache.clear(name))
		loadTemplate: function(idOrTplString){
			//local in-DOM template
			if(_.string.startsWith(idOrTplString, '#')) 
				return $(idOrTplString).html();
			//remote template (with local stored map cache)
			if(_.string.startsWith(idOrTplString, '@')) {
				var rtpl;

				//fetch from remote: (might need server-side CORS support)
				//**Caveat: triggering app.inject.tpl() will replace the cache object that triggered this loadTemplate() call.

				//sync mode injecting
				app.inject.tpl(idOrTplString, true).done(function(tpl){
					rtpl = tpl;
				});

				//pre-process the markdown if needed (put here to also support batched all.json tpl injected markdowns)
				if(_.string.endsWith(idOrTplString, '.md'))
					rtpl = app.markdown(rtpl);
				return rtpl;
			}
			//string and string array
			return app.Util.Tpl.build(idOrTplString);
			//this can NOT be null or empty since Marionette.Render guards it so don't need to use idOrTplString || ' ';
		},

		//2 Override to use Handlebars templating engine with Backbone.Marionette
		compileTemplate: function(rawTemplate) {
		    return Handlebars.compile(rawTemplate);
		},

	});

})(Application);
