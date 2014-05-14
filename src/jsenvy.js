var jsenvy = (function() {
	//keep track of
	var filesLoaded = [];
	var cdnjsLibraries = preloadCdnjs();

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
				"Microsoft.XmlHttp"
			];
					
			for (var i = 0, len = versions.length; i < len; i++) {
				try {
					xhr = new ActiveXObject(versions[i]);
					break;
				} catch(e) {
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
		
		xhr.open('GET', url, true);
		xhr.send('');
		return xhr;
	}
	
	function preloadCdnjs() {
		var request = get("http://api.cdnjs.com/libraries", function(data) {
			cdnjsLibraries = JSON.parse(data.response).results;
		});
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
		searchCdnjs: function(query) {
			var results = [];
			
			for (var i = 0; i < cdnjsLibraries.length; i++) {
				if (cdnjsLibraries[i].name.indexOf(query) > -1) {
					results.push(cdnjsLibraries[i]);
				}
			}
			
			return results;
		},
		toggleHideable: function(element) {
			if (element.nextElementSibling.getAttribute("data-hidden") != "true") {
				element.nextElementSibling.classList.add("hidden");
				element.nextElementSibling.setAttribute("data-hidden", "true");
			} else {
				element.nextElementSibling.classList.remove("hidden");
				element.nextElementSibling.setAttribute("data-hidden", "false");
			}
		}
	};
})();

var jsenvyUi = (function() {
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
	
	jsenvyUi.enableHideables = function() {
		var hideables = document.getElementsByClassName("hideable");
		
		for (var i = 0; i < hideables.length; i++) {
			hideables[i].onclick = function(e) {
				jsenvy.toggleHideable(this);
			}
		}
	};
	
	document.getElementById('libraryName').onkeyup = function() {
		if (this.value.length < 1) {
			document.getElementById("librarySuggestions").innerHTML = "";
			return;
		}
		
		document.getElementById("librarySuggestions").innerHTML = "";
		//get the new stuff
		var results = jsenvy.searchCdnjs(this.value);
		if (!results.length) {
			document.getElementById("suggestions-help").innerHTML = "No results.";
			return;
		}
		
		for (var i = 0; i < results.length; i++) {
			document.getElementById("suggestions-help").innerHTML 
				= "To load a cdnjs library, select it from the list.";
			var li = document.createElement("li");
			li.innerHTML = results[i].name;
			li.setAttribute("data-src", results[i].latest);
			li.onclick = function() {
				jsenvyUi.load(this.getAttribute("data-src"));
			};
			document.getElementById("librarySuggestions").appendChild(li);
		}
	};
	
	document.getElementById('loadFromUrl').click = function(e) {
		jsenvyUi.load(document.getElementById("libraryName").value);
	};

	jsenvyUi.enableHideables();
	
	return jsenvyUi;
})();

var jsConsole = (function(id) {
	//cache the money
	var $console = document.getElementById(id),
		$toolTip = $console.getElementsByClassName('tool-tip')[0];
		$form = $console.getElementsByTagName('form')[0],
		$input = $form.input,
		$history = $console.getElementsByClassName('history')[0],
		inputHistory = [],
		inputIterator = -1;
	//get methods and stuff of object
	function getMethods(object) {
			var options = [];
			for (var things in object) {
				if (["object", "function"].indexOf(typeof object[things]) > -1) {
					options.push(things);
				}
			}
			return options;
	}
	//tooltip
	function showToolTip(tips) {
		if (!tips.length) return;
		//load tips into tool
		$toolTip.innerHTML = "";
		for (var i = 0; i < tips.length; i++) {
			var li = document.createElement("option");
			li.innerHTML = tips[i];
			$toolTip.appendChild(li);
		}
		//display tool
		var x = caretPosition($input);
		$toolTip.style.left = (x * parseInt(getDefaultComputedStyle($toolTip).fontSize)) + "px";
		$toolTip.style.bottom = 0;
		$toolTip.style.display = "block";
	}
	//filter
	function filterToolTip() {
		if ($toolTip.style.display == "none") return;
		
		var filter = $input.value.split(".")[$input.value.split(".").length - 1],
			tips = $toolTip.getElementsByTagName('option');
		for (var i = 0; i < tips.length; i++) {
			if (tips[i].innerHTML.indexOf(filter) < 0) {
				$toolTip.removeChild(tips[i]);
			}
		}
	}
	//hide
	function hideToolTip() {
		$toolTip.style.display = "none";
	}
	/*
	 ** Returns the caret (cursor) position of the specified text field.
	 ** Return value range is 0-oField.value.length.
	 */
	function caretPosition(oField) {

		// Initialize
		var iCaretPos = 0;

		// IE Support
		if (document.selection) {

			// Set focus on the element
			oField.focus();

			// To get cursor position, get empty selection range
			var oSel = document.selection.createRange();

			// Move selection start to 0 position
			oSel.moveStart('character', -oField.value.length);

			// The caret position is selection length
			iCaretPos = oSel.text.length;
		}

		// Firefox support
		else if (oField.selectionStart || oField.selectionStart == '0')
			iCaretPos = oField.selectionStart;

		// Return results
		return (iCaretPos);
	}
	//add to input
	function addToInput(string) {
		$input.value = $input.value.slice(0, $input.value.lastIndexOf(".")) + "." + string;
		//close tooptip and refocus on input
		hideToolTip();
		$input.focus();		
	}
	//add clear function
	$console.clear
	//execute the codez
	$form.onsubmit = function(e) {
		e.preventDefault();
		
		var input = document.createElement("span")
		input.classList.add("input");
		input.classList.add("col-md-6");
		input.innerHTML = $input.value;
		
		var output = document.createElement("span")
		output.classList.add("output");
		output.classList.add("col-md-6");
		output.innerHTML = eval($input.value);
		
		var li = document.createElement("li");
		li.appendChild(input)
		li.appendChild(output);
		//clean up
		inputHistory.push($input.value);
		inputIterator = inputHistory.length;
		$history.appendChild(li);
		$input.value = "";
	};
	//do some intellisense
	$input.onkeyup = function(e) {
		if ($toolTip.style.display != "none" && (e.keyCode == 38 || e.keyCode == 40)) {
			$toolTip.focus();
			return;
		}
		filterToolTip();
		switch (e.keyCode) {
			case 38:	//"up"
				inputIterator = inputIterator <= 0 ? 0 : --inputIterator;
				$input.value = inputHistory[inputIterator] ? inputHistory[inputIterator] : "";
				break;
			case 40:	//"down"
				inputIterator = inputIterator >= inputHistory.length ? inputHistory.length : ++inputIterator;
				$input.value = inputHistory[inputIterator] ? inputHistory[inputIterator] : "";
				break;
			case 190:	//"period"
				var objectName = eval($input.value.slice(0, -1));
				showToolTip(getMethods(objectName));
				break;
		}
	};
	//handle tooltip stuff
	$toolTip.onkeyup = function(e) {
		if (e.keyCode != 13) return;
		addToInput(this.value);
	};
	$toolTip.onclick = function(e) {
		addToInput(e.target.innerHTML);
	};
	
	var jsConsole = {};
	
	jsConsole.console = $console;
	
	return jsConsole;
})("console");

