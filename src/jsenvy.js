(function () {
	//keep track of
	var filesLoaded = [],
		cdnjsLibraries,
		libraryInput = document.getElementById("libraryName");

	//preload cdnjs libraries
	get("http://api.cdnjs.com/libraries", function (data) {
		cdnjsLibraries = JSON.parse(data.response).results;
	});

	//enable hideables
	var hideables = document.getElementsByClassName("hideable");
	for (var i = 0; i < hideables.length; i++) {
		hideables[i].onclick = function () {
			toggleHideable(this);
		}
	}

	/*
	 Append functions to the DOM
	 */

	//typeahead search
	document.getElementById("libraryName").onkeyup = function () {

		//reset the results
		document.getElementById("librarySuggestions").innerHTML = "";

		//return if there is no query
		if (this.value.length < 1) return;

		//get the new stuff
		var results = searchCdnjs(this.value);
		//help if we didn"t find anything
		if (!results.length) {
			document.getElementById("suggestions-help").innerHTML = "No results, try using the full path option.";
			return;
		}
		//help if we did find anything
		document.getElementById("suggestions-help").innerHTML = "To load a cdnjs library, select it from the list.";
		//add the anything
		for (var i = 0; i < results.length; i++) {
			var li = document.createElement("li");
			li.onclick = function () {
				loadScript(this.getAttribute("data-src"));
			};
			li.innerHTML = results[i].name;
			li.setAttribute("data-src", results[i].latest);
			document.getElementById("librarySuggestions").appendChild(li);
		}
	};

	//backup file loader
	document.getElementById("loadFromUrl").onclick = function () {
		loadScript(libraryInput.value);
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
	function loadScript(file) {

		if (!file) return;

		function callback(success, message) {
			if (success) {
				document.getElementById("libraryName").value = "";
				document.getElementById("librarySuggestions").innerHTML = "";

				var li = document.createElement("li");
				li.innerHTML = file;
				document.getElementById("loadedLibraries").appendChild(li);
			} else {
				alert(message);
			}
		}

		if (filesLoaded.indexOf(file) >= 0)
			return callback(false, "We already got this for you.");

		var script = document.createElement("script"), validator = setTimeout(function () {
			if (!callback.done)
				script.remove();
			callback(false, "This little guy didn't make it on time: " + file);
		}, 2000);

		document.body.appendChild(script);
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
		if (element.nextElementSibling.getAttribute("data-hidden") != "true") {
			element.nextElementSibling.classList.add("hidden");
			element.nextElementSibling.setAttribute("data-hidden", "true");
		} else {
			element.nextElementSibling.classList.remove("hidden");
			element.nextElementSibling.setAttribute("data-hidden", "false");
		}
	}
})();