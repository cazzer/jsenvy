!function () {
	function e() {
		var e = h.update(), t = !1;
		g.style.display = "none", p.innerHTML = "", f.innerHTML = "";
		for (var n = 0; n < e.properties.length; n++) {
			t = !0;
			var i = document.createElement("li");
			i.innerHTML = e.properties[n], p.appendChild(i)
		}
		for (var n = 0; n < e.methods.length; n++) {
			t = !0;
			var i = document.createElement("li");
			i.innerHTML = e.methods[n], f.appendChild(i)
		}
		t && (g.style.display = "block")
	}

	function t(e, t) {
		function n() {
			i.readyState < 4 || 200 === i.status && 4 === i.readyState && t(i)
		}

		var i;
		if ("undefined" != typeof XMLHttpRequest)i = new XMLHttpRequest; else for (var o = ["MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"], r = 0, a = o.length; a > r; r++)try {
			i = new ActiveXObject(o[r]);
			break
		} catch (d) {
		}
		return i.onreadystatechange = n, i.open("GET", e, !0), i.send(""), i
	}

	function n(e, t) {
		function n(n, i) {
			if (n) {
				document.getElementById("libraryName").value = "", document.getElementById("librarySuggestions").innerHTML = "", r(m), r(u);
				var o = document.createElement("li");
				o.innerHTML = e, document.getElementById("loadedLibraries").appendChild(o), "function" == typeof t && t()
			} else alert(i)
		}

		if (e) {
			if (void 0 !== ga && ga("send", "event", "load", e), l.indexOf(e) >= 0)return n(!1, "We already got this for you.");
			var i = document.createElement("script"), o = setTimeout(function () {
				n.done || i.remove(), n(!1, "This little guy didn't make it on time: " + e)
			}, 2e3);
			document.body.appendChild(i), i.src = e, i.asynch = !0, i.onreadystatechange = i.onload = function () {
				var t = i.readyState;
				n.done || t && !/loaded|complete/.test(t) || (l.push(e), n.done = !0, clearTimeout(o), n(!0))
			}
		}
	}

	function i(e) {
		for (var t = [], n = 0; n < d.length; n++)d[n].name.indexOf(e) > -1 && t.push(d[n]);
		return t
	}

	function o(e) {
		e.nextElementSibling.classList.contains("hidden") ? a(e) : r(e)
	}

	function r(e) {
		e.classList.contains("hidden") || e.classList.add("hidden")
	}

	function a(e) {
		e.classList.remove("hidden")
	}

	var d, l = [], s = document.getElementById("libraryName"), c = document.getElementById("librarySuggestions"), u = document.getElementById("suggestions-error"), m = document.getElementById("suggestions-help"), g = document.getElementById("windowChanges"), p = document.getElementById("newProperties"), f = document.getElementById("newMethods"), h = ScopeCreep(window);
	t("http://api.cdnjs.com/libraries", function (e) {
		var t = JSON.parse(e.response).results;
		t.sort(function (e, t) {
			return e.name.length - t.name.length
		}), d = t
	});
	for (var y = document.getElementsByClassName("hideable"), v = 0; v < y.length; v++)y[v].onclick = function () {
		o(this)
	};
	document.getElementById("libraryForm").onsubmit = function (e) {
		e.preventDefault(), c.firstChild.click()
	}, s.onkeyup = function () {
		if (c.innerHTML = "", !(this.value.length < 1)) {
			var t = i(this.value);
			if (!t.length)return a(u), void r(m);
			a(m), r(u);
			for (var o = 0; o < t.length; o++) {
				var d = document.createElement("li");
				d.onclick = function () {
					h.update(), n(this.getAttribute("data-src"), e)
				}, d.innerHTML = t[o].name, d.setAttribute("data-src", t[o].latest), document.getElementById("librarySuggestions").appendChild(d)
			}
		}
	}, document.getElementById("loadFromUrl").onclick = function () {
		h.update(), n(s.value, e)
	}
}();