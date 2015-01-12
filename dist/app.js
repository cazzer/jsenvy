(function(window) {
	//export a global to work with
	window.jsenvy = {};
})(window);
(function(jsenvy) {
	/**
	 }
	 * Scope Creep
	 * ===
	 * A fun way to creep on people's scope. Lets you:
	 * - Update a scope to see the scope difference
	 * - View the current contents of the scope, in case you forgot what you're creeping on
	 */
	jsenvy.ScopeCreep = function(victim, ignores) {
		var properties = [],
			methods = [];

		ignores = ignores || {properties: [], methods: []};

		//a setter for the scope properties and methods
		function setScope(scope) {
			if (typeof scope !== "object") {
				scope = enumerateScope();
			}

			properties = scope.properties;
			methods = scope.methods;
		}

		//an updater for the scope that returns the difference
		function update() {
			var diff = getScopeDiff();
			setScope(diff.scope);
			return diff;
		}

		//the actually scope dissection
		function enumerateScope() {
			var properties = [],
				methods = [],
				thingsToIgnore = ["length", "__CommandLineAPI"];

			var scope = Object.getOwnPropertyNames(victim);
			for (var i = 0; i < scope.length; i++) {
				var prop = scope[i];
				if (thingsToIgnore.indexOf(prop) >= 0) continue;
				if (typeof window[prop] === "function") {
					methods.push(prop);
				} else {
					properties.push(prop);
				}
			}

			return {
				properties: properties,
				methods: methods
			};
		}

		//retrieve the scope diff without setting the scope
		function getScopeDiff() {
			var newScope = enumerateScope();

			var propertyDiff = arrayDiff(ignores.properties, arrayDiff(properties, newScope.properties)),
				methodDiff = arrayDiff(ignores.methods, arrayDiff(methods, newScope.methods));

			return {
				properties: propertyDiff,
				methods: methodDiff,
				scope: newScope
			};
		}

		function arrayDiff(array1, array2) {
			var difference = [];

			array2.forEach(function(item) {
				if (array1.indexOf(item) === -1) {
					difference.push(item);
				}
			});

			return difference;
		}

		setScope();
		return {
			update: update,
			peek: getScopeDiff,
			get: enumerateScope
		}
	};
})(jsenvy);
(function(jsenvy, document) {
	jsenvy.libraries = {
		preload: preload,
		search: search,
		load: load,
		loaded: loaded,
		callback: callback
	};

	var cdnjsLibraries = [],
		filesLoaded = [],
		callbacks = [];

	function preload() {
		get("http://api.cdnjs.com/libraries", function (data) {
			var results = JSON.parse(data.response).results;
			//sort these once here
			results.sort(function (a, b) {
				return a.name.length - b.name.length;
			});

			cdnjsLibraries = results;
		});
	}

	function search(query) {
		var results = [];

		for (var i = 0; i < cdnjsLibraries.length; i++) {
			if (cdnjsLibraries[i].name.indexOf(query) > -1) {
				results.push(cdnjsLibraries[i]);
			}
		}

		return results;
	}

	function load(file, callback) {
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
				//clear the dishes
				callback.done = true;
				clearTimeout(validator);
				callbacks.forEach(function (fn) {
					fn(file);
				});
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
	}

	function loaded() {
		return filesLoaded;
	}

	function callback(fn) {
		callbacks.push(fn);
	}

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

})(jsenvy, document);
(function(jsenvy, document) {
	jsenvy.hideables = {
		hide: hide,
		show: show
	};

	//enable hideables
	var hideables = document.getElementsByClassName("hideable");
	for (var i = 0; i < hideables.length; i++) {
		hideables[i].onclick = function () {
			toggleHideable(this);
		}
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
})(jsenvy, document);
(function (jsenvy, document, window) {
	jsenvy.console = {
		log: log,
		history: history,
		callback: callback
	};
	//keep track of this guy!
	var _console = window.console;
	//elements
	var consoleLog = document.getElementById('console-log'),
		consoleForm = document.getElementById('console-form'),
		consoleInput = document.getElementById('console-input');
	//templates
	var templates = {
		log: document.getElementById('log-template'),
		error: document.getElementById('error-template')
	};
	//random variables
	var consoleHistoryIndex = 0,
		callbacks = [];

	//attach events
	consoleForm.onsubmit = function (e) {
		e.preventDefault();
		log();
	};

	consoleInput.onkeyup = function (e) {
		switch (e.keyCode) {
			case 38: //"up"
				consoleHistory(-1);
				break;
			case 40: //"down"
				consoleHistory(+1);
				break;
			default:
				break;
		}
	};

	function callback(fn) {
		callbacks.push(fn);
	}

	function runCallbacks() {
		callbacks.forEach(function (fn) {
			fn();
		});
	}

	function log(value) {
		var expression = value || consoleInput.value;
		if (expression === '') return;

		consoleInput.value = '';
		//here is the magic
		try {
			var value = eval(expression),
				entry = templates.log.cloneNode();

			entry.title = expression;
			entry.innerHTML = value;
			consoleLog.appendChild(entry);
		} catch (error) {
			var entry = templates.error.cloneNode();

			entry.title = expression;
			entry.innerHTML = error.message;
			consoleLog.appendChild(entry);
		}
		//keep the console at the bottom
		consoleLog.scrollTop = consoleLog.scrollHeight;
		consoleHistoryIndex = consoleLog.childElementCount;
		runCallbacks();
	}

	function consoleHistory(operation) {
		if (consoleHistoryIndex + operation > -1 &&
			consoleHistoryIndex + operation <= consoleLog.childElementCount) {
			consoleHistoryIndex = consoleHistoryIndex + operation;
		}
		if (consoleHistoryIndex === consoleLog.childElementCount) {
			consoleInput.value = '';
		} else if (consoleLog.childElementCount) {
			consoleInput.value = consoleLog.children[consoleHistoryIndex].title;
		}
	}

	function history() {
		var logs = consoleLog.children,
			statements = [];

		for (var i = 0, l = logs.length; i < l; i++) {
			statements.push(logs[i].title);
		}

		return statements;
	}

	//process templates
	(function () {
		for (var template in templates) {
			var cloned = templates[template].cloneNode();
			cloned.id = '';
			templates[template].remove();
			templates[template] = cloned;
		}
	})();
})(jsenvy, document, window);
(function(jsenvy) {
	jsenvy.persist = {
		get: getFromHash,
		put: putInHash,
		post: postInHash,
		remove: removeFromHash,
		if: ifHash
	};

	function getFromHash(where) {
		var regex = new RegExp('[\\#]' + where + '=([^#]*)'),
			results = regex.exec(location.hash);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	function putInHash(what, where) {
		var regex = new RegExp(where + '=([^#]*)');
		if (!regex.exec(location.hash)) return postInHash(what, where);
		location.hash = location.hash.replace(regex, where + '=' + encodeURIComponent(what));
	}

	function postInHash(what, where) {
		removeFromHash(where);
		location.hash = ifHash(what, where);
	}

	function removeFromHash(where) {
		var regex = new RegExp('[#]' + where + '=([^#]*)');
		location.hash = location.hash.replace(regex, '');
	}

	function ifHash(what, where) {
		return location.hash + '#' + where + '=' + encodeURIComponent(what);
	}
})(jsenvy);
(function (jsenvy) {

	loadLibrariesFromSearch(runLogsFromSearch);

	function loadLibrariesFromSearch(callback) {
		var libraries = jsenvy.persist.get('libs').split(',');

		if (!libraries || !libraries.length || !libraries[0]) {
			callback();
			return;
		}

		loadLibrary(libraries, callback);

		function loadLibrary(library, callback) {
			if (typeof library === 'object' && library.length) {
				jsenvy.libraries.load(library.shift(), function () {
					loadLibrary(library, callback);
				}, true);
			} else {
				callback();
			}
		}
	}

	function runLogsFromSearch(callback) {
		var logs = jsenvy.persist.get('logs').split(',,');

		if (!logs || !logs.length || !logs[0]) {
			if (typeof callback === 'function') callback();
			return;
		}

		loadLog(logs, callback);

		function loadLog(log, callback) {
			if (typeof log === 'object' && log.length) {
				jsenvy.console.log(log.shift());
				window.setTimeout(function () {
					loadLog(log, callback);
				}, 500);
			} else {
				if (typeof callback === 'function') callback();
			}
		}
	}
})(jsenvy);
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
		jsenvy.libraries.load(url, function(success, message) {
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
})(jsenvy, window, document);