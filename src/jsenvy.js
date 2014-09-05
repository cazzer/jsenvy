(function () {
	//keep track of
	var filesLoaded = [],
		cdnjsLibraries,
		libraryInput = document.getElementById("libraryName"),
		librarySuggestions = document.getElementById("librarySuggestions"),
		suggestionsError = document.getElementById("suggestions-error"),
		suggestionsHelp = document.getElementById("suggestions-help"),
		windowChanges = document.getElementById("windowChanges"),
		newProperties = document.getElementById("newProperties"),
		newMethods = document.getElementById("newMethods"),
		windowCreep = ScopeCreep(window);

	//preload cdnjs libraries
	get("http://api.cdnjs.com/libraries", function (data) {
		var results = JSON.parse(data.response).results;
		//sort these once here
		results.sort(function (a, b) {
			return a.name.length - b.name.length;
		});

		cdnjsLibraries = results;
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

			windowChanges.style.display = "none";
			newProperties.innerHTML = "";
			newMethods.innerHTML = "";

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
	document.getElementById("libraryForm").onsubmit = function(e) {
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
				//analytics
				if(ga !== undefined) {
					ga('send', 'event', 'loadcdnjs', this.innerHTML);
				}
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
		//analytics
		if(ga !== undefined) {
			ga('send', 'event', 'loadurl', libraryInput.value);
		}
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
	function loadScript(file, userCallback) {

		if (!file) return;

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
		if (element.nextElementSibling.hasClass("hidden")) {
			show(element);
		} else {
			hide(element);
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
})();