#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var OUTFILE_DEFAULT = "checked.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var loadURL = function (htmlurl, checksfile, outfile) {
    var loadedHtml = function(result, response) {
	if (result instanceof Error) {
	    console.error('Error: Unable to load html from %s. Exiting.', htmlurl);
	    process.exit(1);
	} else {
	    console.error("Loaded %s", htmlurl);
	    var $ = cheerio.load(result);
	    var checkJson = checkHtml($, checksfile);
	    response2Console(checkJson, outfile);
	}
    };
    return loadedHtml;
};

var checkHtmlUrl = function(htmlurl, checksfile, outfile) {
    var loadedHtml = loadURL(htmlurl, checksfile, outfile);
    rest.get(htmlurl).on('complete', loadedHtml);
};

var checkHtmlFile = function(htmlfile, checksfile, outfile) {
    var $ = cheerio.load(fs.readFileSync(htmlfile));
    var checkJson = checkHtml($, checksfile);
    response2Console(checkJson, outfile);
};

var checkHtml = function($, checksfile) {
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var response2Console = function(checkJson, outfile) {
j    var outJson = JSON.stringify(checkJson, null, 4);
    fs.writeFileSync(outfile, outJson);
    console.log(outJson);
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if (require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-o, --outfile <output_file>', 'Path to output file', OUTFILE_DEFAULT)
	.option('-u, --url <page_url>', 'The URL of the html page')
	.parse(process.argv);
    if (program.url !== undefined) {
	console.log('Grading HTML from URL: %s \n', program.url);
	checkHtmlUrl(program.url, program.checks, program.outfile);
    } else {
	console.log('Grading HTML from file: %s \n', program.file);
	checkHtmlFile(program.file, program.checks, program.outfile);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkHtmlUrl = checkHtmlUrl;
}
