/*
 *layout: {
 *	direction: 'h' or 'v',
 *	split: ['1:region', '1:View', 'xs-6, md-4:region', 'md-6:View', '1:region:fixed', '2:View:fixed'],
 *	type: 'bootstrap', 'free' or 'flexbox'(TBD)
 *	min: number,
 *	height: 'auto' || number,
 *	width: 'auto' || number,
 *	adjustable: true or false
 *}
 */

;(function($){

	$.fn.split = function(options){
		options = options || {};
		//default parameters
		var direction = options.direction || 'h',
			split = options.split || ['1:sample-region', '1'],
			type = options.type || 'free',
			min = options.min || 20,
			height = options.height || '100%',
			width = options.width || '100%',
			adjustable = options.adjustable || false,
			barclass = options.barclass || 'split-' + direction + 'bar',
			that = this,
			$this = $(this);
		//check the type of layout, bootstrap or free
		if( type === 'bootstrap' /*bootstrap layout*/){
			//hornor the height and width settings
			if( height !== 'auto' )
				$this.css({height: height});
			if( width !== 'auto' )
				$this.css({width: width});
			//break split into tokens in the trimmed array
			var bsgrid = /(xs|sm|md|lg)/,
				trimmed = [];
			_.each(split, function(data, index){
				//bootstrap grid class
				trimmed[index] = data.split(':');
				//check whether split array has proper bootstrap-classname for every element
				if( !trimmed[index][0].match(bsgrid) ){
					throw new Error('Dev::runtime::split-plugin::for bootstrap type layout, you must give a proper bootstrap grid class');
				}
			});
			//make the calling element position relative if not defined as relative or absolute
			if($this.css('position') !== 'absolute' && $this.css('position') !== 'relative')
				$this.css({position: 'relative'});
			//check directions
			if( direction === 'h' ){
				_.each(trimmed, function(data, index){
					//split classes and add col
					var classnames = '',
						rvname = '';
					//--------------------bootstrap 'h' divide do not hornor classnames----------------------//
					//--------------------it simply insert rows of divs that contains the region/view names--//
					// _.each(data[0].split(','), function(classname){
					// 	classnames += ( 'col-' + classname + ' ' );
					// });
					//--------------------------------------------------------------------------------------//
					//check whether given a region or view name
					if(data[1]){
						if( data[1].charAt(0) === data[1].charAt(0).toUpperCase() )//view name uppercase
							rvname = 'view="' + data[1]+'"';
						else if( data[1].charAt(0) === data[1].charAt(0).toLowerCase() )//region name lowercase
							rvname = 'region="' + data[1]+'"';
						else
							throw new Error('Dev::runtime::split-plugin::the region/view name you give is not valid.');
					}
					$this.append('<div class="row"><div class="col-xs-12"'+rvname+'><div class="'+barclass+'"></div></div></div>');
				});
			}else if(direction === 'v'){
				//add a row for the columns below;
				$this.append('<div class="row split-plugin-added"></div>');
				_.each(trimmed, function(data, index){
					var classnames = '',
						rvname = '';
					//hornor the class names for bootstrap
					_.each(data[0].split(','), function(classname){
						classnames += ( 'col-' + classname + ' ' );
					});
					//check whether given a region or view name
					if(data[1]){
						if( data[1].charAt(0) === data[1].charAt(0).toUpperCase() )
							rvname = 'view="' + data[1]+'"';
						else if( data[1].charAt(0) === data[1].charAt(0).toLowerCase() )
							rvname = 'region="' + data[1]+'"';
						else
							throw new Error('Dev::runtime::split-plugin::the region/view name you give is not valid.');
					}
					$this.find('.split-plugin-added').append('<div class="'+classnames+'" '+rvname+'><div class="'+barclass+'" style="height:100%;"></div></div>');
				});
			}else{
				throw new Error('Dev::runtime::split-plugin::direction can only be \'h\' or \'v\' for horizontal or vertical respectively.');
			}
		}else if( type === 'free' /*free layout*/){
			//hornor the height and width settings
			if( height !== 'auto' )
				$this.css({height: height});
			if( width !== 'auto' )
				$this.css({width: width});
			//make sure the parent position is at least relative
			if($this.css('position') !== 'absolute' && $this.css('position') !== 'relative')
				$this.css({position: 'relative'});
			//---------------------------------------------------------------------
			//for debug, add border for reference
			//$this.css({border: '1px solid black'});
			//---------------------------------------------------------------------
			//check direction
			if( direction === 'h' || direction === 'v' ){
				//call setLayout function
				setFreeLayout($this, split, direction, adjustable, barclass, min);
			}else{
				throw new Error('Dev::runtime::split-plugin::direction can only be \'h\' or \'v\' for horizontal or vertical respectively.');
			}
		}else{
			//error layout type
			throw new error('Dev::runtime::split-plugin::type can only be bootstrap or free; flexbox has not been implemented');
		}

	};

	var px_em = function(array){
		var bool = false,
			match = /(px|em)/;
		for(var i = 0; i < array.length; i++){
			if( array[i].split(':')[0].match(match) ){
				bool = true;
				break;
			}
		}
		return bool;
	};

	var setFreeLayout = function($el, array, direction, adjustable, barclass, min){
		var sum = 0,
			sum_px = 0,
			trimmed = [],
			barPercent,
			totalHeight = $el.height(),
			totalWidth = $el.innerWidth(),
			contentHeight,
			contentWidth,
			current = 0;
		//get divide bar width by adding a barclass div, getting width and removing it
		$el.append('<div class="'+barclass+'"></div>');
		var barwidth = $el.find('.'+barclass)[(direction === 'h')? 'height' : 'width']();
		$el.find('.'+barclass).remove();
		//check the given height, whether there is a fixed number in it.
		if( px_em(array) ){
			//take out the fixed pixel or ems, then calcualte the percentage for every block
			_.each(array, function(data, index){
				//store array into trimmed
				trimmed[index] = data.split(':');
				//check whether the first element is ratio or fixed px/em
				if( trimmed[index][0].match(/(px|em)/) ){
					if( trimmed[index][0].match(/(px)/) ){
						//px
						sum_px += Number.parseFloat(trimmed[index][0].match(/\d/g).join(""));
					}else{
						//em
						sum_px += get_px( Number.parseFloat(trimmed[index][0].match(/\d/g).join("")), $el[0] );
						//change unit into px
						trimmed[index][0] = get_px( Number.parseFloat(trimmed[index][0].match(/\d/g).join("")), $el[0] ) + 'px';
					}
				}else{
					//not em or px
					sum += Number.parseFloat(trimmed[index][0]);
				}
			});
			//insert divs and divide bars
			if( direction === 'h' ){//horizontally
				//available content height for ratio divs
				contentHeight = totalHeight - ( array.length - 1 ) * barwidth - sum_px;
				barPercent = ( barwidth / totalHeight ) * 100;
				//insert divs and bars
				_.each(trimmed, function(data, index){
					var rvname = '',
						position = (data[2])? 'fixed' : 'absolute',
						contentPercent,
						$currentEl;
					//check whether fixed height
					if( data[0].match(/(px)/) ){
						contentPercent = Number.parseFloat( data[0].match(/\d/g).join("") ) / totalHeight * 100;
					}else{
						contentPercent = ( ( contentHeight * ( data[0] / sum ) ) / totalHeight ) * 100;
					}
					//check whether given a region or view name
					rvname = get_rvname(data[1]);
					//insert contents horizontally
					if( data[0].match(/(px)/) ){
						//px in height
						$currentEl = $('<div ' + rvname + ' style="top:' + current + '%;height:' + Number.parseFloat( data[0].match(/\d/g).join("") ) + 'px;position:absolute;"></div>').appendTo($el);
					}else{
						//% in height
						$currentEl = $('<div ' + rvname + ' style="top:' + current + '%;height:' + contentPercent + '%;position:absolute;"></div>').appendTo($el);
					}
					current += contentPercent;
					//add divide bar
					if( index < ( array.length - 1 ) ){
						var $element = $('<div class="' + barclass + '" style="top:' + current + '%;height:' + barPercent + '%;width:100%;position:absolute;"></div>').appendTo($el);//didn't sepcify the position property yet
						current += barPercent;
						//adjustable divs, if fixed width, cannot be adjust
						if( adjustable ){
							if( data[0].match(/(px)/) ){
								//cannot be adjust
								if($currentEl.prev().length > 0)
									//cancel all the events registed on previous divide bar
									$currentEl.prev().unbind('mouseover mousedown mouseup');
							}else{
								$element
								.mouseover(function(){
									$element.css({'cursor':'ns-resize'});
								})
								.mousedown(function(){
									$el.bind('mousemove', function(event){
										//get relative parameters
										var relY = event.pageY - $el.offset().top,
											prevTop = $element.prev().position().top,
											nextBottom = $element.next().position().top + $element.next().height();
										if(relY > ( prevTop + barwidth + min/*least height/width*/ ) && relY < ( nextBottom - barwidth - min ) ){
											$element.css({top: (relY / $el.height()) * 100 + '%'});
											//reset the div accrodingly
											resetFreeLayout($element, direction);
										}
									});
								})
								.mouseup(function(){
									$el.unbind('mousemove');
								});
								//track window mouseup, just in case
								$window.mouseup(function(){
									$el.unbind('mousemove');
								});
							}
						}
					}
				});
			}else{//vertically
				contentWidth = totalWidth - ( array.length - 1 ) * barwidth - sum_px;
				barPercent = ( barwidth / totalWidth ) * 100;
				//insert divs and bars
				_.each(trimmed, function(data, index){
					var rvname = '',
						position = (data[2])? 'fixed' : 'absolute',
						contentPercent,
						$currentEl;
						//check whether fixed height
					if( data[0].match(/(px)/) ){
						contentPercent = Number.parseFloat( data[0].match(/\d/g).join("") ) / totalWidth * 100;
					}else{
						contentPercent = ( ( contentWidth * ( data[0] / sum ) ) / totalWidth ) * 100;
					}
					//check whether given a region or view name
					rvname = get_rvname(data[1]);
					//insert contents vertically
					if( data[0].match(/(px)/) ){
						//px in height
						$currentEl = $('<div ' + rvname + ' style="left:' + current + '%;width:' + Number.parseFloat( data[0].match(/\d/g).join("") ) + 'px;position:'+position+';"></div>').appendTo($el);
					}else{
						//% in height
						$currentEl = $('<div ' + rvname + ' style="left:' + current + '%;width:' + contentPercent + '%;position:'+position+';"></div>').appendTo($el);
					}
					current += contentPercent;
					//add divide bar
					if( index < ( array.length - 1 ) ){
						var $element = $('<div class="' + barclass + '" style="left:' + current + '%;width:' + barPercent + '%;height:100%;position:'+position+';"></div>').appendTo($el);//didn't sepcify the position property yet
						current += barPercent;
						//ajustable divide bars
						if(adjustable){
							if( data[0].match(/(px)/) ){
								//cannot be adjust
								if($currentEl.prev().length > 0)
									//cancel all the events registed on previous divide bar
									$currentEl.prev().unbind('mouseover mousedown mouseup');
							}else{
								$element
								.mouseover(function(){
									$element.css({'cursor':'ew-resize'});
								})
								.mousedown(function(){
									$el.bind('mousemove', function(event){
										//get relative parameters
										var relX = event.pageX - $el.offset().left,
											prevLeft = $element.prev().position().left,
											nextRight = $element.next().position().left + $element.next().width();
										if(relX > ( prevLeft + barwidth + min/*least height/width*/ ) && relX < ( nextRight - barwidth - min ) ){
											$element.css({left: (relX / $el.width()) * 100 + '%'});
											//reset the div accrodingly
											resetFreeLayout($element, direction);
										}
									});
								})
								.mouseup(function(){
									$el.unbind('mousemove');
								});
								//track window mouseup, just in case
								$window.mouseup(function(){
									$el.unbind('mousemove');
								});
							}
						}
					}
				});
			}
			//if adjustable register resize event on the divide bar
			
			
		}else{//calculate the percentage for every block, then insert divs and divde bars
			//calculate the total ratio for all blocks
			_.each(array, function(data, index){
				//store array into 
				trimmed[index] = data.split(':');
				//add total propotion
				sum += Number.parseFloat(trimmed[index][0]);
			});
			if( direction === 'h' ){//horizontal
				contentHeight = totalHeight - ( array.length - 1 ) * barwidth;
				barPercent = ( barwidth / totalHeight ) * 100;
				_.each(trimmed, function(data, index){
					var rvname = '',
						position = (data[2])?'fixed':'absolute',
						contentPercent = ( ( contentHeight * ( data[0] / sum ) ) / totalHeight ) * 100;
					//check whether given a region or view name
					rvname = get_rvname(data[1]);
					//insert contents horizontally
					$el.append('<div ' + rvname + ' style="top:' + current + '%;height:' + contentPercent + '%;position:absolute;"></div>');//didn't sepcify the position property yet
					current += contentPercent;
					//add divide bar
					if( index < ( array.length - 1 ) ){
						var $element = $('<div class="' + barclass + '" style="top:' + current + '%;height:' + barPercent + '%;width:100%;position:absolute;"></div>').appendTo($el);//didn't sepcify the position property yet
						current += barPercent;
						//adjustable divide bar event
						if(adjustable){
							$element
							.mouseover(function(){
								$element.css({'cursor':'ns-resize'});
							})
							.mousedown(function(){
								$el.bind('mousemove', function(event){
									//get relative parameters
									var relY = event.pageY - $el.offset().top,
										prevTop = $element.prev().position().top,
										nextBottom = $element.next().position().top + $element.next().height();
									if(relY > ( prevTop + barwidth + min/*least height/width*/ ) && relY < ( nextBottom - barwidth - min ) ){
										$element.css({top: (relY / $el.height()) * 100 + '%'});
										//reset the div accrodingly
										resetFreeLayout($element, direction);
									}
								});
							})
							.mouseup(function(){
								$el.unbind('mousemove');
							});
							//track window mouseup, just in case
							$window.mouseup(function(){
								$el.unbind('mousemove');
							});
						}
					}
					
				});
			}else{//vertical
				contentWidth = totalWidth - ( array.length - 1 ) * barwidth;
				barPercent = ( barwidth / totalWidth ) * 100;
				_.each(trimmed, function(data, index){
					var rvname = '',
						position = (data[2])?'fixed':'absolute';
						contentPercent = ( ( contentWidth * ( data[0] / sum ) ) / totalWidth ) * 100;
					//check whether given a region or view name
					rvname = get_rvname(data[1]);
					//insert contents vertically
					$el.append('<div ' + rvname + ' style="left:' + current + '%;width:' + contentPercent + '%;position:absolute;"></div>');
					current += contentPercent;
					//add divide bar
					if( index < ( array.length - 1 ) ){
						var $element = $('<div class="' + barclass + '" style="left:' + current + '%;width:' + barPercent + '%;height:100%;position:absolute;"></div>').appendTo($el);
						current += barPercent;
						//adjustable divider
						if(adjustable){
							$element
							.mouseover(function(){
								$element.css({'cursor':'ew-resize'});
							})
							.mousedown(function(){
								$el.bind('mousemove', function(event){
									//get relative parameters
									var relX = event.pageX - $el.offset().left,
										prevLeft = $element.prev().position().left,
										nextRight = $element.next().position().left + $element.next().width();
									if(relX > ( prevLeft + barwidth + min/*least height/width*/ ) && relX < ( nextRight - barwidth - min ) ){
										$element.css({left: (relX / $el.width()) * 100 + '%'});
										//reset the div accrodingly
										resetFreeLayout($element, direction);
									}
								});
							})
							.mouseup(function(){
								$el.unbind('mousemove');
							});
							//track window mouseup, just in case
							$window.mouseup(function(){
								$el.unbind('mousemove');
							});
						}
					}
				});
			}
		}
	};

	//reset layout if one bar is moved
	var resetFreeLayout = function($bar, direction/*h or v*/){
		if(direction === 'h'){
			//horizontal
			var prevTop = $bar.prev().position().top,
				nextTop = $bar.position().top + $bar.height(),
				nextBottom,
				totalHeight = $bar.parent().height();
			//check whether last bar
			if( $bar.next().next().length === 0 ){
				//last
				$bar.prev().css({'height': (( $bar.position().top - prevTop ) / totalHeight) * 100 + '%'});
				$bar.next().css({
					'top':(( $bar.position().top + $bar.height() ) / totalHeight) * 100 + '%', 
					'height': (( totalHeight - ($bar.position().top + $bar.height()) ) / totalHeight ) * 100 + '%'
				});
			}else{
				//not last
				nextBottom = $bar.next().next().position().top;
				$bar.prev().css({'height': (( $bar.position().top - prevTop ) / totalHeight) * 100 + '%'});
				$bar.next().css({
					'top':(( $bar.position().top + $bar.height() ) / totalHeight) * 100 + '%', 
					'height': (( nextBottom - ($bar.position().top + $bar.height()) ) / totalHeight ) * 100 + '%'
				});
			}
		}else{
			//vertival
			var prevLeft = $bar.prev().position().left,
				nextLeft = $bar.position().left + $bar.width(),
				nextRight,
				totalWidth = $bar.parent().width();
			//check whether last bar
			if( $bar.next().next().length === 0 ){
				//last
				$bar.prev().css({'width': (( $bar.position().left - prevLeft ) / totalWidth) * 100 + '%'});
				$bar.next().css({
					'left':(( $bar.position().left + $bar.width() ) / totalWidth) * 100 + '%', 
					'width': (( totalWidth - ($bar.position().left + $bar.width()) ) / totalWidth ) * 100 + '%'
				});
			}else{
				//not last
				nextRight = $bar.next().next().position().left;
				$bar.prev().css({'width': (( $bar.position().left - prevLeft ) / totalWidth) * 100 + '%'});
				$bar.next().css({
					'left':(( $bar.position().left + $bar.width() ) / totalWidth) * 100 + '%', 
					'width': (( nextRight - ($bar.position().left + $bar.width()) ) / totalWidth ) * 100 + '%'
				});
			}
		}
		
	};

	//function for coverting em to px
	var get_px = function(em, context) {
    	// Returns a number
	    return em * parseFloat( getComputedStyle( context || document.documentElement ).fontSize );
	};

	//get region or view name
	var get_rvname = function(str){
		var rvname = '';
		//check whether given a region or view name
		if(str){
			if( str.charAt(0) === str.charAt(0).toUpperCase() )
				rvname = 'view="' + str + '"';
			else if( str.charAt(0) === str.charAt(0).toLowerCase() )
				rvname = 'region="' + str + '"';
			else
				throw new Error('Dev::runtime::split-plugin::the region/view name you give is not valid.');
		}
		return rvname;
	};

})(jQuery);