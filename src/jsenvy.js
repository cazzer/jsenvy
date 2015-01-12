(function (jsenvy, window, document) {
	//keep track of
	var libraryInput = document.getElementById("libraryName"),
		libraryForm = document.getElementById("libraryForm"),
		librarySuggestions = document.getElementById("librarySuggestions"),
		suggestionsError = document.getElementById("suggestions-error"),
		suggestionsHelp = document.getElementById("suggestions-help"),
		loadedLibraries = document.getElementById('loadedLibraries'),
		windowChanges = document.getElementById("windowChanges"),
		newProperties = document.getElementById("newProperties"),
		newMethods = document.getElementById("newMethods"),
		linkLogs = document.getElementById('link-logs'),
		linkLibs = document.getElementById('link-libraries'),
		embedCodeModal = document.getElementById('embed-code-modal'),
		embedCode = document.getElementById('embed-code'),
		windowCreep = jsenvy.ScopeCreep(window, {
			properties: ['gaplugins', 'GoogleAnalyticsObject', 'gaGlobal'],
			methods: ['ga']
		});

	var logsLinked = true,
		libsLinked = true;

	jsenvy.libraries.preload();

	jsenvy.libraries.callback(addToLoadedLibraries);

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

	jsenvy.console.callback(updateLogs);

	linkLibs.onclick = function (e) {
		e.preventDefault();
		e.stopPropagation();
		libsLinked = !libsLinked;
		var libs = jsenvy.libraries.loaded().join(',');
		if (libsLinked) {
			linkLibs.href = jsenvy.persist.if('', 'libs');
			linkLibs.classList.remove('boring-link');
			jsenvy.persist.post(libs, 'libs');
		} else {
			linkLibs.href = jsenvy.persist.if(libs, 'libs');
			linkLibs.classList.add('boring-link');
			jsenvy.persist.remove('libs');
		}
	};

	linkLogs.onclick = function (e) {
		e.preventDefault();
		e.stopPropagation();
		logsLinked = !logsLinked;
		var logs = jsenvy.console.history().join(',,');
		if (logsLinked) {
			linkLogs.href = jsenvy.persist.if('', 'logs');
			linkLogs.classList.remove('boring-link');
			jsenvy.persist.post(logs, 'logs');
		} else {
			linkLogs.href = jsenvy.persist.if(logs, 'logs');
			linkLogs.classList.add('boring-link');
			jsenvy.persist.remove('logs');
		}
	};

	document.getElementById('close-modal').onclick = closeModal;

	document.getElementById('embed-console').onclick = openModal;

	//update urls or links
	function updateLibraries() {
		var libs = jsenvy.libraries.loaded().join(',');
		if (libsLinked) {
			jsenvy.persist.put(libs, 'libs');
		} else {
			linkLibs.href = jsenvy.persist.if(libs, 'libs');
		}
	}

	function updateLogs() {
		var logs = jsenvy.console.history().join(',,');
		if (logsLinked) {
			jsenvy.persist.put(logs, 'logs');
		} else {
			linkLibs.href = jsenvy.persist.if(logs, 'logs');
		}
	}


	function loadLibrary(url) {
		windowCreep.update();
		jsenvy.libraries.load(url, function (success, message) {
			if (success) {
				document.getElementById("libraryName").value = "";
				document.getElementById("librarySuggestions").innerHTML = "";
				jsenvy.hideables.hide(suggestionsHelp);
				jsenvy.hideables.hide(suggestionsError);

				updateLibraries();
				scopeUpdateViewer();
			} else {
				alert(message);
			}
		});
	}

	function addToLoadedLibraries(url) {
		var li = document.createElement("li");
		li.innerHTML = url;
		loadedLibraries.appendChild(li);
	}

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

	function openModal(e) {
		e.preventDefault();
		e.stopPropagation();
		embedCode.innerHTML = '<iframe src="' + location.host + '/console.html' + location.hash + '"></iframe>';
		embedCodeModal.style.display = 'block';
	}

	function closeModal() {
		embedCodeModal.style.display = 'none';
	}
})(jsenvy, window, document);