/*
The MIT License (MIT)

Copyright (c) 2014 Andrew Maurer

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/



/*****************
	This function is desinged to do dependency injection
		deps is an array of objects which is used to pass to the other JS files
		paths is the directories that we do a recursive file lookup and execute
		paths extends the base idea of MVC (which we're only executing the M and V for that pattern)
*/

function myMVC(){

	this.references = {};
	this.directories = {};
	this.directories.ordered = null;
	this.directories.named = null;

};

myMVC.prototype.init = function(deps, paths, scope){


	var fs = require("fs");
	var i, ii, x, xx, len, lenn, directories,
		files, req, directoryMap, fileSplit, dependenciesFinal;
	var d = deps || [];
	var directories = paths || [
		 __dirname + "/controllers"
		,__dirname + "/models"
	];
	var s = scope || {};

	if(typeof d !== "object" || d.length == null)
		throw "Dependencies passed to module must be an array";
	if(typeof directories !== "object" || directories.length == null)
		throw "Paths passed to module must be an array";

	directoryMap = this.createDirectoryObjectMap(directories);

	// Loop Directory
	for (i = 0, len = directoryMap.ordered.length; i < len; i++) {
 		x = directoryMap.ordered[i];

 		// Make sure it exists
		if(!fs.existsSync(x.ref))
			throw x.name + " does not exist!";

		// Get Files
		files = fs.readdirSync(x.ref);

		this.references[x.name] = {};

		// Loop files from directory
		for (ii = 0, lenn = files.length; ii < lenn; ii++) {
			xx = files[ii];
			fileSplit = xx.split(".");

			// Filter anything none JavaScript
			if(fileSplit[1] !== "js")
				continue;

			// Require file
			req = module.require(x.ref + "/" + xx);

			// Init Required
			if(req.init == null)
				throw xx + " must have an init function!";

			// Add to references => this.references.controller.myfile.publicfunctions()
			this.references[x.name][fileSplit[0]] = req;

		};

	};

	dependenciesFinal = [this.references].concat(deps);

	// Call init (in order of directory param) on required JS
	for (i = 0, len = directoryMap.ordered.length; i < len; i++) {
 		x = this.references[directoryMap.ordered[i].name];

 		for(n in x){
			x[n].init.apply(s, dependenciesFinal);
 		};

	};


};



myMVC.prototype.createDirectoryObjectMap = function(directories){
	var orderedTemp = [], namedTemp = {};
	var i, x, len;
	for (i = 0, len = directories.length; i < len; i++) {
		x = directories[i];
		dirName = this.getName(x);
		orderedTemp.push({
			 name : dirName
			,ref : x
		});
		namedTemp[dirName] = x;
	};

	this.directories.ordered = orderedTemp;
	this.directories.named = namedTemp;

	return this.directories;
};



myMVC.prototype.getName = function(path){
	var pathSplit = path.split("/");
	return pathSplit[pathSplit.length-1];
};



module.exports = new myMVC();

