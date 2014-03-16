var jsenvy = (function() {
	//keep track of
	var filesLoaded = [];

	function get(url, callback) {
		var xhr;

		if ( typeof XMLHttpRequest !== 'undefined')
			xhr = new XMLHttpRequest();
		else {
			var versions = [
					"MSXML2.XmlHttp.5.0",
					"MSXML2.XmlHttp.4.0",
					"MSXML2.XmlHttp.3.0",
					"MSXML2.XmlHttp.2.0",
					"Microsoft.XmlHttp"];

			for (var i = 0, len = versions.length; i < len; i++) {
				try {
					xhr = new ActiveXObject(versions[i]);
					break;
				} catch(e) {
				}
			} // end for
		}
		xhr.onreadystatechange = ensureReadiness;
		function ensureReadiness() {
			if (xhr.readyState < 4) {
				return;
			}
			if (xhr.status !== 200) {
				return;
			}

			// all is well
			if (xhr.readyState === 4) {
				callback(xhr);
			}
		}
		
		xhr.open('GET', url, true);
		xhr.send('');
		return xhr;
	}


	return {
		load : function(file, callback) {
			if (filesLoaded.indexOf(file) >= 0)
				return callback(false, 'We already got this for you.');

			var script = document.createElement('script'), validator = setTimeout(function() {
				if (!callback.done)
					script.remove();
				callback(false, "This little guy didn't make it on time: " + file);
			}, 2000);

			document.body.appendChild(script);
			script.src = file;
			script.asynch = true;
			script.onreadystatechange = script.onload = function() {
				var state = script.readyState;
				if (!callback.done && (!state || /loaded|complete/.test(state))) {
					filesLoaded.push(file);
					//clear the dishes
					callback.done = true;
					clearTimeout(validator);
					callback(true);
				}
			};
		},
		searchCdnjs : function(query, callback) {
			var request = get("http://api.cdnjs.com/libraries?search=" + query.replace(/\s/g, "+"), function(data) {
				callback(JSON.parse(data.response));
			});
			
			return request;
		}
	};
})();

var jsenvyUi = {};

jsenvyUi.load = function(file) {
	jsenvy.load(file, function(success, message) {
		if (success) {
			document.getElementById("libraryName").value = "";
			document.getElementById("librarySuggestions").innerHTML = "";
			
			var li = document.createElement('li');
			li.innerHTML = file;
			document.getElementById('loadedLibraries').appendChild(li);
		} else {
			alert(message);
		}
	});
};

document.getElementById('libraryForm').onsubmit = function(e) {
	//set the table
	e.preventDefault();
	var self = this;

	jsenvyUi.load(this.libraryName.value);
};

jsenvyUi.searchRequest = null;
document.getElementById('libraryName').onkeyup = function(e) {
	if (this.value.length > 2) {
		//clear current suggestions
		if (jsenvyUi.searchRequest) jsenvyUi.searchRequest.abort();
		document.getElementById("librarySuggestions").innerHTML = "";
		//get the new stuff
		jsenvyUi.searchRequest = jsenvy.searchCdnjs(this.value, function(data) {
			if (!data.results) return console.log("No results?");
			
			for (var i = 0; i < data.results.length; i++) {
				var li = document.createElement("li");
				li.innerHTML = data.results[i].name;
				li.setAttribute("data-src", data.results[i].latest);
				li.onclick = function() {
					jsenvyUi.load(this.getAttribute("data-src"));
				};
				document.getElementById("librarySuggestions").appendChild(li);
			}
		});
	}
};
