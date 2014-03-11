var jsenvy = (function(window, document, undefined) {
	var filesLoaded = [],
		self = this;
	
	function loadFile(file, callback) {
		if (self.filesLoaded.indexOf(file) >= 0) return callback('We already got this for you.');
		
		var script = document.createElement('script');
		script.src = file;
		script.asynch = true;
		script.onreadystatechange = script.onload = function() {
			var state = script.readyState;
			if (!callback.done && (!state || /loaded|complete/.test(state))) {
				self.filesLoaded.push(file);
				callback.done = true;
				callback('The following has been loaded: ' + file);
			}
		};
	}
	
	self.load = function(file) {
		loadFile(file, function(message) {
			alert(message);
		});
	};
	
	return self;
}(window, this));

/**
requirejs.config({
	appDir: ".",
	baseUrl: "libraries",
	paths: {
		'jquery': ['//code.jquery.com/jquery-2.1.0'],
		'bootstrap': ['//netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min.', 'libs/bootstrap-min'],
		'backbone': ['//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min']
	}
});

document.getElementById('libraryForm').onsubmit = function(e) {
	//set the table
	e.preventDefault();
	var self = this;

	try {
		define([self.libraryName.value], function() {
			//clean up the dishes
			alert('loaded...');
			self.libraryName.value = "";
		});	
	}
	catch(e) {
		alert('library could not be loaded...');
	}
};

**/