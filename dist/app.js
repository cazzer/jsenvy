!function (document, window) {
	function callback(o) {
		callbacks.push(o)
	}

	function runCallbacks() {
		callbacks.forEach(function (o) {
			o()
		})
	}

	function log(value) {
		var expression = value || consoleInput.value;
		if ("" !== expression) {
			consoleInput.value = "";
			try {
				var value = eval(expression), entry = templates.log.cloneNode();
				entry.title = expression, entry.innerHTML = value, consoleLog.appendChild(entry)
			} catch (error) {
				var entry = templates.error.cloneNode();
				entry.title = expression, entry.innerHTML = error.message, consoleLog.appendChild(entry)
			}
			consoleLog.scrollTop = consoleLog.scrollHeight, consoleHistoryIndex = consoleLog.childElementCount, runCallbacks()
		}
	}

	function consoleHistory(o) {
		consoleHistoryIndex + o > -1 && consoleHistoryIndex + o <= consoleLog.childElementCount && (consoleHistoryIndex += o), consoleHistoryIndex === consoleLog.childElementCount ? consoleInput.value = "" : consoleLog.childElementCount && (consoleInput.value = consoleLog.children[consoleHistoryIndex].title)
	}

	function history() {
		for (var o = consoleLog.children, e = [], n = 0, l = o.length; l > n; n++)e.push(o[n].title);
		return e
	}

	var _console = window.console, consoleLog = document.getElementById("console-log"), consoleForm = document.getElementById("console-form"), consoleInput = document.getElementById("console-input");
	window.jsConsole = {log: log, history: history, callback: callback};
	var templates = {log: document.getElementById("log-template"), error: document.getElementById("error-template")}, consoleHistoryIndex = 0, callbacks = [];
	consoleForm.onsubmit = function (o) {
		o.preventDefault(), log()
	}, consoleInput.onkeyup = function (o) {
		switch (o.keyCode) {
			case 38:
				consoleHistory(-1);
				break;
			case 40:
				consoleHistory(1)
		}
	}, function () {
		for (var o in templates) {
			var e = templates[o].cloneNode();
			e.id = "", templates[o].remove(), templates[o] = e
		}
	}()
}(document, window);
var ScopeCreep = function (e, t) {
	function r(e) {
		"object" != typeof e && (e = n()), s = e.properties, u = e.methods
	}

	function o() {
		var e = p();
		return r(e.scope), e
	}

	function n() {
		for (var t = [], r = [], o = ["length", "__CommandLineAPI"], n = Object.getOwnPropertyNames(e), p = 0; p < n.length; p++) {
			var i = n[p];
			o.indexOf(i) >= 0 || ("function" == typeof window[i] ? r.push(i) : t.push(i))
		}
		return{properties: t, methods: r}
	}

	function p() {
		var e = n(), r = i(t.properties, i(s, e.properties)), o = i(t.methods, i(u, e.methods));
		return{properties: r, methods: o, scope: e}
	}

	function i(e, t) {
		var r = [];
		return t.forEach(function (t) {
			-1 === e.indexOf(t) && r.push(t)
		}), r
	}

	var s = [], u = [];
	return t = t || {properties: [], methods: []}, r(), {update: o, peek: p, get: n}
};
!function () {
	function e() {
		for (var e = S.update(), t = !1, n = 0; n < e.properties.length; n++) {
			t = !0;
			var o = document.createElement("li");
			o.innerHTML = e.properties[n], b.appendChild(o)
		}
		for (var n = 0; n < e.methods.length; n++) {
			t = !0;
			var o = document.createElement("li");
			o.innerHTML = e.methods[n], E.appendChild(o)
		}
		t && (w.style.display = "block")
	}

	function t(e, t) {
		function n() {
			o.readyState < 4 || 200 === o.status && 4 === o.readyState && t(o)
		}

		var o;
		if ("undefined" != typeof XMLHttpRequest)o = new XMLHttpRequest; else for (var i = ["MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"], l = 0, a = i.length; a > l; l++)try {
			o = new ActiveXObject(i[l]);
			break
		} catch (r) {
		}
		return o.onreadystatechange = n, o.open("GET", e, !0), o.send(""), o
	}

	function n(e, t, n) {
		function o(n, o) {
			if (n) {
				document.getElementById("libraryName").value = "", document.getElementById("librarySuggestions").innerHTML = "", l(v), l(y);
				var i = document.createElement("li");
				i.innerHTML = e, document.getElementById("loadedLibraries").appendChild(i), "function" == typeof t && t()
			} else alert(o)
		}

		if (e) {
			if (p.indexOf(e) >= 0)return o(!1, "We already got this for you.");
			var i = document.createElement("script");
			i.src = e, i.asynch = !0, i.onreadystatechange = i.onload = function () {
				var t = i.readyState;
				o.done || t && !/loaded|complete/.test(t) || (p.push(e), n || r(), o.done = !0, clearTimeout(a), o(!0))
			}, document.body.appendChild(i);
			var a = setTimeout(function () {
				o.done || i.remove(), o(!1, "This little guy didn't make it on time: " + e)
			}, 2e3);
			void 0 !== window.ga && window.ga("send", "event", "load", e)
		}
	}

	function o(e) {
		for (var t = [], n = 0; n < m.length; n++)m[n].name.indexOf(e) > -1 && t.push(m[n]);
		return t
	}

	function i(e) {
		e.nextElementSibling.classList.contains("hidden") ? a(e.nextElementSibling) : l(e.nextElementSibling)
	}

	function l(e) {
		e.classList.contains("hidden") || e.classList.add("hidden")
	}

	function a(e) {
		e.classList.remove("hidden")
	}

	function r() {
		for (var e, t = [], n = 0; n < p.length; n++) {
			var o = p[n].replace(g, "!");
			t.push(encodeURIComponent(o))
		}
		t = t.join(","), e = u("libs", t), window.history.replaceState ? window.history.replaceState(null, null, e) : window.location.search = e
	}

	function c(t) {
		function o(t, i) {
			if ("object" == typeof t && t.length) {
				var l = t.shift().replace("!", g);
				n(decodeURIComponent(l), function () {
					o(t, i)
				}, !0)
			} else e(), i()
		}

		var i = s("libs").split(",");
		return i && i.length ? void o(i, t) : void t()
	}

	function d(e) {
		function t(e, n) {
			"object" == typeof e && e.length ? (jsConsole.log(decodeURIComponent(e.shift())), window.setTimeout(function () {
				t(e, n)
			}, 500)) : n()
		}

		var n = s("logs").split(",,");
		return n && n.length ? void t(n, e) : void e()
	}

	function s(e) {
		e = e.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var t = new RegExp("[\\?&]" + e + "=([^&#]*)"), n = t.exec(location.search);
		return null === n ? "" : decodeURIComponent(n[1].replace(/\+/g, " "))
	}

	function u(e, t) {
		var n = location.search, o = new RegExp("([?&])" + e + "=.*?(&|$)", "i"), i = -1 !== n.indexOf("?") ? "&" : "?";
		return n.match(o) ? n.replace(o, "$1" + e + "=" + t + "$2") : n + i + e + "=" + t
	}

	var m, p = [], g = "http://cdnjs.cloudflare.com/ajax/libs", f = document.getElementById("libraryName"), h = document.getElementById("librarySuggestions"), y = document.getElementById("suggestions-error"), v = document.getElementById("suggestions-help"), w = document.getElementById("windowChanges"), b = document.getElementById("newProperties"), E = document.getElementById("newMethods"), S = ScopeCreep(window, {properties: ["gaplugins", "GoogleAnalyticsObject", "gaGlobal"], methods: ["ga"]});
	t("http://api.cdnjs.com/libraries", function (e) {
		var t = JSON.parse(e.response).results;
		t.sort(function (e, t) {
			return e.name.length - t.name.length
		}), m = t, window.location.search && (s("libs") ? c(function () {
			s("logs") && d()
		}) : s("logs") && d())
	});
	for (var I = document.getElementsByClassName("hideable"), M = 0; M < I.length; M++)I[M].onclick = function () {
		i(this)
	};
	document.getElementById("libraryForm").onsubmit = function (e) {
		e.preventDefault(), h.firstChild.click()
	}, f.onkeyup = function () {
		if (h.innerHTML = "", !(this.value.length < 1)) {
			var t = o(this.value);
			if (!t.length)return a(y), void l(v);
			a(v), l(y);
			for (var i = 0; i < t.length; i++) {
				var r = document.createElement("li");
				r.onclick = function () {
					S.update(), n(this.getAttribute("data-src"), e)
				}, r.innerHTML = t[i].name, r.setAttribute("data-src", t[i].latest), document.getElementById("librarySuggestions").appendChild(r)
			}
		}
	}, document.getElementById("loadFromUrl").onclick = function () {
		S.update(), n(f.value, e)
	}, jsConsole.callback(function () {
		var e, t = jsConsole.history().join(",,");
		e = u("logs", encodeURIComponent(t)), window.history.replaceState ? window.history.replaceState(null, null, e) : window.location.search = e
	})
}();
!function (e, n, a, t, c, s, o) {
	e.GoogleAnalyticsObject = c, e[c] = e[c] || function () {
		(e[c].q = e[c].q || []).push(arguments)
	}, e[c].l = 1 * new Date, s = n.createElement(a), o = n.getElementsByTagName(a)[0], s.async = 1, s.src = t, o.parentNode.insertBefore(s, o)
}(window, document, "script", "//www.google-analytics.com/analytics.js", "ga"), ga("create", "UA-50959303-1", "jsenvy.com"), ga("send", "pageview");