/**
 * Scope Creep
 * ===
 * A fun way to creep on people's scope. Lets you:
 * - Update a scope to see the scope difference
 * - View the current contents of the scope, in case you forgot what you're creeping on
 */
var ScopeCreep = function(victim, ignores) {
	var properties = [],
		methods = [];

	ignores = ignores || {properties: [], methods: []};

	//a setter for the scope properties and methods
	function setScope(scope) {
		if (typeof scope !== "object") {
			scope = enumerateScope();
		}

		properties = scope.properties;
		methods = scope.methods;
	}

	//an updater for the scope that returns the difference
	function update() {
		var diff = getScopeDiff();
		setScope(diff.scope);
		return diff;
	}

	//the actually scope dissection
	function enumerateScope() {
		var properties = [],
			methods = [],
			thingsToIgnore = ["length", "__CommandLineAPI"];

		var scope = Object.getOwnPropertyNames(victim);
		for (var i = 0; i < scope.length; i++) {
			var prop = scope[i];
			if (thingsToIgnore.indexOf(prop) >= 0) continue;
			if (typeof window[prop] === "function") {
				methods.push(prop);
			} else {
				properties.push(prop);
			}
		}

		return {
			properties: properties,
			methods: methods
		};
	}

	//retrieve the scope diff without setting the scope
	function getScopeDiff() {
		var newScope = enumerateScope();

		var propertyDiff = arrayDiff(ignores.properties, arrayDiff(properties, newScope.properties)),
			methodDiff = arrayDiff(ignores.methods, arrayDiff(methods, newScope.methods));

		return {
			properties: propertyDiff,
			methods: methodDiff,
			scope: newScope
		};
	}

	function arrayDiff(array1, array2) {
		var difference = [];

		array2.forEach(function(item) {
			if (array1.indexOf(item) === -1) {
				difference.push(item);
			}
		});

		return difference;
	}

	setScope();
	return {
		update: update,
		peek: getScopeDiff,
		get: enumerateScope
	}
};