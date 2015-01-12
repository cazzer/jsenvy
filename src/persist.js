(function(jsenvy) {
	jsenvy.persist = {
		get: getFromHash,
		put: putInHash,
		post: postInHash,
		remove: removeFromHash,
		if: ifHash
	};

	function getFromHash(where) {
		var regex = new RegExp('[\\#]' + where + '=([^#]*)'),
			results = regex.exec(location.hash);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	function putInHash(what, where) {
		var regex = new RegExp(where + '=([^#]*)');
		if (!regex.exec(location.hash)) return postInHash(what, where);
		location.hash = location.hash.replace(regex, where + '=' + encodeURIComponent(what));
	}

	function postInHash(what, where) {
		removeFromHash(where);
		location.hash = ifHash(what, where);
	}

	function removeFromHash(where) {
		var regex = new RegExp('[#]' + where + '=([^#]*)');
		location.hash = location.hash.replace(regex, '');
	}

	function ifHash(what, where) {
		return location.hash + '#' + where + '=' + encodeURIComponent(what);
	}
})(jsenvy);