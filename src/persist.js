(function(jsenvy) {
	jsenvy.persist = {};

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
				if (typeof callback === 'function') {
					callback()
				}
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
})(jsenvy);