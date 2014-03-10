requirejs.config({
	appDir: ".",
	baseUrl: "libraries",
	paths: {
		/* Load jquery from google cdn. On fail, load local file. */
		'jquery': ['//code.jquery.com/jquery-2.1.0'],
		/* Load bootstrap from cdn. On fail, load local file. */
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