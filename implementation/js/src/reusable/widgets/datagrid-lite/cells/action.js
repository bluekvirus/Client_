/**
 * This is the ActionCell definition 
 *
 * options
 * -------
 * passed down by this.model.get('actions')
 * 
 * actions: { (replace the actions)
 * 		'name': {
 * 			label: ...,
 * 			icon: ...,
 * 			tooltip: ...,
 * 			fn: function(){
 * 				this.model is the row record data model
 * 			}
 * 		},
 * 		...
 * }
 *
 * @author Tim Lauv
 * @created 2013.11.27
 * @updated 2014.04.22
 */

;(function(app){

	app.widget('ActionCell', function(){

		var UI = app.view({
			template: [
				'{{#each actions}}',
					'<span class="action-cell-item" action="{{@key}}" data-toggle="tooltip" title="{{i18n tooltip}}"><i class="{{icon}}"></i> {{i18n label}}</span> ',
				'{{/each}}'
			],
			className: 'action-cell',

			initialize: function(options){
				this.row = options.row;
				var actions = this.model.get('actions') || {};

					//default
					_.each({
						preview: {
							icon: 'glyphicon glyphicon-eye-open',
							tooltip: 'Preview'
						},
						edit: {
							icon: 'glyphicon glyphicon-pencil',
							tooltip: 'Edit'
						},
						'delete': {
							icon: 'glyphicon glyphicon-remove',
							tooltip: 'Delete'
						}
					}, function(def, name){
						if(actions[name]){
							actions[name] = _.extend(def, actions[name]);
						}
					});


				//allow action impl overriden by action config.fn
				this.actions = this.actions || {};
				_.each(actions, function(action, name){
					if(action.fn){
						this.actions[name] = function($action){
							action.fn.apply(this.row, arguments);
							/*Warning:: If we use options.row here, it won't work, since the options object will change, hence this event listener will be refering to other record's row when triggered*/
						};
					}
				}, this);
				this.model.set('actions', actions);
				this.enableActionTags(true);
			},
			tooltips: true

		});

		return UI;

	});	

})(Application);
