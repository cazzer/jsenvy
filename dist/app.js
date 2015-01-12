(function(jsenvy, document, window) {
	jsenvy.jsConsole = {
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
	consoleForm.onsubmit = function(e) {
		e.preventDefault();
		log();
	};

	consoleInput.onkeyup = function(e) {
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
	(function() {
		for (var template in templates) {
			var cloned = templates[template].cloneNode();
			cloned.id = '';
			templates[template].remove();
			templates[template] = cloned;
		}
	})();
})(jsenvy, document, window);
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