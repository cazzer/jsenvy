/**
 * Scope Creep
 * ===
 * A fun way to creep on people's scope. Lets you:
 * - Update a scope to see the scope difference
 * - View the current contents of the scope, in case you forgot what you're creeping on
 */
var ScopeCreep = function(victim) {
	var properties = [],
		methods = [];

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

		var propertyDiff = arrayDiff(properties, newScope.properties),
			methodDiff = arrayDiff(methods, newScope.methods);

		return {
			properties: propertyDiff,
			methods: methodDiff,
			scope: newScope
		};
	}

	function arrayDiff(a1, a2)
	{
		var a=[], diff=[];
		for(var i=0;i<a1.length;i++)
			a[a1[i]]=true;
		for(var i=0;i<a2.length;i++)
			if(a[a2[i]]) delete a[a2[i]];
			else a[a2[i]]=true;
		for(var k in a)
			diff.push(k);
		return diff;
	}

	setScope();
	return {
		update: update,
		peek: getScopeDiff,
		get: enumerateScope
	}
};