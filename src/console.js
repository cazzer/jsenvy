(function(document, window) {
	//keep track of this guy!
	var _console = window.console;
	//elements
	var consoleLog = document.getElementById('console-log'),
		consoleForm = document.getElementById('console-form'),
		consoleInput = document.getElementById('console-input');
	//our console object
	var console = {
		log: console
	};
	//templates
	var templates = {
		log: document.getElementById('log-template'),
		error: document.getElementById('error-template')
	};
	//random variables
	var consoleHistoryIndex = 0;

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

	//process templates
	(function() {
		for (var template in templates) {
			var cloned = templates[template].cloneNode();
			cloned.id = '';
			templates[template].remove();
			templates[template] = cloned;
		}
	})();
})(document, window);