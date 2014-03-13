/**
 * This is the build script for building your web application front-end.
 *
 * 1. read build config;
 * 2. load target html and process libs on it; (we also support patching in the autoloaded scripts)
 * 3. output all-in-one.js and index.html and web client structure (resources, themes, config and statics...)
 *
 * @author Tim.Liu
 * @created 2013.09.26
 */

var program = require('commander'), 
_ = require('underscore'),
path = require('path'),
mkdirp = require('mkdirp'),
colors = require('colors'),
moment = require('moment'),
hammer = require('../shared/hammer'),
processor = require('../shared/process-html'),
rimraf = require('rimraf'),
AdmZip = require('adm-zip'),
targz = new (require('tar.gz'))(9, 9);

program.version('1.0.0')
		.usage('[options] <output folder>')
		.option('-C --config [dist]', 'config name used for the build, \'abc\' means to use \'config.abc.js\'')
		.option('-G --targz <path>', 'put the output path into a compressed .tar.gz file')
		.option('-Z --zip <path>', 'put the output path into a compressed .zip file [use only on non-Unix env]');

program.command('*').description('build your web front-end project using customized configure').action(function(outputFolder){
	outputFolder = outputFolder || 'dist';
	var startTime = new Date().getTime();

	//0. load build config according to --config
	var configName = './config.' + (program.config || 'dist') + '.js';
	var config = require(configName);
	console.log('Start building using config ['.yellow, configName, '] >> ['.yellow, outputFolder, ']'.yellow);

	//1. start processing index page
	var result = processor.combine({
		root: config.src.root,
		html: config.src.index,
		excludeAttr: program.config
	});

	//2. hammer the output folder structure out
	hammer.createFolderStructure(_.extend({cachedFiles: result, output: outputFolder}, config), function(){
		//check if --G
		if(program.targz) {
			//tar.gz
			var tarball = path.normalize(program.targz);
			targz.compress(outputFolder, tarball, function(err){
				if(err) console.log('ERROR'.red, err.message);
				else console.log('Gzipped into ', tarball.yellow);
			});
		}
		//check if --Z
		if(program.zip) {
			//zip (problem on Unix based machine)
			var zip = new AdmZip();
			zip.addLocalFolder(outputFolder);
			var name = path.normalize(program.zip);
			zip.writeZip(name);
			console.log('Zipped into ', name.yellow);
		}
		console.log('Build Task [app] Complete'.rainbow, '-', moment.utc(new Date().getTime() - startTime).format('HH:mm:ss.SSS').underline);
	});

});

program.parse(process.argv);

