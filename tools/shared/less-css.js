/**
 * This is the LESS to CSS compile util
 *
 * Option
 * ------
 * root: path to the theme folder which contains /less
 *
 * @author Tim Lauv
 * @created 2014.04.18
 */

var _ = require('underscore'),
path = require('path'),
fs = require('fs-extra'),
less = require('less'),
colors = require('colors'),
autoprefixer = require('autoprefixer'),
cleancss = new (require('clean-css'))({keepSpecialComments: 0});

module.exports = function(root, main, collaborate){
	main = main || 'main.less';
	var mainLess = path.join(root, 'less', main);

	//less.parser has been decrepted. use less.render instead for less.js 2.5.1
	fs.readFile(mainLess, {encoding: 'utf-8'}, function(err, data){
		//if error, throw err
		if(err) throw err;

		//get main.less folder path and setup collaborate lesses path
		var mainFolder = path.dirname(mainLess);
		//stringfy data for later use
		data = data.toString(); 
		//check if there is a collaborate path, if yes add all the less files for compling.
		if(collaborate && fs.existsSync(collaborate)){
			_.each(fs.walkSync(collaboratePath), function(sp){
				//calculate relative path from main.less
				var relpath = path.relative(mainFolder, sp);
				//append those files into main.ess. two newline characters are just to prevent weird styling error.
				data += '\n\n@import "' + relpath + '";';
			});
		}

		//less.parser has been decrepted, use less.render for less.js 2.x.x
		less.render(data, {
			//give base paths for compling
			paths: [path.join(root, 'less'), path.join(root, '..', '..', 'bower_components')]
		}, function(error, output){
			//if error, print error and return
			if(error){
				console.log('LESS compile error\n', error);
				return;
			}

			//path for main.css
			var mainCss = path.resolve(path.join(mainLess, '..', '..', 'css', 'main.css'));
			//use autoprefixer(options).compile if needs be in the future.
			var css = output.css;
			//fix the google-font issue (remove them)
			css = css.replace(/@import url\(.*?fonts.*?\)/, '');
			css = cleancss.minify(css);
			fs.outputFileSync(mainCss, css);
			console.log('[Theme'.yellow, path.basename(root).cyan, 'recompiled:'.yellow, mainCss.cyan, ']'.yellow);	
		});
	});



};