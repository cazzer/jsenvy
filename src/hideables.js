(function(jsenvy, document) {
	jsenvy.hideables = {
		hide: hide,
		show: show
	};

	//enable hideables
	var hideables = document.getElementsByClassName("hideable");
	for (var i = 0; i < hideables.length; i++) {
		hideables[i].onclick = function () {
			toggleHideable(this);
		}
	}

	//open or close a hideable element
	function toggleHideable(element) {
		if (element.nextElementSibling.classList.contains("hidden")) {
			show(element.nextElementSibling);
		} else {
			hide(element.nextElementSibling);
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
})(jsenvy, document);