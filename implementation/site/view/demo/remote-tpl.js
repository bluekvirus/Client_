;(function(app){

	app.regional('Demo.RemoteTpl', {
		overlay: true,
		template: '@test-ct.html',
		className: 'wrapper-full-2x border border-full',
		effect: {
			enter: 'fadeInDown',
			exit: 'fadeOutDown'
		},
		onShow: function(){
			this.getRegion('left').show(app.view({
				template: '@test/test2.html' //nested template path, != @test2.html
			}, true));

			this.getRegion('right').show(app.view({
				template: '@test.html' //same template will be cached and will not trigger a re-fetch.
			}, true));
			
			this.getRegion('nav').show(app.view({
				template: '@test2.html' //cached template in all.json will not trigger a re-fetch either.
			}, true));
		}
	});

})(Application);