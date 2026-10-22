// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, g = h.trustedTypes, _ = g ? g.emptyScript : "", ee = h.reactiveElementPolyfillSupport, v = (e, t) => e, y = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? _ : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, te = (e, t) => !l(e, t), b = {
	attribute: !0,
	type: String,
	converter: y,
	reflect: !1,
	useDefault: !1,
	hasChanged: te
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var x = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = b) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? b;
	}
	static _$Ei() {
		if (this.hasOwnProperty(v("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(v("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(v("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? y : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? y : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? te)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
x.elementStyles = [], x.shadowRootOptions = { mode: "open" }, x[v("elementProperties")] = /* @__PURE__ */ new Map(), x[v("finalized")] = /* @__PURE__ */ new Map(), ee?.({ ReactiveElement: x }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ne = globalThis, S = (e) => e, C = ne.trustedTypes, w = C ? C.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, re = "$lit$", T = `lit$${Math.random().toFixed(9).slice(2)}$`, ie = "?" + T, ae = `<${ie}>`, E = document, D = () => E.createComment(""), O = (e) => e === null || typeof e != "object" && typeof e != "function", k = Array.isArray, oe = (e) => k(e) || typeof e?.[Symbol.iterator] == "function", se = "[ 	\n\f\r]", A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, j = /-->/g, ce = />/g, M = RegExp(`>|${se}(?:([^\\s"'>=/]+)(${se}*=${se}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), le = /'/g, ue = /"/g, de = /^(?:script|style|textarea|title)$/i, fe = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), N = fe(1), pe = fe(2), P = Symbol.for("lit-noChange"), F = Symbol.for("lit-nothing"), me = /* @__PURE__ */ new WeakMap(), I = E.createTreeWalker(E, 129);
function he(e, t) {
	if (!k(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return w === void 0 ? t : w.createHTML(t);
}
var ge = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = A;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === A ? c[1] === "!--" ? o = j : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = M) : (de.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = M) : o = ce : o === M ? c[0] === ">" ? (o = i ?? A, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? M : c[3] === "\"" ? ue : le) : o === ue || o === le ? o = M : o === j || o === ce ? o = A : (o = M, i = void 0);
		let d = o === M && e[t + 1].startsWith("/>") ? " " : "";
		a += o === A ? n + ae : l >= 0 ? (r.push(s), n.slice(0, l) + re + n.slice(l) + T + d) : n + T + (l === -2 ? t : d);
	}
	return [he(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, _e = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ge(t, n);
		if (this.el = e.createElement(l, r), I.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = I.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(re)) {
					let t = u[o++], n = i.getAttribute(e).split(T), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? xe : r[1] === "?" ? Se : r[1] === "@" ? Ce : be
					}), i.removeAttribute(e);
				} else e.startsWith(T) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (de.test(i.tagName)) {
					let e = i.textContent.split(T), t = e.length - 1;
					if (t > 0) {
						i.textContent = C ? C.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], D()), I.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], D());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ie) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(T, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += T.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = E.createElement("template");
		return n.innerHTML = e, n;
	}
};
function L(e, t, n = e, r) {
	if (t === P) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = O(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = L(e, i._$AS(e, t.values), i, r)), t;
}
var ve = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? E).importNode(t, !0);
		I.currentNode = r;
		let i = I.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new ye(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new we(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = I.nextNode(), a++);
		}
		return I.currentNode = E, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, ye = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = F, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = L(this, e, t), O(e) ? e === F || e == null || e === "" ? (this._$AH !== F && this._$AR(), this._$AH = F) : e !== this._$AH && e !== P && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? oe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== F && O(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = _e.createElement(he(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new ve(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = me.get(e.strings);
		return t === void 0 && me.set(e.strings, t = new _e(e)), t;
	}
	k(t) {
		k(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(D()), this.O(D()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = S(e).nextSibling;
			S(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, be = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = F, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = F;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = L(this, e, t, 0), a = !O(e) || e !== this._$AH && e !== P, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = L(this, r[n + o], t, o), s === P && (s = this._$AH[o]), a ||= !O(s) || s !== this._$AH[o], s === F ? e = F : e !== F && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === F ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, xe = class extends be {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === F ? void 0 : e;
	}
}, Se = class extends be {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== F);
	}
}, Ce = class extends be {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = L(this, e, t, 0) ?? F) === P) return;
		let n = this._$AH, r = e === F && n !== F || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== F && (n === F || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, we = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		L(this, e);
	}
}, Te = {
	M: re,
	P: T,
	A: ie,
	C: 1,
	L: ge,
	R: ve,
	D: oe,
	V: L,
	I: ye,
	H: be,
	N: Se,
	U: Ce,
	B: xe,
	F: we
}, Ee = ne.litHtmlPolyfillSupport;
Ee?.(_e, ye), (ne.litHtmlVersions ??= []).push("3.3.3");
var De = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new ye(t.insertBefore(D(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Oe = globalThis, R = class extends x {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = De(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return P;
	}
};
R._$litElement$ = !0, R.finalized = !0, Oe.litElementHydrateSupport?.({ LitElement: R });
var ke = Oe.litElementPolyfillSupport;
ke?.({ LitElement: R }), (Oe.litElementVersions ??= []).push("4.2.2");
// node_modules/lit-html/directive.js
var Ae = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, je = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Me = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, { I: Ne } = Te, Pe = (e) => e, Fe = () => document.createComment(""), Ie = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new Ne(r.insertBefore(Fe(), i), r.insertBefore(Fe(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Pe(e).nextSibling;
				Pe(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, z = (e, t, n = e) => (e._$AI(t, n), e), Le = {}, Re = (e, t = Le) => e._$AH = t, ze = (e) => e._$AH, Be = (e) => {
	e._$AR(), e._$AA.remove();
}, Ve = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, He = je(class extends Me {
	constructor(e) {
		if (super(e), e.type !== Ae.CHILD) throw Error("repeat() can only be used in text expressions");
	}
	dt(e, t, n) {
		let r;
		n === void 0 ? n = t : t !== void 0 && (r = t);
		let i = [], a = [], o = 0;
		for (let t of e) i[o] = r ? r(t, o) : o, a[o] = n(t, o), o++;
		return {
			values: a,
			keys: i
		};
	}
	render(e, t, n) {
		return this.dt(e, t, n).values;
	}
	update(e, [t, n, r]) {
		let i = ze(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = z(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = z(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = z(i[d], a[m]), Ie(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = z(i[f], a[p]), Ie(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = Ve(o, p, m), u = Ve(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = Ie(e, i[d]);
					z(t, a[p]), c[p] = t;
				} else c[p] = z(n, a[p]), Ie(e, i[d], n), i[t] = null;
				p++;
			} else Be(i[f]), f--;
		} else Be(i[d]), d++;
		for (; p <= m;) {
			let t = Ie(e, c[m + 1]);
			z(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && Be(e);
		}
		return this.ut = o, Re(e, c), P;
	}
}), Ue = class {
	constructor(e) {
		this.listeners = /* @__PURE__ */ new Set(), this.subscriptions = [], this.generation = 0, this.requestSequence = 0, this.state = { loading: !0 }, this.hass = e;
	}
	updateHass(e) {
		this.hass = e;
	}
	subscribe(e) {
		let t = this.listeners.size === 0;
		return this.listeners.add(e), e(this.state), t && this.start(), () => {
			this.listeners.delete(e), this.listeners.size === 0 && (this.generation++, this.subscriptions.forEach((e) => e()), this.subscriptions = []);
		};
	}
	emit(e) {
		this.state = e, this.listeners.forEach((t) => t(e));
	}
	async start() {
		let e = ++this.generation;
		try {
			for (let t of ["device_registry_updated", "entity_registry_updated"]) {
				let n = await this.hass.connection.subscribeEvents(() => void this.refresh(), t);
				if (e !== this.generation) {
					n();
					return;
				}
				this.subscriptions.push(n);
			}
			await this.refresh();
		} catch (t) {
			e === this.generation && this.emit({
				...this.state,
				loading: !1,
				error: B(t)
			});
		}
	}
	async refresh() {
		let e = this.generation, t = ++this.requestSequence;
		this.emit({
			...this.state,
			loading: !0,
			error: void 0
		});
		try {
			let [n, r] = await Promise.all([this.hass.callWS({ type: "config/device_registry/list" }), this.hass.callWS({ type: "config/entity_registry/list" })]);
			if (!Array.isArray(n) || !Array.isArray(r)) throw Error("Home Assistant returned an invalid device/entity registry.");
			e === this.generation && t === this.requestSequence && this.emit({
				snapshot: {
					devices: n,
					entities: r
				},
				loading: !1
			});
		} catch (n) {
			e === this.generation && t === this.requestSequence && this.emit({
				...this.state,
				loading: !1,
				error: B(n)
			});
		}
	}
}, We = /* @__PURE__ */ new WeakMap();
function Ge(e) {
	let t = We.get(e.connection);
	return t || (t = new Ue(e), We.set(e.connection, t)), t.updateHass(e), t;
}
function B(e) {
	return e instanceof Error ? e : typeof e == "object" && e && "message" in e ? Error(String(e.message)) : Error(String(e));
}
// src/domain/printers.ts
function Ke(e) {
	return e.split(".")[0];
}
function qe(e, t) {
	if (e.translation_key === t) return !0;
	let n = e.unique_id?.toLowerCase();
	return t === "printing_speed" ? n?.endsWith("_speed") === !0 : n?.endsWith(`_${t.toLowerCase()}`) === !0;
}
function V(e, t, n = "sensor") {
	return e.find(({ entry: e }) => !e.disabled_by && Ke(e.entity_id) === n && qe(e, t));
}
function H(e) {
	return !(!e?.state || e.entry.disabled_by || e.state.state === "unavailable");
}
function U(e) {
	let t = e?.state?.state;
	return t === void 0 || t === "unknown" || t === "unavailable" ? null : t;
}
function Je(e) {
	let t = U(e);
	if (t === null || t.trim() === "") return null;
	let n = Number(t);
	return Number.isFinite(n) ? n : null;
}
function Ye(e) {
	return e.entry.name || e.entry.original_name || String(e.state?.attributes.friendly_name || e.entry.translation_key || e.entry.entity_id);
}
function Xe(e) {
	let t = e.entry.unique_id?.match(/_tray_(\d+)$/i);
	if (t) return Number(t[1]);
	let n = e.state?.attributes.slot;
	return typeof n == "number" && Number.isInteger(n) ? n + 1 : void 0;
}
function Ze(e, t) {
	let n = [e], r = /* @__PURE__ */ new Set([e]), i = [];
	for (; n.length;) {
		let e = n.shift();
		for (let a of t) a.via_device_id !== e || r.has(a.id) || (r.add(a.id), n.push(a.id), i.push(a));
	}
	return i;
}
function Qe(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let n of e.entities) {
		if (n.platform !== "bambu_lab" || !n.device_id) continue;
		let e = r.get(n.device_id) || [];
		e.push({
			entry: n,
			state: t.states[n.entity_id]
		}), r.set(n.device_id, e);
	}
	let i = n.devices || [];
	return e.devices.filter((e) => !e.disabled_by && V(r.get(e.id) || [], "print_status")).filter((e) => n.discovery !== "selected" || i.includes(e.id)).map((t) => {
		let n = r.get(t.id) || [], i = Ze(t.id, e.devices), a = i.filter((e) => /ams|external spool/i.test(e.model || "")).map((e) => {
			let t = r.get(e.id) || [], n = /external spool/i.test(e.model || ""), i = t.filter(({ entry: e }) => Ke(e.entity_id) === "sensor").map((e) => ({
				entity: e,
				index: Xe(e)
			})).filter((e) => e.index !== void 0).sort((e, t) => e.index - t.index);
			if (n) {
				let e = t.find(({ entry: e }) => Ke(e.entity_id) === "sensor");
				e && i.push({
					index: 1,
					entity: e
				});
			}
			return {
				device: e,
				entities: t,
				slots: i,
				external: n
			};
		}), o = U(V(n, "print_status"))?.toLowerCase() || V(n, "print_status")?.state?.state || "unknown";
		return {
			id: t.id,
			device: t,
			name: t.name_by_user || t.name || t.model || "Bambu Lab",
			model: t.model || "Unknown",
			serial: t.identifiers?.find(([e]) => e === "bambu_lab")?.[1] || t.serial_number || void 0,
			entities: n,
			allEntities: [...n, ...i.flatMap((e) => r.get(e.id) || [])],
			ams: a,
			status: o,
			stage: V(n, "stage"),
			progress: Je(V(n, "print_progress")),
			camera: V(n, "camera", "camera"),
			light: V(n, "chamber_light", "light") || V(n, "camera_light", "light"),
			speed: V(n, "printing_speed", "select"),
			cover: V(n, "cover_image", "image"),
			pause: V(n, "pause", "button"),
			resume: V(n, "resume", "button"),
			stop: V(n, "stop", "button")
		};
	}).sort((e, t) => {
		if (i.length) {
			let n = i.indexOf(e.id), r = i.indexOf(t.id);
			if (n !== r) return (n < 0 ? Infinity : n) - (r < 0 ? Infinity : r);
		}
		return e.name.localeCompare(t.name);
	});
}
function W(e) {
	return [
		"idle",
		"finish",
		"finished",
		"failed"
	].includes(e.status);
}
function $e(e) {
	return Object.fromEntries(Object.entries(e.state?.attributes || {}).filter(([e]) => !et(e)).map(([e, t]) => [e, tt(t)]));
}
function et(e) {
	return /token|password|secret|credential|authorization|api_key/i.test(e);
}
function tt(e) {
	return Array.isArray(e) ? e.map(tt) : typeof e == "object" && e ? Object.fromEntries(Object.entries(e).filter(([e]) => !et(e)).map(([e, t]) => [e, tt(t)])) : typeof e == "string" && /^(https?:\/\/|\/)/i.test(e) ? e.replace(/([?&](?:[^=&]*(?:token|password|secret|credential|authorization|api_key)[^=&]*)=)[^&#]*/gi, "$1[redacted]") : e;
}
function nt(e) {
	return typeof e == "string" && /^#[\da-f]{6}([\da-f]{2})?$/i.test(e) ? e : void 0;
}
function rt(e) {
	let t = e.state?.attributes;
	return !t?.remain_enabled || typeof t.remain != "number" ? null : t.remain >= 0 && t.remain <= 100 ? t.remain : null;
}
// node_modules/fflate/esm/browser.js
var G = Uint8Array, K = Uint16Array, it = Int32Array, at = new G([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	0,
	0,
	0,
	0
]), ot = new G([
	0,
	0,
	0,
	0,
	1,
	1,
	2,
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	7,
	7,
	8,
	8,
	9,
	9,
	10,
	10,
	11,
	11,
	12,
	12,
	13,
	13,
	0,
	0
]), st = new G([
	16,
	17,
	18,
	0,
	8,
	7,
	9,
	6,
	10,
	5,
	11,
	4,
	12,
	3,
	13,
	2,
	14,
	1,
	15
]), ct = function(e, t) {
	for (var n = new K(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new it(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, lt = ct(at, 2), ut = lt.b, dt = lt.r;
ut[28] = 258, dt[258] = 28;
var ft = ct(ot, 0), pt = ft.b;
ft.r;
for (var mt = new K(32768), q = 0; q < 32768; ++q) {
	var J = (q & 43690) >> 1 | (q & 21845) << 1;
	J = (J & 52428) >> 2 | (J & 13107) << 2, J = (J & 61680) >> 4 | (J & 3855) << 4, mt[q] = ((J & 65280) >> 8 | (J & 255) << 8) >> 1;
}
for (var ht = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new K(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new K(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new K(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[mt[d] >> c] = l;
	} else for (s = new K(r), i = 0; i < r; ++i) e[i] && (s[i] = mt[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), gt = new G(288), q = 0; q < 144; ++q) gt[q] = 8;
for (var q = 144; q < 256; ++q) gt[q] = 9;
for (var q = 256; q < 280; ++q) gt[q] = 7;
for (var q = 280; q < 288; ++q) gt[q] = 8;
for (var _t = new G(32), q = 0; q < 32; ++q) _t[q] = 5;
var vt = /*#__PURE__*/ ht(gt, 9, 1), yt = /*#__PURE__*/ ht(_t, 5, 1), bt = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, Y = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, xt = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, St = function(e) {
	return (e + 7) / 8 | 0;
}, Ct = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new G(e.subarray(t, n));
}, wt = [
	"unexpected EOF",
	"invalid block type",
	"invalid length/literal",
	"invalid distance",
	"stream finished",
	"no stream handler",
	,
	"no callback",
	"invalid UTF-8 data",
	"extra field too long",
	"date not in range 1980-2099",
	"filename too long",
	"stream finishing",
	"invalid zip data"
], X = function(e, t, n) {
	var r = Error(t || wt[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, X), !n) throw r;
	return r;
}, Tt = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new G(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new G(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new G(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = Y(e, d, 1);
			var ee = Y(e, d + 1, 3);
			if (d += 3, !ee) {
				var v = St(d) + 4, y = e[v - 4] | e[v - 3] << 8, te = v + y;
				if (te > i) {
					c && X(0);
					break;
				}
				s && l(f + y), n.set(e.subarray(v, te), f), t.b = f += y, t.p = d = te * 8, t.f = u;
				continue;
			}
			if (ee == 1) p = vt, m = yt, h = 9, g = 5;
			else if (ee == 2) {
				var b = Y(e, d, 31) + 257, x = Y(e, d + 10, 15) + 4, ne = b + Y(e, d + 5, 31) + 1;
				d += 14;
				for (var S = new G(ne), C = new G(19), w = 0; w < x; ++w) C[st[w]] = Y(e, d + w * 3, 7);
				d += x * 3;
				for (var re = bt(C), T = (1 << re) - 1, ie = ht(C, re, 1), w = 0; w < ne;) {
					var ae = ie[Y(e, d, T)];
					d += ae & 15;
					var v = ae >> 4;
					if (v < 16) S[w++] = v;
					else {
						var E = 0, D = 0;
						for (v == 16 ? (D = 3 + Y(e, d, 3), d += 2, E = S[w - 1]) : v == 17 ? (D = 3 + Y(e, d, 7), d += 3) : v == 18 && (D = 11 + Y(e, d, 127), d += 7); D--;) S[w++] = E;
					}
				}
				var O = S.subarray(0, b), k = S.subarray(b);
				h = bt(O), g = bt(k), p = ht(O, h, 1), m = ht(k, g, 1);
			} else X(1);
			if (d > _) {
				c && X(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var oe = (1 << h) - 1, se = (1 << g) - 1, A = d;; A = d) {
			var E = p[xt(e, d) & oe], j = E >> 4;
			if (d += E & 15, d > _) {
				c && X(0);
				break;
			}
			if (E || X(2), j < 256) n[f++] = j;
			else if (j == 256) {
				A = d, p = null;
				break;
			} else {
				var ce = j - 254;
				if (j > 264) {
					var w = j - 257, M = at[w];
					ce = Y(e, d, (1 << M) - 1) + ut[w], d += M;
				}
				var le = m[xt(e, d) & se], ue = le >> 4;
				le || X(3), d += le & 15;
				var k = pt[ue];
				if (ue > 3) {
					var M = ot[ue];
					k += xt(e, d) & (1 << M) - 1, d += M;
				}
				if (d > _) {
					c && X(0);
					break;
				}
				s && l(f + 131072);
				var de = f + ce;
				if (f < k) {
					var fe = a - k, N = Math.min(k, de);
					for (fe + f < 0 && X(3); f < N; ++f) n[f] = r[fe + f];
				}
				for (; f < de; ++f) n[f] = n[f - k];
			}
		}
		t.l = p, t.p = A, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? Ct(n, 0, f) : n.subarray(0, f);
}, Et = /*#__PURE__*/ new G(0), Z = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, Q = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, Dt = function(e, t) {
	return Q(e, t) + Q(e, t + 4) * 4294967296;
};
function Ot(e, t) {
	return Tt(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var kt = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	kt.decode(Et, { stream: !0 });
} catch {}
var At = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: Ct(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function jt(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	}
	if (kt) return kt.decode(e);
	var i = At(e), a = i.s, n = i.r;
	return n.length && X(8), a;
}
var Mt = function(e, t) {
	return t + 30 + Z(e, t + 26) + Z(e, t + 28);
}, Nt = function(e, t, n) {
	var r = Z(e, t + 28), i = Z(e, t + 30), a = jt(e.subarray(t + 46, t + 46 + r), !(Z(e, t + 8) & 2048)), o = t + 46 + r, s = Pt(e, o, i, n, Q(e, t + 20), Q(e, t + 24), Q(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		Z(e, t + 10),
		c,
		l,
		a,
		o + i + Z(e, t + 32),
		u
	];
}, Pt = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + Z(e, t + 2)) if (Z(e, t) == 1) return [
			s ? Dt(e, t + 4 + 8 * c) : i,
			c ? Dt(e, t + 4) : a,
			l ? Dt(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && X(13);
	}
	return [
		i,
		a,
		o,
		0
	];
};
function Ft(e, t) {
	for (var n = {}, r = e.length - 22; Q(e, r) != 101010256; --r) (!r || e.length - r > 65558) && X(13);
	var i = Z(e, r + 8);
	if (!i) return {};
	var a = Q(e, r + 16), o = Q(e, r - 20) == 117853008;
	if (o) {
		var s = Q(e, r - 12);
		o = Q(e, s) == 101075792, o && (i = Q(e, s + 32), a = Q(e, s + 48));
	}
	for (var c = t && t.filter, l = 0; l < i; ++l) {
		var u = Nt(e, a, o), d = u[0], f = u[1], p = u[2], m = u[3], h = u[4], g = u[5], _ = Mt(e, g);
		a = h, (!c || c({
			name: m,
			size: f,
			originalSize: p,
			compression: d
		})) && (d ? d == 8 ? n[m] = Ot(e.subarray(_, _ + f), { out: new G(p) }) : X(14, "unknown compression type " + d) : n[m] = Ct(e, _, _ + f));
	}
	return n;
}
// src/domain/projects.ts
function It(e) {
	let t = e.split("/");
	if (t.length < 3 || t[1] !== "prints" || t.some((e) => !e || e === "." || e === ".." || /[\\\0]/.test(e))) throw Error("Invalid cached project path.");
	return {
		serial: t[0],
		relative: t.slice(1).join("/"),
		remote: t.slice(2).join("/")
	};
}
function Lt(e) {
	let t = e.split("/");
	if (t.length < 2 || t.some((e) => !e || e === "." || e === ".." || /[\\\0]/.test(e))) throw Error("Invalid cached file path.");
	return `/api/bambu_lab/file_cache/${t.map(encodeURIComponent).join("/")}`;
}
function Rt(e) {
	if (typeof e != "object" || !e || !("files" in e) || !Array.isArray(e.files)) throw Error("The cached-project API returned an invalid response.");
	return e.files.map((e) => {
		if (typeof e != "object" || !e) throw Error("Invalid cached-project entry.");
		let t = e;
		for (let e of [
			"filename",
			"path",
			"modified",
			"printer_serial",
			"printer_device_id",
			"printer_name",
			"printer_model"
		]) if (typeof t[e] != "string") throw Error(`Cached project is missing ${e}.`);
		if (typeof t.size != "number" || !Number.isSafeInteger(t.size) || t.size <= 0) throw Error("Invalid cached-project size.");
		return It(t.path), t;
	});
}
function zt(e) {
	let t = new DOMParser().parseFromString(e, "application/xml");
	if (t.querySelector("parsererror")) throw Error("The 3MF contains invalid metadata XML.");
	return t;
}
function Bt(e, t) {
	let n = Array.from(e.querySelectorAll("metadata")).find((e) => e.getAttribute("key") === t);
	return n?.getAttribute("value") || n?.textContent || null;
}
function Vt(e) {
	return (Array.isArray(e) ? e : typeof e == "string" ? e.split(/[;,]/) : []).map(Number).filter((e) => Number.isFinite(e) && e > 0);
}
function Ht(e) {
	let t = /* @__PURE__ */ new Set(), n = Ft(e, { filter: (e) => {
		let n = e.name.match(/^Metadata\/plate_(\d+)\.gcode$/i);
		return n && t.add(Number(n[1])), [
			"Metadata/project_settings.config",
			"Metadata/model_settings.config",
			"Metadata/slice_info.config"
		].includes(e.name);
	} });
	if (!t.size) throw Error("This is not a sliced 3MF project: no printable G-code plates were found.");
	let r = n["Metadata/project_settings.config"] ? JSON.parse(jt(n["Metadata/project_settings.config"])) : void 0, i = n["Metadata/model_settings.config"] ? zt(jt(n["Metadata/model_settings.config"])) : void 0, a = n["Metadata/slice_info.config"] ? zt(jt(n["Metadata/slice_info.config"])) : void 0, o = typeof r?.printer_model == "string" ? r.printer_model : null, s = Vt(r?.nozzle_diameter);
	if (!s.length && a) for (let e of a.querySelectorAll("nozzle")) s.push(...Vt(e.getAttribute("nozzle_diameter")));
	let c = [...t].sort((e, t) => e - t).map((e) => {
		let t = Array.from(i?.querySelectorAll("plate") || []).find((t) => Number(Bt(t, "plater_id")) === e), n = Array.from(a?.querySelectorAll("plate") || []).find((t) => Number(Bt(t, "index") || t.getAttribute("id")) === e), r = Array.from(n?.querySelectorAll("filament") || []).map((e) => ({
			id: Number(e.getAttribute("id")),
			type: e.getAttribute("type") || "",
			color: e.getAttribute("color") || ""
		}));
		return {
			id: e,
			name: t && Bt(t, "plater_name") || `Plate ${e}`,
			filaments: r
		};
	});
	return {
		model: o,
		nozzles: [...new Set(s)],
		plates: c
	};
}
function Ut(e) {
	let t = e.toLowerCase().replace(/bambu\s*lab/g, "").replace(/[^a-z0-9]/g, "");
	return {
		x1carbon: "x1c",
		x1carboncombo: "x1c"
	}[t] || t;
}
function Wt(e, t, n) {
	let r = [];
	return e.model ? Ut(e.model) !== Ut(t) && r.push(`Project model ${e.model} does not match target ${t}.`) : r.push("Project printer model is missing. Re-slice the project with printer metadata."), e.nozzles.length ? n === null ? r.push("Target printer nozzle diameter is unknown.") : e.nozzles.some((e) => e !== n) && r.push(`Project nozzle ${e.nozzles.join("/")} mm does not match target ${n} mm.`) : r.push("Project nozzle diameter is missing."), r;
}
function Gt(e, t) {
	if (!Number.isInteger(e.plate) || e.plate < 1 || e.plate > 100) throw Error("Plate must be an integer from 1 to 100.");
	if (t && !t.some((t) => t.id === e.plate)) throw Error("The selected plate has no sliced G-code.");
	if (e.useAms && !/^-?\d+(,-?\d+)*$/.test(e.amsMapping)) throw Error("Choose the AMS mapping for every project filament.");
	if (e.useAms && e.amsMapping.split(",").some((e) => !Number.isSafeInteger(Number(e)) || Number(e) < -1)) throw Error("AMS mapping accepts non-negative slot IDs or the -1 sentinel.");
}
function Kt(e, t) {
	if (t.status === "use_legacy_path") {
		if (!t.detail) throw Error("The integration did not return the legacy project path.");
		let e = t.detail.replace(/^\//, "");
		if (!e || e.split("/").some((e) => e === ".." || e === "." || !e) || /[\\\0]/.test(e)) throw Error("The integration returned an unsafe legacy project path.");
		return e;
	}
	if (t.status !== "present" && t.status !== "uploaded") throw Error(t.detail || `Unexpected file-check result: ${t.status}`);
	return It(e.path).remote;
}
// src/ha/client.ts
var qt = class {
	constructor(e) {
		this.hass = e;
	}
	async files() {
		try {
			return Rt(await this.hass.callApi("GET", "bambu_lab/print_history"));
		} catch (e) {
			let t = B(e).message;
			throw Error(`Cannot load cached projects. This requires the ha-bambulab cached-file API. ${t}`);
		}
	}
	async fileBytes(e) {
		if (typeof this.hass.fetchWithAuth != "function") throw Error("This HA frontend does not expose authenticated file requests.");
		let t = await this.hass.fetchWithAuth(Lt(e));
		if (!t.ok) throw Error(`Cached file request failed: HTTP ${t.status}.`);
		return new Uint8Array(await t.arrayBuffer());
	}
	async press(e, t) {
		let n = t === "pause" ? e.status === "running" : t === "resume" ? e.status === "pause" : ["running", "pause"].includes(e.status), r = e[t];
		if (!n || !H(r)) throw Error(`${t} is not available in the printer's current state.`);
		this.assertOwner(e, r), await this.hass.callService("button", "press", { entity_id: r.entry.entity_id });
	}
	async light(e) {
		let t = e.light;
		if (!H(t) || !["on", "off"].includes(t.state.state)) throw Error("Light state is unavailable.");
		this.assertOwner(e, t), await this.hass.callService("light", t.state.state === "on" ? "turn_off" : "turn_on", { entity_id: t.entry.entity_id });
	}
	async speed(e, t) {
		let n = e.speed;
		if (e.status !== "running" || !H(n)) throw Error("Speed control is available while printing.");
		let r = n.state.attributes.options;
		if (!Array.isArray(r) || !r.includes(t)) throw Error("This speed is not offered by the printer.");
		this.assertOwner(e, n), await this.hass.callService("select", "select_option", {
			entity_id: n.entry.entity_id,
			option: t
		});
	}
	assertOwner(e, t) {
		if (t.entry.device_id !== e.id) throw Error("Control entity does not belong to the target printer.");
	}
	async ensureFile(e, t, n) {
		if (!e.serial) throw Error("The target printer serial is missing from the device registry.");
		if (!W(e)) throw Error("The target printer is not idle.");
		if (It(t.path), !Number.isSafeInteger(t.size) || t.size <= 0) throw Error("Invalid cached-project size.");
		let r = e.serial, i = await this.hass.connection.subscribeEvents((e) => {
			let t = e.data;
			t.serial === r && typeof t.bytes_sent == "number" && typeof t.total == "number" && n?.({
				sent: t.bytes_sent,
				total: t.total
			});
		}, "bambu_upload_progress");
		try {
			return Kt(t, await this.hass.callApi("POST", "bambu_lab/ensure_cache_file", {
				serial: r,
				cache_path: t.path,
				expected_size: t.size
			}));
		} finally {
			i();
		}
	}
	async start(e, t, n) {
		if (!W(e)) throw Error("The target printer is not idle.");
		if (!t || t.startsWith("/") || t.split("/").some((e) => e === ".." || e === "." || !e) || /[\\\0]/.test(t)) throw Error("Enter a relative path to a sliced 3MF project on the printer SD card.");
		if (!t.toLowerCase().endsWith(".3mf")) throw Error("Printing requires a sliced .3mf project.");
		Gt(n), await this.hass.callService("bambu_lab", "print_project_file", {
			device_id: e.id,
			filepath: t,
			plate: n.plate,
			timelapse: n.timelapse,
			bed_leveling: n.bedLeveling,
			flow_cali: n.flowCalibration,
			vibration_cali: n.vibrationCalibration,
			layer_inspect: !1,
			use_ams: n.useAms,
			ams_mapping: n.useAms ? n.amsMapping : "0"
		});
	}
}, Jt = {
	workspace: ["Your print workspace", "打印工作台"],
	subtitle: ["Every printer. Every detail. One workspace.", "每台打印机，每个细节，一个工作台。"],
	allPrinters: ["All printers", "全部打印机"],
	printers: ["Printers", "打印机"],
	printing: ["Printing", "打印中"],
	ready: ["Ready", "就绪"],
	offline: ["Offline", "离线"],
	overview: ["Overview", "总览"],
	ams: ["Filament & AMS", "耗材与 AMS"],
	files: ["Recent files", "最近文件"],
	parameters: ["All parameters", "全部参数"],
	discover: ["Discovering your printers…", "正在发现打印机…"],
	noPrinters: ["No Bambu printers found. Add them through ha-bambulab, or check the selected devices.", "尚未发现拓竹打印机，请先通过 ha-bambulab 接入，或检查设备筛选。"],
	registryError: ["Device discovery failed", "设备发现失败"],
	refresh: ["Refresh", "刷新"],
	retry: ["Retry", "重试"],
	idle: ["Idle", "空闲"],
	running: ["Printing", "打印中"],
	prepare: ["Preparing", "准备中"],
	pause: ["Paused", "已暂停"],
	finish: ["Completed", "已完成"],
	failed: ["Failed", "失败"],
	unknown: ["Unknown", "未知"],
	unavailable: ["Unavailable", "不可用"],
	disabled: ["Disabled", "已禁用"],
	notLoaded: ["Not loaded", "未载入"],
	task: ["Current project", "当前项目"],
	noTask: ["No active print", "暂无打印任务"],
	progress: ["Progress", "打印进度"],
	remaining: ["Remaining", "剩余时间"],
	layers: ["Layers", "层数"],
	nozzle: ["Nozzle", "喷嘴"],
	bed: ["Bed", "热床"],
	fan: ["Part fan", "冷却风扇"],
	stage: ["Stage", "当前阶段"],
	weight: ["Filament weight", "耗材重量"],
	length: ["Filament length", "耗材长度"],
	start: ["Start a print", "开始打印"],
	pauseAction: ["Pause", "暂停"],
	resumeAction: ["Resume", "恢复"],
	stopAction: ["Stop print", "停止打印"],
	controls: ["Print controls", "打印控制"],
	speed: ["Print speed", "打印速度"],
	speedHelp: ["Speed options are available while printing.", "打印进行中才可选择速度档位。"],
	light: ["Printer light", "打印机灯光"],
	on: ["On", "开启"],
	off: ["Off", "关闭"],
	lightHelp: ["The integration exposes an on/off light. Verify its effect on your hardware.", "插件提供灯光开关，实际灯效需按硬件确认。"],
	unsupported: ["Not provided by this device", "此设备未提供"],
	camera: ["Camera", "摄像头"],
	snapshot: ["Image camera", "图像摄像头"],
	live: ["Live stream", "视频流"],
	cameraHelp: ["Camera transport is provided by Home Assistant.", "使用 Home Assistant 提供的摄像头连接。"],
	loading: ["Loading…", "加载中…"],
	external: ["External spool", "外置料盘"],
	active: ["In use", "使用中"],
	empty: ["Empty", "空槽"],
	humidity: ["Humidity", "湿度"],
	temperature: ["Temperature", "温度"],
	remainingUnknown: ["Remaining unknown", "余量未知"],
	noAms: ["No AMS or external spool device registered.", "未注册 AMS 或外置料盘设备。"],
	cachedFiles: ["Cached projects", "缓存项目文件"],
	cacheHelp: ["Files retained by ha-bambulab, sorted by cache modification time. This is not a complete print history.", "这是 ha-bambulab 保留的项目文件，按缓存修改时间排序，并非完整打印历史。"],
	noFiles: ["No cached projects are available.", "暂无缓存项目文件。"],
	download: ["Download", "下载"],
	printAgain: ["Print project", "打印项目"],
	source: ["Source printer", "来源打印机"],
	cachedAt: ["Cached at", "缓存时间"],
	size: ["Size", "大小"],
	search: ["Search parameters, entities or values…", "搜索参数、实体或数值…"],
	entity: ["Entity", "实体"],
	value: ["Value", "数值"],
	details: ["Details", "详情"],
	attributes: ["Attributes", "附加属性"],
	noParameters: ["No matching parameters.", "没有匹配的参数。"],
	updated: ["Updated", "更新时间"],
	cancel: ["Cancel", "取消"],
	close: ["Close", "关闭"],
	target: ["Target printer", "目标打印机"],
	plate: ["Plate", "打印盘"],
	sdPath: ["Sliced 3MF path on SD card", "SD 卡中的已切片 3MF 路径"],
	knownPath: ["Known SD-card project", "已知 SD 卡项目"],
	chooseFile: ["Choose a cached project", "选择缓存项目"],
	manualConfirm: ["I verified this SD-card project was sliced for this printer and nozzle.", "我已确认该 SD 卡项目适用于这台打印机和喷嘴。"],
	bedLevel: ["Bed leveling", "打印前调平"],
	timelapse: ["Timelapse", "延时摄影"],
	flowCali: ["Flow calibration", "流量校准"],
	vibrationCali: ["Vibration calibration", "振动校准"],
	useAms: ["Use AMS", "使用 AMS"],
	mapping: ["Filament → AMS slot mapping (zero-based)", "项目耗材 → AMS 槽位映射（从 0 开始）"],
	mappingHelp: ["Enter one slot per project filament, comma-separated; use -1 only when supported by the project.", "为项目中的各耗材填写槽位编号，以逗号分隔；仅在项目支持时使用 -1。"],
	confirmStart: ["Confirm & start", "确认并开始"],
	startHelp: ["Verify the target, clear bed, plate and filament before starting.", "开始前确认目标打印机、空闲台面、打印盘和耗材。"],
	stopHelp: ["This stops the active print on the named printer. It cannot be resumed as a paused print.", "此操作会停止指定打印机的当前任务，不能像暂停任务那样恢复。"],
	checking: ["Inspecting sliced project…", "正在检查切片项目…"],
	transferring: ["Checking / transferring project…", "正在检查或传输项目…"],
	submitted: ["Command submitted. Waiting for the printer state to confirm.", "命令已提交，等待打印机状态回报确认。"],
	confirmed: ["Printer state confirmed.", "打印机状态已确认。"],
	dismiss: ["Dismiss notice", "关闭提示"],
	commandFailed: ["Operation failed", "操作失败"],
	selectedDevices: ["Show selected printers only", "仅显示所选打印机"],
	title: ["Title", "标题"],
	language: ["Language", "语言"],
	automatic: ["Automatic", "自动"],
	experimental: ["Development preview", "开发预览"]
};
function Yt(e, t) {
	return Jt[t][+(e === "zh")];
}
// src/ui/icons.ts
var Xt = {
	printer: "M5 20V4h14v16M3 20h18M7 7h10M12 7v5m-2 0h4m-6 5h8M6 4V2h12v2",
	grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
	arrow: "m9 5 7 7-7 7",
	back: "m14 5-7 7 7 7",
	play: "m8 4 12 8-12 8z",
	pause: "M7 4h3v16H7zM14 4h3v16h-3z",
	stop: "M5 5h14v14H5z",
	camera: "M3 7h12v12H3zM15 11l6-3v10l-6-3M6 7l2-3h4l2 3",
	spool: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M12 3v6m0 6v6M3 12h6m6 0h6",
	folder: "M3 6h7l2 3h9v11H3zM3 6V4h7l2 2",
	tune: "M3 6h18M3 12h18M3 18h18M8 3v6m8 0v6m-9 0v6",
	refresh: "M20 8a9 9 0 1 0 1 7M20 3v6h-6",
	light: "M8 14a6 6 0 1 1 8 0l-1 3H9zM9 20h6M10 23h4",
	clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v6l4 2",
	heat: "M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0M12 8v9",
	check: "m4 12 5 5L20 6",
	alert: "M12 3 2 21h20zM12 9v5m0 3v1",
	download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
	close: "m5 5 14 14M5 19 19 5",
	search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6"
};
function $(e) {
	return pe`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${Xt[e] || Xt.printer}></path></svg>`;
}
function Zt() {
	return pe`<svg viewBox="0 0 320 220" class="printer-art" fill="none" aria-hidden="true">
    <ellipse cx="160" cy="193" rx="105" ry="13" fill="currentColor" opacity=".04"/>
    <path d="M88 180V43h144v137M99 180V54h122v126" stroke="currentColor" stroke-width="5" opacity=".7"/>
    <path d="M94 94h132M94 103h132" stroke="currentColor" stroke-width="4" opacity=".45"/>
    <path d="M151 88h31v29h-31zM160 117h14l-7 11z" fill="var(--bd-accent)" fill-opacity=".8"/>
    <path d="m101 155 79-7 42 17-80 8z" stroke="currentColor" stroke-width="3" fill="currentColor" fill-opacity=".08"/>
    <path d="M142 173v9m80-17v9M101 155v10l41 17 80-8M72 184h175v10H72z" stroke="currentColor" stroke-width="3"/>
    <path d="m151 151 0-22 19-6 14 8v19l-18 7z" fill="var(--bd-accent)" fill-opacity=".14" stroke="var(--bd-accent)" stroke-width="2"/>
    <path d="m151 129 15 9 18-7m-18 7v19" stroke="var(--bd-accent)" stroke-width="2"/>
    <path d="M199 43V21m-16 0h32M200 23c-23 0-40 15-33 65" stroke="currentColor" stroke-width="2" opacity=".35"/>
  </svg>`;
}
// src/ui/select-values.ts
function Qt(e) {
	for (let t of e.querySelectorAll("select[data-value]")) {
		let e = t.dataset.value;
		t.value !== e && (t.value = e);
	}
}
// src/ui/styles.css?inline
var $t = ":host{color:var(--primary-text-color,#e8eeec);--bd-accent:#28bb8b;--bd-accent-soft:color-mix(in srgb, var(--bd-accent) 12%, transparent);--bd-bg:var(--primary-background-color,#101716);--bd-panel:var(--card-background-color,#19211f);--bd-raised:var(--secondary-background-color,#202a27);--bd-text:var(--primary-text-color,#e8eeec);--bd-muted:var(--secondary-text-color,#93a49d);--bd-line:color-mix(in srgb, var(--bd-text) 10%, transparent);--bd-danger:var(--error-color,#db6e67);font-family:var(--paper-font-body1_-_font-family,Inter, ui-sans-serif, system-ui, sans-serif);font-size:14px;line-height:1.5;display:block}*{box-sizing:border-box}button,input,select{font:inherit}button{color:inherit;cursor:pointer}button:disabled{opacity:.42;cursor:not-allowed}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid var(--bd-accent);outline-offset:3px}button,input,select{-webkit-tap-highlight-color:transparent}a{color:var(--bd-accent)}.shell{background:var(--bd-bg);border:1px solid var(--bd-line);border-radius:20px;min-height:460px;overflow:hidden}.topbar{background:var(--bd-panel);border-bottom:1px solid var(--bd-line);justify-content:space-between;align-items:center;gap:20px;min-height:72px;padding:17px 28px;display:flex}.brand{align-items:center;gap:12px;display:flex}.brand-mark{background:var(--bd-accent);color:#08291f;border-radius:11px;place-items:center;width:37px;height:37px;display:grid}.brand-title{letter-spacing:-.4px;font-size:16px;font-weight:750}.brand-subtitle,.eyebrow{color:var(--bd-muted);letter-spacing:1.6px;text-transform:uppercase;font-size:10px;font-weight:650}.top-actions{align-items:center;gap:12px;display:flex}.connection{color:var(--bd-muted);align-items:center;gap:7px;font-size:11px;display:flex}.dot{background:var(--bd-muted);border-radius:50%;flex-shrink:0;width:7px;height:7px}.dot.running,.dot.ready,.dot.finish{background:var(--bd-accent)}.dot.pause,.dot.prepare{background:#d8ac5b}.dot.failed{background:var(--bd-danger)}.workspace{grid-template-columns:216px minmax(0,1fr);display:grid}.sidebar{border-right:1px solid var(--bd-line);background:color-mix(in srgb, var(--bd-panel) 55%, var(--bd-bg));padding:25px 13px}.sidebar-label{color:var(--bd-muted);letter-spacing:1.6px;text-transform:uppercase;margin:5px 12px 12px;font-size:10px;font-weight:700}.sidebar button{text-align:left;background:0 0;border:0;border-radius:10px;align-items:center;gap:10px;width:100%;padding:11px 12px;display:flex}.sidebar button:hover{background:var(--bd-line)}.sidebar button.selected{background:var(--bd-accent-soft);color:var(--bd-accent)}.sidebar .icon{flex-shrink:0;width:18px;height:18px}.sidebar .printer-link{margin-top:5px}.sidebar .printer-link .dot{margin-left:auto}.sidebar .name{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.sidebar .model{color:var(--bd-muted);font-size:11px;display:block}.sidebar-rule{background:var(--bd-line);height:1px;margin:20px 10px}.sidebar-foot{color:var(--bd-muted);margin:28px 12px 0;font-size:11px}.main{min-width:0;padding:29px 30px 35px}.page-heading{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:24px;display:flex}h1{letter-spacing:-1.1px;margin:7px 0 8px;font-size:28px;font-weight:720;line-height:1.2}h2{letter-spacing:-.3px;margin:0;font-size:16px}h3{margin:0;font-size:13px}p{margin:0}.muted{color:var(--bd-muted)}.description{color:var(--bd-muted);font-size:12px}.stats{flex-wrap:wrap;gap:8px;margin-top:4px;display:flex}.stat{border:1px solid var(--bd-line);background:var(--bd-panel);color:var(--bd-muted);white-space:nowrap;border-radius:9px;padding:7px 12px;font-size:11px}.stat b{color:var(--bd-text);margin-right:4px;font-size:15px}.tabs{border-bottom:1px solid var(--bd-line);gap:5px;margin-bottom:22px;padding-bottom:12px;display:flex;overflow-x:auto}.tabs button{color:var(--bd-muted);white-space:nowrap;background:0 0;border:0;border-radius:8px;align-items:center;gap:7px;padding:9px 12px;font-size:12px;display:flex}.tabs button.active{background:var(--bd-accent-soft);color:var(--bd-accent)}.icon{vertical-align:middle;flex-shrink:0;width:19px;height:19px;display:inline-block}.icon-button{border:1px solid var(--bd-line);background:0 0;border-radius:9px;place-items:center;width:33px;height:33px;display:inline-grid}.icon-button:hover{background:var(--bd-line)}.button{border:1px solid var(--bd-line);background:var(--bd-raised);border-radius:9px;justify-content:center;align-items:center;gap:8px;padding:10px 14px;font-size:12px;font-weight:600;display:inline-flex}.button.primary{background:var(--bd-accent);border-color:var(--bd-accent);color:#092e22}.button.danger{color:var(--bd-danger);background:color-mix(in srgb, var(--bd-danger) 8%, transparent);border-color:color-mix(in srgb, var(--bd-danger) 28%, transparent)}.button.small{padding:7px 10px;font-size:11px}.panel{background:var(--bd-panel);border:1px solid var(--bd-line);border-radius:14px;overflow:hidden}.panel-head{border-bottom:1px solid var(--bd-line);justify-content:space-between;align-items:center;gap:12px;padding:17px 20px;display:flex}.panel-body{padding:20px}.printer-grid{grid-template-columns:repeat(auto-fit,minmax(min(310px,100%),1fr));gap:18px;display:grid}.printer-card{transition:border-color .15s}.printer-card:hover{border-color:color-mix(in srgb, var(--bd-accent) 50%, var(--bd-line))}.printer-card .card-heading{text-align:left;background:0 0;border:0;align-items:center;gap:10px;width:100%;padding:18px 20px 0;display:flex}.machine-badge{border:1px solid var(--bd-line);width:34px;height:34px;color:var(--bd-muted);border-radius:9px;place-items:center;display:grid}.card-heading .heading-copy{flex:1;min-width:0}.card-heading .heading-copy b{text-overflow:ellipsis;white-space:nowrap;font-size:14px;display:block;overflow:hidden}.card-heading small{color:var(--bd-muted);font-size:10px}.status{border:1px solid var(--bd-line);white-space:nowrap;border-radius:6px;align-items:center;gap:6px;padding:4px 8px;font-size:10px;display:inline-flex}.status.running,.status.finish{color:var(--bd-accent);background:var(--bd-accent-soft);border-color:#0000}.status.pause,.status.prepare{color:#d8ac5b}.status.failed{color:var(--bd-danger)}.preview{background:radial-gradient(ellipse at center, var(--bd-accent-soft), transparent 72%);border-radius:10px;place-items:center;height:208px;margin:8px 10px;display:grid;position:relative;overflow:hidden}.preview bambu-dashboard-camera{width:100%;position:absolute;inset:0}.printer-art{width:90%;max-width:320px;height:100%;color:var(--bd-muted)}.preview-caption{background:var(--bd-panel);border:1px solid var(--bd-line);color:var(--bd-muted);border-radius:4px;padding:3px 7px;font-size:9px;position:absolute;bottom:9px;left:10px}.tile-content{padding:4px 20px 20px}.task-line{align-items:center;gap:9px;margin-bottom:15px;display:flex}.task-line .icon{color:var(--bd-muted);width:15px;height:15px}.task-line span{text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.progress-label{color:var(--bd-muted);justify-content:space-between;align-items:center;gap:12px;margin:8px 0;font-size:11px;display:flex}.progress-label strong{color:var(--bd-accent);font-size:13px}.progress-track{background:var(--bd-line);border-radius:4px;height:5px;overflow:hidden}.progress-fill{height:100%;width:var(--progress,0%);background:var(--bd-accent);border-radius:inherit;transition:width .3s}.tile-metrics{grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0 14px;display:grid}.tile-metrics span{color:var(--bd-muted);font-size:10px;display:block}.tile-metrics strong{margin-top:3px;font-size:13px;font-weight:600;display:block}.tile-footer{border-top:1px solid var(--bd-line);justify-content:space-between;align-items:center;gap:10px;padding-top:12px;display:flex}.filament-dots{align-items:center;gap:5px;display:flex}.filament-dot{border:2px solid var(--bd-line);background:var(--filament,transparent);border-radius:50%;width:14px;height:14px}.filament-dot.active{outline:1px solid var(--bd-accent);outline-offset:2px}.detail-grid{grid-template-columns:minmax(0,1.5fr) minmax(260px,1fr);gap:18px;display:grid}.camera-large{background:radial-gradient(ellipse at center, var(--bd-accent-soft), transparent);place-items:center;height:330px;display:grid;position:relative}.camera-large bambu-dashboard-camera{width:100%;height:100%}.camera-large .printer-art{max-width:400px}.metric-grid{grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:12px;margin-top:18px;display:grid}.metric{padding:16px 18px}.metric .metric-top{color:var(--bd-muted);align-items:center;gap:7px;font-size:11px;display:flex}.metric strong{letter-spacing:-.6px;margin-top:7px;font-size:22px;font-weight:650;display:block}.metric small{color:var(--bd-muted);font-size:11px}.job-name{overflow-wrap:anywhere;margin:8px 0 18px;font-size:19px;font-weight:650;line-height:1.4}.job-top{align-items:center;gap:14px;margin-bottom:12px;display:flex}.job-cover{border:1px solid var(--bd-line);background:var(--bd-bg);border-radius:10px;flex-shrink:0;width:64px;height:64px;overflow:hidden}.job-top .job-name{margin-bottom:4px}.job-summary{grid-template-columns:1fr 1fr;gap:14px;margin:18px 0;display:grid}.job-summary span{color:var(--bd-muted);font-size:11px;display:block}.job-summary b{margin-top:4px;font-size:15px;display:block}.control-row{gap:8px;margin:12px 0;display:flex}.control-row .button{flex:1}.control-divider{background:var(--bd-line);height:1px;margin:19px 0}.field{flex-direction:column;gap:7px;margin:12px 0;font-size:12px;display:flex}.field label,.field>span{color:var(--bd-muted);font-size:11px}input,select{border:1px solid var(--bd-line);background:var(--bd-bg);width:100%;min-width:0;color:var(--bd-text);border-radius:8px;padding:10px 12px}input[type=checkbox]{width:16px;height:16px;accent-color:var(--bd-accent)}.check{align-items:flex-start;gap:9px;margin:12px 0;font-size:12px;display:flex}.check input{flex-shrink:0;margin-top:2px}.light-control{justify-content:space-between;align-items:center;gap:12px;font-size:12px;display:flex}.light-control .button.on{color:var(--bd-accent);border-color:var(--bd-accent)}.helper{color:var(--bd-muted);margin-top:8px;font-size:11px;line-height:1.6}.ams-section{margin-top:18px}.ams-grid{grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));gap:12px;padding:20px;display:grid}.spool{border:1px solid var(--bd-line);background:var(--bd-bg);border-radius:11px;min-width:0;padding:16px 13px 13px;position:relative}.spool.active{border-color:color-mix(in srgb, var(--bd-accent) 65%, transparent);background:var(--bd-accent-soft)}.spool-index{color:var(--bd-muted);font-size:10px}.spool-visual{background:repeating-radial-gradient(circle at center, transparent 0 3px, #0002 4px 5px),var(--filament,var(--bd-raised));border:5px solid color-mix(in srgb, var(--filament,var(--bd-muted)) 65%, var(--bd-line));border-radius:50%;width:64px;height:64px;margin:15px auto;position:relative;box-shadow:inset 0 0 0 1px #fff3}.spool-visual:after{content:\"\";background:var(--bd-bg);border:2px solid var(--bd-line);border-radius:50%;position:absolute;inset:18px}.spool h3{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.spool .material{color:var(--bd-muted);margin-top:4px;font-size:10px}.spool .remain{color:var(--bd-muted);margin-top:11px;font-size:11px}.spool .active-label{color:var(--bd-accent);font-size:9px;position:absolute;top:12px;right:9px}.ams-extra{color:var(--bd-muted);flex-wrap:wrap;gap:15px;padding:0 20px 17px;font-size:11px;display:flex}.file-list{margin-top:18px}.file-row{grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:17px;padding:18px 20px;display:grid}.file-row+.file-row{border-top:1px solid var(--bd-line)}.file-preview{border:1px solid var(--bd-line);background:var(--bd-bg);width:64px;height:64px;color:var(--bd-muted);border-radius:10px;place-items:center;display:grid;overflow:hidden}.file-title{overflow-wrap:anywhere;font-size:13px;font-weight:600}.file-meta{color:var(--bd-muted);flex-wrap:wrap;gap:12px;margin-top:5px;font-size:10px;display:flex}.file-actions{gap:8px;display:flex}.section-heading{justify-content:space-between;align-items:flex-start;gap:20px;display:flex}.section-heading .description{max-width:700px;margin-top:6px}.search-box{border:1px solid var(--bd-line);background:var(--bd-panel);color:var(--bd-muted);border-radius:9px;align-items:center;gap:10px;margin:18px 0 13px;padding-left:12px;display:flex}.search-box input{background:0 0;border:0}.parameter-table{border-collapse:collapse;width:100%;font-size:12px}.parameter-table th{text-align:left;color:var(--bd-muted);border-bottom:1px solid var(--bd-line);padding:13px 18px;font-size:10px;font-weight:500}.parameter-table td{vertical-align:top;border-bottom:1px solid var(--bd-line);padding:12px 18px}.parameter-table tr:last-child td{border-bottom:0}.entity-name{font-size:12px;font-weight:550}.entity-id{color:var(--bd-muted);overflow-wrap:anywhere;margin-top:4px;font-size:9px}.entity-value{word-break:break-word;font-weight:650}.parameter-table summary{cursor:pointer;color:var(--bd-muted);font-size:10px}.attribute-grid{grid-template-columns:minmax(80px,auto) minmax(0,1fr);gap:7px 12px;padding:12px 0 0;font-size:10px;display:grid}.attribute-grid dt{color:var(--bd-muted);overflow-wrap:anywhere}.attribute-grid dd{word-break:break-word;white-space:pre-wrap;margin:0}.banner{border:1px solid var(--bd-line);background:var(--bd-panel);border-radius:10px;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;font-size:12px;display:flex}.banner.error{border-color:color-mix(in srgb,var(--bd-danger) 35%,transparent);color:var(--bd-danger)}.banner.notice{border-color:color-mix(in srgb,var(--bd-accent) 35%,transparent)}.banner .copy{overflow-wrap:anywhere;flex:1}.empty{text-align:center;color:var(--bd-muted);padding:48px 25px}.empty .icon{opacity:.7;width:30px;height:30px;margin-bottom:12px}.empty p{margin-bottom:15px;font-size:12px}.overlay{z-index:7;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);background:#0008;place-items:center;padding:20px;display:grid;position:fixed;inset:0}.dialog{background:var(--bd-panel);border:1px solid var(--bd-line);border-radius:17px;width:min(620px,100%);max-height:90vh;overflow-y:auto;box-shadow:0 20px 90px #0005}.dialog .dialog-body{padding:22px}.dialog-target{background:var(--bd-accent-soft);border:1px solid color-mix(in srgb,var(--bd-accent) 25%,transparent);border-radius:10px;justify-content:space-between;gap:16px;margin-bottom:17px;padding:13px 15px;display:flex}.dialog-target span{color:var(--bd-muted);font-size:10px}.dialog-target b{margin-top:3px;font-size:13px;display:block}.dialog-footer{border-top:1px solid var(--bd-line);justify-content:flex-end;gap:10px;padding:16px 22px;display:flex}.two-fields{grid-template-columns:1fr 1fr;gap:15px;display:grid}.progress-caption{color:var(--bd-accent);margin-top:12px;font-size:11px}.mobile-picker{display:none}@media (max-width:1100px){.workspace{grid-template-columns:180px minmax(0,1fr)}.main{padding:24px 20px}.detail-grid{grid-template-columns:1fr}.camera-large{height:300px}.stats{display:none}}@media (max-width:700px){.shell{border-radius:12px}.topbar{padding:14px 17px}.brand-subtitle{font-size:8px}.connection{display:none}.workspace{display:block}.sidebar{display:none}.main{padding:20px 15px}h1{font-size:24px}.page-heading{margin-bottom:16px}.mobile-picker{margin-bottom:15px;display:block}.tabs button{padding:8px;font-size:11px}.tabs .icon{width:15px;height:15px}.camera-large{height:240px}.file-row{grid-template-columns:48px minmax(0,1fr);gap:12px;padding:15px}.file-preview{width:48px;height:48px}.file-actions{grid-column:2}.parameter-table th,.parameter-table td{padding:11px 10px}.parameter-table th:first-child{width:38%}.overlay{padding:10px}.two-fields{grid-template-columns:1fr;gap:0}}@media (prefers-reduced-motion:reduce){*{transition:none!important}}@media (max-width:700px){.tabs .icon{display:none}.tabs{gap:2px}}", en = class extends R {
	constructor(...e) {
		super(...e), this.entity = "", this._error = "", this._visible = !1, this.generation = 0;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			entity: {},
			_error: { state: !0 },
			_visible: { state: !0 }
		};
	}
	static {
		this.styles = o`:host{display:block;height:100%;min-height:180px;overflow:hidden} .message{display:grid;place-content:center;height:100%;padding:24px;text-align:center;color:var(--secondary-text-color);font-size:13px} .error{color:var(--error-color,#d25454)} hui-picture-entity-card{height:100%;--ha-card-border-width:0;--ha-card-border-radius:0}`;
	}
	connectedCallback() {
		super.connectedCallback(), this.observer = new IntersectionObserver(([e]) => {
			this._visible = e.isIntersecting, e.isIntersecting || (this.card = void 0);
		}), this.observer.observe(this);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.generation++, this.observer?.disconnect(), this.card = void 0, this._visible = !1;
	}
	updated(e) {
		e.has("entity") && (this.card = void 0, this._error = ""), this._visible && (this.card ? this.card.hass = this.hass : this.entity && this.hass && !this._error && this.load());
	}
	async load() {
		let e = ++this.generation;
		try {
			if (!window.loadCardHelpers) throw Error("Home Assistant card helpers are unavailable.");
			let t = await window.loadCardHelpers();
			if (e !== this.generation || !this._visible) return;
			let n = !!(Number(this.hass?.states[this.entity]?.attributes.supported_features) & 2);
			this.card = t.createCardElement({
				type: "picture-entity",
				entity: this.entity,
				camera_view: n ? "live" : "auto",
				show_name: !1,
				show_state: !1
			}), this.card.hass = this.hass, this.requestUpdate();
		} catch (t) {
			e === this.generation && (this._error = B(t).message);
		}
	}
	render() {
		return this._error ? N`<div class="message error">${this._error}</div>` : this._visible ? this.card || N`<div class="message">Camera · …</div>` : F;
	}
}, tn = class extends R {
	constructor(...e) {
		super(...e), this.path = "", this.entity = "", this.version = "", this._url = "", this._error = "";
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			path: {},
			entity: {},
			version: {},
			_url: { state: !0 },
			_error: { state: !0 }
		};
	}
	static {
		this.styles = o`:host{display:block;width:100%;height:100%} img{display:block;width:100%;height:100%;object-fit:contain} .error{font-size:11px;padding:10px;color:var(--error-color,#d25454)}`;
	}
	connectedCallback() {
		super.connectedCallback(), this.hasUpdated && this.load();
	}
	updated(e) {
		let t = e.get("hass"), n = e.has("hass") && t?.connection !== this.hass?.connection;
		(e.has("path") || e.has("entity") || e.has("version") || n) && this.load();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.request?.abort(), this._url && URL.revokeObjectURL(this._url), this._url = "";
	}
	async load() {
		if (this.request?.abort(), this._url && URL.revokeObjectURL(this._url), this._url = "", this._error = "", !this.path && !this.entity || !this.hass) return;
		let e = this.request = new AbortController();
		try {
			if (this.entity && !/^image\.[a-z0-9_]+$/.test(this.entity)) throw Error("Expected an HA image entity.");
			let t = this.entity ? `/api/image_proxy/${encodeURIComponent(this.entity)}` : Lt(this.path), n = this.version ? `${t}?v=${encodeURIComponent(this.version)}` : t, r = await this.hass.fetchWithAuth(n, { signal: e.signal });
			if (!r.ok) throw Error(`Image: HTTP ${r.status}`);
			let i = await r.blob();
			e.signal.aborted || (this._url = URL.createObjectURL(i));
		} catch (t) {
			e.signal.aborted || (this._error = B(t).message);
		}
	}
	render() {
		return this._url ? N`<img src=${this._url} alt="Project preview"/>` : this._error ? N`<span class="error">${this._error}</span>` : F;
	}
};
customElements.define("bambu-dashboard-camera", en), customElements.define("bambu-dashboard-file-image", tn);
// src/editor.ts
var nn = class extends R {
	constructor(...e) {
		super(...e), this._config = {
			type: "custom:bambu-dashboard-card",
			discovery: "auto"
		}, this._catalog = { loading: !0 };
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 },
			_catalog: { state: !0 }
		};
	}
	static {
		this.styles = o`
    :host{display:block;color:var(--primary-text-color);padding:12px 0;font:14px system-ui}
    label{display:block;margin:16px 0} input[type=text],select{box-sizing:border-box;width:100%;padding:11px;margin-top:7px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color);color:inherit;font:inherit}
    .check{display:flex;gap:10px;align-items:center} input[type=checkbox]{width:17px;height:17px;accent-color:var(--primary-color)} small{color:var(--secondary-text-color)} .error{color:var(--error-color)}
    .row{display:flex;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--divider-color)}.row label{flex:1;margin:0}.row button{background:none;color:inherit;border:1px solid var(--divider-color);border-radius:5px;cursor:pointer;padding:4px 7px}
  `;
	}
	setConfig(e) {
		this._config = { ...e };
	}
	updated(e) {
		Qt(this.renderRoot), e.has("hass") && this.hass && this.connection !== this.hass.connection && (this.unsubscribe?.(), this.connection = this.hass.connection, this.unsubscribe = Ge(this.hass).subscribe((e) => {
			this._catalog = e;
		}));
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.unsubscribe?.(), this.connection = void 0;
	}
	change(e) {
		this._config = {
			...this._config,
			...e
		}, this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: this._config },
			bubbles: !0,
			composed: !0
		}));
	}
	move(e, t) {
		let n = [...this._config.devices || []], r = n.indexOf(e), i = r + t;
		r < 0 || i < 0 || i >= n.length || ([n[r], n[i]] = [n[i], n[r]], this.change({ devices: n }));
	}
	render() {
		let e = this.hass?.language.startsWith("zh") ? "zh" : "en", t = (t) => Yt(e, t), n = this._config.devices || [], r = this._catalog.snapshot && this.hass ? Qe(this._catalog.snapshot, this.hass, {
			...this._config,
			discovery: "auto"
		}) : [];
		return N`<label>${t("title")}<input type="text" .value=${this._config.title || ""} @input=${(e) => this.change({ title: e.target.value })}/></label>
      <label>${t("language")}<select data-value=${this._config.language || "auto"} @change=${(e) => this.change({ language: e.target.value })}><option value="auto">${t("automatic")}</option><option value="en">English</option><option value="zh">简体中文</option></select></label>
      <label class="check"><input type="checkbox" .checked=${this._config.discovery === "selected"} @change=${(e) => this.change({
			discovery: e.target.checked ? "selected" : "auto",
			devices: this._config.devices || []
		})}/>${t("selectedDevices")}</label>
      ${this._config.discovery === "selected" ? N`${r.map((e) => N`<div class="row"><label class="check"><input type="checkbox" .checked=${n.includes(e.id)} @change=${(t) => this.change({ devices: t.target.checked ? [...n, e.id] : n.filter((t) => t !== e.id) })}/>${e.name} <small>${e.model}</small></label>${n.includes(e.id) ? N`<button aria-label="Move up" @click=${() => this.move(e.id, -1)}>↑</button><button aria-label="Move down" @click=${() => this.move(e.id, 1)}>↓</button>` : F}</div>`)}` : N`<small>${t("allPrinters")} · ${r.length}</small>`}
      ${this._catalog.error ? N`<p class="error">${this._catalog.error.message}</p>` : F}`;
	}
};
customElements.define("bambu-dashboard-card-editor", nn);
// src/card.ts
var rn = class extends R {
	constructor(...e) {
		super(...e), this._config = {
			type: "custom:bambu-dashboard-card",
			discovery: "auto"
		}, this._catalogState = { loading: !0 }, this._selected = null, this._tab = "overview", this._search = "", this._error = "", this._notice = "", this._filesError = "", this._filesLoading = !1, this._pending = /* @__PURE__ */ new Map(), this._transfer = "", this.dialogGeneration = 0;
	}
	static {
		this.properties = {
			_config: { state: !0 },
			_catalogState: { state: !0 },
			_selected: { state: !0 },
			_tab: { state: !0 },
			_search: { state: !0 },
			_error: { state: !0 },
			_notice: { state: !0 },
			_files: { state: !0 },
			_filesError: { state: !0 },
			_filesLoading: { state: !0 },
			_dialog: { state: !0 },
			_pending: { state: !0 },
			_transfer: { state: !0 }
		};
	}
	static {
		this.styles = a($t);
	}
	set hass(e) {
		let t = this._hass;
		this._hass = e, this.isConnected && this.attachCatalog(), this.requestUpdate("hass", t);
	}
	get hass() {
		return this._hass;
	}
	setConfig(e) {
		if (!e || e.discovery === "selected" && !Array.isArray(e.devices)) throw Error("Selected discovery requires a devices array.");
		this._config = { ...e };
	}
	static getConfigElement() {
		return document.createElement("bambu-dashboard-card-editor");
	}
	static getStubConfig() {
		return {
			type: "custom:bambu-dashboard-card",
			discovery: "auto"
		};
	}
	getCardSize() {
		return 12;
	}
	getGridOptions() {
		return {
			columns: "full",
			min_columns: 6
		};
	}
	connectedCallback() {
		super.connectedCallback(), this.attachCatalog();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.unsubscribe?.(), this.unsubscribe = void 0, this.connection = void 0, this.downloadUrl && URL.revokeObjectURL(this.downloadUrl);
	}
	attachCatalog() {
		this._hass && this.connection !== this._hass.connection && (this.unsubscribe?.(), this.connection = this._hass.connection, this.unsubscribe = Ge(this._hass).subscribe((e) => {
			this._catalogState = e;
		}));
	}
	get language() {
		return this._config.language && this._config.language !== "auto" ? this._config.language : this._hass?.language.startsWith("zh") ? "zh" : "en";
	}
	t(e) {
		return Yt(this.language, e);
	}
	get printers() {
		return this._catalogState.snapshot && this._hass ? Qe(this._catalogState.snapshot, this._hass, this._config) : [];
	}
	get currentPrinters() {
		return this.printers.filter((e) => !this._selected || e.id === this._selected);
	}
	get client() {
		if (!this._hass) throw Error("Home Assistant is not connected.");
		return new qt(this._hass);
	}
	target(e) {
		let t = (this._catalogState.snapshot && this._hass ? Qe(this._catalogState.snapshot, this._hass, {
			type: this._config.type,
			discovery: "auto"
		}) : []).find((t) => t.id === e);
		if (!t) throw Error("The target printer is no longer registered.");
		return t;
	}
	willUpdate(e) {
		if (!e.has("hass") && !e.has("_catalogState")) return;
		let t = this.printers, n = this._catalogState.snapshot && this._hass ? Qe(this._catalogState.snapshot, this._hass, {
			type: this._config.type,
			discovery: "auto"
		}) : [];
		this._selected && !t.some((e) => e.id === this._selected) && this._catalogState.snapshot && (this._selected = null);
		for (let [e, t] of this._pending) {
			let r = n.find((t) => t.id === e);
			!r && this._catalogState.snapshot && !this._catalogState.loading && !this._catalogState.error ? (this.clearPending(e), this._error = `${t.name}: target device was removed; the command outcome is unknown.`) : r && t.phase === "submitted" && t.confirmed?.(r) && (this._pending = new Map(this._pending), this._pending.delete(e), this._notice = `${r.name} · ${this.t("confirmed")}`);
		}
	}
	updated() {
		Qt(this.renderRoot);
	}
	value(e) {
		if (!e) return this.t("unsupported");
		if (e.entry.disabled_by) return this.t("disabled");
		if (!e.state) return this.t("notLoaded");
		if (e.state.state === "unavailable") return this.t("unavailable");
		if (e.state.state === "unknown") return this.t("unknown");
		let t = e.state.attributes.unit_of_measurement;
		return `${e.state.state}${t ? ` ${String(t)}` : ""}`;
	}
	sensor(e, t) {
		return this.value(V(e.entities, t));
	}
	status(e) {
		let t = {
			idle: "idle",
			running: "running",
			pause: "pause",
			prepare: "prepare",
			finish: "finish",
			failed: "failed",
			offline: "offline",
			unavailable: "unavailable",
			unknown: "unknown"
		};
		return t[e.status] ? this.t(t[e.status]) : e.status;
	}
	statusBadge(e) {
		return N`<span class="status ${e.status}"><span class="dot ${e.status}"></span>${this.status(e)}</span>`;
	}
	selectPrinter(e) {
		this._selected = e, this._search = "";
	}
	setTab(e) {
		this._tab = e, e === "files" && !this._files && !this._filesLoading && this.loadFiles();
	}
	progress(e) {
		let t = e.progress !== null && e.progress >= 0 && e.progress <= 100;
		return N`<div class="progress-label"><span>${this.t("progress")}</span><strong>${e.progress === null ? "—" : `${e.progress}%`}</strong></div>
      <div class="progress-track" role="progressbar" aria-label=${this.t("progress")} aria-valuenow=${t ? e.progress : F} style=${`--progress:${t ? e.progress : 0}%`}><div class="progress-fill"></div></div>`;
	}
	async runAction(e, t, n, r) {
		if (!this._pending.has(e)) {
			this._error = "", this._pending = new Map(this._pending).set(e, {
				name: t,
				phase: "request"
			});
			try {
				await n(this.target(e));
				let i = this.target(e);
				r(i) ? (this.clearPending(e), this._notice = `${i.name} · ${this.t("confirmed")}`) : this._pending = new Map(this._pending).set(e, {
					name: t,
					phase: "submitted",
					confirmed: r
				});
			} catch (n) {
				this.clearPending(e), this._error = `${t}: ${B(n).message}`;
			}
		}
	}
	clearPending(e) {
		this._pending = new Map(this._pending), this._pending.delete(e);
	}
	press(e, t) {
		t === "stop" ? this._dialog = {
			kind: "stop",
			printerId: e.id
		} : this.runAction(e.id, `${e.name} · ${t}`, (e) => this.client.press(e, t), (e) => e.status === (t === "pause" ? "pause" : "running"));
	}
	async loadFiles() {
		this._filesLoading = !0, this._filesError = "";
		try {
			this._files = await this.client.files();
		} catch (e) {
			this._filesError = B(e).message;
		} finally {
			this._filesLoading = !1;
		}
	}
	async download(e) {
		try {
			let t = await this.client.fileBytes(e.path);
			this.downloadUrl && URL.revokeObjectURL(this.downloadUrl), this.downloadUrl = URL.createObjectURL(new Blob([t], { type: "application/octet-stream" }));
			let n = document.createElement("a");
			n.href = this.downloadUrl, n.download = e.filename, n.click();
		} catch (e) {
			this._error = B(e).message;
		}
	}
	async openStart(e, t) {
		let n = ++this.dialogGeneration;
		if (this._transfer = "", this._dialog = {
			kind: "start",
			printerId: e.id,
			file: t,
			loading: !!t,
			error: "",
			path: "",
			acknowledged: !1,
			options: {
				plate: 1,
				timelapse: !1,
				bedLeveling: !0,
				flowCalibration: !0,
				vibrationCalibration: !0,
				useAms: !1,
				amsMapping: ""
			}
		}, t) try {
			let e = Ht(await this.client.fileBytes(t.path));
			if (n !== this.dialogGeneration || this._dialog?.kind !== "start") return;
			this._dialog = {
				...this._dialog,
				metadata: e,
				loading: !1,
				options: {
					...this._dialog.options,
					plate: e.plates[0].id
				}
			};
		} catch (e) {
			n === this.dialogGeneration && this._dialog?.kind === "start" && (this._dialog = {
				...this._dialog,
				loading: !1,
				error: B(e).message
			});
		}
	}
	updateOptions(e) {
		this._dialog?.kind === "start" && (this._dialog = {
			...this._dialog,
			error: "",
			options: {
				...this._dialog.options,
				...e
			}
		});
	}
	closeDialog() {
		this.dialogGeneration++, this._dialog = void 0;
	}
	async confirmStart() {
		let e = this._dialog;
		if (e?.kind !== "start") return;
		let t = e.printerId, n = this.target(t);
		try {
			if (Gt(e.options, e.metadata?.plates), e.file) {
				if (!e.metadata) throw Error("Project metadata has not been verified.");
				let t = Wt(e.metadata, n.model, Je(V(n.entities, "nozzle_diameter")));
				if (t.length) throw Error(t.join(" "));
			} else if (!e.acknowledged) throw Error(this.t("manualConfirm"));
			if (e.options.useAms && !n.ams.some((e) => !e.external)) throw Error("No AMS is registered for this printer.");
		} catch (t) {
			this._dialog = {
				...e,
				error: B(t).message
			};
			return;
		}
		await this.runAction(t, `${n.name} · ${this.t("start")}`, async () => {
			let n = e.file ? await this.client.ensureFile(this.target(t), e.file, (e) => {
				this._transfer = `${this.t("transferring")} ${e.sent.toLocaleString()} / ${e.total.toLocaleString()} B`;
			}) : e.path;
			await this.client.start(this.target(t), n, e.options), this.closeDialog();
		}, (e) => ["prepare", "running"].includes(e.status));
	}
	render() {
		let e = this.printers, t = e.find((e) => e.id === this._selected);
		return N`<div class="shell">
      <header class="topbar"><div class="brand"><span class="brand-mark">${$("printer")}</span><div><div class="brand-title">${this._config.title || "Bambu Dashboard"}</div><div class="brand-subtitle">HOME ASSISTANT · PRINT WORKSPACE</div></div></div>
      <div class="top-actions"><span class="connection"><span class="dot ${this._catalogState.error ? "failed" : "ready"}"></span>ha-bambulab</span><button class="icon-button" aria-label=${this.t("refresh")} @click=${() => this._hass && void Ge(this._hass).refresh()}>${$("refresh")}</button></div></header>
      <div class="workspace">${this.renderSidebar(e)}<main class="main">
        <div class="mobile-picker"><select aria-label=${this.t("printers")} data-value=${this._selected || ""} @change=${(e) => this.selectPrinter(e.target.value || null)}><option value="">${this.t("allPrinters")}</option>${e.map((e) => N`<option value=${e.id}>${e.name}</option>`)}</select></div>
        <div class="page-heading"><div><div class="eyebrow">${t ? t.model : "YOUR PRINT FARM"}</div><h1>${t?.name || this.t("workspace")}</h1><p class="description">${t ? `${this.status(t)} · ${this.value(t.stage)}` : this.t("subtitle")}</p></div>
        <div class="stats"><span class="stat"><b>${e.length}</b>${this.t("printers")}</span><span class="stat"><b>${e.filter((e) => e.status === "running").length}</b>${this.t("printing")}</span></div></div>
        ${this.renderBanners()}
        ${this._catalogState.error ? N`<div class="banner error">${$("alert")}<div>${this.t("registryError")}: ${this._catalogState.error.message}</div></div>` : F}
        <nav class="tabs" aria-label="Workspace">${[
			"overview",
			"ams",
			"files",
			"parameters"
		].map((e, t) => N`<button class=${this._tab === e ? "active" : ""} @click=${() => this.setTab(e)}>${$([
			"grid",
			"spool",
			"folder",
			"tune"
		][t])}${this.t(e)}</button>`)}</nav>
        ${this._catalogState.loading && !this._catalogState.snapshot ? this.renderEmpty("refresh", this.t("discover")) : e.length ? this.renderContent(t) : this.renderEmpty("printer", this.t("noPrinters"))}
      </main></div></div>${this.renderDialog()}`;
	}
	renderSidebar(e) {
		return N`<aside class="sidebar"><div class="sidebar-label">WORKSPACE</div><button class=${this._selected ? "" : "selected"} @click=${() => this.selectPrinter(null)}>${$("grid")}${this.t("allPrinters")}</button><div class="sidebar-rule"></div><div class="sidebar-label">${this.t("printers")}</div>
      ${He(e, (e) => e.id, (e) => N`<button class="printer-link ${this._selected === e.id ? "selected" : ""}" @click=${() => this.selectPrinter(e.id)}>${$("printer")}<span class="name">${e.name}<small class="model">${e.model}</small></span><span class="dot ${e.status}"></span></button>`)}
      <div class="sidebar-foot">Bambu Dashboard Card<br>v0.1 · Community project</div></aside>`;
	}
	renderBanners() {
		return N`${this._error ? N`<div class="banner error" role="alert">${$("alert")}<div class="copy">${this._error}</div><button class="icon-button" aria-label=${this.t("close")} @click=${() => {
			this._error = "";
		}}>${$("close")}</button></div>` : F}
      ${this._notice ? N`<div class="banner notice" role="status">${$("check")}<div class="copy">${this._notice}</div><button class="icon-button" aria-label=${this.t("close")} @click=${() => {
			this._notice = "";
		}}>${$("close")}</button></div>` : F}
      ${[...this._pending].map(([e, t]) => N`<div class="banner notice" role="status">${$("clock")}<div class="copy"><b>${t.name}</b><br>${t.phase === "request" ? this._transfer || this.t("loading") : this.t("submitted")}</div>${t.phase === "submitted" ? N`<button class="button small" @click=${() => this.clearPending(e)}>${this.t("dismiss")}</button>` : F}</div>`)}`;
	}
	renderEmpty(e, t) {
		return N`<div class="panel empty">${$(e)}<p>${t}</p></div>`;
	}
	renderContent(e) {
		return this._tab === "files" ? this.renderFiles() : this._tab === "parameters" ? this.renderParameters() : this._tab === "ams" ? N`${this.currentPrinters.map((e) => this.renderAms(e, !0))}` : e ? this.renderDetail(e) : N`<div class="printer-grid">${He(this.printers, (e) => e.id, (e) => this.renderTile(e))}</div>`;
	}
	renderTile(e) {
		let t = U(V(e.entities, "subtask_name"));
		return N`<article class="panel printer-card"><button class="card-heading" @click=${() => this.selectPrinter(e.id)}><span class="machine-badge">${$("printer")}</span><span class="heading-copy"><b>${e.name}</b><small>${e.model}</small></span>${this.statusBadge(e)}</button>
      <div class="preview">${Zt()}${e.camera && H(e.camera) ? N`<bambu-dashboard-camera .hass=${this._hass} .entity=${e.camera.entry.entity_id}></bambu-dashboard-camera>` : F}<span class="preview-caption">${e.camera ? this.t("camera") : this.t("unsupported")}</span></div>
      <div class="tile-content"><div class="task-line">${$("folder")}<span>${t || this.t("noTask")}</span></div>${this.progress(e)}<div class="tile-metrics"><div><span>${this.t("remaining")}</span><strong>${this.sensor(e, "remaining_time")}</strong></div><div><span>${this.t("nozzle")}</span><strong>${this.sensor(e, "nozzle_temp")}</strong></div><div><span>${this.t("bed")}</span><strong>${this.sensor(e, "bed_temp")}</strong></div></div>
      <div class="tile-footer"><div class="filament-dots">${e.ams.flatMap((e) => e.slots).map(({ entity: e }) => N`<span title=${Ye(e)} class="filament-dot ${e.state?.attributes.active ? "active" : ""}" style=${`--filament:${nt(e.state?.attributes.color) || "transparent"}`}></span>`)}</div><button class="button small" @click=${() => this.selectPrinter(e.id)}>${this.t("details")}${$("arrow")}</button></div></div></article>`;
	}
	renderDetail(e) {
		return N`<div class="detail-grid"><section class="panel"><div class="panel-head"><h2>${$("camera")} ${this.t("camera")}</h2><span class="description">${e.camera && Number(e.camera.state?.attributes.supported_features) & 2 ? this.t("live") : this.t("snapshot")}</span></div><div class="camera-large">${e.camera ? N`<bambu-dashboard-camera .hass=${this._hass} .entity=${e.camera.entry.entity_id}></bambu-dashboard-camera>` : N`${Zt()}<span class="preview-caption">${this.t("unsupported")}</span>`}</div></section>
      <section class="panel"><div class="panel-head"><h2>${this.t("controls")}</h2>${this.statusBadge(e)}</div><div class="panel-body"><div class="job-top">${e.cover && U(e.cover) ? N`<div class="job-cover"><bambu-dashboard-file-image .hass=${this._hass} .entity=${e.cover.entry.entity_id} .version=${U(e.cover) || ""}></bambu-dashboard-file-image></div>` : F}<div><div class="eyebrow">${this.t("task")}</div><div class="job-name">${U(V(e.entities, "subtask_name")) || this.t("noTask")}</div></div></div>${this.progress(e)}<div class="job-summary"><div><span>${this.t("remaining")}</span><b>${this.sensor(e, "remaining_time")}</b></div><div><span>${this.t("layers")}</span><b>${this.sensor(e, "current_layer")} / ${this.sensor(e, "total_layers")}</b></div></div>${this.renderControls(e)}</div></section></div>
      <div class="metric-grid">${[
			[
				"nozzle",
				"nozzle_temp",
				"target_nozzle_temp"
			],
			[
				"bed",
				"bed_temp",
				"target_bed_temp"
			],
			[
				"fan",
				"cooling_fan_speed",
				""
			],
			[
				"weight",
				"print_weight",
				""
			],
			[
				"length",
				"print_length",
				""
			]
		].map(([t, n, r]) => N`<div class="panel metric"><div class="metric-top">${$(t === "nozzle" || t === "bed" ? "heat" : "tune")}${this.t(t)}</div><strong>${this.sensor(e, n)}</strong>${r ? N`<small>→ ${this.sensor(e, r)}</small>` : F}</div>`)}</div>${this.renderAms(e, !1)}`;
	}
	renderControls(e) {
		let t = this._pending.has(e.id), n = e.speed?.state?.attributes.options;
		return N`<button class="button primary" style="width:100%" ?disabled=${!W(e) || t} @click=${() => void this.openStart(e)}>${$("play")}${this.t("start")}</button><div class="control-row"><button class="button" ?disabled=${t || !(e.status === "running" ? H(e.pause) : e.status === "pause" && H(e.resume))} @click=${() => this.press(e, e.status === "pause" ? "resume" : "pause")}>${$(e.status === "pause" ? "play" : "pause")}${this.t(e.status === "pause" ? "resumeAction" : "pauseAction")}</button><button class="button danger" ?disabled=${t || !["running", "pause"].includes(e.status) || !H(e.stop)} @click=${() => this.press(e, "stop")}>${$("stop")}${this.t("stopAction")}</button></div>
      <div class="control-divider"></div><label class="field"><span>${this.t("speed")}</span><select data-value=${U(e.speed) || ""} ?disabled=${t || e.status !== "running" || !H(e.speed)} @change=${(t) => {
			let n = t.target.value;
			this.runAction(e.id, `${e.name} · ${this.t("speed")}`, (e) => this.client.speed(e, n), (e) => U(e.speed) === n);
		}}><option value="" disabled>${this.value(e.speed)}</option>${Array.isArray(n) ? n.map((e) => N`<option value=${String(e)}>${String(e)}</option>`) : F}</select></label><div class="helper">${this.t("speedHelp")}</div>
      <div class="control-divider"></div><div class="light-control"><span>${$("light")} ${this.t("light")}</span><button class="button small ${U(e.light) === "on" ? "on" : ""}" ?disabled=${t || !H(e.light) || !["on", "off"].includes(U(e.light) || "")} @click=${() => {
			let t = U(e.light) === "on" ? "off" : "on";
			this.runAction(e.id, `${e.name} · ${this.t("light")}`, (e) => this.client.light(e), (e) => U(e.light) === t);
		}}>${U(e.light) === "on" ? this.t("on") : U(e.light) === "off" ? this.t("off") : this.value(e.light)}</button></div><div class="helper">${this.t("lightHelp")}</div>`;
	}
	renderAms(e, t) {
		return e.ams.length ? N`${e.ams.map((n) => this.renderAmsUnit(e, n, t))}` : N`<div class="ams-section">${this.renderEmpty("spool", `${t ? `${e.name} · ` : ""}${this.t("noAms")}`)}</div>`;
	}
	renderAmsUnit(e, t, n) {
		let r = V(t.entities, "humidity"), i = V(t.entities, "ams_temp");
		return N`<section class="panel ams-section"><div class="panel-head"><h2>${$("spool")} ${n ? `${e.name} · ` : ""}${t.external ? this.t("external") : t.device.name_by_user || t.device.model}</h2><span class="description">${t.slots.length} ${t.external ? "" : "slots"}</span></div><div class="ams-grid">${t.slots.map(({ index: e, entity: n }) => {
			let r = n.state?.attributes || {}, i = rt(n);
			return N`<div class="spool ${r.active === !0 ? "active" : ""}" style=${`--filament:${nt(r.color) || "var(--bd-raised)"}`}><div class="spool-index">${t.external ? this.t("external") : `SLOT ${String(e).padStart(2, "0")}`}</div>${r.active === !0 ? N`<span class="active-label">● ${this.t("active")}</span>` : F}<div class="spool-visual"></div><h3>${r.empty === !0 ? this.t("empty") : this.value(n)}</h3><div class="material">${typeof r.type == "string" ? r.type : "—"} ${nt(r.color) || ""}</div><div class="remain">${i === null ? this.t("remainingUnknown") : `${i}%`}</div></div>`;
		})}</div>${r || i ? N`<div class="ams-extra">${r ? N`<span>${this.t("humidity")}: ${this.value(r)}</span>` : F}${i ? N`<span>${this.t("temperature")}: ${this.value(i)}</span>` : F}</div>` : F}</section>`;
	}
	renderFiles() {
		let e = this._files?.filter((e) => !this._selected || e.printer_device_id === this._selected);
		return N`<div class="section-heading"><div><h2>${this.t("cachedFiles")}</h2><p class="description">${this.t("cacheHelp")}</p></div><button class="button small" ?disabled=${this._filesLoading} @click=${() => void this.loadFiles()}>${$("refresh")}${this.t("refresh")}</button></div>
      ${this._filesError ? N`<div class="banner error" style="margin-top:18px" role="alert">${$("alert")}<div>${this._filesError}</div></div>` : F}
      ${this._filesLoading ? this.renderEmpty("refresh", this.t("loading")) : e?.length ? N`<section class="panel file-list">${e.map((e) => {
			let t = this.printers.find((t) => t.id === (this._selected || e.printer_device_id)), n = t && W(t) ? t : this.printers.find((e) => W(e) && !this._pending.has(e.id));
			return N`<div class="file-row"><div class="file-preview">${e.thumbnail_path ? N`<bambu-dashboard-file-image .hass=${this._hass} .path=${e.thumbnail_path}></bambu-dashboard-file-image>` : $("folder")}</div><div><div class="file-title">${e.filename}</div><div class="file-meta"><span>${e.printer_name}</span><span>${e.size_human || `${e.size.toLocaleString()} B`}</span><span>${this.date(e.modified)}</span></div></div><div class="file-actions"><button class="icon-button" aria-label=${this.t("download")} @click=${() => void this.download(e)}>${$("download")}</button><button class="button small" ?disabled=${!n || !W(n) || this._pending.has(n.id)} @click=${() => n && void this.openStart(n, e)}>${$("play")}${this.t("printAgain")}</button></div></div>`;
		})}</section>` : this._filesError ? F : this.renderEmpty("folder", this.t("noFiles"))}`;
	}
	date(e) {
		if (!e) return "—";
		let t = new Date(e);
		return Number.isNaN(t.getTime()) ? e : new Intl.DateTimeFormat(this.language, {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: this._hass?.config?.time_zone
		}).format(t);
	}
	renderParameters() {
		let e = this._search.toLocaleLowerCase(), t = this.currentPrinters.flatMap((e) => e.allEntities.map((t) => ({
			printer: e,
			entity: t
		}))).filter(({ printer: t, entity: n }) => `${t.name} ${Ye(n)} ${n.entry.entity_id} ${n.state?.state || ""}`.toLocaleLowerCase().includes(e));
		return N`<div class="section-heading"><div><h2>${this.t("parameters")}</h2><p class="description">${t.length} entities · ha-bambulab</p></div></div><label class="search-box">${$("search")}<input aria-label=${this.t("search")} placeholder=${this.t("search")} .value=${this._search} @input=${(e) => {
			this._search = e.target.value;
		}}/></label>
      ${t.length ? N`<section class="panel" style="overflow-x:auto"><table class="parameter-table"><thead><tr><th>${this.t("entity")}</th><th>${this.t("value")}</th><th>${this.t("details")}</th></tr></thead><tbody>${He(t, ({ entity: e }) => e.entry.entity_id, ({ printer: e, entity: t }) => N`<tr><td><div class="entity-name">${Ye(t)}</div><div class="entity-id">${e.name} · ${Ke(t.entry.entity_id)}</div></td><td><span class="entity-value">${this.value(t)}</span></td><td><details><summary>${this.t("attributes")}</summary><div class="entity-id">${t.entry.entity_id}</div><dl class="attribute-grid"><dt>${this.t("updated")}</dt><dd>${this.date(t.state?.last_updated)}</dd>${Object.entries($e(t)).map(([e, t]) => N`<dt>${e}</dt><dd>${typeof t == "object" ? JSON.stringify(t, null, 2) : String(t)}</dd>`)}</dl><button class="button small" @click=${() => this.dispatchEvent(new CustomEvent("hass-more-info", {
			detail: { entityId: t.entry.entity_id },
			bubbles: !0,
			composed: !0
		}))}>${this.t("details")}</button></details></td></tr>`)}</tbody></table></section>` : this.renderEmpty("search", this.t("noParameters"))}`;
	}
	renderDialog() {
		let e = this._dialog;
		if (!e) return F;
		let t = this.printers.find((t) => t.id === e.printerId);
		if (!t) return N`<div class="overlay"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-body">The target printer was removed.</div><div class="dialog-footer"><button class="button" @click=${() => this.closeDialog()}>${this.t("close")}</button></div></section></div>`;
		let n = this._pending.has(t.id), r = e.kind === "start" && e.metadata ? Wt(e.metadata, t.model, Je(V(t.entities, "nozzle_diameter"))).length > 0 : !1;
		return N`<div class="overlay" @keydown=${(e) => {
			e.key === "Escape" && !n && this.closeDialog();
		}}><section class="dialog" role="dialog" aria-modal="true" aria-label=${this.t(e.kind === "stop" ? "stopAction" : "start")}><div class="panel-head"><h2>${this.t(e.kind === "stop" ? "stopAction" : "start")}</h2><button class="icon-button" ?disabled=${n} aria-label=${this.t("close")} @click=${() => this.closeDialog()}>${$("close")}</button></div><div class="dialog-body"><div class="dialog-target"><div><span>${this.t("target")}</span><b>${t.name}</b></div><div><span>${t.model}</span><b>${this.sensor(t, "nozzle_diameter")}</b></div></div>
      ${e.kind === "stop" ? N`<p>${this.t("stopHelp")}</p>` : this.renderStartFields(t, e, n)}</div><div class="dialog-footer"><button class="button" ?disabled=${n} @click=${() => this.closeDialog()}>${this.t("cancel")}</button>${e.kind === "stop" ? N`<button class="button danger" ?disabled=${n} @click=${() => {
			this.closeDialog(), this.runAction(t.id, `${t.name} · ${this.t("stopAction")}`, (e) => this.client.press(e, "stop"), (e) => [
				"idle",
				"finish",
				"failed"
			].includes(e.status));
		}}>${this.t("stopAction")}</button>` : N`<button class="button primary" ?disabled=${n || r || e.loading || !(!e.file || e.metadata && !e.error) || !W(t)} @click=${() => void this.confirmStart()}>${$("play")}${this.t("confirmStart")}</button>`}</div></section></div>`;
	}
	renderStartFields(e, t, n) {
		if (t.loading) return N`<p>${this.t("checking")}</p>`;
		let r = t.metadata ? Wt(t.metadata, e.model, Je(V(e.entities, "nozzle_diameter"))) : [];
		return N`<label class="field"><span>${this.t("target")}</span><select aria-label=${this.t("target")} data-value=${e.id} ?disabled=${n} @change=${(e) => {
			this._dialog = {
				...t,
				printerId: e.target.value,
				error: "",
				acknowledged: !1,
				options: {
					...t.options,
					useAms: !1,
					amsMapping: ""
				}
			};
		}}>${this.printers.map((e) => N`<option value=${e.id} ?disabled=${!W(e) || this._pending.has(e.id)}>${e.name} · ${e.model}</option>`)}</select></label>
      ${t.error ? N`<div class="banner error" role="alert">${t.error}</div>` : F}${r.length ? N`<div class="banner error">${r.join(" ")}</div>` : F}
      ${t.file ? N`<div class="field"><span>${this.t("task")}</span><b>${t.file.filename}</b></div>` : N`<label class="field"><span>${this.t("sdPath")}</span><input placeholder="cache/project.3mf" .value=${t.path} ?disabled=${n} @input=${(e) => {
			this._dialog = {
				...t,
				path: e.target.value
			};
		}}/></label><label class="check"><input type="checkbox" .checked=${t.acknowledged} ?disabled=${n} @change=${(e) => {
			this._dialog = {
				...t,
				acknowledged: e.target.checked
			};
		}}/>${this.t("manualConfirm")}</label>`}
      <label class="field"><span>${this.t("plate")}</span>${t.metadata ? N`<select data-value=${String(t.options.plate)} ?disabled=${n} @change=${(e) => this.updateOptions({ plate: Number(e.target.value) })}>${t.metadata.plates.map((e) => N`<option value=${e.id}>${e.id} · ${e.name}</option>`)}</select>` : N`<input type="number" min="1" max="100" .value=${String(t.options.plate)} ?disabled=${n} @input=${(e) => this.updateOptions({ plate: Number(e.target.value) })}/>`}</label>
      <div class="two-fields">${[
			["bedLeveling", "bedLevel"],
			["timelapse", "timelapse"],
			["flowCalibration", "flowCali"],
			["vibrationCalibration", "vibrationCali"]
		].map(([e, r]) => N`<label class="check"><input type="checkbox" .checked=${!!t.options[e]} ?disabled=${n} @change=${(t) => this.updateOptions({ [e]: t.target.checked })}/>${this.t(r)}</label>`)}</div>
      ${e.ams.some((e) => !e.external) ? N`<div class="control-divider"></div><label class="check"><input type="checkbox" .checked=${t.options.useAms} ?disabled=${n} @change=${(e) => this.updateOptions({ useAms: e.target.checked })}/>${this.t("useAms")}</label>${t.options.useAms ? N`<label class="field"><span>${this.t("mapping")}</span><input placeholder="0,1,2" .value=${t.options.amsMapping} ?disabled=${n} @input=${(e) => this.updateOptions({ amsMapping: e.target.value })}/></label><p class="helper">${this.t("mappingHelp")}</p>` : F}` : F}
      <div class="control-divider"></div><p class="helper">${this.t("startHelp")}</p>${this._transfer ? N`<p class="progress-caption">${this._transfer}</p>` : F}`;
	}
};
customElements.define("bambu-dashboard-card", rn), window.customCards = window.customCards || [], window.customCards.push({
	type: "bambu-dashboard-card",
	name: "Bambu Dashboard",
	preview: !0,
	description: "Complete multi-printer workspace for ha-bambulab."
}), console.info("%c BAMBU DASHBOARD %c 0.1.0 ", "background:#28bb8b;color:#08291f;font-weight:bold;padding:4px", "background:#15201b;color:#cfe9de;padding:4px");
export { rn as BambuDashboardCard };
