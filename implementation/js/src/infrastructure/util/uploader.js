/**
 * Application universal uploader
 *
 * Usage
 * -----
 * app.upload(url, {data:{...}})
 *
 * @author Tim Lauv
 * @created 2017.03.16
 */
;(function(app){

	function uploader(url, options){
		options = options || {};

		//create hidden file input
	    var $drone = $('#hidden-uploader-input');
	    if($drone.length > 0){
	    }else{
	        $('body').append(
	        	'<input id="hidden-uploader-input" type="file" name="files[]" multiple>'
    		);
	        $drone = $('#hidden-uploader-input');
	        $drone.fileupload();
	    }

	    //change options (fixing options.data error (jQuery.FileUploader BUG??))
	    var extraData = options.formData || options.data;
		$drone.fileupload('option', _.extend(_.without(options, 'data'), {url: url, formData: extraData}));

	    return $drone.click();
	}

	app.Util.upload = uploader;

})(Application);