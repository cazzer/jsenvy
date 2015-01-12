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