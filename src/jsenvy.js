(function (jsenvy, window, document) {
	//keep track of
	var libraryInput = document.getElementById("libraryName"),
		libraryForm = document.getElementById("libraryForm"),
		librarySuggestions = document.getElementById("librarySuggestions"),
		suggestionsError = document.getElementById("suggestions-error"),
		suggestionsHelp = document.getElementById("suggestions-help"),
		windowChanges = document.getElementById("windowChanges"),
		newProperties = document.getElementById("newProperties"),
		newMethods = document.getElementById("newMethods"),
		linkLogs = document.getElementById('link-logs'),
		linkLibs = document.getElementById('link-libraries'),
		windowCreep = jsenvy.ScopeCreep(window, {
			properties: ['gaplugins', 'GoogleAnalyticsObject', 'gaGlobal'],
			methods: ['ga']
		});

	var logsLinked = false,
		libsLinked = false;

	jsenvy.libraries.preload();

	//just load the first damn result
	libraryForm.onsubmit = function (e) {
		e.preventDefault();
		librarySuggestions.firstChild.click();
	};

	//typeahead search
	libraryInput.onkeyup = function () {
		//reset the results
		librarySuggestions.innerHTML = "";
		//return if there is no query
		if (this.value.length < 1) return;
		//get the new stuff
		var results = jsenvy.libraries.search(this.value);
		//help if we didn"t find anything
		if (!results.length) {
			jsenvy.hideables.show(suggestionsError);
			jsenvy.hideables.hide(suggestionsHelp);
			return;
		}
		//help if we did find anything
		jsenvy.hideables.show(suggestionsHelp);
		jsenvy.hideables.hide(suggestionsError);
		//add the anything
		for (var i = 0; i < results.length; i++) {
			var li = document.createElement("li");
			li.onclick = function () {
				loadLibrary(this.getAttribute("data-src"));
			};
			li.innerHTML = results[i].name;
			li.setAttribute("data-src", results[i].latest);
			librarySuggestions.appendChild(li);
		}
	};

	//backup file loader
	document.getElementById("loadFromUrl").onclick = function () {
		loadLibrary(libraryInput.value);
	};

	function loadLibrary(url) {
		windowCreep.update();
		jsenvy.libraries.load(url, function(success, message) {
			if (success) {
				document.getElementById("libraryName").value = "";
				document.getElementById("librarySuggestions").innerHTML = "";
				jsenvy.hideables.hide(suggestionsHelp);
				jsenvy.hideables.hide(suggestionsError);

				var li = document.createElement("li");
				li.innerHTML = url;
				document.getElementById("loadedLibraries").appendChild(li);
				linkLibs.href = jsenvy.persist.if(jsenvy.libraries.loaded().join(','), 'libs')
			} else {
				alert(message);
			}

			scopeUpdateViewer();
		});
	}

	linkLibs.onclick = function() {

	};

	//display updates to scope
	function scopeUpdateViewer() {
		var update = windowCreep.update(),
			boom = false;

		for (var i = 0; i < update.properties.length; i++) {
			boom = true;
			var li = document.createElement("li");
			li.innerHTML = update.properties[i];
			newProperties.appendChild(li);
		}

		for (var i = 0; i < update.methods.length; i++) {
			boom = true;
			var li = document.createElement("li");
			li.innerHTML = update.methods[i];
			newMethods.appendChild(li);
		}

		if (boom) windowChanges.style.display = "block";
	}
})(jsenvy, window, document);