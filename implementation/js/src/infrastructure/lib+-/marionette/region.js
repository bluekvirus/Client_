/**
 * Enhancing the Backbone.Marionette.Region Class
 *
 * 1. open()/close/show() (altered to support enter/exit effects)
 * --------------
 * a. consult view.effect animation names (from Animate.css or your own, not from jQuery ui) when showing a view;
 * b. inject parent view as parentCt to sub-regional view;
 *
 * 2. resize()
 * -----------
 * ...
 *
 *
 * Effect config
 * -------------
 * in both view & region
 * 
 * use the css animation name as enter (show) & exit (close) effect name.
 * 1. 'lightSpeed' or {enter: 'lightSpeedIn', exit: '...'} in view definition
 * 2. data-effect="lightSpeed" or data-effect-enter="lightSpeedIn" data-effect-exit="..." on region tag
 *
 * https://daneden.github.io/animate.css/
 * 
 *
 * @author Tim Lauv
 * @updated 2014.03.03
 * @updated 2015.08.10
 * @updated 2015.12.15
 * @updated 2015.02.03
 */

;
(function(app) {

    _.extend(Backbone.Marionette.Region.prototype, {

        //'region:show', 'view:show' will always trigger after effect done.
    	show: function(newView, options){
            this.ensureEl();
            var view = this.currentView;
            if (view) {
                this.close(function(){
                    this._show(newView, options);
                });
                return this;
            }
            return this._show(newView, options);
    	},

    	//modified show method (removed preventClose & same view check)
        _show: function(view, options) {

            view.render();
            Marionette.triggerMethod.call(this, "before:show", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("before:show");
            } else {
                Marionette.triggerMethod.call(view, "before:show");
            }

            this.open(view, function(){

                //original region:show from M.Region
                //Marionette.triggerMethod.call(this, "show", view);

                //call view:show
                if (_.isFunction(view.triggerMethod)) {
                    view.triggerMethod("show");
                } else {
                    Marionette.triggerMethod.call(view, "show");
                }

                //delay region:show till after view:show (to accommodate navRegion build up in Layout)
                Marionette.triggerMethod.call(this, "show", view);
            });

            return this;
        },

        open: function(view, _cb) {
            var that = this;

            //from original open() method in Marionette
            this.$el.empty().append(view.el);
            //-----------------------------------------
            
            //mark currentView, parentRegion
            this.currentView = view;
            view.parentRegion = this;

            //inject parent view container through region into the regional views
            if (this._parentLayout) {
                view.parentCt = this._parentLayout;
                //also passing down the name of the outter-most context container.
                if (this._parentLayout.category === 'Context') view.parentCtx = this._parentLayout;
                else if (this._parentLayout.parentCtx) view.parentCtx = this._parentLayout.parentCtx;
            }

            //trigger view:resized anyway upon its first display
            if (this._contentStyle) {
                //view.$el.css(this._contentStyle); //Tricky, use a .$el.css() call to smooth dom sizing/refreshing after $el.empty().append()
                _.defer(function() {
                    view.trigger('view:resized', {
                        region: that
                    }); //!!Caution: this might be racing if using view.effect as well!!
                });
            }

            //play effect (before 'show')
            var enterEffect = (_.isPlainObject(view.effect) ? view.effect.enter : (view.effect ? (view.effect + 'In') : '')) || (this.$el.data('effect')? (this.$el.data('effect') + 'In') : '') || this.$el.data('effectEnter');
            if (enterEffect) {
                view.$el.css('opacity', 0).addClass(enterEffect);

                _.defer(function() {
                    view.$el.addClass('animated').one(app.ADE, function() {
                        //end state: display block/inline & opacity 1
                        view.$el.css('opacity', 1);
                        view.$el.removeClass('animated', enterEffect);
                        _cb && _cb.apply(that);
                    });
                });
            }else
                _cb && _cb.apply(this);

            return this;
        },

        // Close the current view, if there is one. If there is no
        // current view, it does nothing and returns immediately.
        // 'region:close', 'view:close' will be triggered after animation effect done.
        close: function(_cb) {
            var view = this.currentView;
            if (!view || view.isClosed) {
                return;
            }

            // call 'close' or 'remove', depending on which is found
            if (view.close) {
                var exitEffect = (_.isPlainObject(view.effect) ? view.effect.exit : (view.effect ? (view.effect + 'Out') : '')) || (this.$el.data('effect')? (this.$el.data('effect') + 'Out'): '') || this.$el.data('effectExit');
                if (exitEffect) {
                    var self = this;
                    view.$el.addClass(exitEffect).addClass('animated')
                    .one(app.ADE, function() {
                        view.close();
                        Marionette.triggerMethod.call(self, "close", view);
                        delete self.currentView;
                        _cb && _cb.apply(self); //for opening new view immediately (internal, see show());
                    });
                    return;
                }else
                    view.close();
            } else if (view.remove) {
                view.remove();
            }

            Marionette.triggerMethod.call(this, "close", view);
            delete this.currentView;
            _cb && _cb.apply(this); //for opening new view immediately (internal, see show());
        },


        //you don't need to calculate paddings on a region, since we are using $.innerHeight()
        resize: function(options) {
            options = options || {};

            /*Note that since we use box-sizing in css, if using this.$el.css() to set height/width, they are equal to using innerHeight/Width()*/
            this._contentStyle = _.extend({}, options, this._contentOverflow);
            this.$el.css(this._contentStyle);

            var that = this;
            _.defer(function() { //give browser a chance to catch up with style changes.
                if (that.currentView) {
                    //this.currentView.$el.css(this._contentStyle);
                    that.currentView.trigger('view:resized', {
                        region: that
                    });
                }
            });

            return this;

        }

    });

})(Application);
