(function () {
	//keep track of
	var filesLoaded = [],
		cdnjsLibBase = "http://cdnjs.cloudflare.com/ajax/libs";

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
				if (typeof userCallback === "function") {
					userCallback();
				}
			} else {
				alert(message);
			}
		}
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
				callback();
			}
		}
	}

	function runLogsFromSearch() {
		var logsToLoad = getParameterByName('logs').split(',,');

		if (!logsToLoad || !logsToLoad.length) {
			return;
		}

		loadLog(logsToLoad);

		function loadLog(log) {
			if (typeof log === 'object' && log.length) {
				jsConsole.log(decodeURIComponent(log.shift()));
				window.setTimeout(function () {
					loadLog(log);
				}, 500);
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
