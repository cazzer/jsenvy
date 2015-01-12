!function (n) {
	n.jsenvy = {}
}(window);
!function (e) {
	e.ScopeCreep = function (e, t) {
		function r(e) {
			"object" != typeof e && (e = o()), s = e.properties, u = e.methods
		}

		function n() {
			var e = p();
			return r(e.scope), e
		}

		function o() {
			for (var t = [], r = [], n = ["length", "__CommandLineAPI"], o = Object.getOwnPropertyNames(e), p = 0; p < o.length; p++) {
				var i = o[p];
				n.indexOf(i) >= 0 || ("function" == typeof window[i] ? r.push(i) : t.push(i))
			}
			return{properties: t, methods: r}
		}

		function p() {
			var e = o(), r = i(t.properties, i(s, e.properties)), n = i(t.methods, i(u, e.methods));
			return{properties: r, methods: n, scope: e}
		}

		function i(e, t) {
			var r = [];
			return t.forEach(function (t) {
				-1 === e.indexOf(t) && r.push(t)
			}), r
		}

		var s = [], u = [];
		return t = t || {properties: [], methods: []}, r(), {update: n, peek: p, get: o}
	}
}(jsenvy);
!function (e, t) {
	function n() {
		c("http://api.cdnjs.com/libraries", function (e) {
			var t = JSON.parse(e.response).results;
			t.sort(function (e, t) {
				return e.name.length - t.name.length
			}), d = t
		})
	}

	function a(e) {
		for (var t = [], n = 0; n < d.length; n++)d[n].name.indexOf(e) > -1 && t.push(d[n]);
		return t
	}

	function o(e, n) {
		if (e) {
			if (s.indexOf(e) >= 0)return n(!1, "We already got this for you.");
			var a = t.createElement("script");
			a.src = e, a.asynch = !0, a.onreadystatechange = a.onload = function () {
				var t = a.readyState;
				n.done || t && !/loaded|complete/.test(t) || (s.push(e), n.done = !0, clearTimeout(o), u.forEach(function (t) {
					t(e)
				}), n(!0))
			}, t.body.appendChild(a);
			var o = setTimeout(function () {
				n.done || a.remove(), n(!1, "This little guy didn't make it on time: " + e)
			}, 2e3);
			void 0 !== window.ga && window.ga("send", "event", "load", e)
		}
	}

	function r() {
		return s
	}

	function i(e) {
		u.push(e)
	}

	function c(e, t) {
		function n() {
			a.readyState < 4 || 200 === a.status && 4 === a.readyState && t(a)
		}

		var a;
		if ("undefined" != typeof XMLHttpRequest)a = new XMLHttpRequest; else for (var o = ["MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"], r = 0, i = o.length; i > r; r++)try {
			a = new ActiveXObject(o[r]);
			break
		} catch (c) {
		}
		return a.onreadystatechange = n, a.open("GET", e, !0), a.send(""), a
	}

	e.libraries = {preload: n, search: a, load: o, loaded: r, callback: i};
	var d = [], s = [], u = []
}(jsenvy, document);
!function (n, e) {
	function i(n) {
		n.nextElementSibling.classList.contains("hidden") ? s(n.nextElementSibling) : t(n.nextElementSibling)
	}

	function t(n) {
		n.classList.contains("hidden") || n.classList.add("hidden")
	}

	function s(n) {
		n.classList.remove("hidden")
	}

	n.hideables = {hide: t, show: s};
	for (var l = e.getElementsByClassName("hideable"), c = 0; c < l.length; c++)l[c].onclick = function () {
		i(this)
	}
}(jsenvy, document);
!function (jsenvy, document, window) {
	function callback(e) {
		callbacks.push(e)
	}

	function runCallbacks() {
		callbacks.forEach(function (e) {
			e()
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

	function consoleHistory(e) {
		consoleHistoryIndex + e > -1 && consoleHistoryIndex + e <= consoleLog.childElementCount && (consoleHistoryIndex += e), consoleHistoryIndex === consoleLog.childElementCount ? consoleInput.value = "" : consoleLog.childElementCount && (consoleInput.value = consoleLog.children[consoleHistoryIndex].title)
	}

	function history() {
		for (var e = consoleLog.children, o = [], n = 0, l = e.length; l > n; n++)o.push(e[n].title);
		return o
	}

	jsenvy.console = {log: log, history: history, callback: callback};
	var _console = window.console, consoleLog = document.getElementById("console-log"), consoleForm = document.getElementById("console-form"), consoleInput = document.getElementById("console-input"), templates = {log: document.getElementById("log-template"), error: document.getElementById("error-template")}, consoleHistoryIndex = 0, callbacks = [];
	consoleForm.onsubmit = function (e) {
		e.preventDefault(), log()
	}, consoleInput.onkeyup = function (e) {
		switch (e.keyCode) {
			case 38:
				consoleHistory(-1);
				break;
			case 40:
				consoleHistory(1)
		}
	}, function () {
		for (var e in templates) {
			var o = templates[e].cloneNode();
			o.id = "", templates[e].remove(), templates[e] = o
		}
	}()
}(jsenvy, document, window);
!function (n) {
	function o(n) {
		var o = new RegExp("[\\#]" + n + "=([^#]*)"), e = o.exec(location.hash);
		return null === e ? "" : decodeURIComponent(e[1].replace(/\+/g, " "))
	}

	function e(n, o) {
		var e = new RegExp(o + "=([^#]*)");
		return e.exec(location.hash) ? void(location.hash = location.hash.replace(e, o + "=" + encodeURIComponent(n))) : t(n, o)
	}

	function t(n, o) {
		a(o), location.hash = c(n, o)
	}

	function a(n) {
		var o = new RegExp("[#]" + n + "=([^#]*)");
		location.hash = location.hash.replace(o, "")
	}

	function c(n, o) {
		return location.hash + "#" + o + "=" + encodeURIComponent(n)
	}

	n.persist = {get: o, put: e, post: t, remove: a, "if": c}
}(jsenvy);
!function (t) {
	function n(n) {
		function o(n, i) {
			"object" == typeof n && n.length ? t.libraries.load(n.shift(), function () {
				o(n, i)
			}, !0) : i()
		}

		var i = t.persist.get("libs").split(",");
		return i && i.length && i[0] ? void o(i, n) : void n()
	}

	function o(n) {
		function o(n, i) {
			"object" == typeof n && n.length ? (t.console.log(n.shift()), window.setTimeout(function () {
				o(n, i)
			}, 500)) : "function" == typeof i && i()
		}

		var i = t.persist.get("logs").split(",,");
		return i && i.length && i[0] ? void o(i, n) : void("function" == typeof n && n())
	}

	n(o)
}(jsenvy);
!function (e, i, t) {
	function l() {
		var i = e.libraries.loaded().join(",");
		w ? e.persist.put(i, "libs") : E.href = e.persist.if(i, "libs")
	}

	function n() {
		var i = e.console.history().join(",,");
		L ? e.persist.put(i, "logs") : E.href = e.persist.if(i, "logs")
	}

	function s(i) {
		I.update(), e.libraries.load(i, function (i, n) {
			i ? (t.getElementById("libraryName").value = "", t.getElementById("librarySuggestions").innerHTML = "", e.hideables.hide(h), e.hideables.hide(m), l(), o()) : alert(n)
		})
	}

	function r(e) {
		var i = t.createElement("li");
		i.innerHTML = e, b.appendChild(i)
	}

	function o() {
		for (var e = I.update(), i = !1, l = 0; l < e.properties.length; l++) {
			i = !0;
			var n = t.createElement("li");
			n.innerHTML = e.properties[l], u.appendChild(n)
		}
		for (var l = 0; l < e.methods.length; l++) {
			i = !0;
			var n = t.createElement("li");
			n.innerHTML = e.methods[l], y.appendChild(n)
		}
		i && (f.style.display = "block")
	}

	function a(e) {
		e.preventDefault(), e.stopPropagation(), B.innerHTML = '<iframe src="' + location.origin + "/console.html" + location.hash + '"></iframe>', k.style.display = "block"
	}

	function d() {
		k.style.display = "none"
	}

	var c = t.getElementById("libraryName"), g = t.getElementById("libraryForm"), p = t.getElementById("librarySuggestions"), m = t.getElementById("suggestions-error"), h = t.getElementById("suggestions-help"), b = t.getElementById("loadedLibraries"), f = t.getElementById("windowChanges"), u = t.getElementById("newProperties"), y = t.getElementById("newMethods"), v = t.getElementById("link-logs"), E = t.getElementById("link-libraries"), k = t.getElementById("embed-code-modal"), B = t.getElementById("embed-code"), I = e.ScopeCreep(i, {properties: ["gaplugins", "GoogleAnalyticsObject", "gaGlobal"], methods: ["ga"]}), L = !0, w = !0;
	e.libraries.preload(), e.libraries.callback(r), g.onsubmit = function (e) {
		e.preventDefault(), p.firstChild.click()
	}, c.onkeyup = function () {
		if (p.innerHTML = "", !(this.value.length < 1)) {
			var i = e.libraries.search(this.value);
			if (!i.length)return e.hideables.show(m), void e.hideables.hide(h);
			e.hideables.show(h), e.hideables.hide(m);
			for (var l = 0; l < i.length; l++) {
				var n = t.createElement("li");
				n.onclick = function () {
					s(this.getAttribute("data-src"))
				}, n.innerHTML = i[l].name, n.setAttribute("data-src", i[l].latest), p.appendChild(n)
			}
		}
	}, t.getElementById("loadFromUrl").onclick = function () {
		s(c.value)
	}, e.console.callback(n), E.onclick = function (i) {
		i.preventDefault(), i.stopPropagation(), w = !w;
		var t = e.libraries.loaded().join(",");
		w ? (E.href = e.persist.if("", "libs"), E.classList.remove("boring-link"), e.persist.post(t, "libs")) : (E.href = e.persist.if(t, "libs"), E.classList.add("boring-link"), e.persist.remove("libs"))
	}, v.onclick = function (i) {
		i.preventDefault(), i.stopPropagation(), L = !L;
		var t = e.console.history().join(",,");
		L ? (v.href = e.persist.if("", "logs"), v.classList.remove("boring-link"), e.persist.post(t, "logs")) : (v.href = e.persist.if(t, "logs"), v.classList.add("boring-link"), e.persist.remove("logs"))
	}, t.getElementById("close-modal").onclick = d, t.getElementById("embed-console").onclick = a
}(jsenvy, window, document);
!function (e, n, a, t, c, s, o) {
	e.GoogleAnalyticsObject = c, e[c] = e[c] || function () {
		(e[c].q = e[c].q || []).push(arguments)
	}, e[c].l = 1 * new Date, s = n.createElement(a), o = n.getElementsByTagName(a)[0], s.async = 1, s.src = t, o.parentNode.insertBefore(s, o)
}(window, document, "script", "//www.google-analytics.com/analytics.js", "ga"), ga("create", "UA-50959303-1", "jsenvy.com"), ga("send", "pageview");