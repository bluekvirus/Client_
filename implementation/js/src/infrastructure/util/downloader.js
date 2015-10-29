/**
 * Application universal downloader
 *
 * Usage
 * -----
 * 'string' - url
 * 	or
 * {
 * 	 url:
 * 	 ... (rest as url? query strings)
 * }
 *
 * @author Tim Lauv
 * @created 2013.04.01
 * @updated 2013.11.08
 * @updated 2014.03.04
 */
;(function(app){

	function downloader(ticket){
	    var drone = $('#hidden-download-iframe');
	    if(drone.length > 0){
	    }else{
	        $('body').append('<iframe id="hidden-download-iframe" style="display:none"></iframe>');
	        drone = $('#hidden-download-iframe');
	    }
	    
	    if(_.isString(ticket)) ticket = { url: ticket };
	    drone.attr('src', (app.uri(ticket.url || '/').addQuery(_.omit(ticket, 'url'))).toString());
	}

	app.Util.download = downloader;

})(Application);