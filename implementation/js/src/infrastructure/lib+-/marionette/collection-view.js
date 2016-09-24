/**
 * Marionette.CollectionView Enhancements (can be used in CompositeView as well)
 *
 * 1. Render with data 
 * 		view:render-data, view:data-rendered
 * 		
 * 2. Pagination, Filtering, Sorting support
 * 		view:load-page, view:page-changed
 * 		
 * 		TBI: 
 * 		view:sort-by, view:filter-by
 *
 * @author Tim Lauv
 * @created 2014.04.30
 * @updated 2016.02.10
 */

;(function(app){

	/**
	 * Meta-event Listeners (pre-defined)
	 * view:render-data
	 * view:load-page
	 */
	_.extend(Backbone.Marionette.CollectionView.prototype, {

		// Handle cleanup and other closing needs for
		// the collection of views.
		close: function(_cb) {
		    if (this.isClosed) {
		    	_cb && _cb();
		        return;
		    }

		    this.triggerMethod("collection:before:close");
		    this.closeChildren(_.bind(function(){
			    //triggers 'close' before BB.remove() --> stopListening
			    Marionette.View.prototype.close.apply(this, arguments);
			    this.triggerMethod("collection:closed"); //align with ItemView
			    _cb && _cb();
		    }, this));
		},

		// Close the child views that this collection view
		// is holding on to, if any
		closeChildren: function(_cb) {
			if(!_.size(this.children))
				_cb && _cb();
			else {
				var callback = _.after(_.size(this.children), function(){
					_cb && _cb();
				});
			    this.children.each(function(child) {
			        this.removeChildView(child, callback);
			    }, this);
			    //this.checkEmpty();
			}
		},

		// Remove the child view and close it
		removeChildView: function(view, _cb) {

		    // shut down the child view properly,
		    // including events that the collection has from it
		    if (view) {
		        // call 'close' or 'remove', depending on which is found
		        if (view.close) {
		            view.close(_.bind(function(){
				        this.stopListening(view);
				        this.children.remove(view);
				        this.triggerMethod("item:removed", view);
				        _cb && _cb();
		            }, this));
		        } else if (view.remove) {
		            view.remove();
			        this.stopListening(view);
			        this.children.remove(view);
			        this.triggerMethod("item:removed", view);
			        _cb && _cb();
		        }
		    }
		},

		// Build an `itemView` for a model in the collection. (inject parentCt)
		buildItemView: function(item, ItemViewType, itemViewOptions) {
			var options = _.extend({ model: item }, itemViewOptions);
			var view = new ItemViewType(options);
			if(this._moreItems === true)
				view.parentCt = this.parentCt;
			else
				view.parentCt = this;
			return view;
		},

		/////////////////////////////
		onRenderData: function(data){
			this.set(data);
		},

		//no refresh() yet (auto data-url fetch in item-view.js)
		set: function(data, options){
			if(!_.isArray(data)) throw new Error('DEV::CollectionView+::set() You need to have an array passed in as data...');
			
			if(!this.collection){
				this.collection = app.collection();
				this._initialEvents(); //from M.CollectionView
			}
			
			if(options && _.isBoolean(options))
				this.collection.reset(data);
			else 
				this.collection.set(data, options);
			//align with normal view's data rendered and ready events notification
			this.trigger('view:data-rendered');
			this.trigger('view:ready');
			return this;
		},

		get: function(idCidOrModel){
			if(!idCidOrModel)
				return this.collection && this.collection.toJSON();
			return this.collection && this.collection.get(idCidOrModel);
		},
		///////////////////////////////////////////////////////////////////////////
		/**
		 * Note that view:load-page will have its options cached in this._remote
		 *
		 * To reset: (either)
		 * 1. clear this._remote
		 * 2. issue overriding options (including the options for app.remote())
		 */
		onLoadPage: function(options){
			options = _.extend({
				page: 1,
				pageSize: 15,
				dataKey: 'payload',
				totalKey: 'total',
				params: {},
				//+ app.remote() options
			}, this._remote, options);

			//merge pagination ?offset=...&size=... params/querys into app.remote options
			_.each(['params', 'querys'], function(k){
				if(!options[k]) return;

				_.extend(options[k], {
					offset: (options.page -1) * options.pageSize,
					size: options.pageSize
				});
			});

			var that = this;
			//store pagination status for later access
			this._remote = options;

			//allow customized page data processing sequence, but provides a default (onLoadPageDone).
			app.remote(_.omit(options, 'page', 'pageSize', 'dataKey', 'totalKey'))
				.done(function(){
					that.trigger('view:load-page-done', arguments);
				})
				.fail(function(){
					that.trigger('view:load-page-fail', arguments);
				})
				.always(function(){
					that.trigger('view:load-page-always', arguments);
				});
		},

		onLoadPageDone: function(args){
			var result = args[0];
			//render this page:
			this.set(result[this._remote.dataKey]);
			//signal other widget (e.g a paginator widget)
			this.trigger('view:page-changed', {
				current: this._remote.page,
				total: Math.ceil(result[this._remote.totalKey]/this._remote.pageSize), //total page-count
			});
		}
	});

})(Application);