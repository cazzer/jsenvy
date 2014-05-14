!function () {
	function e(e, t) {
		function n() {
			i.readyState < 4 || 200 === i.status && 4 === i.readyState && t(i)
		}

		var i;
		if ("undefined" != typeof XMLHttpRequest)i = new XMLHttpRequest; else for (var r = ["MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"], a = 0, l = r.length; l > a; a++)try {
			i = new ActiveXObject(r[a]);
			break
		} catch (o) {
		}
		return i.onreadystatechange = n, i.open("GET", e, !0), i.send(""), i
	}

	function t(e) {
		function t(t, n) {
			if (t) {
				document.getElementById("libraryName").value = "", document.getElementById("librarySuggestions").innerHTML = "";
				var i = document.createElement("li");
				i.innerHTML = e, document.getElementById("loadedLibraries").appendChild(i)
			} else alert(n)
		}

		if (e) {
			if (a.indexOf(e) >= 0)return t(!1, "We already got this for you.");
			var n = document.createElement("script"), i = setTimeout(function () {
				t.done || n.remove(), t(!1, "This little guy didn't make it on time: " + e)
			}, 2e3);
			document.body.appendChild(n), n.src = e, n.asynch = !0, n.onreadystatechange = n.onload = function () {
				var r = n.readyState;
				t.done || r && !/loaded|complete/.test(r) || (a.push(e), t.done = !0, clearTimeout(i), t(!0))
			}
		}
	}

	function n(e) {
		for (var t = [], n = 0; n < r.length; n++)r[n].name.indexOf(e) > -1 && t.push(r[n]);
		return t
	}

	function i(e) {
		"true" != e.nextElementSibling.getAttribute("data-hidden") ? (e.nextElementSibling.classList.add("hidden"), e.nextElementSibling.setAttribute("data-hidden", "true")) : (e.nextElementSibling.classList.remove("hidden"), e.nextElementSibling.setAttribute("data-hidden", "false"))
	}

	var r, a = [], l = document.getElementById("libraryName");
	e("http://api.cdnjs.com/libraries", function (e) {
		var t = JSON.parse(e.response).results;
		t.sort(function (e, t) {
			return e.name.length - t.name.length
		}), r = t
	});
	for (var o = document.getElementsByClassName("hideable"), d = 0; d < o.length; d++)o[d].onclick = function () {
		i(this)
	};
	document.getElementById("libraryName").onkeyup = function () {
		if (document.getElementById("librarySuggestions").innerHTML = "", !(this.value.length < 1)) {
			var e = n(this.value);
			if (!e.length)return void(document.getElementById("suggestions-help").innerHTML = "No results, try using the full path option.");
			document.getElementById("suggestions-help").innerHTML = "To load a cdnjs library, select it from the list.";
			for (var i = 0; i < e.length; i++) {
				var r = document.createElement("li");
				r.onclick = function () {
					t(this.getAttribute("data-src"))
				}, r.innerHTML = e[i].name, r.setAttribute("data-src", e[i].latest), document.getElementById("librarySuggestions").appendChild(r)
			}
		}
	}, document.getElementById("loadFromUrl").onclick = function () {
		t(l.value)
	}
}();