(function (jsenvy, document, window) {
	jsenvy.console = {
		log: log,
		history: history,
		callback: callback,
		clear: clear
	};
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
	consoleForm.onsubmit = function (e) {
		e.preventDefault();
		log();
	};

	consoleInput.onkeyup = function (e) {
		switch (e.keyCode) {
			case 38: //"up"
				consoleHistory(-1);
				break;
			case 40: //"down"
				consoleHistory(+1);
				break;
			default:
	//			showTypeAhead();
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

	function showTypeAhead() {
		var currentValue = consoleInput.value,
			currentScope = window,
			property;

		//find property
		for (var key in currentScope) {
			if (key.indexOf(currentValue) === 0) {
				property = key;
				break;
			}
		}

		//append difference to input
		var wordDifference = property.replace(currentValue, '');
	//	consoleInput.value = currentValue + wordDifference;
	}

	function log(value) {
		var expression = value || consoleInput.value,
			error = false,
			entry;

		if (expression === '') return;

		//evaluate the statement
		try {
			value = window.eval(expression);
			entry = templates.log.cloneNode();
		} catch (error) {
			entry = templates.error.cloneNode();
			error = true;
		}

		//build the log entry
		entry.title = expression;
		if (!error) {
			switch (typeof value) {
				case "object":
					entry.innerHTML = JSON.stringify(value);
					break;
				default:
					entry.innerHTML = value;
					break;
			}
		} else {
			entry.innerHTML = error.message;
		}
		consoleLog.appendChild(entry);

		//do the dishes
		consoleLog.scrollTop = consoleLog.scrollHeight;
		consoleHistoryIndex = consoleLog.childElementCount;
		consoleInput.value = '';

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

	function clear() {
		consoleLog.innerHTML = '';
	}

	//process templates
	(function () {
		for (var template in templates) {
			var cloned = templates[template].cloneNode();
			cloned.id = '';
			templates[template].remove();
			templates[template] = cloned;
		}
	})();
})(jsenvy, document, window);