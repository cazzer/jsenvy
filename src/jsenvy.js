(function () {
	//keep track of
	var filesLoaded = [],
		cdnjsLibraries,
		cdnjsLibBase = "http://cdnjs.cloudflare.com/ajax/libs",
		libraryInput = document.getElementById("libraryName"),
		librarySuggestions = document.getElementById("librarySuggestions"),
		suggestionsError = document.getElementById("suggestions-error"),
		suggestionsHelp = document.getElementById("suggestions-help"),
		windowChanges = document.getElementById("windowChanges"),
		newProperties = document.getElementById("newProperties"),
		newMethods = document.getElementById("newMethods"),
		windowCreep = ScopeCreep(window, {
			properties: ['gaplugins', 'GoogleAnalyticsObject', 'gaGlobal'],
			methods: ['ga']
		});

	//preload cdnjs libraries
	get("http://api.cdnjs.com/libraries", function (data) {
		var results = JSON.parse(data.response).results;
		//sort these once here
		results.sort(function (a, b) {
			return a.name.length - b.name.length;
		});

		cdnjsLibraries = results;
		if (window.location.search) {
			if (getParameterByName('libs')) {
				loadLibrariesFromSearch(function () {
					if (getParameterByName('logs')) {
						runLogsFromSearch();
					}
				});
			} else {
				if (getParameterByName('logs')) {
					runLogsFromSearch();
				}
			}
		}
	});

	//enable hideables
	var hideables = document.getElementsByClassName("hideable");
	for (var i = 0; i < hideables.length; i++) {
		hideables[i].onclick = function () {
			toggleHideable(this);
		}
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

	/*
	 Append functions to the DOM
	 */

	//just load the first damn result
	document.getElementById("libraryForm").onsubmit = function (e) {
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
		var results = searchCdnjs(this.value);
		//help if we didn"t find anything
		if (!results.length) {
			show(suggestionsError);
			hide(suggestionsHelp);
			return;
		}
		//help if we did find anything
		show(suggestionsHelp);
		hide(suggestionsError);
		//add the anything
		for (var i = 0; i < results.length; i++) {
			var li = document.createElement("li");
			li.onclick = function () {
				windowCreep.update();
				loadScript(this.getAttribute("data-src"), scopeUpdateViewer);
			};
			li.innerHTML = results[i].name;
			li.setAttribute("data-src", results[i].latest);
			document.getElementById("librarySuggestions").appendChild(li);
		}
	};

	//backup file loader
	document.getElementById("loadFromUrl").onclick = function () {
		windowCreep.update();
		loadScript(libraryInput.value, scopeUpdateViewer);
	};

	/*
	 Utility Functions
	 */

	//our friendly neighborhood ajax http request
	function get(url, callback) {

		var xhr;

		if (typeof XMLHttpRequest !== "undefined")
			xhr = new XMLHttpRequest();
		else {
			var versions = [
				"MSXML2.XmlHttp.5.0",
				"MSXML2.XmlHttp.4.0",
				"MSXML2.XmlHttp.3.0",
				"MSXML2.XmlHttp.2.0",
				"Microsoft.XmlHttp"
			];

			for (var i = 0, len = versions.length; i < len; i++) {
				try {
					xhr = new ActiveXObject(versions[i]);
					break;
				} catch (e) {
				}
			}
		}
		xhr.onreadystatechange = ensureReadiness;
		function ensureReadiness() {
			if (xhr.readyState < 4) {
				return;
			}
			if (xhr.status !== 200) {
				return;
			}
			if (xhr.readyState === 4) {
				callback(xhr);
			}
		}

		xhr.open("GET", url, true);
		xhr.send("");
		return xhr;
	}

	//load a script in a friendly way
	function loadScript(file, userCallback, skipPersist) {

		//fail fast
		if (!file) {
			return;
		}
		if (filesLoaded.indexOf(file) >= 0) {
			return callback(false, "We already got this for you.");
		}

		//create a script
		var script = document.createElement("script");
		script.src = file;
		script.asynch = true;
		script.onreadystatechange = script.onload = function () {
			var state = script.readyState;
			if (!callback.done && (!state || /loaded|complete/.test(state))) {
				filesLoaded.push(file);
				if (!skipPersist) {
					persistLibrariesToHash();
				}
				//clear the dishes
				callback.done = true;
				clearTimeout(validator);
				callback(true);
			}
		};
		document.body.appendChild(script);

		//create a limit
		var validator = setTimeout(function () {
			if (!callback.done)
				script.remove();
			callback(false, "This little guy didn't make it on time: " + file);
		}, 2000);

		//analytics
		if (window.ga !== undefined) {
			window.ga('send', 'event', 'load', file);
		}

		//update the world on your life
		function callback(success, message) {
			if (success) {
				document.getElementById("libraryName").value = "";
				document.getElementById("librarySuggestions").innerHTML = "";
				hide(suggestionsHelp);
				hide(suggestionsError);

				var li = document.createElement("li");
				li.innerHTML = file;
				document.getElementById("loadedLibraries").appendChild(li);
				if (typeof userCallback === "function") {
					userCallback();
				}
			} else {
				alert(message);
			}
		}
	}

	//search cdnjs stuff and return the results
	function searchCdnjs(query) {
		var results = [];

		for (var i = 0; i < cdnjsLibraries.length; i++) {
			if (cdnjsLibraries[i].name.indexOf(query) > -1) {
				results.push(cdnjsLibraries[i]);
			}
		}

		return results;
	}

	//open or close a hideable element
	function toggleHideable(element) {
		if (element.nextElementSibling.classList.contains("hidden")) {
			show(element.nextElementSibling);
		} else {
			hide(element.nextElementSibling);
		}
	}

	//remove class helper
	function hide(element) {
		if (!element.classList.contains("hidden")) {
			element.classList.add("hidden");
		}
	}

	function show(element) {
		element.classList.remove("hidden");
	}

	function persistLibrariesToHash() {
		var libs = [],
			url;
		for (var i = 0; i < filesLoaded.length; i++) {
			var fileName = filesLoaded[i].replace(cdnjsLibBase, "!");
			libs.push(encodeURIComponent(fileName));
		}
		libs = libs.join(",");

		url = setParameterByName('libs', libs);
		if (window.history.replaceState) {
			window.history.replaceState(null, null, url);
		} else {
			window.location.search = url;
		}
	}

	//persist logs to hash
	jsConsole.callback(function () {
		var logs = jsConsole.history().join(',,'),
			url;

		url = setParameterByName('logs', encodeURIComponent(logs));
		if (window.history.replaceState) {
			window.history.replaceState(null, null, url);
		} else {
			window.location.search = url;
		}
	});

	function loadLibrariesFromSearch(callback) {
		var filesToLoad = getParameterByName('libs').split(',');

		if (!filesToLoad || !filesToLoad.length) {
			callback();
			return;
		}

		loadLibrary(filesToLoad, callback);

		function loadLibrary(library, callback) {
			if (typeof library === 'object' && library.length) {
				var fileUrl = library.shift().replace("!", cdnjsLibBase);
				loadScript(decodeURIComponent(fileUrl), function () {
					loadLibrary(library, callback);
				}, true);
			} else {
				scopeUpdateViewer();
				callback();
			}
		}
	}

	function runLogsFromSearch(callback) {
		var logsToLoad = getParameterByName('logs').split(',,');

		if (!logsToLoad || !logsToLoad.length) {
			callback();
			return;
		}

		loadLog(logsToLoad, callback);

		function loadLog(log, callback) {
			if (typeof log === 'object' && log.length) {
				jsConsole.log(decodeURIComponent(log.shift()));
				window.setTimeout(function () {
					loadLog(log, callback);
				}, 500);
			} else {
				callback();
			}
		}
	}

	//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	//http://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
	function setParameterByName(key, value) {
		var uri = location.search;
		var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
		var separator = uri.indexOf('?') !== -1 ? "&" : "?";
		if (uri.match(re)) {
			return uri.replace(re, '$1' + key + "=" + value + '$2');
		}
		else {
			return uri + separator + key + "=" + value;
		}
	}
})();
