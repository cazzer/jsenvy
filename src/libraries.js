(function(jsenvy, document) {
	jsenvy.libraries = {
		preload: preload,
		search: search,
		load: load,
		loaded: loaded
	};

	var cdnjsLibraries = [],
		filesLoaded = [];

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