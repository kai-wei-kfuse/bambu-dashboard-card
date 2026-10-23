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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, g = h.trustedTypes, _ = g ? g.emptyScript : "", ee = h.reactiveElementPolyfillSupport, v = (e, t) => e, te = {
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
}, ne = (e, t) => !l(e, t), re = {
	attribute: !0,
	type: String,
	converter: te,
	reflect: !1,
	useDefault: !1,
	hasChanged: ne
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = re) {
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
		return this.elementProperties.get(e) ?? re;
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
			let i = (n.converter?.toAttribute === void 0 ? te : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? te : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ne)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[v("elementProperties")] = /* @__PURE__ */ new Map(), y[v("finalized")] = /* @__PURE__ */ new Map(), ee?.({ ReactiveElement: y }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ie = globalThis, b = (e) => e, x = ie.trustedTypes, S = x ? x.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ae = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, oe = "?" + C, se = `<${oe}>`, w = document, T = () => w.createComment(""), E = (e) => e === null || typeof e != "object" && typeof e != "function", D = Array.isArray, ce = (e) => D(e) || typeof e?.[Symbol.iterator] == "function", le = "[ 	\n\f\r]", O = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, k = /-->/g, ue = />/g, A = RegExp(`>|${le}(?:([^\\s"'>=/]+)(${le}*=${le}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), de = /'/g, fe = /"/g, pe = /^(?:script|style|textarea|title)$/i, me = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), j = me(1), he = me(2), M = Symbol.for("lit-noChange"), N = Symbol.for("lit-nothing"), ge = /* @__PURE__ */ new WeakMap(), P = w.createTreeWalker(w, 129);
function _e(e, t) {
	if (!D(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return S === void 0 ? t : S.createHTML(t);
}
var ve = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = O;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === O ? c[1] === "!--" ? o = k : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = A) : (pe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = A) : o = ue : o === A ? c[0] === ">" ? (o = i ?? O, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? A : c[3] === "\"" ? fe : de) : o === fe || o === de ? o = A : o === k || o === ue ? o = O : (o = A, i = void 0);
		let d = o === A && e[t + 1].startsWith("/>") ? " " : "";
		a += o === O ? n + se : l >= 0 ? (r.push(s), n.slice(0, l) + ae + n.slice(l) + C + d) : n + C + (l === -2 ? t : d);
	}
	return [_e(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, ye = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ve(t, n);
		if (this.el = e.createElement(l, r), P.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = P.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ae)) {
					let t = u[o++], n = i.getAttribute(e).split(C), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ce : r[1] === "?" ? we : r[1] === "@" ? Te : Se
					}), i.removeAttribute(e);
				} else e.startsWith(C) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (pe.test(i.tagName)) {
					let e = i.textContent.split(C), t = e.length - 1;
					if (t > 0) {
						i.textContent = x ? x.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], T()), P.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], T());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === oe) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(C, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += C.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = w.createElement("template");
		return n.innerHTML = e, n;
	}
};
function F(e, t, n = e, r) {
	if (t === M) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = E(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = F(e, i._$AS(e, t.values), i, r)), t;
}
var be = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? w).importNode(t, !0);
		P.currentNode = r;
		let i = P.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new xe(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ee(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = P.nextNode(), a++);
		}
		return P.currentNode = w, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, xe = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = N, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = F(this, e, t), E(e) ? e === N || e == null || e === "" ? (this._$AH !== N && this._$AR(), this._$AH = N) : e !== this._$AH && e !== M && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ce(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== N && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(w.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = ye.createElement(_e(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new be(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ge.get(e.strings);
		return t === void 0 && ge.set(e.strings, t = new ye(e)), t;
	}
	k(t) {
		D(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(T()), this.O(T()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = b(e).nextSibling;
			b(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Se = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = N, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = N;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = F(this, e, t, 0), a = !E(e) || e !== this._$AH && e !== M, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = F(this, r[n + o], t, o), s === M && (s = this._$AH[o]), a ||= !E(s) || s !== this._$AH[o], s === N ? e = N : e !== N && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === N ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ce = class extends Se {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === N ? void 0 : e;
	}
}, we = class extends Se {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== N);
	}
}, Te = class extends Se {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = F(this, e, t, 0) ?? N) === M) return;
		let n = this._$AH, r = e === N && n !== N || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== N && (n === N || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Ee = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		F(this, e);
	}
}, De = {
	M: ae,
	P: C,
	A: oe,
	C: 1,
	L: ve,
	R: be,
	D: ce,
	V: F,
	I: xe,
	H: Se,
	N: we,
	U: Te,
	B: Ce,
	F: Ee
}, Oe = ie.litHtmlPolyfillSupport;
Oe?.(ye, xe), (ie.litHtmlVersions ??= []).push("3.3.3");
var ke = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new xe(t.insertBefore(T(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ae = globalThis, I = class extends y {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ke(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return M;
	}
};
I._$litElement$ = !0, I.finalized = !0, Ae.litElementHydrateSupport?.({ LitElement: I });
var je = Ae.litElementPolyfillSupport;
je?.({ LitElement: I }), (Ae.litElementVersions ??= []).push("4.2.2");
// node_modules/lit-html/directive.js
var Me = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Ne = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Pe = class {
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
}, { I: Fe } = De, Ie = (e) => e, Le = () => document.createComment(""), Re = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new Fe(r.insertBefore(Le(), i), r.insertBefore(Le(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Ie(e).nextSibling;
				Ie(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, L = (e, t, n = e) => (e._$AI(t, n), e), ze = {}, Be = (e, t = ze) => e._$AH = t, Ve = (e) => e._$AH, He = (e) => {
	e._$AR(), e._$AA.remove();
}, Ue = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, We = Ne(class extends Pe {
	constructor(e) {
		if (super(e), e.type !== Me.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = Ve(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = L(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = L(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = L(i[d], a[m]), Re(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = L(i[f], a[p]), Re(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = Ue(o, p, m), u = Ue(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = Re(e, i[d]);
					L(t, a[p]), c[p] = t;
				} else c[p] = L(n, a[p]), Re(e, i[d], n), i[t] = null;
				p++;
			} else He(i[f]), f--;
		} else He(i[d]), d++;
		for (; p <= m;) {
			let t = Re(e, c[m + 1]);
			L(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && He(e);
		}
		return this.ut = o, Be(e, c), M;
	}
}), Ge = "0.1.0", Ke = class {
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
				error: R(t)
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
				error: R(n)
			});
		}
	}
}, qe = /* @__PURE__ */ new WeakMap();
function Je(e) {
	let t = qe.get(e.connection);
	return t || (t = new Ke(e), qe.set(e.connection, t)), t.updateHass(e), t;
}
function R(e) {
	return e instanceof Error ? e : typeof e == "object" && e && "message" in e ? Error(String(e.message)) : Error(String(e));
}
// src/domain/printers.ts
function Ye(e) {
	return e.split(".")[0];
}
function Xe(e, t) {
	if (e.translation_key === t) return !0;
	let n = e.unique_id?.toLowerCase();
	return t === "printing_speed" ? n?.endsWith("_speed") === !0 : n?.endsWith(`_${t.toLowerCase()}`) === !0;
}
function z(e, t, n = "sensor", r = {}) {
	return e.find(({ entry: e }) => (r.includeDisabled || !e.disabled_by) && Ye(e.entity_id) === n && Xe(e, t));
}
function Ze(e) {
	return e ? e.entry.disabled_by ? "disabled" : e.state ? e.state.state === "unavailable" || e.state.state === "unknown" ? e.state.state : "ready" : "notLoaded" : "unsupported";
}
function B(e) {
	return !(!e?.state || e.entry.disabled_by || e.state.state === "unavailable");
}
function V(e) {
	let t = e?.state?.state;
	return t === void 0 || t === "unknown" || t === "unavailable" ? null : t;
}
function Qe(e) {
	let t = V(e);
	if (t === null || t.trim() === "") return null;
	let n = Number(t);
	return Number.isFinite(n) ? n : null;
}
function $e(e) {
	let t = z(e.entities, "speed_profile");
	if (!t || V(t) === null) return null;
	let n = t.state.attributes.modifier;
	return typeof n == "number" && Number.isFinite(n) && n >= 0 ? n : null;
}
function et(e) {
	return e.entry.name || e.entry.original_name || String(e.state?.attributes.friendly_name || e.entry.translation_key || e.entry.entity_id);
}
function tt(e) {
	let t = e.entry.unique_id?.match(/_tray_(\d+)$/i);
	if (t) return Number(t[1]);
	let n = e.state?.attributes.slot;
	return typeof n == "number" && Number.isInteger(n) ? n + 1 : void 0;
}
function nt(e, t) {
	let n = [e], r = /* @__PURE__ */ new Set([e]), i = [];
	for (; n.length;) {
		let e = n.shift();
		for (let a of t) a.via_device_id !== e || r.has(a.id) || (r.add(a.id), n.push(a.id), i.push(a));
	}
	return i;
}
function rt(e, t, n) {
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
	return e.devices.filter((e) => !e.disabled_by && z(r.get(e.id) || [], "print_status")).filter((e) => n.discovery !== "selected" || i.includes(e.id)).map((t) => {
		let n = r.get(t.id) || [], i = nt(t.id, e.devices), a = i.filter((e) => /ams|external spool/i.test(e.model || "")).map((e) => {
			let t = r.get(e.id) || [], n = /external spool/i.test(e.model || ""), i = t.filter(({ entry: e }) => Ye(e.entity_id) === "sensor").map((e) => ({
				entity: e,
				index: tt(e)
			})).filter((e) => e.index !== void 0).sort((e, t) => e.index - t.index);
			if (n) {
				let e = t.find(({ entry: e }) => Ye(e.entity_id) === "sensor");
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
		}), o = V(z(n, "print_status"))?.toLowerCase() || z(n, "print_status")?.state?.state || "unknown", s = t.name_by_user || t.name || t.model || "Bambu Lab";
		return {
			id: t.id,
			device: t,
			name: V(z(n, "printer_name"))?.trim() || s,
			haName: s,
			model: t.model || "Unknown",
			serial: t.identifiers?.find(([e]) => e === "bambu_lab")?.[1] || t.serial_number || void 0,
			entities: n,
			allEntities: [...n, ...i.flatMap((e) => r.get(e.id) || [])],
			ams: a,
			status: o,
			stage: z(n, "stage"),
			progress: Qe(z(n, "print_progress")),
			camera: z(n, "camera", "camera"),
			light: z(n, "chamber_light", "light") || z(n, "camera_light", "light"),
			speed: z(n, "printing_speed", "select"),
			cover: z(n, "cover_image", "image"),
			pause: z(n, "pause", "button"),
			resume: z(n, "resume", "button"),
			stop: z(n, "stop", "button")
		};
	}).sort((e, t) => {
		if (i.length) {
			let n = i.indexOf(e.id), r = i.indexOf(t.id);
			if (n !== r) return (n < 0 ? Infinity : n) - (r < 0 ? Infinity : r);
		}
		return e.name.localeCompare(t.name);
	});
}
function H(e) {
	return [
		"idle",
		"finish",
		"finished",
		"failed"
	].includes(e.status);
}
function it(e) {
	return Object.fromEntries(Object.entries(e.state?.attributes || {}).filter(([e]) => !at(e)).map(([e, t]) => [e, ot(t)]));
}
function at(e) {
	return /token|password|secret|credential|authorization|api_key/i.test(e);
}
function ot(e) {
	return Array.isArray(e) ? e.map(ot) : typeof e == "object" && e ? Object.fromEntries(Object.entries(e).filter(([e]) => !at(e)).map(([e, t]) => [e, ot(t)])) : typeof e == "string" && /^(https?:\/\/|\/)/i.test(e) ? e.replace(/([?&](?:[^=&]*(?:token|password|secret|credential|authorization|api_key)[^=&]*)=)[^&#]*/gi, "$1[redacted]") : e;
}
function st(e) {
	return typeof e == "string" && /^#[\da-f]{6}([\da-f]{2})?$/i.test(e) ? e : void 0;
}
function ct(e) {
	let t = e.state?.attributes;
	return !t?.remain_enabled || typeof t.remain != "number" ? null : t.remain >= 0 && t.remain <= 100 ? t.remain : null;
}
// node_modules/fflate/esm/browser.js
var U = Uint8Array, lt = Uint16Array, ut = Int32Array, dt = new U([
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
]), ft = new U([
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
]), pt = new U([
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
]), mt = function(e, t) {
	for (var n = new lt(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new ut(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, ht = mt(dt, 2), gt = ht.b, _t = ht.r;
gt[28] = 258, _t[258] = 28;
var vt = mt(ft, 0), yt = vt.b;
vt.r;
for (var bt = new lt(32768), W = 0; W < 32768; ++W) {
	var G = (W & 43690) >> 1 | (W & 21845) << 1;
	G = (G & 52428) >> 2 | (G & 13107) << 2, G = (G & 61680) >> 4 | (G & 3855) << 4, bt[W] = ((G & 65280) >> 8 | (G & 255) << 8) >> 1;
}
for (var xt = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new lt(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new lt(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new lt(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[bt[d] >> c] = l;
	} else for (s = new lt(r), i = 0; i < r; ++i) e[i] && (s[i] = bt[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), St = new U(288), W = 0; W < 144; ++W) St[W] = 8;
for (var W = 144; W < 256; ++W) St[W] = 9;
for (var W = 256; W < 280; ++W) St[W] = 7;
for (var W = 280; W < 288; ++W) St[W] = 8;
for (var Ct = new U(32), W = 0; W < 32; ++W) Ct[W] = 5;
var wt = /*#__PURE__*/ xt(St, 9, 1), Tt = /*#__PURE__*/ xt(Ct, 5, 1), Et = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, K = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, Dt = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, Ot = function(e) {
	return (e + 7) / 8 | 0;
}, kt = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new U(e.subarray(t, n));
}, At = [
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
], q = function(e, t, n) {
	var r = Error(t || At[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, q), !n) throw r;
	return r;
}, jt = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new U(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new U(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new U(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = K(e, d, 1);
			var ee = K(e, d + 1, 3);
			if (d += 3, !ee) {
				var v = Ot(d) + 4, te = e[v - 4] | e[v - 3] << 8, ne = v + te;
				if (ne > i) {
					c && q(0);
					break;
				}
				s && l(f + te), n.set(e.subarray(v, ne), f), t.b = f += te, t.p = d = ne * 8, t.f = u;
				continue;
			}
			if (ee == 1) p = wt, m = Tt, h = 9, g = 5;
			else if (ee == 2) {
				var re = K(e, d, 31) + 257, y = K(e, d + 10, 15) + 4, ie = re + K(e, d + 5, 31) + 1;
				d += 14;
				for (var b = new U(ie), x = new U(19), S = 0; S < y; ++S) x[pt[S]] = K(e, d + S * 3, 7);
				d += y * 3;
				for (var ae = Et(x), C = (1 << ae) - 1, oe = xt(x, ae, 1), S = 0; S < ie;) {
					var se = oe[K(e, d, C)];
					d += se & 15;
					var v = se >> 4;
					if (v < 16) b[S++] = v;
					else {
						var w = 0, T = 0;
						for (v == 16 ? (T = 3 + K(e, d, 3), d += 2, w = b[S - 1]) : v == 17 ? (T = 3 + K(e, d, 7), d += 3) : v == 18 && (T = 11 + K(e, d, 127), d += 7); T--;) b[S++] = w;
					}
				}
				var E = b.subarray(0, re), D = b.subarray(re);
				h = Et(E), g = Et(D), p = xt(E, h, 1), m = xt(D, g, 1);
			} else q(1);
			if (d > _) {
				c && q(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var ce = (1 << h) - 1, le = (1 << g) - 1, O = d;; O = d) {
			var w = p[Dt(e, d) & ce], k = w >> 4;
			if (d += w & 15, d > _) {
				c && q(0);
				break;
			}
			if (w || q(2), k < 256) n[f++] = k;
			else if (k == 256) {
				O = d, p = null;
				break;
			} else {
				var ue = k - 254;
				if (k > 264) {
					var S = k - 257, A = dt[S];
					ue = K(e, d, (1 << A) - 1) + gt[S], d += A;
				}
				var de = m[Dt(e, d) & le], fe = de >> 4;
				de || q(3), d += de & 15;
				var D = yt[fe];
				if (fe > 3) {
					var A = ft[fe];
					D += Dt(e, d) & (1 << A) - 1, d += A;
				}
				if (d > _) {
					c && q(0);
					break;
				}
				s && l(f + 131072);
				var pe = f + ue;
				if (f < D) {
					var me = a - D, j = Math.min(D, pe);
					for (me + f < 0 && q(3); f < j; ++f) n[f] = r[me + f];
				}
				for (; f < pe; ++f) n[f] = n[f - D];
			}
		}
		t.l = p, t.p = O, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? kt(n, 0, f) : n.subarray(0, f);
}, Mt = /*#__PURE__*/ new U(0), J = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, Y = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, Nt = function(e, t) {
	return Y(e, t) + Y(e, t + 4) * 4294967296;
};
function Pt(e, t) {
	return jt(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var Ft = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	Ft.decode(Mt, { stream: !0 });
} catch {}
var It = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: kt(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function Lt(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	}
	if (Ft) return Ft.decode(e);
	var i = It(e), a = i.s, n = i.r;
	return n.length && q(8), a;
}
var Rt = function(e, t) {
	return t + 30 + J(e, t + 26) + J(e, t + 28);
}, zt = function(e, t, n) {
	var r = J(e, t + 28), i = J(e, t + 30), a = Lt(e.subarray(t + 46, t + 46 + r), !(J(e, t + 8) & 2048)), o = t + 46 + r, s = Bt(e, o, i, n, Y(e, t + 20), Y(e, t + 24), Y(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		J(e, t + 10),
		c,
		l,
		a,
		o + i + J(e, t + 32),
		u
	];
}, Bt = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + J(e, t + 2)) if (J(e, t) == 1) return [
			s ? Nt(e, t + 4 + 8 * c) : i,
			c ? Nt(e, t + 4) : a,
			l ? Nt(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && q(13);
	}
	return [
		i,
		a,
		o,
		0
	];
};
function Vt(e, t) {
	for (var n = {}, r = e.length - 22; Y(e, r) != 101010256; --r) (!r || e.length - r > 65558) && q(13);
	var i = J(e, r + 8);
	if (!i) return {};
	var a = Y(e, r + 16), o = Y(e, r - 20) == 117853008;
	if (o) {
		var s = Y(e, r - 12);
		o = Y(e, s) == 101075792, o && (i = Y(e, s + 32), a = Y(e, s + 48));
	}
	for (var c = t && t.filter, l = 0; l < i; ++l) {
		var u = zt(e, a, o), d = u[0], f = u[1], p = u[2], m = u[3], h = u[4], g = u[5], _ = Rt(e, g);
		a = h, (!c || c({
			name: m,
			size: f,
			originalSize: p,
			compression: d
		})) && (d ? d == 8 ? n[m] = Pt(e.subarray(_, _ + f), { out: new U(p) }) : q(14, "unknown compression type " + d) : n[m] = kt(e, _, _ + f));
	}
	return n;
}
// src/domain/projects.ts
function Ht(e) {
	let t = e.split("/");
	if (t.length < 3 || t[1] !== "prints" || t.some((e) => !e || e === "." || e === ".." || /[\\\0]/.test(e))) throw Error("Invalid cached project path.");
	return {
		serial: t[0],
		relative: t.slice(1).join("/"),
		remote: t.slice(2).join("/")
	};
}
function Ut(e) {
	let t = e.split("/");
	if (t.length < 2 || t.some((e) => !e || e === "." || e === ".." || /[\\\0]/.test(e))) throw Error("Invalid cached file path.");
	return `/api/bambu_lab/file_cache/${t.map(encodeURIComponent).join("/")}`;
}
function Wt(e) {
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
		return Ht(t.path), t;
	});
}
function Gt(e) {
	let t = new DOMParser().parseFromString(e, "application/xml");
	if (t.querySelector("parsererror")) throw Error("The 3MF contains invalid metadata XML.");
	return t;
}
function Kt(e, t) {
	let n = Array.from(e.querySelectorAll("metadata")).find((e) => e.getAttribute("key") === t);
	return n?.getAttribute("value") || n?.textContent || null;
}
function qt(e) {
	return (Array.isArray(e) ? e : typeof e == "string" ? e.split(/[;,]/) : []).map(Number).filter((e) => Number.isFinite(e) && e > 0);
}
function Jt(e) {
	let t = /* @__PURE__ */ new Set(), n = Vt(e, { filter: (e) => {
		let n = e.name.match(/^Metadata\/plate_(\d+)\.gcode$/i);
		return n && t.add(Number(n[1])), [
			"Metadata/project_settings.config",
			"Metadata/model_settings.config",
			"Metadata/slice_info.config"
		].includes(e.name);
	} });
	if (!t.size) throw Error("This is not a sliced 3MF project: no printable G-code plates were found.");
	let r = n["Metadata/project_settings.config"] ? JSON.parse(Lt(n["Metadata/project_settings.config"])) : void 0, i = n["Metadata/model_settings.config"] ? Gt(Lt(n["Metadata/model_settings.config"])) : void 0, a = n["Metadata/slice_info.config"] ? Gt(Lt(n["Metadata/slice_info.config"])) : void 0, o = typeof r?.printer_model == "string" ? r.printer_model : null, s = qt(r?.nozzle_diameter);
	if (!s.length && a) for (let e of a.querySelectorAll("nozzle")) s.push(...qt(e.getAttribute("nozzle_diameter")));
	let c = [...t].sort((e, t) => e - t).map((e) => {
		let t = Array.from(i?.querySelectorAll("plate") || []).find((t) => Number(Kt(t, "plater_id")) === e), n = Array.from(a?.querySelectorAll("plate") || []).find((t) => Number(Kt(t, "index") || t.getAttribute("id")) === e), r = Array.from(n?.querySelectorAll("filament") || []).map((e) => ({
			id: Number(e.getAttribute("id")),
			type: e.getAttribute("type") || "",
			color: e.getAttribute("color") || ""
		}));
		return {
			id: e,
			name: t && Kt(t, "plater_name") || `Plate ${e}`,
			filaments: r
		};
	});
	return {
		model: o,
		nozzles: [...new Set(s)],
		plates: c
	};
}
function Yt(e) {
	let t = e.toLowerCase().replace(/bambu\s*lab/g, "").replace(/[^a-z0-9]/g, "");
	return {
		x1carbon: "x1c",
		x1carboncombo: "x1c"
	}[t] || t;
}
function Xt(e, t, n) {
	let r = [];
	return e.model ? Yt(e.model) !== Yt(t) && r.push(`Project model ${e.model} does not match target ${t}.`) : r.push("Project printer model is missing. Re-slice the project with printer metadata."), e.nozzles.length ? n === null ? r.push("Target printer nozzle diameter is unknown.") : e.nozzles.some((e) => e !== n) && r.push(`Project nozzle ${e.nozzles.join("/")} mm does not match target ${n} mm.`) : r.push("Project nozzle diameter is missing."), r;
}
function Zt(e, t) {
	if (!Number.isInteger(e.plate) || e.plate < 1 || e.plate > 100) throw Error("Plate must be an integer from 1 to 100.");
	if (t && !t.some((t) => t.id === e.plate)) throw Error("The selected plate has no sliced G-code.");
	if (e.useAms && !/^-?\d+(,-?\d+)*$/.test(e.amsMapping)) throw Error("Choose the AMS mapping for every project filament.");
	if (e.useAms && e.amsMapping.split(",").some((e) => !Number.isSafeInteger(Number(e)) || Number(e) < -1)) throw Error("AMS mapping accepts non-negative slot IDs or the -1 sentinel.");
}
function Qt(e, t) {
	if (t.status === "use_legacy_path") {
		if (!t.detail) throw Error("The integration did not return the legacy project path.");
		let e = t.detail.replace(/^\//, "");
		if (!e || e.split("/").some((e) => e === ".." || e === "." || !e) || /[\\\0]/.test(e)) throw Error("The integration returned an unsafe legacy project path.");
		return e;
	}
	if (t.status !== "present" && t.status !== "uploaded") throw Error(t.detail || `Unexpected file-check result: ${t.status}`);
	return Ht(e.path).remote;
}
// src/ha/client.ts
var $t = class {
	constructor(e) {
		this.hass = e;
	}
	async files() {
		try {
			return Wt(await this.hass.callApi("GET", "bambu_lab/print_history"));
		} catch (e) {
			let t = R(e).message;
			throw Error(`Cannot load cached projects. This requires the ha-bambulab cached-file API. ${t}`);
		}
	}
	async fileBytes(e) {
		if (typeof this.hass.fetchWithAuth != "function") throw Error("This HA frontend does not expose authenticated file requests.");
		let t = await this.hass.fetchWithAuth(Ut(e));
		if (!t.ok) throw Error(`Cached file request failed: HTTP ${t.status}.`);
		return new Uint8Array(await t.arrayBuffer());
	}
	async press(e, t) {
		let n = t === "pause" ? e.status === "running" : t === "resume" ? e.status === "pause" : ["running", "pause"].includes(e.status), r = e[t];
		if (!n || !B(r)) throw Error(`${t} is not available in the printer's current state.`);
		this.assertOwner(e, r), await this.hass.callService("button", "press", { entity_id: r.entry.entity_id });
	}
	async light(e) {
		let t = e.light;
		if (!B(t) || !["on", "off"].includes(t.state.state)) throw Error("Light state is unavailable.");
		this.assertOwner(e, t), await this.hass.callService("light", t.state.state === "on" ? "turn_off" : "turn_on", { entity_id: t.entry.entity_id });
	}
	async speed(e, t) {
		let n = e.speed;
		if (e.status !== "running" || !B(n)) throw Error("Speed control is available while printing.");
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
		if (!H(e)) throw Error("The target printer is not idle.");
		if (Ht(t.path), !Number.isSafeInteger(t.size) || t.size <= 0) throw Error("Invalid cached-project size.");
		let r = e.serial, i = await this.hass.connection.subscribeEvents((e) => {
			let t = e.data;
			t.serial === r && typeof t.bytes_sent == "number" && typeof t.total == "number" && n?.({
				sent: t.bytes_sent,
				total: t.total
			});
		}, "bambu_upload_progress");
		try {
			return Qt(t, await this.hass.callApi("POST", "bambu_lab/ensure_cache_file", {
				serial: r,
				cache_path: t.path,
				expected_size: t.size
			}));
		} finally {
			i();
		}
	}
	async start(e, t, n) {
		if (!H(e)) throw Error("The target printer is not idle.");
		if (!t || t.startsWith("/") || t.split("/").some((e) => e === ".." || e === "." || !e) || /[\\\0]/.test(t)) throw Error("Enter a relative path to a sliced 3MF project on the printer SD card.");
		if (!t.toLowerCase().endsWith(".3mf")) throw Error("Printing requires a sliced .3mf project.");
		Zt(n), await this.hass.callService("bambu_lab", "print_project_file", {
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
}, en = {
	h: 36e5,
	min: 6e4,
	s: 1e3
};
function tn(e) {
	let t = z(e.entities, "remaining_time"), n = Qe(t), r = t?.state?.attributes.unit_of_measurement;
	if (n === null || n < 0 || typeof r != "string" || !Object.hasOwn(en, r)) return null;
	let i = n * en[r];
	return Number.isFinite(i) ? i : null;
}
function nn(e, t) {
	if (!["running", "prepare"].includes(e.status)) return null;
	let n = tn(e);
	if (n === null) return null;
	let r = t + n;
	return Number.isNaN(new Date(r).getTime()) ? null : r;
}
// src/domain/diagnostics.ts
function rn(e, t, n = "sensor") {
	return z(e.entities, t, n, { includeDisabled: !0 });
}
function an(e) {
	return Ze(e) === "ready" ? e.state.state === "on" || e.state.state !== "off" && null : null;
}
function on(e) {
	if (typeof e != "string") return;
	let t;
	try {
		t = new URL(e);
	} catch {
		return;
	}
	return t.origin === "https://wiki.bambulab.com" && !t.username && !t.password ? t.href : void 0;
}
function sn(e) {
	if (e != null) {
		if (typeof e != "string") throw Error("Invalid diagnostic text field.");
		return e || void 0;
	}
}
function cn(e) {
	let t = e.Count;
	if (!Number.isSafeInteger(t) || t < 0) throw Error("Invalid HMS count.");
	let n = Object.keys(e).map((e) => /^(\d+)-Error$/.exec(e)?.[1]).filter((e) => e !== void 0).sort((e, t) => Number(e) - Number(t));
	if (n.length !== t) throw Error("HMS count does not match the details.");
	return n.map((t) => {
		let n = sn(e[`${t}-Error`]);
		if (!n) throw Error("HMS description is missing.");
		let r = e[`${t}-Wiki`], i = on(r);
		return {
			code: sn(e[`${t}-Code`]),
			description: n,
			severity: sn(e[`${t}-Severity`]),
			wiki: i,
			linkRejected: r != null && !i
		};
	});
}
function ln(e, t) {
	let n = rn(e, t, "binary_sensor"), r = Ze(n), i = an(n), a = {
		kind: t,
		entity: n,
		availability: r,
		active: i,
		alerts: [],
		invalid: r === "ready" && i === null
	};
	if (i !== !0) return a;
	try {
		if (t === "hms_errors") a.alerts = cn(n.state.attributes);
		else {
			let e = n.state.attributes, t = sn(e.code), r = sn(e.error);
			(t || r) && (a.alerts = [{
				code: t,
				description: r,
				linkRejected: !1
			}]);
		}
	} catch (e) {
		if (!(e instanceof Error)) throw e;
		a.invalid = !0, a.detailError = e.message;
	}
	return a;
}
function un(e) {
	let t = [ln(e, "hms_errors"), ln(e, "print_error")], n = an(rn(e, "online", "binary_sensor"));
	return {
		groups: t,
		online: n,
		status: n === !1 || ["offline", "unavailable"].includes(e.status) ? "offline" : e.status === "failed" || t.some((e) => e.active === !0) ? "alert" : n === !0 && e.status !== "unknown" && t.every((e) => e.active === !1 && !e.invalid) ? "clear" : "unknown"
	};
}
// src/domain/fleet.ts
function dn(e) {
	let t = un(e), n = t.status === "offline", r = t.status === "alert";
	return {
		diagnostic: t,
		offline: n,
		attention: r,
		printing: !n && [
			"prepare",
			"running",
			"pause"
		].includes(e.status),
		idle: !n && !r && ["idle", "finish"].includes(e.status)
	};
}
function fn(e, t) {
	return t === "all" || dn(e)[t];
}
function pn(e) {
	return e.reduce((e, t) => {
		let n = dn(t);
		e.all++;
		for (let t of [
			"printing",
			"attention",
			"idle",
			"offline"
		]) n[t] && e[t]++;
		return e;
	}, {
		all: 0,
		printing: 0,
		attention: 0,
		idle: 0,
		offline: 0
	});
}
// src/ui/i18n.ts
var mn = {
	workspace: ["Your print workspace", "打印工作台"],
	subtitle: ["Every printer. Every detail. One workspace.", "每台打印机，每个细节，一个工作台。"],
	allPrinters: ["All printers", "全部打印机"],
	fleetPrinting: ["Active jobs", "任务中"],
	fleetAttention: ["Faults", "异常"],
	fleetFilter: ["Filter printers by status", "按状态筛选打印机"],
	fleetNoMatches: ["No printers match this status", "当前没有符合此状态的打印机"],
	openAlerts: ["Open alert center", "查看告警中心"],
	printers: ["Printers", "打印机"],
	printing: ["Printing", "打印中"],
	ready: ["Ready", "就绪"],
	offline: ["Offline", "离线"],
	overview: ["Overview", "总览"],
	ams: ["Filament & AMS", "耗材与 AMS"],
	files: ["Recent files", "最近文件"],
	parameters: ["All parameters", "全部参数"],
	liveParameters: ["Live parameters", "实时参数"],
	alerts: ["Alert center", "告警中心"],
	alertsActive: ["Fault reported", "收到故障上报"],
	alertsClear: ["No reported faults", "未发现上报故障"],
	alertsUnknown: ["Status not confirmed", "状态尚未确认"],
	alertsOffline: ["Printer offline", "打印机离线"],
	alertsOfflineHelp: ["Offline: diagnostics below are the last reported state, not a current health confirmation.", "打印机离线，以下为最后上报状态，无法确认当前设备状况。"],
	alertsScopeHelp: ["Based on HA print status, HMS and print-error reports.", "依据 HA 打印状态、HMS 与打印错误上报，不代表全面硬件检测。"],
	printStatusFailed: ["The reported print status is Failed. Check the printer for details.", "当前上报的打印状态为失败，请检查打印机上的具体原因。"],
	hmsErrors: ["HMS diagnostics", "HMS 诊断"],
	printError: ["Print errors", "打印错误"],
	reportedFault: ["Fault reported", "上报异常"],
	noReportedFault: ["No fault reported", "未上报告警"],
	faultCleared: ["Fault cleared", "告警已解除"],
	diagnosticInvalid: ["Unrecognized diagnostic state", "无法识别的诊断状态"],
	diagnosticDetailsInvalid: ["Diagnostic details could not be parsed", "诊断明细解析失败"],
	diagnosticDetailsMissing: ["The sensor reports a fault but has no detailed description.", "传感器上报异常，暂未提供详细说明。"],
	diagnosticLinkInvalid: ["Official help link unavailable", "官方帮助链接不可用"],
	officialTroubleshooting: ["Official troubleshooting", "官方排查说明"],
	deviceHealth: ["Device & connection", "设备与连接"],
	deviceOnline: ["Connection", "在线状态"],
	online: ["Online", "在线"],
	wifiSignal: ["Wi-Fi signal", "Wi-Fi 信号"],
	connectionMode: ["Connection mode", "连接模式"],
	connectionLocal: ["Local LAN", "本地局域网"],
	connectionCloud: ["Bambu Cloud", "拓竹云"],
	sdCard: ["SD card", "SD 卡"],
	sdNormal: ["Normal", "正常"],
	sdMissing: ["Missing", "未插入"],
	sdAbnormal: ["Abnormal", "异常"],
	nozzleType: ["Nozzle material", "喷嘴材质"],
	nozzleDiameter: ["Nozzle diameter", "喷嘴直径"],
	hardenedSteel: ["Hardened steel", "硬化钢"],
	stainlessSteel: ["Stainless steel", "不锈钢"],
	firmwareStatus: ["Firmware update", "固件更新"],
	firmwareAvailable: ["Update available", "有可用更新"],
	firmwareNoUpdate: ["No update reported", "未上报更新"],
	estimatedUsage: ["Estimated usage", "累计使用（估算）"],
	usageEstimateHelp: ["Usage hours are estimated by the integration and may need calibration.", "累计时长由集成估算，可能需要校准，不代表部件寿命。"],
	temperatureHistory: ["Temperature trend", "温度趋势"],
	recentEvents: ["Recent events", "近期事件"],
	targetNozzle: ["Nozzle target", "喷嘴目标"],
	targetBed: ["Bed target", "热床目标"],
	heatbreakFan: ["Hotend fan", "热端风扇"],
	temperatureChartLabel: ["Recorded nozzle and bed temperature trends", "喷嘴与热床的历史温度曲线"],
	temperatureHistoryHelp: ["Recorded values, normalized to °C. Unknown or missing-unit readings leave gaps.", "历史温度统一为 °C，未知值或单位缺失处保留断线。"],
	noTemperatureHistory: ["No valid temperature history in this period", "该时段暂无有效温度记录"],
	noRecentEvents: ["No recorded state changes in this period", "该时段暂无状态变化记录"],
	noRecordedValue: ["No valid record", "无有效记录"],
	historyUnsupported: ["No supported history entities", "未提供可查询的历史实体"],
	historyMissingEntities: ["Unavailable series", "未提供或禁用的曲线项目"],
	historyRecorderHelp: ["History depends on HA History/Recorder and whether these entities are recorded.", "历史数据取决于 HA History / Recorder 是否启用并记录这些实体。"],
	refreshHistory: ["Refresh history", "刷新历史"],
	historyHour: ["Past hour", "最近 1 小时"],
	historySixHours: ["Past 6 hours", "最近 6 小时"],
	historyRange: ["Temperature history range", "温度历史范围"],
	chartToggle: ["Toggle series", "切换曲线"],
	chartAllHidden: ["All curves are hidden. Select a legend to show one.", "所有曲线已隐藏，点击图例重新显示。"],
	chartSampleAt: ["Recorded at", "记录于"],
	chartInspectHelp: ["Point or touch to inspect recorded states. Arrow keys move by a minute; Home/End select the range edges.", "鼠标或触摸查看历史读数；方向键移动一分钟，Home/End 跳转起止时间。"],
	historyDay: ["Past 24 hours", "最近 24 小时"],
	historyAsOf: ["As of", "数据截至"],
	historyRefreshing: ["Refreshing…", "正在刷新…"],
	historyReadError: ["Could not read HA history", "HA 历史读取失败"],
	historyRetainedData: ["Showing the last successful result from", "以下保留上次成功结果，时间为"],
	recentEventsHelp: ["HA-recorded state changes; not a complete print archive", "HA 记录的状态变化，并非完整打印履历"],
	eventStarted: ["Print started", "开始打印"],
	eventResumed: ["Print resumed", "恢复打印"],
	eventFinished: ["Print completed", "打印已完成"],
	stageLeveling: ["Bed leveling", "自动调平"],
	stageBedHeating: ["Heating bed", "预热热床"],
	stageNozzleHeating: ["Heating nozzle", "加热喷嘴"],
	stageChangingFilament: ["Changing filament", "换料"],
	stageLoading: ["Loading filament", "加载耗材"],
	stageUnloading: ["Unloading filament", "卸载耗材"],
	stageHoming: ["Homing", "工具头归位"],
	stageCleaning: ["Cleaning nozzle", "清理喷嘴"],
	stageFlowCalibration: ["Flow calibration", "流量校准"],
	stageRunout: ["Paused: filament runout", "耗材耗尽暂停"],
	stageNozzleCooling: ["Cooling nozzle", "冷却喷嘴"],
	detailLayout: ["Detail layout", "详情布局"],
	layoutEdit: ["Edit layout", "编辑布局"],
	layoutEditing: ["Editing layout", "正在编辑布局"],
	layoutAccount: ["Saved per printer in your HA account", "每台打印机独立保存到你的 HA 账号"],
	layoutSave: ["Save layout", "保存布局"],
	layoutReset: ["Restore default", "恢复默认"],
	layoutSaved: ["Layout saved", "布局已保存"],
	layoutUnsaved: ["Layout changes not saved", "布局修改尚未保存"],
	layoutError: ["Could not load or save layout", "布局读取或保存失败"],
	layoutDrag: ["Drag", "拖动"],
	layoutEarlier: ["Move earlier", "前移"],
	layoutLater: ["Move later", "后移"],
	layoutVisible: ["Visible", "显示"],
	layoutCollapsed: ["Start collapsed", "默认折叠"],
	layoutWidth: ["Card width", "卡片宽度"],
	layoutNormal: ["Normal", "普通卡"],
	layoutWide: ["Wide", "宽卡"],
	layoutExpand: ["Expand", "展开"],
	layoutCollapse: ["Collapse", "收起"],
	layoutHiddenHelp: ["Hidden after saving. Turn Visible on to restore.", "保存后隐藏，勾选“显示”即可恢复。"],
	layoutCollapsedHelp: ["Starts collapsed; expand it when needed.", "默认折叠，使用时可临时展开。"],
	layoutAllHidden: ["All cards are hidden. Edit layout to show them again.", "所有信息块已隐藏，可进入编辑布局恢复显示。"],
	layoutDragHelp: ["Drag the full card by its title bar; other cards make room as you move. Use the arrows to reorder, or Escape to cancel a drag. Device controls are inactive while editing. Save to keep the new order.", "拖动标题条移动整张卡片，其他卡片会实时让位；也可用箭头排序，按 Esc 撤回本次拖动。编辑期间设备控制暂停操作，保存后记住布局。"],
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
	projectPreview: ["Print preview", "打印件预览"],
	noProjectPreview: ["No print preview available", "暂无打印件缩略图"],
	progress: ["Progress", "打印进度"],
	remaining: ["Remaining", "剩余时间"],
	estimatedFinish: ["Estimated finish", "预估完成时间"],
	estimatePaused: ["Recalculate after resuming", "恢复打印后重新估算"],
	haName: ["HA name", "HA 名称"],
	hourUnit: ["h", "小时"],
	minuteUnit: ["min", "分钟"],
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
	externalCamera: ["External camera", "外接摄像头"],
	builtinCamera: ["Built-in camera", "自带摄像头"],
	cameraChange: ["Change camera", "更换摄像头"],
	cameraSource: ["Camera source", "摄像头来源"],
	cameraSave: ["Save camera", "保存摄像头"],
	cameraPickerHelp: ["Choose a camera already connected to Home Assistant for this printer. The overview and detail use the same source.", "为这台打印机选择已接入 Home Assistant 的摄像头，首页和详情使用同一来源。"],
	cameraAccountHelp: ["Saved per printer in your HA account; other clients restore it when opening or refreshing this view.", "每台打印机独立保存到你的 HA 账号，其他设备打开或刷新后恢复。"],
	cameraNone: ["No external HA cameras found", "未发现可选的外接摄像头"],
	cameraSetupHelp: ["Connect the camera through an HA integration first. It will appear here when its camera entity is available. Built-in printer cameras are listed separately.", "请先通过 HA 集成接入摄像头，出现摄像头实体后即可在这里选择。打印机自带摄像头不计入外接列表。"],
	cameraSetupLink: ["Open HA integrations", "打开 HA 集成设置"],
	cameraMissing: ["Selected camera is missing or inaccessible", "所选摄像头已移除或当前账号不可访问"],
	cameraBuiltinMissing: ["This printer has no camera available", "此打印机尚无可用的自带摄像头"],
	cameraSelectionMissing: ["This camera is no longer selectable. Choose a current HA camera or the built-in source.", "该摄像头已不在可选列表中，请重新选择或使用自带摄像头。"],
	cameraLoadError: ["Could not load camera preference", "摄像头设置读取失败"],
	snapshot: ["Image camera", "图像摄像头"],
	live: ["Live stream", "视频流"],
	cameraHelp: ["Camera transport is provided by Home Assistant.", "使用 Home Assistant 提供的摄像头连接。"],
	loading: ["Loading…", "加载中…"],
	external: ["External spool", "外挂料盘"],
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
	experimental: ["Development preview", "开发预览"],
	completionNotifications: ["Print completion reminders", "打印完成提醒"],
	notifyHelp: ["Choose a phone and save an HA automation for this printer. Reminders continue when this dashboard is closed.", "为这台打印机选择手机并保存 HA 自动化。关闭面板后，提醒仍会生效。"],
	notifyEnable: ["Remind me when this printer finishes", "这台打印机完成后提醒我"],
	notifyRecipient: ["Receiving phone / destination", "接收手机 / 通知目标"],
	notifyMobileApp: ["HA phone app", "HA 手机 App"],
	notifyEntity: ["Notification entity", "通知实体"],
	chooseRecipient: ["Choose a destination", "请选择接收目标"],
	notifyStyle: ["Reminder style", "提醒方式"],
	notifyAlarm: ["Alarm-style sound (Android)", "闹钟式响铃（安卓）"],
	notifySpeech: ["Alarm speech (Android)", "闹钟语音播报（安卓）"],
	notifySpeechHelp: ["Reads the reminder using Android alarm audio and the current alarm volume. Requires a working text-to-speech engine. Ordinary notification sound settings and volume stay unchanged.", "通过安卓闹钟音频流朗读提醒，使用当前闹钟音量。手机需有可用的语音引擎；普通通知的声音设置和音量保持不变。"],
	notifyStandard: ["Standard notification", "普通通知"],
	notifyAlarmHelp: ["Uses Android alarm volume. Enable HA notifications and the alarm_stream channel on your phone; allow Do Not Disturb bypass if needed. This does not create a Clock alarm or promise continuous ringing.", "使用安卓闹钟音量。请在手机开启 HA 通知及 alarm_stream 通道，需要时允许绕过勿扰。此方式不创建系统时钟闹钟，也不保证持续循环响铃。"],
	notifyReliability: ["HA and the printer must stay connected. Completions while HA is stopped or the printer is disconnected are not replayed. Phone delivery depends on the app permissions and connection.", "HA 与打印机需保持连接。HA 停机或打印机断连期间完成的任务不会补发。手机是否响铃还取决于 App 权限与连接。"],
	notifyAdmin: ["An HA administrator must configure reminders. Existing automations continue running for other viewers.", "需要 HA 管理员配置提醒。其他用户查看面板时，已保存的自动化仍会运行。"],
	notifyNoTargets: ["No notification destinations were found. Connect the HA Companion App or configure a notify entity first.", "未发现通知目标，请先连接 HA 手机 App 或配置通知实体。"],
	notifyNoAlarmTarget: ["Alarm-style alerts need a specific notify.mobile_app_* action from the Android HA Companion App. No such action is currently registered.", "闹钟式响铃需要安卓 HA 手机 App 注册的 notify.mobile_app_* 动作，目前未发现此类动作。"],
	notifyTargetUnavailable: ["The selected destination is unavailable. Choose an available phone before enabling.", "所选目标不可用，请选择可用的手机后再启用。"],
	saveNotification: ["Save reminder", "保存提醒设置"],
	saving: ["Saving…", "保存中…"],
	notifyNotLoaded: ["Settings not loaded", "尚未读取设置"],
	notifyNotConfigured: ["No reminder configured", "尚未配置提醒"],
	notifyPending: ["Saved; HA runtime loading is not yet confirmed", "设置已保存，尚未确认 HA 已加载"],
	notifyActive: ["Saved and enabled in HA", "已保存，HA 后台已启用"],
	notifyInactive: ["Saved and disabled in HA", "已保存，HA 后台已关闭"],
	notifyStateMismatch: ["Runtime switch differs from saved startup setting; save again to reapply", "后台开关与保存的启动设置不同，重新保存可同步"],
	notifyRuntimeUnavailable: ["Automation runtime unavailable", "后台自动化不可用"],
	notifyUnsaved: ["Unsaved changes", "有未保存的修改"],
	notifyError: ["Could not load or save reminders", "提醒设置读取或保存失败"],
	notifyRuntimeError: ["Could not verify loaded automation", "无法核验后台自动化"],
	notifyViewAutomation: ["View HA automation", "查看 HA 自动化"],
	notifySettings: ["Settings & test", "设置与测试"],
	notifyTest: ["Test phone reminder", "测试手机提醒"],
	notifyTestSending: ["Sending test…", "正在发送测试…"],
	notifyTestHelp: ["Sends one reminder to the currently selected phone and style. No need to enable or save first.", "点击会按当前选择的手机和提醒方式发送一次提醒，无需先启用或保存。"],
	notifyTestSubmitted: ["HA accepted the test request. Check whether your phone received it and sounded.", "HA 已接受测试请求，请确认手机是否收到并响铃。"],
	notifyTestError: ["Test reminder failed", "测试提醒发送失败"]
};
function X(e, t) {
	return mn[t][+(e === "zh")];
}
// src/ui/icons.ts
var hn = {
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
	search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6",
	move: "M12 3v18M3 12h18m-6-6-3-3-3 3m6 12-3 3-3-3M6 9l-3 3 3 3m12-6 3 3-3 3",
	grip: "M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01",
	chart: "M3 3v18h18M6 15l4-5 4 3 6-8",
	connection: "M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0m-3 4h.01"
};
function Z(e) {
	return he`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${hn[e] || hn.printer}></path></svg>`;
}
// src/ui/select-values.ts
function gn(e) {
	for (let t of e.querySelectorAll("select[data-value]")) {
		let e = t.dataset.value;
		t.value !== e && (t.value = e);
	}
}
// src/ui/entity-value.ts
function _n(e, t) {
	let n = Ze(t);
	if (n !== "ready") return X(e, n);
	let r = t.state.attributes.unit_of_measurement;
	return `${t.state.state}${r ? ` ${String(r)}` : ""}`;
}
var vn = {
	idle: "idle",
	offline: "offline",
	printing: "running",
	paused_user: "pause",
	auto_bed_leveling: "stageLeveling",
	heatbed_preheating: "stageBedHeating",
	heating_hotend: "stageNozzleHeating",
	changing_filament: "stageChangingFilament",
	filament_loading: "stageLoading",
	filament_unloading: "stageUnloading",
	homing_toolhead: "stageHoming",
	cleaning_nozzle_tip: "stageCleaning",
	calibrating_extrusion: "stageFlowCalibration",
	calibrating_extrusion_flow: "stageFlowCalibration",
	paused_filament_runout: "stageRunout",
	cooling_nozzle: "stageNozzleCooling"
};
function yn(e, t) {
	if (Ze(t) !== "ready") return _n(e, t);
	let n = t.state.state;
	return vn[n] ? X(e, vn[n]) : n;
}
// src/ui/styles.css?inline
var bn = ":host{color:var(--primary-text-color,#e8eeec);--bd-accent:#00ae42;--bd-accent-soft:color-mix(in srgb, var(--bd-accent) 12%, transparent);--bd-bg:var(--primary-background-color,#101716);--bd-panel:var(--card-background-color,#19211f);--bd-raised:var(--secondary-background-color,#202a27);--bd-text:var(--primary-text-color,#e8eeec);--bd-muted:var(--secondary-text-color,#93a49d);--bd-line:color-mix(in srgb, var(--bd-text) 7%, transparent);--bd-surface:color-mix(in srgb, var(--bd-panel) 86%, transparent);--bd-inset:color-mix(in srgb, var(--bd-panel) 62%, var(--bd-raised));--bd-card-radius:22px;--bd-shadow:0 8px 28px #183c3010, 0 1px 3px #183c3006, inset 0 1px 0 #ffffff24;--bd-danger:var(--error-color,#db6e67);font-family:var(--paper-font-body1_-_font-family,Inter, ui-sans-serif, system-ui, sans-serif);font-size:14px;line-height:1.5;display:block}*{box-sizing:border-box}button,input,select{font:inherit}button{color:inherit;cursor:pointer}button:disabled{opacity:.42;cursor:not-allowed}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid var(--bd-accent);outline-offset:3px}button,input,select{-webkit-tap-highlight-color:transparent}a{color:var(--bd-accent)}.shell{background:radial-gradient(ellipse at 0% 0%, #b8dcea40, transparent 55%), radial-gradient(ellipse at 100% 100%, #ffd8b838, transparent 55%), radial-gradient(ellipse at 70% 0%, #c3ead529, transparent 45%), var(--bd-bg);border:1px solid var(--bd-line);border-radius:28px;min-height:460px;overflow:hidden}.topbar{background:color-mix(in srgb, var(--bd-panel) 58%, transparent);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-bottom:1px solid var(--bd-line);justify-content:space-between;align-items:center;gap:20px;min-height:72px;padding:17px 28px;display:flex}.brand{align-items:center;gap:12px;display:flex}.brand-mark{background:linear-gradient(145deg, var(--bd-accent), color-mix(in srgb, var(--bd-accent) 80%, #07562b));color:#062b14;border-radius:13px;place-items:center;width:37px;height:37px;display:grid;box-shadow:0 5px 14px #00ae4224}.brand-title{letter-spacing:-.4px;font-size:16px;font-weight:750}.brand-subtitle,.eyebrow{color:var(--bd-muted);letter-spacing:1.6px;text-transform:uppercase;font-size:10px;font-weight:650}.top-actions{align-items:center;gap:12px;display:flex}.connection{color:var(--bd-muted);align-items:center;gap:7px;font-size:11px;display:flex}.dot{background:var(--bd-muted);border-radius:50%;flex-shrink:0;width:7px;height:7px}.dot.running,.dot.ready,.dot.finish{background:var(--bd-accent)}.dot.pause,.dot.prepare{background:#d8ac5b}.dot.failed{background:var(--bd-danger)}.workspace{grid-template-columns:216px minmax(0,1fr);display:grid}.sidebar{border-right:1px solid var(--bd-line);background:color-mix(in srgb, var(--bd-panel) 34%, transparent);padding:25px 13px}.sidebar-label{color:var(--bd-muted);letter-spacing:1.6px;text-transform:uppercase;margin:5px 12px 12px;font-size:10px;font-weight:700}.sidebar button{text-align:left;background:0 0;border:1px solid #0000;border-radius:15px;align-items:center;gap:10px;width:100%;padding:11px 12px;display:flex}.sidebar button:hover{background:var(--bd-line)}.sidebar button.selected{background:color-mix(in srgb, var(--bd-accent) 12%, var(--bd-surface));border-color:color-mix(in srgb, var(--bd-accent) 12%, transparent);color:var(--bd-accent);box-shadow:0 3px 10px #183c3005}.sidebar .icon{flex-shrink:0;width:18px;height:18px}.sidebar .printer-link{margin-top:5px}.sidebar .printer-link .dot{margin-left:auto}.sidebar .name{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.sidebar .model{color:var(--bd-muted);font-size:11px;display:block}.sidebar-rule{background:var(--bd-line);height:1px;margin:20px 10px}.sidebar-foot{color:var(--bd-muted);margin:28px 12px 0;font-size:11px}.main{min-width:0;padding:29px 30px 35px}.page-heading{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:24px;display:flex}h1{letter-spacing:-1.1px;overflow-wrap:anywhere;margin:7px 0 8px;font-size:28px;font-weight:720;line-height:1.2}h2{letter-spacing:-.3px;margin:0;font-size:16px}h3{margin:0;font-size:13px}p{margin:0}.muted{color:var(--bd-muted)}.description{color:var(--bd-muted);font-size:12px}.ha-name{overflow-wrap:anywhere;margin-bottom:5px}.stats{flex-wrap:wrap;gap:8px;margin-top:4px;display:flex}.stat{border:1px solid var(--bd-line);background:var(--bd-surface);color:var(--bd-muted);white-space:nowrap;border-radius:14px;padding:8px 13px;font-size:11px;box-shadow:0 3px 12px #183c3005}.stat b{color:var(--bd-text);margin-right:4px;font-size:15px}.stat.stat-alert,.stat.stat-alert b{color:var(--bd-danger)}.fleet-filters{flex-wrap:wrap;gap:8px;margin:0 0 18px;display:flex}.fleet-filters b{background:var(--bd-line);border-radius:6px;min-width:18px;padding:0 4px}.button.selected{color:var(--bd-accent);border-color:var(--bd-accent);background:var(--bd-accent-soft)}.tile-diagnostics{border:1px solid var(--bd-line);background:var(--bd-line);width:calc(100% - 40px);color:var(--bd-muted);text-align:left;border-radius:10px;align-items:center;gap:7px;margin:12px 20px 0;padding:7px 9px;font-size:10px;display:flex}.tile-diagnostics .icon{width:14px;height:14px}.tile-diagnostics .icon:last-child{margin-left:auto}.tile-diagnostics.clear{background:var(--bd-accent-soft);color:var(--bd-accent)}.tile-diagnostics.fault{color:var(--bd-danger);background:color-mix(in srgb, var(--bd-danger) 9%, transparent)}.tabs{border:1px solid var(--bd-line);background:color-mix(in srgb, var(--bd-panel) 48%, transparent);border-radius:16px;gap:4px;width:-moz-fit-content;width:fit-content;max-width:100%;margin-bottom:22px;padding:5px;display:flex;overflow-x:auto}.tabs button{color:var(--bd-muted);white-space:nowrap;background:0 0;border:0;border-radius:11px;align-items:center;gap:7px;padding:9px 12px;font-size:12px;display:flex}.tabs button.active{background:var(--bd-accent-soft);color:var(--bd-accent)}.icon{vertical-align:middle;flex-shrink:0;width:19px;height:19px;display:inline-block}.icon-button{background:var(--bd-surface);border:1px solid var(--bd-line);border-radius:50%;place-items:center;width:35px;height:35px;display:inline-grid;box-shadow:0 3px 10px #183c3008}.icon-button:hover{background:var(--bd-line)}.button{border:1px solid var(--bd-line);background:var(--bd-inset);border-radius:12px;justify-content:center;align-items:center;gap:8px;padding:10px 14px;font-size:12px;font-weight:600;display:inline-flex;box-shadow:0 2px 6px #183c3005}.button.primary{background:linear-gradient(145deg, var(--bd-accent), color-mix(in srgb, var(--bd-accent) 86%, #087a32));color:#052b12;border-color:#0000;box-shadow:0 4px 12px #00ae421c}.button.danger{color:var(--bd-danger);background:color-mix(in srgb, var(--bd-danger) 8%, transparent);border-color:color-mix(in srgb, var(--bd-danger) 28%, transparent)}.button.small{padding:7px 10px;font-size:11px}.panel{background:var(--bd-surface);border:1px solid var(--bd-line);border-radius:var(--bd-card-radius);box-shadow:var(--bd-shadow);overflow:hidden}.panel-head{background:linear-gradient(110deg, color-mix(in srgb, var(--bd-panel) 36%, transparent), transparent);border-bottom:1px solid var(--bd-line);justify-content:space-between;align-items:center;gap:12px;padding:17px 20px;display:flex}.panel-body{padding:20px}.printer-grid{grid-template-columns:repeat(auto-fit,minmax(min(310px,100%),1fr));gap:18px;display:grid}.printer-card{transition:border-color .15s,box-shadow .15s}.printer-card:hover{border-color:color-mix(in srgb, var(--bd-accent) 24%, var(--bd-line));box-shadow:0 12px 32px #183c3016,inset 0 1px #ffffff24}.printer-card .card-heading{text-align:left;background:0 0;border:0;align-items:center;gap:10px;width:100%;padding:18px 20px 0;display:flex}.machine-badge{border:1px solid var(--bd-line);background:var(--bd-inset);width:36px;height:36px;color:var(--bd-muted);border-radius:12px;place-items:center;display:grid}.card-heading .heading-copy{flex:1;min-width:0}.card-heading .heading-copy b{text-overflow:ellipsis;white-space:nowrap;font-size:14px;display:block;overflow:hidden}.card-heading small{color:var(--bd-muted);font-size:10px}.status{border:1px solid var(--bd-line);white-space:nowrap;border-radius:999px;align-items:center;gap:6px;padding:5px 9px;font-size:10px;display:inline-flex}.status.running,.status.finish{color:var(--bd-accent);background:var(--bd-accent-soft);border-color:#0000}.status.pause,.status.prepare{color:#d8ac5b}.status.failed{color:var(--bd-danger)}.tile-media{grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:12px;padding:14px 14px 10px;display:grid}.preview{background:radial-gradient(ellipse at center, var(--bd-accent-soft), transparent 72%);border-radius:16px;place-items:center;height:208px;display:grid;position:relative;overflow:hidden}.preview bambu-dashboard-camera{width:100%;position:absolute;inset:0}bambu-printer-camera{min-width:0;display:block}.camera-source-tile .camera-source-entry{z-index:1;background:var(--bd-panel);padding:5px 8px;font-size:10px;position:absolute;top:9px;right:9px;box-shadow:0 3px 12px #0002}.camera-source-entry .icon{width:14px;height:14px}.camera-source-tile .preview-caption{text-overflow:ellipsis;white-space:nowrap;max-width:calc(100% - 20px);overflow:hidden}.camera-source-message{text-align:center;min-height:180px;color:var(--bd-muted);overflow-wrap:anywhere;align-content:center;justify-items:center;gap:8px;padding:48px 14px 28px;font-size:12px;display:grid}.camera-source-message.error{color:var(--bd-danger)}.camera-source-caption{color:var(--bd-muted);border-top:1px solid var(--bd-line);overflow-wrap:anywhere;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:9px 14px;font-size:10px;display:flex}.camera-source-caption b{color:var(--bd-accent)}.camera-source-caption small{margin-left:auto}.project-preview{border:1px solid var(--bd-line);background:linear-gradient(145deg, color-mix(in srgb, var(--bd-accent) 4%, var(--bd-panel)), color-mix(in srgb, #b8dcea 12%, var(--bd-panel)));border-radius:16px;grid-template-rows:minmax(0,1fr);place-items:center;min-width:0;height:208px;display:grid;position:relative;overflow:hidden}.project-preview bambu-dashboard-file-image{padding:8px 8px 32px}.preview-empty{color:var(--bd-muted);text-align:center;justify-items:center;gap:10px;padding:12px 12px 32px;font-size:11px;display:grid}.printer-art{width:90%;max-width:320px;height:100%;color:var(--bd-muted)}.preview-caption{background:var(--bd-surface);border:1px solid var(--bd-line);color:var(--bd-muted);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:999px;padding:4px 8px;font-size:9px;position:absolute;bottom:9px;left:10px}.tile-content{padding:4px 20px 20px}.task-line{align-items:center;gap:9px;margin-bottom:15px;display:flex}.task-line .icon{color:var(--bd-muted);width:15px;height:15px}.task-line span{text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.progress-label{color:var(--bd-muted);justify-content:space-between;align-items:center;gap:12px;margin:8px 0;font-size:11px;display:flex}.progress-label strong{color:var(--bd-accent);font-size:13px}.progress-track{background:var(--bd-line);border-radius:4px;height:5px;overflow:hidden}.progress-fill{height:100%;width:var(--progress,0%);background:var(--bd-accent);border-radius:inherit;transition:width .3s}.tile-metrics{grid-template-columns:repeat(auto-fit,minmax(min(100px,100%),1fr));gap:10px;margin:18px 0 14px;display:grid}.tile-metrics span{color:var(--bd-muted);font-size:10px;display:block}.tile-metrics strong{margin-top:3px;font-size:13px;font-weight:600;display:block}.tile-footer{border-top:1px solid var(--bd-line);justify-content:space-between;align-items:flex-end;gap:12px;padding-top:14px;display:flex}.tile-footer>.button{flex-shrink:0}.filament-groups{flex-wrap:wrap;flex:1;gap:8px;min-width:0;display:flex}.filament-group{border:1px solid var(--bd-line);background:color-mix(in srgb, var(--bd-panel) 54%, transparent);border-radius:14px;flex-direction:column;gap:8px;max-width:100%;padding:9px 11px;display:flex}.filament-source{color:var(--bd-muted);overflow-wrap:anywhere;align-items:center;gap:5px;font-size:10px;font-weight:600;display:inline-flex}.filament-source .icon{width:13px;height:13px}.filament-dots{align-items:center;gap:5px;display:flex}.filament-dot{border:2px solid var(--bd-line);background:var(--filament,transparent);border-radius:50%;width:15px;height:15px;box-shadow:0 1px 3px #183c3012}.filament-dot.active{outline:1px solid var(--bd-accent);outline-offset:2px}.detail-grid{grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));grid-auto-rows:1px;grid-auto-flow:dense;align-items:start;gap:14px;display:grid}.detail-grid>*{align-self:start;min-width:0;margin:0}bambu-detail-layout{display:block;container:detail-layout/inline-size}@container detail-layout (width>=654px){.layout-wide{grid-column:span 2}}.layout-revealed{border-radius:var(--bd-card-radius);outline:2px solid var(--bd-accent);outline-offset:3px}.layout-options{flex-wrap:wrap;align-items:center;gap:6px 10px;padding:4px 7px 10px;font-size:10px;display:flex}.layout-options label{align-items:center;gap:5px;display:inline-flex}.layout-options select{border-radius:8px;width:auto;margin-left:auto;padding:5px 7px;font-size:10px}.layout-summary{background:var(--bd-surface);color:var(--bd-muted);border-radius:12px;padding:15px;font-size:11px}.layout-fold-toggle{border:1px solid var(--bd-line);background:var(--bd-surface);width:100%;box-shadow:var(--bd-shadow);text-align:left;border-radius:16px;justify-content:space-between;align-items:center;gap:8px;padding:14px;font-size:12px;display:flex}.layout-fold-toggle span{color:var(--bd-accent);white-space:nowrap;font-size:10px}.layout-toolbar{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin:0 0 14px;display:flex}.layout-caption{gap:3px;min-width:0;font-size:12px;font-weight:600;display:grid}.layout-caption small{color:var(--bd-muted);font-size:10px;font-weight:400}.layout-actions{flex-wrap:wrap;gap:8px;display:flex}.layout-help{color:var(--bd-muted);margin:0 0 14px;font-size:12px}.layout-item{position:relative}.layout-card-content{min-width:0}.layout-card-content>bambu-completion-notifications{margin:0}.layout-editing .layout-card{border:1px dashed color-mix(in srgb, var(--bd-accent) 40%, transparent);border-radius:calc(var(--bd-card-radius) + 6px);background:var(--bd-accent-soft);padding:6px}.layout-handlebar{align-items:center;gap:4px;margin:0 0 6px;display:flex}.layout-grip{min-width:0;color:var(--bd-text);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;text-align:left;background:0 0;border:0;flex:1;align-items:center;gap:7px;padding:7px;font-size:12px;display:flex}.layout-grip span{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.layout-step{background:var(--bd-surface);border:0;border-radius:9px;flex-shrink:0;width:30px;height:30px}.layout-editing .layout-card-content{pointer-events:none}.layout-item[data-layout-dragging]{border-radius:calc(var(--bd-card-radius) + 6px);outline:2px dashed var(--bd-accent);outline-offset:-2px;background:var(--bd-accent-soft)}.layout-card:popover-open{pointer-events:none;max-width:none;max-height:none;color:var(--bd-text);background:var(--bd-panel);margin:0;position:fixed;inset:auto;overflow:visible;box-shadow:0 18px 48px #183c3038}.layout-card:popover-open .layout-grip{cursor:grabbing}.detail-grid .panel-head{padding:12px 14px}.detail-grid .panel-head h2{align-items:center;gap:7px;font-size:13px;display:flex}.detail-grid .panel-body{padding:14px}bambu-printer-diagnostics,bambu-printer-history{min-width:0;display:block}.job-stage{background:var(--bd-accent-soft);border-radius:10px;justify-content:space-between;gap:10px;margin-bottom:12px;padding:8px 10px;font-size:11px;display:flex}.job-stage span{color:var(--bd-muted)}.job-stage b{color:var(--bd-accent);overflow-wrap:anywhere}.panel-note{color:var(--bd-muted);border-top:1px solid var(--bd-line);overflow-wrap:anywhere;margin:0;padding:10px 14px;font-size:10px}.diagnostic-state{background:var(--bd-line);color:var(--bd-muted);border-radius:999px;padding:4px 8px;font-size:10px}.diagnostic-state.clear{color:var(--bd-accent);background:var(--bd-accent-soft)}.diagnostic-state.alert,.diagnostic-warning{color:var(--bd-danger)}.diagnostic-body{padding:2px 14px;font-size:12px}.diagnostic-group{padding:12px 0}.diagnostic-group+.diagnostic-group{border-top:1px solid var(--bd-line)}.diagnostic-group-title{flex-wrap:wrap;justify-content:space-between;gap:8px;display:flex}.printer-alert{background:color-mix(in srgb, var(--bd-danger) 6%, var(--bd-panel));border:1px solid color-mix(in srgb, var(--bd-danger) 20%, transparent);overflow-wrap:anywhere;border-radius:12px;margin-top:10px;padding:10px}.printer-alert p{margin:7px 0}.printer-alert a,.printer-alert small{font-size:11px}.alert-severity{color:var(--bd-muted);margin-left:8px;font-size:10px}.device-readings{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0;padding:14px;display:grid}.device-readings div{min-width:0}.device-readings dt{color:var(--bd-muted);font-size:10px}.device-readings dd{overflow-wrap:anywhere;margin:4px 0 0;font-size:12px;font-weight:600}.history-meta{color:var(--bd-muted);padding:9px 14px 0;font-size:10px}.history-empty{text-align:center;min-height:140px;color:var(--bd-muted);place-content:center;gap:10px;padding:22px 14px;font-size:12px;display:grid}.history-empty small{font-size:10px}.history-error{color:var(--bd-danger);overflow-wrap:anywhere;gap:7px;padding:12px 14px;font-size:11px;display:grid}.history-error .button{justify-self:start}.temperature-chart{padding:5px 10px 0}.temperature-chart svg{width:100%;height:174px;display:block}.chart-axis{fill:var(--bd-muted);font-family:inherit;font-size:9px}.chart-grid{stroke:var(--bd-line);stroke-width:1px}.chart-legend{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 12px;padding:4px 14px 14px;display:grid}.chart-legend button{text-align:left;background:0 0;border:1px solid #0000;border-radius:8px;grid-template-columns:14px minmax(0,1fr);align-items:center;gap:2px 6px;padding:4px;font-size:10px;display:grid}.chart-legend button:hover{background:var(--bd-line)}.chart-legend .series-hidden{opacity:.5}.chart-legend .series-hidden>span:nth-child(2){text-decoration:line-through}.history-ranges{flex-wrap:wrap;gap:6px;padding:10px 14px 0;display:flex}.temperature-chart svg{touch-action:pan-y}.temperature-chart svg:focus-visible{outline:2px solid var(--bd-accent);border-radius:8px}.chart-cursor{stroke:var(--bd-muted);stroke-width:1px;stroke-dasharray:3 2}.temperature-plot{position:relative}.chart-inspection{z-index:1;pointer-events:none;border:1px solid var(--bd-line);background:var(--bd-panel);width:min(320px,100% - 24px);box-shadow:var(--bd-shadow);border-radius:12px;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 14px;padding:10px 12px;font-size:10px;display:grid;position:absolute;top:10px;right:12px}.chart-inspection>b{grid-column:1/-1}.chart-inspection>div{grid-template-columns:minmax(0,1fr) auto;column-gap:8px;display:grid}.chart-inspection small{color:var(--bd-muted);grid-column:1/-1}.chart-legend b{overflow-wrap:anywhere;grid-column:2;font-size:11px}.legend-swatch{border-top:2px solid var(--series-color);height:0}.legend-swatch.target{border-top-style:dashed}.printer-event-list{max-height:320px;margin:0;padding:14px;list-style:none;overflow-y:auto}.printer-event-list li{gap:11px;padding:0 0 17px;font-size:11px;display:flex;position:relative}.printer-event-list li:not(:last-child):after{content:\"\";background:var(--bd-line);width:1px;position:absolute;top:9px;bottom:0;left:3px}.event-dot{z-index:1;background:var(--bd-accent);border-radius:50%;flex-shrink:0;width:7px;height:7px;margin-top:4px;position:relative}.printer-event-list .fault .event-dot{background:var(--bd-danger)}.printer-event-list b,.printer-event-list time{overflow-wrap:anywhere;display:block}.printer-event-list time{color:var(--bd-muted);margin-top:4px;font-size:10px}.camera-large{background:radial-gradient(ellipse at center, var(--bd-accent-soft), transparent);position:relative}.camera-large bambu-dashboard-camera{width:100%;height:auto;min-height:120px}.camera-large>.printer-art{max-width:320px;height:200px;margin:auto;display:block}.detail-metrics{grid-template-columns:repeat(2,minmax(0,1fr));padding:6px;display:grid}.detail-metrics .metric{background:color-mix(in srgb, var(--bd-panel) 52%, transparent);border-radius:14px;margin:3px;padding:12px 10px}.detail-metrics .metric strong{font-size:20px}.detail-grid .control-divider{margin:12px 0}.detail-grid .control-row{margin:8px 0}.detail-grid .field{margin:10px 0}.detail-grid .ams-grid{grid-template-columns:repeat(auto-fit,minmax(min(130px,100%),1fr));gap:8px;padding:12px}.detail-grid .spool{padding:12px 10px}.detail-grid .spool-visual{width:52px;height:52px;margin:10px auto}.detail-grid .spool-visual:after{inset:12px}.detail-grid .ams-extra{padding:0 12px 12px}.layout-card-content>.ams-section{margin:0}.metric{padding:16px 18px}.metric .metric-top{color:var(--bd-muted);align-items:center;gap:7px;font-size:11px;display:flex}.metric strong{letter-spacing:-.6px;margin-top:7px;font-size:22px;font-weight:650;display:block}.metric small{color:var(--bd-muted);font-size:11px}.job-name{overflow-wrap:anywhere;margin:8px 0 18px;font-size:19px;font-weight:650;line-height:1.4}.job-top{justify-items:center;gap:12px;margin:0 0 14px;display:grid}.job-cover{aspect-ratio:1;border:1px solid var(--bd-line);background:linear-gradient(145deg, var(--bd-panel), color-mix(in srgb, #b8dcea 10%, var(--bd-panel)));border-radius:18px;flex-shrink:0;width:256px;max-width:100%;overflow:hidden}.current-job .job-name{width:100%;margin:0;font-size:17px}.current-job .job-summary{margin:12px 0 0}.current-job .job-summary b{overflow-wrap:anywhere}.job-summary{grid-template-columns:1fr 1fr;gap:14px;margin:18px 0;display:grid}.job-summary span{color:var(--bd-muted);font-size:11px;display:block}.job-summary b{margin-top:4px;font-size:15px;display:block}.completion-estimate{gap:4px;margin-top:10px;display:grid}.completion-estimate time{font-size:12px;font-weight:600}.completion-estimate small{color:var(--bd-muted);font-size:11px}.control-row{gap:8px;margin:12px 0;display:flex}.control-row .button{flex:1}.control-divider{background:var(--bd-line);height:1px;margin:19px 0}.field{flex-direction:column;gap:7px;margin:12px 0;font-size:12px;display:flex}.field label,.field>span{color:var(--bd-muted);font-size:11px}input,select{border:1px solid var(--bd-line);background:var(--bd-inset);width:100%;min-width:0;color:var(--bd-text);border-radius:12px;padding:10px 12px}input[type=checkbox]{width:16px;height:16px;accent-color:var(--bd-accent)}.check{align-items:flex-start;gap:9px;margin:12px 0;font-size:12px;display:flex}.check input{flex-shrink:0;margin-top:2px}.light-control{justify-content:space-between;align-items:center;gap:12px;font-size:12px;display:flex}.light-control .button.on{color:var(--bd-accent);border-color:var(--bd-accent)}.helper{color:var(--bd-muted);margin-top:8px;font-size:11px;line-height:1.6}.ams-section{margin-top:18px}.ams-grid{grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));gap:12px;padding:20px;display:grid}.spool{border:1px solid var(--bd-line);background:color-mix(in srgb, var(--bd-panel) 64%, var(--bd-raised));border-radius:16px;min-width:0;padding:16px 13px 13px;position:relative;box-shadow:inset 0 1px #ffffff20}.spool.active{border-color:color-mix(in srgb, var(--bd-accent) 65%, transparent);background:var(--bd-accent-soft)}.spool-index{color:var(--bd-muted);font-size:10px}.spool-visual{background:repeating-radial-gradient(circle at center, transparent 0 3px, #0002 4px 5px),var(--filament,var(--bd-raised));border:5px solid color-mix(in srgb, var(--filament,var(--bd-muted)) 65%, var(--bd-line));border-radius:50%;width:64px;height:64px;margin:15px auto;position:relative;box-shadow:inset 0 0 0 1px #fff3}.spool-visual:after{content:\"\";background:var(--bd-bg);border:2px solid var(--bd-line);border-radius:50%;position:absolute;inset:18px}.spool h3{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.spool .material{color:var(--bd-muted);margin-top:4px;font-size:10px}.spool .remain{color:var(--bd-muted);margin-top:11px;font-size:11px}.spool .active-label{color:var(--bd-accent);font-size:9px;position:absolute;top:12px;right:9px}.ams-extra{color:var(--bd-muted);flex-wrap:wrap;gap:15px;padding:0 20px 17px;font-size:11px;display:flex}.file-list{margin-top:18px}.file-row{grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:17px;padding:18px 20px;display:grid}.file-row+.file-row{border-top:1px solid var(--bd-line)}.file-preview{border:1px solid var(--bd-line);background:var(--bd-inset);width:64px;height:64px;color:var(--bd-muted);border-radius:16px;place-items:center;display:grid;overflow:hidden}.file-title{overflow-wrap:anywhere;font-size:13px;font-weight:600}.file-meta{color:var(--bd-muted);flex-wrap:wrap;gap:12px;margin-top:5px;font-size:10px;display:flex}.file-actions{gap:8px;display:flex}.section-heading{justify-content:space-between;align-items:flex-start;gap:20px;display:flex}.section-heading .description{max-width:700px;margin-top:6px}.search-box{border:1px solid var(--bd-line);background:var(--bd-surface);color:var(--bd-muted);border-radius:16px;align-items:center;gap:10px;margin:18px 0 13px;padding-left:12px;display:flex;box-shadow:0 3px 12px #183c3005}.search-box input{background:0 0;border:0}.parameter-table{border-collapse:collapse;width:100%;font-size:12px}.parameter-table th{text-align:left;color:var(--bd-muted);border-bottom:1px solid var(--bd-line);padding:13px 18px;font-size:10px;font-weight:500}.parameter-table td{vertical-align:top;border-bottom:1px solid var(--bd-line);padding:12px 18px}.parameter-table tr:last-child td{border-bottom:0}.entity-name{font-size:12px;font-weight:550}.entity-id{color:var(--bd-muted);overflow-wrap:anywhere;margin-top:4px;font-size:9px}.entity-value{word-break:break-word;font-weight:650}.parameter-table summary{cursor:pointer;color:var(--bd-muted);font-size:10px}.attribute-grid{grid-template-columns:minmax(80px,auto) minmax(0,1fr);gap:7px 12px;padding:12px 0 0;font-size:10px;display:grid}.attribute-grid dt{color:var(--bd-muted);overflow-wrap:anywhere}.attribute-grid dd{word-break:break-word;white-space:pre-wrap;margin:0}.banner{border:1px solid var(--bd-line);background:var(--bd-surface);border-radius:16px;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;font-size:12px;display:flex;box-shadow:0 3px 12px #183c3005}.banner.error{border-color:color-mix(in srgb,var(--bd-danger) 35%,transparent);color:var(--bd-danger)}.banner.notice{border-color:color-mix(in srgb,var(--bd-accent) 35%,transparent)}.banner .copy{overflow-wrap:anywhere;flex:1}.empty{text-align:center;color:var(--bd-muted);padding:48px 25px}.empty .icon{opacity:.7;width:30px;height:30px;margin-bottom:12px}.empty p{margin-bottom:15px;font-size:12px}.overlay{z-index:7;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);background:#0008;place-items:center;padding:20px;display:grid;position:fixed;inset:0}.dialog{background:var(--bd-panel);border:1px solid var(--bd-line);border-radius:24px;width:min(620px,100%);max-height:90vh;overflow-y:auto;box-shadow:0 20px 90px #0005}.dialog .dialog-body{padding:22px}.dialog-target{background:var(--bd-accent-soft);border:1px solid color-mix(in srgb,var(--bd-accent) 25%,transparent);border-radius:10px;justify-content:space-between;gap:16px;margin-bottom:17px;padding:13px 15px;display:flex}.dialog-target span{color:var(--bd-muted);font-size:10px}.dialog-target b{margin-top:3px;font-size:13px;display:block}.dialog-footer{border-top:1px solid var(--bd-line);justify-content:flex-end;gap:10px;padding:16px 22px;display:flex}.camera-picker{width:min(620px,100vw - 24px);max-height:calc(100dvh - 24px);color:var(--bd-text);padding:0}.camera-picker::backdrop{-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);background:#0008}.camera-picker .description{margin-bottom:15px}.camera-picker .panel-head h2{align-items:center;gap:8px;display:flex}.camera-picker .field select{width:100%}.camera-setup-empty{border:1px dashed var(--bd-line);color:var(--bd-muted);border-radius:14px;margin:14px 0;padding:15px;font-size:12px}.camera-setup-empty p{margin:7px 0 10px}.two-fields{grid-template-columns:1fr 1fr;gap:15px;display:grid}.progress-caption{color:var(--bd-accent);margin-top:12px;font-size:11px}.mobile-picker{display:none}@media (max-width:1100px){.workspace{grid-template-columns:180px minmax(0,1fr)}.main{padding:24px 20px}.stats{display:none}}@media (max-width:700px){.shell{border-radius:12px}.topbar{padding:14px 17px}.brand-subtitle{font-size:8px}.connection{display:none}.workspace{display:block}.sidebar{display:none}.main{padding:20px 15px}h1{font-size:24px}.page-heading{margin-bottom:16px}.mobile-picker{margin-bottom:15px;display:block}.tabs button{padding:8px;font-size:11px}.tabs .icon{width:15px;height:15px}.file-row{grid-template-columns:48px minmax(0,1fr);gap:12px;padding:15px}.file-preview{width:48px;height:48px}.file-actions{grid-column:2}.parameter-table th,.parameter-table td{padding:11px 10px}.overlay{padding:10px}.two-fields{grid-template-columns:1fr;gap:0}}@media (prefers-reduced-motion:reduce){*{transition:none!important}}@media (max-width:700px){.tabs .icon{display:none}.tabs{gap:2px}}", xn = class extends I {
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
			if (this._visible = e.isIntersecting, !e.isIntersecting) {
				let { width: t, height: n } = e.boundingClientRect;
				this.card && t > 0 && n > 0 && (this.style.aspectRatio = `${t} / ${n}`), this.card = void 0;
			}
		}), this.observer.observe(this);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.generation++, this.observer?.disconnect(), this.card = void 0, this._visible = !1;
	}
	updated(e) {
		e.has("entity") && (this.card = void 0, this._error = "", this.style.aspectRatio = ""), this._visible && (this.card ? this.card.hass = this.hass : this.entity && this.hass && !this._error && this.load());
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
			e === this.generation && (this._error = R(t).message);
		}
	}
	render() {
		return this._error ? j`<div class="message error">${this._error}</div>` : this._visible ? this.card || j`<div class="message">Camera · …</div>` : N;
	}
}, Sn = class extends I {
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
			let t = this.entity ? `/api/image_proxy/${encodeURIComponent(this.entity)}` : Ut(this.path), n = this.version ? `${t}?v=${encodeURIComponent(this.version)}` : t, r = await this.hass.fetchWithAuth(n, { signal: e.signal });
			if (!r.ok) throw Error(`Image: HTTP ${r.status}`);
			let i = await r.blob();
			e.signal.aborted || (this._url = URL.createObjectURL(i));
		} catch (t) {
			e.signal.aborted || (this._error = R(t).message);
		}
	}
	render() {
		return this._url ? j`<img src=${this._url} alt="Project preview"/>` : this._error ? j`<span class="error">${this._error}</span>` : N;
	}
};
customElements.define("bambu-dashboard-camera", xn), customElements.define("bambu-dashboard-file-image", Sn);
// src/domain/cameras.ts
var Cn = /^camera\.[a-z0-9_]+$/;
function wn(e) {
	if (e === null) return {
		version: 1,
		entityId: null
	};
	if (typeof e != "object" || !e || !("version" in e) || e.version !== 1 || !("entityId" in e) || !(e.entityId === null || typeof e.entityId == "string" && Cn.test(e.entityId))) throw Error("HA returned an unsupported camera source preference.");
	return {
		version: 1,
		entityId: e.entityId
	};
}
function Tn(e, t, n, r) {
	let i = e ? n[e] : void 0, a = r.entities.find((t) => t.entity_id === e), o = i?.attributes.friendly_name;
	return {
		entityId: e,
		name: typeof o == "string" && o.trim() ? o : a?.name || a?.original_name || e || "",
		external: t,
		status: a?.disabled_by ? "disabled" : i ? i.state === "unavailable" ? "unavailable" : i.state === "unknown" ? "unknown" : "ready" : "missing",
		streaming: !!(Number(i?.attributes.supported_features) & 2)
	};
}
function En(e, t) {
	let n = new Set(t.entities.filter((e) => e.platform === "bambu_lab").map((e) => e.entity_id));
	return Object.keys(e).filter((e) => Cn.test(e) && !n.has(e)).map((n) => Tn(n, !0, e, t)).filter((e) => e.status !== "disabled").sort((e, t) => e.name.localeCompare(t.name) || e.entityId.localeCompare(t.entityId));
}
function Dn(e, t, n, r) {
	return Tn(t.entityId ?? e.camera?.entry.entity_id, t.entityId !== null, n, r);
}
// src/ha/user-data.ts
async function On(e, t) {
	let n = await e.callWS({
		type: "frontend/get_user_data",
		key: t
	});
	if (typeof n != "object" || !n || !Object.hasOwn(n, "value")) throw Error("HA returned an invalid frontend user-data response.");
	return n.value;
}
async function kn(e, t, n) {
	await e.callWS({
		type: "frontend/set_user_data",
		key: t,
		value: n
	});
}
// src/ha/cameras.ts
var An = class {
	constructor(e) {
		this.hass = e;
	}
	async load(e) {
		return wn(await On(this.hass, this.key(e)));
	}
	async save(e, t) {
		await kn(this.hass, this.key(e), wn(t));
	}
	key(e) {
		return `bambu_dashboard.camera_source.v1.${e}`;
	}
}, jn = class extends I {
	constructor(...e) {
		super(...e), this.language = "en", this.variant = "tile", this._loading = !1, this._saving = !1, this._error = "", this._open = !1, this._choice = "", this.generation = 0;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			printer: { attribute: !1 },
			registry: { attribute: !1 },
			language: { attribute: !1 },
			variant: {},
			_preference: { state: !0 },
			_loading: { state: !0 },
			_saving: { state: !0 },
			_error: { state: !0 },
			_open: { state: !0 },
			_choice: { state: !0 }
		};
	}
	createRenderRoot() {
		return this;
	}
	connectedCallback() {
		super.connectedCallback(), this.requestUpdate();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.generation++, this.context = void 0, this._open = !1;
	}
	willUpdate(e) {
		this.hass && this.printer && this.registry && (this.context?.connection !== this.hass.connection || this.context.printerId !== this.printer.id) && (this.context = {
			connection: this.hass.connection,
			printerId: this.printer.id
		}, this._preference = void 0, this._choice = "", this._open = !1, this._saving = !1, this.load(++this.generation));
	}
	updated() {
		gn(this);
		let e = this.querySelector("dialog");
		e && !e.open && e.showModal();
	}
	t(e) {
		return X(this.language, e);
	}
	get options() {
		return this.hass && this.registry ? En(this.hass.states, this.registry) : [];
	}
	get source() {
		return this.hass && this.printer && this.registry && this._preference ? Dn(this.printer, this._preference, this.hass.states, this.registry) : void 0;
	}
	async load(e = this.generation) {
		let t = this.hass, n = this.printer.id;
		this._loading = !0, this._error = "";
		try {
			let r = await new An(t).load(n);
			if (e !== this.generation) return;
			this._preference = r, this._choice = r.entityId || "";
		} catch (t) {
			e === this.generation && (this._error = R(t).message);
		} finally {
			e === this.generation && (this._loading = !1);
		}
	}
	openPicker() {
		this._choice = this._preference?.entityId || "", this._preference && (this._error = ""), this._open = !0;
	}
	closePicker() {
		this._saving || (this._open = !1);
	}
	async save() {
		if (this._saving || !this._preference) return;
		let e = this.generation, t = this.printer.id, n = {
			version: 1,
			entityId: this._choice || null
		};
		this._saving = !0, this._error = "";
		try {
			if (n.entityId && !this.options.some((e) => e.entityId === n.entityId)) throw Error(this.t("cameraSelectionMissing"));
			if (await new An(this.hass).save(t, n), e !== this.generation) return;
			this._preference = n, this._open = !1;
		} catch (t) {
			e === this.generation && (this._error = R(t).message);
		} finally {
			e === this.generation && (this._saving = !1);
		}
	}
	entry() {
		return j`<button class="button small camera-source-entry" aria-label=${`${this.t("externalCamera")} · ${this.printer?.name || ""}`} ?disabled=${this._loading} @click=${() => this.openPicker()}>${Z("camera")}${this.t(this.source?.external ? "cameraChange" : "externalCamera")}</button>`;
	}
	picture(e) {
		return this._loading || !e && !this._error ? j`<div class="camera-source-message" role="status">${this.t("loading")}</div>` : e ? e.status === "ready" ? j`<bambu-dashboard-camera .hass=${this.hass} .entity=${e.entityId}></bambu-dashboard-camera>` : j`<div class="camera-source-message" role="status">${Z("camera")}<span>${this.status(e)}</span><small>${e.name}</small></div>` : j`<div class="camera-source-message error" role="alert">${this.t("cameraLoadError")}: ${this._error}<button class="button small" @click=${() => void this.load()}>${this.t("retry")}</button></div>`;
	}
	status(e) {
		return e.status === "missing" ? this.t(e.external ? "cameraMissing" : "cameraBuiltinMissing") : this.t(e.status === "ready" ? "ready" : e.status);
	}
	picker() {
		if (!this._open) return N;
		let e = this.options, t = this._choice && !e.some((e) => e.entityId === this._choice), n = t && this.hass && this.printer && this.registry ? Dn(this.printer, {
			version: 1,
			entityId: this._choice
		}, this.hass.states, this.registry) : void 0;
		return j`<dialog class="dialog camera-picker" aria-label=${this.t("externalCamera")} @cancel=${(e) => {
			e.preventDefault(), this.closePicker();
		}} @click=${(e) => {
			e.target === e.currentTarget && this.closePicker();
		}}><div>
      <div class="panel-head"><h2>${Z("camera")} ${this.t("externalCamera")}</h2><button class="icon-button" aria-label=${this.t("close")} ?disabled=${this._saving} @click=${() => this.closePicker()}>${Z("close")}</button></div>
      <div class="dialog-body"><div class="dialog-target"><div><span>${this.t("printers")}</span><b>${this.printer?.name}</b></div></div>
        <p class="description">${this.t("cameraPickerHelp")}</p>
        ${this._error ? j`<div class="banner error" role="alert"><div class="copy">${this._error}</div>${this._preference ? N : j`<button class="button small" ?disabled=${this._loading} @click=${() => void this.load()}>${this.t("retry")}</button>`}</div>` : N}
        <label class="field"><span>${this.t("cameraSource")}</span><select aria-label=${this.t("cameraSource")} data-value=${this._choice} ?disabled=${this._loading || this._saving || !this._preference} @change=${(e) => {
			this._choice = e.target.value, this._error = "";
		}}>
          <option value="">${this.t("builtinCamera")}</option>
          ${t ? j`<option value=${this._choice} disabled>${this._choice} · ${n ? this.status(n) : this.t("cameraMissing")}</option>` : N}
          ${e.map((e) => j`<option value=${e.entityId}>${e.name} · ${e.entityId}${e.status === "ready" ? "" : ` · ${this.status(e)}`}</option>`)}
        </select></label>
        ${e.length ? N : j`<div class="camera-setup-empty"><b>${this.t("cameraNone")}</b><p>${this.t("cameraSetupHelp")}</p><a href="/config/integrations/dashboard" target="_blank" rel="noopener">${this.t("cameraSetupLink")} ↗</a></div>`}
        <p class="helper">${this.t("cameraAccountHelp")}</p>
      </div><div class="dialog-footer"><button class="button" ?disabled=${this._saving} @click=${() => this.closePicker()}>${this.t("cancel")}</button><button class="button primary" ?disabled=${this._loading || this._saving || !this._preference} @click=${() => void this.save()}>${this.t(this._saving ? "saving" : "cameraSave")}</button></div>
    </div></dialog>`;
	}
	render() {
		let e = this.source, t = this.t(e ? e.external ? "externalCamera" : "builtinCamera" : this._error ? "cameraLoadError" : "loading"), n = e ? e.external ? "external" : "builtin" : "pending";
		return this.variant === "detail" ? j`<section class="panel camera-panel"><div class="panel-head"><h2>${Z("camera")} ${this.t("camera")}</h2>${this.entry()}</div><div class="camera-large" data-camera-kind=${n}>${this.picture(e)}</div><div class="camera-source-caption"><b>${t}</b><span>${e?.name || ""}</span><small>${e?.status === "ready" ? this.t(e.streaming ? "live" : "snapshot") : e ? this.status(e) : ""}</small></div></section>${this.picker()}` : j`<div class="preview camera-source-tile" aria-label=${this.t("camera")} data-camera-kind=${n}>${this.picture(e)}${this.entry()}<span class="preview-caption" title=${e?.name || ""}>${t}${e?.external ? ` · ${e.name}` : ""}</span></div>${this.picker()}`;
	}
};
customElements.define("bambu-printer-camera", jn);
// src/ui/diagnostics.ts
var Mn = [
	{
		key: "online",
		label: "deviceOnline",
		domain: "binary_sensor"
	},
	{
		key: "wifi_signal",
		label: "wifiSignal"
	},
	{
		key: "mqtt_mode",
		label: "connectionMode"
	},
	{
		key: "sdcard_status",
		label: "sdCard"
	},
	{
		key: "nozzle_diameter",
		label: "nozzleDiameter"
	},
	{
		key: "nozzle_type",
		label: "nozzleType"
	},
	{
		key: "firmware_update",
		label: "firmwareStatus",
		domain: "binary_sensor"
	},
	{
		key: "total_usage_hours",
		label: "estimatedUsage"
	}
], Nn = class extends I {
	constructor(...e) {
		super(...e), this.language = "en", this.variant = "alerts";
	}
	static {
		this.properties = {
			printer: { attribute: !1 },
			language: { attribute: !1 },
			variant: {}
		};
	}
	createRenderRoot() {
		return this;
	}
	t(e) {
		return X(this.language, e);
	}
	deviceValue(e) {
		let t = rn(this.printer, e.key, e.domain);
		if (Ze(t) !== "ready") return _n(this.language, t);
		if (e.domain === "binary_sensor") {
			let n = an(t);
			return n === null ? `${this.t("unknown")} · ${t.state.state}` : e.key === "online" ? this.t(n ? "online" : "offline") : this.t(n ? "firmwareAvailable" : "firmwareNoUpdate");
		}
		let n = t.state.state, r = {
			local: "connectionLocal",
			bambu_cloud: "connectionCloud",
			normal: "sdNormal",
			missing: "sdMissing",
			abnormal: "sdAbnormal",
			hardened_steel: "hardenedSteel",
			stainless_steel: "stainlessSteel"
		};
		return r[n] ? this.t(r[n]) : _n(this.language, t);
	}
	render() {
		if (!this.printer) return N;
		if (this.variant === "device") return j`<section class="panel device-health"><div class="panel-head"><h2>${Z("connection")} ${this.t("deviceHealth")}</h2><span class="description">${this.printer.model}</span></div><dl class="device-readings">${Mn.map((e) => j`<div><dt>${this.t(e.label)}</dt><dd>${this.deviceValue(e)}</dd></div>`)}</dl><p class="panel-note">${this.t("usageEstimateHelp")}</p></section>`;
		let { groups: e, status: t } = un(this.printer);
		return j`<section class="panel alerts-panel"><div class="panel-head"><h2>${Z("alert")} ${this.t("alerts")}</h2><span class="diagnostic-state ${t}">${this.t({
			offline: "alertsOffline",
			alert: "alertsActive",
			clear: "alertsClear",
			unknown: "alertsUnknown"
		}[t])}</span></div><div class="diagnostic-body">
      ${t === "offline" ? j`<p class="diagnostic-warning">${this.t("alertsOfflineHelp")}</p>` : N}
      ${this.printer.status === "failed" ? j`<p class="diagnostic-warning">${this.t("printStatusFailed")}</p>` : N}
      ${e.map((e) => j`<div class="diagnostic-group"><div class="diagnostic-group-title"><b>${this.t(e.kind === "hms_errors" ? "hmsErrors" : "printError")}</b><span class=${e.active ? "diagnostic-warning" : "description"}>${e.active === null ? e.invalid ? this.t("diagnosticInvalid") : this.t(e.availability === "ready" ? "unknown" : e.availability) : this.t(e.active ? "reportedFault" : "noReportedFault")}</span></div>
        ${e.invalid ? j`<p class="diagnostic-warning" role="alert">${this.t("diagnosticDetailsInvalid")}${e.detailError ? ` · ${e.detailError}` : ""}</p>` : N}
        ${e.active && !e.alerts.length ? j`<p class="description">${this.t("diagnosticDetailsMissing")}</p>` : N}
        ${e.alerts.map((e) => j`<article class="printer-alert"><div><b>${e.code || this.t("reportedFault")}</b>${e.severity ? j`<span class="alert-severity">${e.severity}</span>` : N}</div><p>${e.description || this.t("diagnosticDetailsMissing")}</p>${e.wiki ? j`<a href=${e.wiki} target="_blank" rel="noopener noreferrer">${this.t("officialTroubleshooting")} ↗</a>` : e.linkRejected ? j`<small>${this.t("diagnosticLinkInvalid")}</small>` : N}</article>`)}
      </div>`)}
    </div><p class="panel-note">${this.t("alertsScopeHelp")}</p></section>`;
	}
};
customElements.define("bambu-printer-diagnostics", Nn);
// src/domain/history.ts
function Pn(e, t) {
	return (t === "temperature" ? [
		"nozzle_temp",
		"target_nozzle_temp",
		"bed_temp",
		"target_bed_temp"
	] : [
		"print_status",
		"hms_errors",
		"print_error"
	]).map((t, n) => ({
		key: t,
		entity: rn(e, t, t === "hms_errors" || t === "print_error" ? "binary_sensor" : "sensor"),
		color: n < 2 ? "var(--bd-accent)" : "var(--bd-chart-secondary, #438bcc)",
		target: t.startsWith("target_")
	}));
}
function Fn(e, t) {
	if (!Array.isArray(e)) throw Error("HA returned an invalid history response.");
	let n = new Map(t.map((e) => [e, []]));
	for (let t of e) {
		if (!Array.isArray(t)) throw Error("HA returned an invalid history group.");
		for (let e of t) {
			if (typeof e != "object" || !e || typeof e.entity_id != "string" || !n.has(e.entity_id) || typeof e.state != "string" || typeof e.last_changed != "string") throw Error("HA returned an invalid history state.");
			let t = Date.parse(e.last_changed);
			if (!Number.isFinite(t)) throw Error("HA returned an invalid history timestamp.");
			let r = e.attributes?.unit_of_measurement;
			if (r !== void 0 && typeof r != "string") throw Error("HA returned an invalid historical temperature unit.");
			n.get(e.entity_id).push({
				entityId: e.entity_id,
				state: e.state,
				time: t,
				unit: r
			});
		}
	}
	for (let e of n.values()) e.sort((e, t) => e.time - t.time);
	return n;
}
function In(e) {
	if (!e.state.trim() || e.state === "unknown" || e.state === "unavailable") return null;
	let t = Number(e.state);
	return Number.isFinite(t) ? e.unit === "°C" ? t : e.unit === "°F" ? (t - 32) * 5 / 9 : e.unit === "K" ? t - 273.15 : null : null;
}
function Ln(e, t) {
	let n = 0, r = e.length;
	for (; n < r;) {
		let i = Math.floor((n + r) / 2);
		e[i].time <= t ? n = i + 1 : r = i;
	}
	return e[n - 1];
}
function Rn(e, t, n) {
	let r = [], i = [];
	for (let a of e) {
		if (a.time > n) continue;
		let e = In(a);
		e === null ? (i.length && r.push(i), i = []) : i.push({
			time: Math.max(t, a.time),
			value: e
		});
	}
	return i.length && (i.push({
		time: n,
		value: i.at(-1).value
	}), r.push(i)), r;
}
function zn(e, t, n, r) {
	let i = [];
	for (let a of e) {
		if (!a.entity) continue;
		let e;
		for (let o of t.get(a.entity.entry.entity_id) || []) o.state !== e && (o.time >= n && o.time <= r && i.push({
			...o,
			kind: a.key,
			previous: e
		}), e = o.state);
	}
	return i.sort((e, t) => t.time - e.time || e.entityId.localeCompare(t.entityId));
}
// src/ha/history.ts
var Bn = class {
	constructor(e) {
		this.hass = e;
	}
	async read(e, t, n, r) {
		if (!e.length || e.some((e) => !/^(sensor|binary_sensor)\.[a-z0-9_]+$/.test(e))) throw Error("History requires explicit sensor entity IDs.");
		if (!Number.isFinite(t) || !Number.isFinite(n) || n <= t) throw Error("History requires a valid time range.");
		let i = new URLSearchParams({
			filter_entity_id: [...new Set(e)].join(","),
			end_time: new Date(n).toISOString(),
			significant_changes_only: "0"
		});
		return r === "events" && (i.set("no_attributes", "1"), i.set("skip_initial_state", "1")), Fn(await this.hass.callApi("GET", `history/period/${encodeURIComponent(new Date(t).toISOString())}?${i}`), e);
	}
}, Vn = 36e5, Hn = 6e4, Un = 36, Wn = 12, Gn = {
	nozzle_temp: "nozzle",
	target_nozzle_temp: "targetNozzle",
	bed_temp: "bed",
	target_bed_temp: "targetBed"
}, Kn = class extends I {
	constructor(...e) {
		super(...e), this.language = "en", this.variant = "temperature", this.now = Date.now(), this._loading = !1, this._error = "", this._start = 0, this._end = 0, this._hours = 1, this._hiddenSeries = /* @__PURE__ */ new Set(), this._chartWidth = 320, this.generation = 0;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			printer: { attribute: !1 },
			language: { attribute: !1 },
			variant: {},
			now: { attribute: !1 },
			_records: { state: !0 },
			_loading: { state: !0 },
			_error: { state: !0 },
			_start: { state: !0 },
			_end: { state: !0 },
			_hours: { state: !0 },
			_hiddenSeries: { state: !0 },
			_cursor: { state: !0 },
			_chartWidth: { state: !0 }
		};
	}
	createRenderRoot() {
		return this;
	}
	connectedCallback() {
		super.connectedCallback(), this.resize = new ResizeObserver(([e]) => {
			e.contentRect.width > 0 && (this._chartWidth = e.contentRect.width - 20);
		}), this.resize.observe(this), this.requestUpdate();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.resize?.disconnect(), this.generation++, this.context = void 0;
	}
	t(e) {
		return X(this.language, e);
	}
	get specs() {
		return this.printer ? Pn(this.printer, this.variant) : [];
	}
	get entityIds() {
		return this.specs.filter(({ entity: e }) => e && !e.entry.disabled_by).map(({ entity: e }) => e.entry.entity_id);
	}
	willUpdate(e) {
		if (!this.isConnected || !this.hass || !this.printer) return;
		let t = JSON.stringify([
			this.printer.id,
			this.variant,
			this.entityIds,
			this.variant === "temperature" ? this._hours : 24
		]);
		(this.context?.connection !== this.hass.connection || this.context.signature !== t) && (this.context = {
			connection: this.hass.connection,
			signature: t
		}, this.generation++, this._records = void 0, this._loading = !1, this._error = "", this._end = 0, this._cursor = void 0, this.requestedMinute = void 0), this.entityIds.length && !this._loading && this.requestedMinute !== Math.floor(this.now / Hn) && this.load();
	}
	async load() {
		if (!this.isConnected || this._loading || !this.hass || !this.entityIds.length) return;
		let e = this.generation, t = this.hass, n = this.variant, r = this.now, i = r - (n === "temperature" ? this._hours : 24) * Vn, a = this.entityIds;
		this.requestedMinute = Math.floor(this.now / Hn), this._loading = !0, this._error = "";
		try {
			let o = await new Bn(t).read(a, i, r, n);
			if (e !== this.generation) return;
			this._records = o, this._start = i, this._end = r;
		} catch (t) {
			e === this.generation && (this._error = R(t).message);
		} finally {
			e === this.generation && (this._loading = !1);
		}
	}
	time(e, t = !1) {
		return new Intl.DateTimeFormat(this.language, {
			timeZone: this.hass?.config?.time_zone,
			...t ? {
				month: "2-digit",
				day: "2-digit"
			} : {},
			hour: "2-digit",
			minute: "2-digit",
			hour12: !1
		}).format(e);
	}
	number(e) {
		return new Intl.NumberFormat(this.language, { maximumFractionDigits: 1 }).format(e);
	}
	inspect(e) {
		let t = e.currentTarget.getBoundingClientRect(), n = ((e.clientX - t.left) / t.width * this._chartWidth - Un) / (this._chartWidth - Un - Wn);
		this._cursor = this._start + Math.max(0, Math.min(1, n)) * (this._end - this._start);
	}
	inspectKey(e) {
		let t = {
			ArrowLeft: -6e4,
			ArrowRight: Hn,
			PageDown: -36e5,
			PageUp: Vn
		};
		if (!(e.key in t) && !["Home", "End"].includes(e.key)) return;
		e.preventDefault();
		let n = e.key === "Home" ? this._start : e.key === "End" ? this._end : (this._cursor ?? this._end) + t[e.key];
		this._cursor = Math.max(this._start, Math.min(this._end, n));
	}
	toggleSeries(e) {
		let t = new Set(this._hiddenSeries);
		t.has(e) ? t.delete(e) : t.add(e), this._hiddenSeries = t;
	}
	temperatures() {
		let e = this.specs.map((e) => {
			let t = e.entity && this._records.get(e.entity.entry.entity_id) || [];
			return {
				...e,
				points: t,
				segments: Rn(t, this._start, this._end)
			};
		});
		if (!e.some((e) => e.segments.length)) return this.empty("noTemperatureHistory");
		let t = e.filter((e) => !this._hiddenSeries.has(e.key)), n = t.flatMap((e) => e.segments.flatMap((e) => e.map((e) => e.value))), r = n.reduce((e, t) => Math.min(e, t), Infinity), i = n.reduce((e, t) => Math.max(e, t), -Infinity);
		if (r === i) {
			let e = Math.max(Math.abs(r) * .05, 1);
			r -= e, i += e;
		}
		let a = this._chartWidth - Wn, o = (e) => Un + (e - this._start) / (this._end - this._start) * (a - Un), s = (e) => 145 - (e - r) / (i - r) * 124, c = this._cursor === void 0 ? void 0 : Math.max(this._start, Math.min(this._end, this._cursor));
		return j`<div class="temperature-plot">${n.length ? j`<div class="temperature-chart">${he`<svg viewBox=${`0 0 ${this._chartWidth} 174`} role="slider" tabindex="0" aria-label=${this.t("temperatureChartLabel")} aria-valuemin=${this._start} aria-valuemax=${this._end} aria-valuenow=${c ?? this._end} aria-valuetext=${this.time(c ?? this._end, !0)} @pointerdown=${(e) => this.inspect(e)} @pointermove=${(e) => this.inspect(e)} @pointerleave=${(e) => {
			e.pointerType === "mouse" && (this._cursor = void 0);
		}} @pointercancel=${() => {
			this._cursor = void 0;
		}} @blur=${() => {
			this._cursor = void 0;
		}} @keydown=${(e) => this.inspectKey(e)}>
      <text x="4" y="13" class="chart-axis">°C</text>
      ${[
			r,
			(r + i) / 2,
			i
		].map((e) => he`<line x1=${Un} x2=${a} y1=${s(e)} y2=${s(e)} class="chart-grid"></line><text x="30" y=${s(e) + 4} text-anchor="end" class="chart-axis">${this.number(e)}</text>`)}
      ${t.map((e) => e.segments.map((t) => he`<path d=${t.map((e, t) => `${t ? "L" : "M"}${o(e.time).toFixed(2)},${s(e.value).toFixed(2)}`).join(" ")} fill="none" stroke=${e.color} stroke-width=${e.target ? "1.5" : "2"} stroke-dasharray=${e.target ? "4 3" : "none"}></path>`))}
      ${c === void 0 ? N : he`<line class="chart-cursor" x1=${o(c)} x2=${o(c)} y1="21" y2="145"></line>`}
      <text x=${Un} y="166" class="chart-axis">${this.time(this._start, this._hours > 1)}</text><text x=${a} y="166" text-anchor="end" class="chart-axis">${this.time(this._end, this._hours > 1)}</text>
    </svg`}</div>` : j`<div class="history-empty">${this.t(t.length ? "noTemperatureHistory" : "chartAllHidden")}</div>`}
    ${c !== void 0 && t.length ? j`<div class="chart-inspection" role="status"><b>${this.time(c, !0)}</b>${t.map((e) => {
			let t = Ln(e.points, c), n = t ? In(t) : null;
			return j`<div><span>${this.t(Gn[e.key])}</span><b>${n === null ? this.t("noRecordedValue") : `${this.number(n)} °C`}</b><small>${t ? `${this.t("chartSampleAt")} ${this.time(t.time, !0)}` : this.t("noRecordedValue")}</small></div>`;
		})}</div>` : N}</div>
    <div class="chart-legend">${e.map((e) => {
			let t = e.points.at(-1), n = t ? In(t) : null;
			return j`<button class=${this._hiddenSeries.has(e.key) ? "series-hidden" : ""} aria-pressed=${!this._hiddenSeries.has(e.key)} aria-label=${`${this.t("chartToggle")} ${this.t(Gn[e.key])}`} @click=${() => this.toggleSeries(e.key)}><span class="legend-swatch ${e.target ? "target" : ""}" style=${`--series-color:${e.color}`}></span><span>${this.t(Gn[e.key])}</span><b>${n === null ? this.t(e.entity ? "noRecordedValue" : "unsupported") : `${this.number(n)} °C`}</b></button>`;
		})}</div><p class="panel-note">${this.t("temperatureHistoryHelp")} ${this.t("chartInspectHelp")}</p>`;
	}
	eventTitle(e) {
		if (e.kind === "hms_errors" || e.kind === "print_error") return `${this.t(e.kind === "hms_errors" ? "hmsErrors" : "printError")} · ${e.state === "on" ? this.t("reportedFault") : e.state === "off" ? this.t("faultCleared") : e.state}`;
		if (e.state === "running" && e.previous === "pause") return this.t("eventResumed");
		if (e.state === "running" && [
			"prepare",
			"idle",
			"finish"
		].includes(e.previous || "")) return this.t("eventStarted");
		let t = {
			running: "running",
			printing: "running",
			prepare: "prepare",
			pause: "pause",
			paused_user: "pause",
			finish: "eventFinished",
			failed: "failed",
			idle: "idle",
			offline: "offline",
			unavailable: "unavailable",
			unknown: "unknown"
		};
		return t[e.state] ? this.t(t[e.state]) : e.state;
	}
	events() {
		let e = zn(this.specs, this._records, this._start, this._end);
		return e.length ? j`<ol class="printer-event-list">${e.map((e) => j`<li class=${e.kind !== "print_status" && e.state === "on" ? "fault" : ""}><span class="event-dot"></span><div><b>${this.eventTitle(e)}</b><time datetime=${new Date(e.time).toISOString()}>${this.time(e.time, !0)}</time></div></li>`)}</ol><p class="panel-note">${this.t("recentEventsHelp")} · ${e.length}</p>` : this.empty("noRecentEvents");
	}
	empty(e) {
		return j`<div class="history-empty"><span>${this.t(e)}</span><small>${this.t("historyRecorderHelp")}</small></div>`;
	}
	render() {
		let e = this.specs.filter(({ entity: e }) => !e || e.entry.disabled_by);
		return j`<section class="panel printer-history ${this.variant}"><div class="panel-head"><h2>${Z(this.variant === "temperature" ? "chart" : "clock")} ${this.t(this.variant === "temperature" ? "temperatureHistory" : "recentEvents")}</h2><button class="icon-button" aria-label=${this.t("refreshHistory")} ?disabled=${this._loading || !this.entityIds.length} @click=${() => {
			this.now = Date.now(), this.load();
		}}>${Z("refresh")}</button></div>
      ${this.variant === "temperature" ? j`<div class="history-ranges" role="group" aria-label=${this.t("historyRange")}>${[
			1,
			6,
			24
		].map((e) => j`<button class="button small ${this._hours === e ? "selected" : ""}" aria-pressed=${this._hours === e} @click=${() => {
			this._hours = e;
		}}>${e} ${this.t("hourUnit")}</button>`)}</div>` : N}
      <div class="history-meta" role="status">${this.t(this.variant === "events" || this._hours === 24 ? "historyDay" : this._hours === 6 ? "historySixHours" : "historyHour")} · ${this._loading ? this.t("historyRefreshing") : this._end ? `${this.t("historyAsOf")} ${this.time(this._end)}` : this.t("notLoaded")}</div>
      ${this._error ? j`<div class="history-error" role="alert"><b>${this.t("historyReadError")}</b><span>${this._error}</span><small>${this.t("historyRecorderHelp")}</small><button class="button small" ?disabled=${this._loading} @click=${() => {
			this.now = Date.now(), this.load();
		}}>${this.t("retry")}</button></div>` : N}
      ${e.length ? j`<p class="panel-note">${this.t("historyMissingEntities")}: ${e.map((e) => `${e.key} (${this.t(Ze(e.entity) === "disabled" ? "disabled" : "unsupported")})`).join(", ")}</p>` : N}
      ${this.entityIds.length ? this._records ? this.variant === "temperature" ? this.temperatures() : this.events() : this._error ? N : j`<div class="history-empty">${this.t("loading")}</div>` : this.empty("historyUnsupported")}
      ${this._error && this._records ? j`<p class="panel-note">${this.t("historyRetainedData")} ${this.time(this._end, !0)}</p>` : N}
    </section>`;
	}
};
customElements.define("bambu-printer-history", Kn);
// src/domain/notifications.ts
var qn = "Managed by Bambu Dashboard Card: completion-notification/v1/";
function Jn(e) {
	if (!/^[a-zA-Z0-9_-]+$/.test(e)) throw Error("Invalid registered device identifier.");
	return e;
}
function Yn(e) {
	if (!/^sensor\.[a-z0-9_]+$/.test(e)) throw Error("Invalid registered sensor entity ID.");
	return e;
}
function Xn(e) {
	return `bambu_dashboard_finish_${Jn(e)}`;
}
function Q(e) {
	return `${e.kind}:${e.id}`;
}
function Zn(e, t, n) {
	let r = e.entities.filter((e) => e.entity_id.startsWith("notify.") && !e.disabled_by).map((r) => {
		let i = t[r.entity_id], a = e.devices.find((e) => e.id === r.device_id);
		return {
			kind: "entity",
			id: r.entity_id,
			label: r.name || String(i?.attributes.friendly_name || a?.name_by_user || a?.name || r.original_name || r.entity_id),
			available: !!(i && i.state !== "unavailable" && n.notify?.send_message)
		};
	});
	for (let e of Object.keys(n.notify || {})) /^mobile_app_[a-z0-9_]+$/.test(e) && r.push({
		kind: "service",
		id: `notify.${e}`,
		label: e.slice(11).replaceAll("_", " "),
		available: !0
	});
	return r.sort((e, t) => e.label.localeCompare(t.label) || e.id.localeCompare(t.id));
}
function Qn(e, t) {
	let n = e.target;
	if (n.kind === "entity" ? !/^notify\.[a-z0-9_]+$/.test(n.id) : n.kind !== "service" || !/^notify\.mobile_app_[a-z0-9_]+$/.test(n.id)) throw Error("Select a specific notification entity or mobile-app destination.");
	if (e.style !== "standard" && n.kind !== "service") throw Error("Android alarm alerts require a specific mobile_app service; notify.send_message does not accept channel data.");
	let r = e.style === "android_tts" ? {
		title: t.title,
		message: "TTS",
		data: {
			ttl: 0,
			priority: "high",
			media_stream: "alarm_stream",
			tts_text: t.message
		}
	} : {
		...t,
		...e.style === "android_alarm" ? { data: {
			ttl: 0,
			priority: "high",
			channel: "alarm_stream"
		} } : {}
	};
	return n.kind === "entity" ? {
		action: "notify.send_message",
		target: { entity_id: n.id },
		data: r
	} : {
		action: n.id,
		data: r
	};
}
function $n(e, t) {
	return Qn(t, {
		title: t.language === "zh" ? "打印提醒测试" : "Print reminder test",
		message: t.language === "zh" ? `${e.name}：这是一条测试提醒，请确认手机是否响铃。` : `Test reminder for ${e.name}. Please check whether your phone sounds.`
	});
}
function er(e, t) {
	let n = z(e.entities, "print_status");
	if (!n || n.entry.device_id !== e.id) throw Error("The printer has no registered print-status sensor.");
	let r = Jn(e.id), i = z(e.entities, "subtask_name");
	if (i && i.entry.device_id !== e.id) throw Error("The project sensor does not belong to this printer.");
	let a = `{{ device_attr('${r}', 'name_by_user') or device_attr('${r}', 'name') or 'Bambu Lab' }}`, o = i ? `{{ states('${Yn(i.entry.entity_id)}') }}` : "", s = Qn(t, {
		title: t.language === "zh" ? "3D 打印已完成" : "3D print completed",
		message: t.language === "zh" ? `${a} 已完成打印。${o}` : `${a} finished printing. ${o}`
	});
	return {
		id: Xn(r),
		alias: `Bambu Dashboard · Print complete · ${e.name}`,
		description: `${qn}${r}`,
		initial_state: t.enabled,
		triggers: [{
			trigger: "state",
			entity_id: Yn(n.entry.entity_id),
			from: ["running", "pause"],
			to: "finish"
		}],
		conditions: [],
		actions: [s],
		mode: "queued"
	};
}
function $(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function tr(e, t) {
	if (e === t) return !0;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length && e.every((e, n) => tr(e, t[n]));
	if (!$(e) || !$(t)) return !1;
	let n = Object.keys(e);
	return n.length === Object.keys(t).length && n.every((n) => Object.hasOwn(t, n) && tr(e[n], t[n]));
}
function nr(e, t) {
	if (!$(t) || t.id !== Xn(e.id) || t.description !== `${qn}${e.id}`) throw Error("This automation ID is owned by another configuration. It will not be overwritten.");
	let n = t.actions, r = Array.isArray(n) && n.length === 1 && $(n[0]) ? n[0] : void 0, i = r && $(r.target) ? r.target.entity_id : void 0, a = r?.action === "notify.send_message" && typeof i == "string" ? {
		kind: "entity",
		id: i
	} : {
		kind: "service",
		id: String(r?.action)
	}, o = r && $(r.data) ? r.data.title : void 0, s = r && $(r.data) ? r.data : void 0, c = s?.message === "TTS" && $(s.data) && s.data.media_stream === "alarm_stream" ? "android_tts" : s?.data === void 0 ? "standard" : "android_alarm", l = o === "3D 打印已完成" ? "zh" : o === "3D print completed" ? "en" : void 0;
	if (typeof t.initial_state != "boolean" || !l || typeof t.alias != "string") throw Error("The managed notification automation was customized or has an unsupported version. Duplicate it before editing.");
	let u = {
		enabled: t.initial_state,
		target: a,
		language: l,
		style: c
	};
	if (!tr(t, {
		...er(e, u),
		alias: t.alias
	})) throw Error("The managed notification automation was customized or its sensor IDs changed. Review it in HA before saving.");
	return {
		config: t,
		settings: u
	};
}
function rr(e, t) {
	let n = Xn(t);
	return Object.values(e).find((e) => e.entity_id.startsWith("automation.") && e.attributes.id === n);
}
// src/ha/notifications.ts
var ir = class {
	constructor(e) {
		this.hass = e;
	}
	async services() {
		let e = await this.hass.callWS({ type: "get_services" });
		if (!$(e) || !Object.values(e).every((e) => $(e) && Object.values(e).every((e) => $(e) && (e.name === void 0 || typeof e.name == "string")))) throw Error("HA returned an invalid service catalog.");
		return e;
	}
	async load(e) {
		let t = await this.request(e.id, "GET");
		return t === null ? null : nr(e, t);
	}
	async save(e, t, n) {
		let r = await this.load(e);
		if (!tr(r?.config ?? null, n)) throw Error("Notification settings changed in HA. Refresh before saving again.");
		let i = er(e, t), a = await this.request(e.id, "POST", i);
		if (!$(a) || a.result !== "ok") throw Error("HA did not confirm saving the notification automation.");
		let o = rr(this.hass.states, e.id);
		return tr(r?.config, i) && o && o.state !== (t.enabled ? "on" : "off") && await this.hass.callService("automation", t.enabled ? "turn_on" : "turn_off", { entity_id: o.entity_id }), {
			config: i,
			settings: t
		};
	}
	async loadedConfig(e) {
		let t = await this.hass.callWS({
			type: "automation/config",
			entity_id: e
		});
		if (!$(t) || !$(t.config)) throw Error("HA returned an invalid loaded automation configuration.");
		return t.config;
	}
	async test(e, t) {
		let n = $n(e, t);
		await this.hass.callService("notify", n.action.slice(7), {
			...n.data,
			...n.target ? { entity_id: n.target.entity_id } : {}
		});
	}
	async request(e, t, n) {
		let r = await this.hass.fetchWithAuth(`/api/config/automation/config/${encodeURIComponent(Xn(e))}`, t === "GET" ? void 0 : {
			method: t,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(n)
		}), i;
		try {
			i = await r.json();
		} catch (e) {
			throw Error(`Notification configuration: HTTP ${r.status}; invalid JSON response. ${R(e).message}`);
		}
		if (t === "GET" && r.status === 404 && $(i) && i.message === "Resource not found") return null;
		if (!r.ok) {
			let e = $(i) && typeof i.message == "string" ? i.message : r.statusText;
			throw Error(`Notification configuration: HTTP ${r.status}. ${e}`);
		}
		return i;
	}
}, ar = class extends I {
	constructor(...e) {
		super(...e), this.language = "en", this.compact = !1, this._services = {}, this._enabled = !1, this._recipient = "", this._style = "android_alarm", this._loading = !1, this._saving = !1, this._error = "", this._runtimeError = "", this._dirty = !1, this.generation = 0, this.runtimeSequence = 0;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			printer: { attribute: !1 },
			registry: { attribute: !1 },
			language: { attribute: !1 },
			compact: {
				type: Boolean,
				reflect: !0
			},
			_saved: { state: !0 },
			_services: { state: !0 },
			_enabled: { state: !0 },
			_recipient: { state: !0 },
			_style: { state: !0 },
			_loading: { state: !0 },
			_saving: { state: !0 },
			_error: { state: !0 },
			_runtimeConfig: { state: !0 },
			_runtimeError: { state: !0 },
			_dirty: { state: !0 },
			_test: { state: !0 }
		};
	}
	static {
		this.styles = o`
    :host { display: block; margin-top: 18px; }
    * { box-sizing: border-box; }
    section { background: var(--bd-surface); border: 1px solid var(--bd-line); border-radius: var(--bd-card-radius); box-shadow: var(--bd-shadow); overflow: hidden; }
    header { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 18px 20px; background: linear-gradient(110deg, color-mix(in srgb, var(--bd-panel) 36%, transparent), transparent); border-bottom: 1px solid var(--bd-line); }
    h2 { font-size: 13px; font-weight: 650; margin: 0; }
    .body { padding: 18px 20px; }
    p { margin: 0 0 14px; color: var(--bd-muted); font-size: 12px; line-height: 1.6; }
    .fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(170px, 100%), 1fr)); gap: 12px; margin: 12px 0; }
    label { display: flex; flex-direction: column; gap: 7px; font-size: 11px; color: var(--bd-muted); min-width: 0; }
    .check { flex-direction: row; align-items: center; color: var(--bd-text); font-size: 13px; }
    input { accent-color: var(--bd-accent); width: 17px; height: 17px; }
    select { width: 100%; min-width: 0; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--bd-line); background: var(--bd-inset); color: var(--bd-text); font: inherit; font-size: 12px; }
    button { border: 1px solid var(--bd-line); background: var(--bd-inset); color: var(--bd-text); padding: 8px 13px; border-radius: 12px; box-shadow: 0 2px 6px #183c3005; cursor: pointer; font: inherit; font-size: 12px; }
    button.primary { background: linear-gradient(145deg, var(--bd-accent), color-mix(in srgb, var(--bd-accent) 86%, #087a32)); color: #052b12; border-color: transparent; box-shadow: 0 4px 12px #00ae421c; font-weight: 650; }
    button:disabled, select:disabled, input:disabled { opacity: .5; cursor: not-allowed; }
    button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid var(--bd-accent); outline-offset: 3px; }
    .footer { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
    .status { font-size: 12px; color: var(--bd-muted); }
    .status.active { color: var(--bd-accent); }
    .error { color: var(--bd-danger); overflow-wrap: anywhere; margin-bottom: 14px; font-size: 12px; }
    .helper { font-size: 11px; margin: 12px 0 0; }
    .automation { color: var(--bd-accent); border: 0; background: none; padding: 0; margin-top: 12px; }
    .compact-summary { display: grid; gap: 5px; margin-bottom: 12px; font-size: 12px; overflow-wrap: anywhere; }
    .compact-summary small { color: var(--bd-muted); }
    summary { color: var(--bd-accent); cursor: pointer; font-size: 12px; }
    details[open] > summary { margin-bottom: 14px; }
    :host([compact]) header { padding: 12px 14px; }
    :host([compact]) .body { padding: 14px; }
    @media (max-width:700px) { .fields { grid-template-columns: 1fr; } }
  `;
	}
	connectedCallback() {
		super.connectedCallback(), this.requestUpdate();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.generation++, this.unsubscribe?.(), this.unsubscribe = void 0, this.context = void 0;
	}
	willUpdate(e) {
		if (!this.hass || !this.printer || !this.registry) return;
		let { connection: t, user: n } = this.hass;
		if (this.context?.connection !== t || this.context?.printerId !== this.printer.id || this.context?.admin !== n?.is_admin) {
			this.unsubscribe?.(), this.unsubscribe = void 0, this.context = {
				connection: t,
				printerId: this.printer.id,
				admin: n?.is_admin
			};
			let e = ++this.generation;
			this._saved = void 0, this._saving = !1, this._enabled = !1, this._recipient = "", this._style = "android_alarm", this._dirty = !1, this._test = void 0, this._runtimeConfig = void 0, this._runtimeError = "", this.runtimeId = void 0, n?.is_admin !== !1 && this.initialize(e);
		} else e.has("hass") && this._saved && rr(this.hass.states, this.printer.id)?.entity_id !== this.runtimeId && this.verifyRuntime(this.generation);
	}
	updated() {
		gn(this.renderRoot);
	}
	t(e) {
		return X(this.language, e);
	}
	get targets() {
		return this.hass && this.registry ? Zn(this.registry, this.hass.states, this._services).filter((e) => this._style === "standard" || e.kind === "service") : [];
	}
	async initialize(e) {
		this._loading = !0, this._error = "", this._test = void 0;
		let t = this.hass;
		try {
			let n = await t.connection.subscribeEvents(() => {
				this.verifyRuntime(e);
			}, "automation_reloaded");
			if (e !== this.generation) {
				n();
				return;
			}
			this.unsubscribe = n, await this.load(e);
		} catch (t) {
			e === this.generation && (this._error = R(t).message);
		} finally {
			e === this.generation && (this._loading = !1);
		}
	}
	async load(e = this.generation) {
		let t = this.hass, n = this.printer;
		this._loading = !0, this._error = "", this._test = void 0;
		try {
			let r = new ir(t), [i, a] = await Promise.all([r.load(n), r.services()]);
			if (e !== this.generation) return;
			this._saved = i, this._services = a, this._enabled = i?.settings.enabled ?? !1, this._recipient = i ? Q(i.settings.target) : "", this._style = i?.settings.style ?? "android_alarm", this._dirty = !1, await this.verifyRuntime(e);
		} catch (t) {
			e === this.generation && (this._error = R(t).message);
		} finally {
			e === this.generation && (this._loading = !1);
		}
	}
	async verifyRuntime(e) {
		if (e !== this.generation) return;
		let t = ++this.runtimeSequence, n = this.hass && this.printer ? rr(this.hass.states, this.printer.id) : void 0;
		if (this.runtimeId = n?.entity_id, this._runtimeConfig = void 0, this._runtimeError = "", n && this._saved) try {
			let r = await new ir(this.hass).loadedConfig(n.entity_id);
			e === this.generation && t === this.runtimeSequence && (this._runtimeConfig = r);
		} catch (n) {
			e === this.generation && t === this.runtimeSequence && (this._runtimeError = R(n).message);
		}
	}
	async save() {
		let e = this.generation, t = this.printer, n = this.hass;
		this._saving = !0, this._error = "";
		try {
			let r = this.targets.find((e) => Q(e) === this._recipient);
			if (!r && (this._enabled || !this._saved || Q(this._saved.settings.target) !== this._recipient)) throw Error(this.t("chooseRecipient"));
			if (this._enabled && !r?.available) throw Error(this.t("notifyTargetUnavailable"));
			let i = {
				enabled: this._enabled,
				target: r ? {
					kind: r.kind,
					id: r.id
				} : this._saved.settings.target,
				language: this.language,
				style: this._style
			}, a = await new ir(n).save(t, i, this._saved?.config ?? null);
			if (e !== this.generation) return;
			this._saved = a, this._dirty = !1, this._runtimeConfig = void 0, await this.verifyRuntime(e);
		} catch (t) {
			e === this.generation && (this._error = R(t).message);
		} finally {
			e === this.generation && (this._saving = !1);
		}
	}
	async testNotification() {
		if (this._test?.phase === "sending") return;
		let e = this.generation, t = this.printer, n = this.hass, r = this.targets.find((e) => Q(e) === this._recipient), i = r?.label || this._recipient;
		this._test = {
			phase: "sending",
			recipient: i
		};
		try {
			if (!r?.available) throw Error(this.t("notifyTargetUnavailable"));
			await new ir(n).test(t, {
				target: {
					kind: r.kind,
					id: r.id
				},
				style: this._style,
				language: this.language
			}), e === this.generation && (this._test = {
				phase: "submitted",
				recipient: i
			});
		} catch (t) {
			e === this.generation && (this._test = {
				phase: "error",
				recipient: i,
				error: R(t).message
			});
		}
	}
	runtimeStatus() {
		if (this._saved === void 0) return "notifyNotLoaded";
		if (this._saved === null) return "notifyNotConfigured";
		if (!tr(this._runtimeConfig, this._saved.config)) return "notifyPending";
		let e = rr(this.hass.states, this.printer.id);
		return !e || !["on", "off"].includes(e.state) ? "notifyRuntimeUnavailable" : e.state === "on" === this._saved.settings.enabled ? this._saved.settings.enabled ? "notifyActive" : "notifyInactive" : "notifyStateMismatch";
	}
	render() {
		if (!this.hass || !this.printer || !this.registry) return N;
		let e = this.hass.user?.is_admin !== !1, t = this._loading || this._saving || this._test?.phase === "sending", n = this.targets.find((e) => Q(e) === this._recipient), r = rr(this.hass.states, this.printer.id), i = this.runtimeStatus();
		return j`<section aria-label=${this.t("completionNotifications")}>
      <header><h2>${this.t("completionNotifications")}</h2><button ?disabled=${t || !e} @click=${() => void (this.unsubscribe ? this.load() : this.initialize(this.generation))}>${this.t("refresh")}</button></header>
      <div class="body">
        ${this.compact ? j`<div class="compact-summary"><span class="status ${i === "notifyActive" ? "active" : ""}" role="status">${this.t(e ? i : "notifyAdmin")}</span>${this._saved ? j`<small>${this.targets.find((e) => Q(e) === Q(this._saved.settings.target))?.label || this._saved.settings.target.id}</small>` : N}</div>` : N}
        <details ?open=${!this.compact || !!(this._error || this._runtimeError)}><summary ?hidden=${!this.compact}>${this.t("notifySettings")}</summary><p>${this.t("notifyHelp")}</p>
        ${e ? j`
          ${this._error ? j`<div class="error" role="alert">${this.t("notifyError")}: ${this._error}</div>` : N}
          ${this._loading ? j`<p role="status">${this.t("loading")}</p>` : N}
          <label class="check"><input type="checkbox" .checked=${this._enabled} ?disabled=${t || this._saved === void 0} @change=${(e) => {
			this._enabled = e.target.checked, this._dirty = !0;
		}}>${this.t("notifyEnable")}</label>
          <div class="fields">
            <label>${this.t("notifyStyle")}<select aria-label=${this.t("notifyStyle")} data-value=${this._style} ?disabled=${t || this._saved === void 0} @change=${(e) => {
			this._style = e.target.value, this._recipient = "", this._dirty = !0, this._test = void 0;
		}}><option value="android_alarm">${this.t("notifyAlarm")}</option><option value="android_tts">${this.t("notifySpeech")}</option><option value="standard">${this.t("notifyStandard")}</option></select></label>
            <label>${this.t("notifyRecipient")}<select aria-label=${this.t("notifyRecipient")} data-value=${this._recipient} ?disabled=${t || this._saved === void 0} @change=${(e) => {
			this._recipient = e.target.value, this._dirty = !0, this._test = void 0;
		}}>
              <option value="">${this.t("chooseRecipient")}</option>${this._recipient && !n ? j`<option value=${this._recipient} disabled>${this._recipient} · ${this.t("unavailable")}</option>` : N}
              ${this.targets.map((e) => j`<option value=${Q(e)} title=${e.id} ?disabled=${!e.available}>${e.label} · ${this.t(e.kind === "service" ? "notifyMobileApp" : "notifyEntity")}${e.available ? "" : ` · ${this.t("unavailable")}`}</option>`)}
            </select></label>
          </div>
          ${!this.targets.length && this._saved !== void 0 ? j`<p>${this.t(this._style === "standard" ? "notifyNoTargets" : "notifyNoAlarmTarget")}</p>` : N}
          <div class="footer"><button class="primary" ?disabled=${t || this._saved === void 0 || !this._recipient || this._enabled && !n?.available} @click=${() => void this.save()}>${this._saving ? this.t("saving") : this.t("saveNotification")}</button><button class="test-notification" ?disabled=${t || !n?.available} @click=${() => void this.testNotification()}>${this.t(this._test?.phase === "sending" ? "notifyTestSending" : "notifyTest")}</button><span role="status" class="status ${i === "notifyActive" ? "active" : ""}">${this._dirty ? this.t("notifyUnsaved") : this.t(i)}</span></div>
          <p class="helper">${this.t("notifyTestHelp")}</p>
          ${this._test ? j`<p class="helper ${this._test.phase === "error" ? "error" : ""}" role=${this._test.phase === "error" ? "alert" : "status"}>${this._test.recipient} · ${this._test.phase === "error" ? `${this.t("notifyTestError")}: ${this._test.error}` : this.t(this._test.phase === "sending" ? "notifyTestSending" : "notifyTestSubmitted")}</p>` : N}
          ${this._runtimeError ? j`<div class="error" role="alert">${this.t("notifyRuntimeError")}: ${this._runtimeError}</div>` : N}
          ${this._style === "android_alarm" ? j`<p class="helper">${this.t("notifyAlarmHelp")}</p>` : N}
          ${this._style === "android_tts" ? j`<p class="helper">${this.t("notifySpeechHelp")}</p>` : N}
          <p class="helper">${this.t("notifyReliability")}</p>
          ${r ? j`<button class="automation" @click=${() => this.dispatchEvent(new CustomEvent("hass-more-info", {
			detail: { entityId: r.entity_id },
			bubbles: !0,
			composed: !0
		}))}>${this.t("notifyViewAutomation")} · ${r.state}</button>` : N}
        ` : j`<p role="status">${this.t("notifyAdmin")}</p>`}
        </details>
      </div></section>`;
	}
};
customElements.define("bambu-completion-notifications", ar);
// node_modules/lit-html/directives/style-map.js
var or = "important", sr = " !" + or, cr = Ne(class extends Pe {
	constructor(e) {
		if (super(e), e.type !== Me.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
	}
	render(e) {
		return Object.keys(e).reduce((t, n) => {
			let r = e[n];
			return r == null ? t : t + `${n = n.includes("-") ? n : n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${r};`;
		}, "");
	}
	update(e, [t]) {
		let { style: n } = e.element;
		if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
		for (let e of this.ft) t[e] ?? (this.ft.delete(e), e.includes("-") ? n.removeProperty(e) : n[e] = null);
		for (let e in t) {
			let r = t[e];
			if (r != null) {
				this.ft.add(e);
				let t = typeof r == "string" && r.endsWith(sr);
				e.includes("-") || t ? n.setProperty(e, t ? r.slice(0, -11) : r, t ? or : "") : n[e] = r;
			}
		}
		return M;
	}
});
// src/domain/layout.ts
function lr() {
	return {
		version: 2,
		order: [],
		cards: {}
	};
}
function ur(e, t) {
	return Object.hasOwn(e.cards, t) ? e.cards[t] : {
		hidden: !1,
		collapsed: !1,
		width: "normal"
	};
}
function dr(e, t, n) {
	return {
		...e,
		cards: {
			...e.cards,
			[t]: {
				...ur(e, t),
				...n
			}
		}
	};
}
function fr(e) {
	if (e === null) return lr();
	if (typeof e != "object" || !e || !("version" in e) || ![1, 2].includes(e.version) || !("order" in e) || !Array.isArray(e.order)) throw Error("HA returned an unsupported detail layout preference.");
	if (!e.order.every((e) => typeof e == "string" && e.length > 0) || new Set(e.order).size !== e.order.length) throw Error("Detail layout card IDs must be unique nonempty strings.");
	if (e.version === 1) return {
		...lr(),
		order: [...e.order]
	};
	if (!("cards" in e) || typeof e.cards != "object" || e.cards === null || Array.isArray(e.cards)) throw Error("Invalid detail card presentation settings.");
	let t = Object.fromEntries(Object.entries(e.cards).map(([e, t]) => {
		if (!e || typeof t != "object" || !t || typeof t.hidden != "boolean" || typeof t.collapsed != "boolean" || !["normal", "wide"].includes(t.width)) throw Error("Invalid detail card presentation settings.");
		return [e, {
			hidden: t.hidden,
			collapsed: t.collapsed,
			width: t.width
		}];
	}));
	return {
		version: 2,
		order: [...e.order],
		cards: t
	};
}
function pr(e, t) {
	let n = new Set(e), r = new Set(t);
	return [...t.filter((e) => n.has(e)), ...e.filter((e) => !r.has(e))];
}
function mr(e, t, n) {
	let r = pr(e, t);
	if (!r.includes(n.source) || !r.includes(n.target)) throw Error("The layout cards changed. Choose a current card to move.");
	if (n.source === n.target) return [...t];
	let i = r.filter((e) => e !== n.source);
	i.splice(i.indexOf(n.target) + +!!n.after, 0, n.source);
	let a = 0;
	return [...t.map((t) => e.includes(t) ? i[a++] : t), ...i.slice(a)];
}
// src/ha/layout.ts
var hr = class {
	constructor(e) {
		this.hass = e;
	}
	async load(e) {
		return fr(await On(this.hass, this.key(e)));
	}
	async save(e, t) {
		let n = fr(t);
		await kn(this.hass, this.key(e), n);
	}
	key(e) {
		return `bambu_dashboard.detail_layout.v1.${e}`;
	}
}, gr = class {
	constructor(e, t) {
		this.host = e, this.callbacks = t, this.enabled = !1, this.animations = /* @__PURE__ */ new Map(), this.start = (e) => {
			if (!this.enabled || e.button !== 0 || e.isPrimary === !1 || !(e.target instanceof Element)) return;
			let t = e.target.closest("[data-layout-handle]"), n = t?.closest("[data-layout-id]");
			if (!t || !n || n.parentElement !== this.host) return;
			e.preventDefault(), this.cancel(), this.stopAnimations(), t.focus();
			let r = n.querySelector(":scope > .layout-card"), i = r.getBoundingClientRect(), a = getComputedStyle(this.host), o = (e) => e === "normal" ? 0 : Number.parseFloat(e), s = new AbortController();
			this.drag = {
				pointerId: e.pointerId,
				source: n,
				card: r,
				offsetX: e.clientX - i.left,
				offsetY: e.clientY - i.top,
				minHeight: n.style.minHeight,
				x: e.clientX,
				y: e.clientY,
				abort: s,
				scroll: this.scrollContainer(),
				margin: {
					x: o(a.columnGap) / 2,
					y: o(a.rowGap) / 2
				}
			}, this.callbacks.start(), n.style.minHeight = `${i.height}px`, n.setAttribute("data-layout-dragging", ""), r.style.width = `${i.width}px`, r.style.left = `${i.left}px`, r.style.top = `${i.top}px`, r.setAttribute("popover", "manual"), r.showPopover(), window.addEventListener("pointermove", this.pointerMove, {
				signal: s.signal,
				passive: !1
			}), window.addEventListener("pointerup", this.finish, { signal: s.signal }), window.addEventListener("pointercancel", this.abortPointer, { signal: s.signal }), window.addEventListener("blur", this.cancelBound, { signal: s.signal }), window.addEventListener("resize", this.cancelBound, { signal: s.signal }), window.addEventListener("keydown", this.keyDown, { signal: s.signal });
		}, this.pointerMove = (e) => {
			this.drag && e.pointerId === this.drag.pointerId && (e.preventDefault(), this.drag.x = e.clientX, this.drag.y = e.clientY, this.updateTarget(), this.scrollFrame === void 0 && this.drag && (this.scrollFrame = requestAnimationFrame(this.scrollStep)));
		}, this.finish = (e) => {
			let t = this.drag;
			t && e.pointerId === t.pointerId && (t.x = e.clientX, t.y = e.clientY, this.updateTarget(), this.drag === t && this.settle(!this.contains(this.host.getBoundingClientRect(), t)));
		}, this.abortPointer = (e) => {
			e.pointerId === this.drag?.pointerId && this.cancel();
		}, this.cancelBound = () => this.cancel(), this.keyDown = (e) => {
			e.key === "Escape" && (e.preventDefault(), this.cancel());
		}, this.scrollStep = () => {
			this.scrollFrame = void 0;
			let e = this.drag;
			if (!e) return;
			let t = e.scroll.getBoundingClientRect(), n = Math.max(0, t.top), r = Math.min(window.innerHeight, t.bottom), i = e.y < n + 64 ? (e.y - n - 64) / 5 : e.y > r - 64 ? (e.y - r + 64) / 5 : 0;
			if (!i) return;
			let a = e.scroll.scrollTop;
			e.scroll.scrollTop += i, this.updateTarget(), this.drag && e.scroll.scrollTop !== a && (this.scrollFrame = requestAnimationFrame(this.scrollStep));
		}, e.addEventListener("pointerdown", this.start);
	}
	disconnect() {
		this.cancel(), this.stopAnimations(), this.host.removeEventListener("pointerdown", this.start);
	}
	cancel() {
		this.settle(!0);
	}
	items() {
		return Array.from(this.host.children).filter((e) => e instanceof HTMLElement && !!e.dataset.layoutId);
	}
	positions() {
		return new Map(this.items().map((e) => {
			let t = e.querySelector(":scope > .layout-card");
			return [t, t.getBoundingClientRect()];
		}));
	}
	contains(e, t, n = {
		x: 0,
		y: 0
	}) {
		return t.x >= e.left - n.x && t.x <= e.right + n.x && t.y >= e.top - n.y && t.y <= e.bottom + n.y;
	}
	side(e, t, n, r) {
		let i = (t.x - e.left) / e.width + (t.y - e.top) / e.height - 1, a = n.margin.x / e.width + n.margin.y / e.height;
		return r === void 0 ? i > 0 : r ? i >= -a : i > a;
	}
	target(e) {
		let t = e.intent;
		if (t) {
			let n = {
				x: e.x + e.scroll.scrollLeft - t.scrollLeft,
				y: e.y + e.scroll.scrollTop - t.scrollTop
			};
			if (this.contains(t.rect, n, e.margin)) return t.after = this.side(t.rect, n, e, t.after), t;
			e.intent = void 0;
		}
		if (this.contains(e.source.getBoundingClientRect(), e)) return;
		let n = this.items().find((t) => t !== e.source && this.contains(t.getBoundingClientRect(), e));
		if (!n) return;
		let r = n.getBoundingClientRect();
		return e.intent = {
			target: n,
			rect: r,
			after: this.side(r, e, e),
			scrollLeft: e.scroll.scrollLeft,
			scrollTop: e.scroll.scrollTop
		}, e.intent;
	}
	updateTarget() {
		let e = this.drag;
		if (!e) return;
		if (!e.source.isConnected) {
			this.cancel();
			return;
		}
		if (e.card.style.left = `${e.x - e.offsetX}px`, e.card.style.top = `${e.y - e.offsetY}px`, !this.contains(this.host.getBoundingClientRect(), e)) return;
		let t = this.target(e);
		if (!t) return;
		let { target: n, after: r } = t;
		if (e.lastMove?.target === n.dataset.layoutId && e.lastMove?.after === r) return;
		let i = this.items().sort((e, t) => Number(e.style.order) - Number(t.style.order)).map((e) => e.dataset.layoutId), a = {
			source: e.source.dataset.layoutId,
			target: n.dataset.layoutId,
			after: r
		};
		if (mr(i, i, a).every((e, t) => e === i[t])) return;
		let o = this.positions();
		e.lastMove = a, this.callbacks.move(a), this.animateFrom(o);
	}
	settle(e) {
		let t = this.drag;
		if (!t) return;
		let n = this.positions();
		this.drag = void 0, t.abort.abort(), t.card.hidePopover(), t.card.removeAttribute("popover");
		for (let e of [
			"width",
			"left",
			"top"
		]) t.card.style.removeProperty(e);
		t.source.style.minHeight = t.minHeight, t.source.removeAttribute("data-layout-dragging"), this.scrollFrame !== void 0 && cancelAnimationFrame(this.scrollFrame), this.scrollFrame = void 0, this.callbacks.end(e), this.animateFrom(n);
	}
	animateFrom(e) {
		this.animationFrame !== void 0 && cancelAnimationFrame(this.animationFrame), this.host.isConnected && (this.animationFrame = requestAnimationFrame(() => {
			if (this.animationFrame = void 0, this.stopAnimations(), !window.matchMedia("(prefers-reduced-motion: reduce)").matches) for (let [t, n] of e) {
				if (!t.isConnected || t === this.drag?.card) continue;
				let e = t.getBoundingClientRect(), r = n.left - e.left, i = n.top - e.top;
				if (!r && !i) continue;
				let a = t.animate([{ transform: `translate(${r}px, ${i}px)` }, { transform: "none" }], {
					duration: 180,
					easing: "ease-out"
				});
				this.animations.set(t, a), a.onfinish = () => {
					this.animations.get(t) === a && this.animations.delete(t);
				};
			}
		}));
	}
	stopAnimations() {
		this.animationFrame !== void 0 && cancelAnimationFrame(this.animationFrame), this.animationFrame = void 0;
		for (let e of this.animations.values()) e.cancel();
		this.animations.clear();
	}
	scrollContainer() {
		let e = this.host.parentElement;
		for (; e;) {
			if (e instanceof HTMLElement && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight) return e;
			let t = e.getRootNode();
			e = e.parentElement || (t instanceof ShadowRoot ? t.host : null);
		}
		return document.scrollingElement || document.documentElement;
	}
}, _r = class extends HTMLElement {
	constructor(...e) {
		super(...e), this.items = /* @__PURE__ */ new Set(), this._editing = !1;
	}
	set editing(e) {
		this._editing = e, this.reorder && (this.reorder.enabled = e), e || this.reorder?.cancel();
	}
	get editing() {
		return this._editing;
	}
	connectedCallback() {
		let e = (e, t) => this.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
		this.reorder = new gr(this, {
			start: () => e("layout-drag-start"),
			move: (t) => e("layout-move", t),
			end: (t) => e(t ? "layout-drag-cancel" : "layout-drag-end")
		}), this.reorder.enabled = this._editing, this.resize = new ResizeObserver(() => this.schedule()), this.mutation = new MutationObserver(() => this.syncChildren()), this.mutation.observe(this, { childList: !0 }), this.syncChildren();
	}
	disconnectedCallback() {
		this.reorder?.disconnect(), this.resize?.disconnect(), this.mutation?.disconnect(), this.frame !== void 0 && cancelAnimationFrame(this.frame), this.frame = void 0, this.items.clear();
	}
	syncChildren() {
		let e = new Set(Array.from(this.children).filter((e) => e instanceof HTMLElement));
		(e.size !== this.items.size || [...this.items].some((t) => !e.has(t))) && this.reorder?.cancel();
		for (let t of this.items) e.has(t) || this.resize.unobserve(t);
		for (let t of e) this.items.has(t) || this.resize.observe(t);
		this.items = e, this.schedule();
	}
	schedule() {
		this.isConnected && this.frame === void 0 && (this.frame = requestAnimationFrame(() => {
			this.frame = void 0;
			let e = getComputedStyle(this), t = Number.parseFloat(e.gridAutoRows), n = Number.parseFloat(e.rowGap);
			for (let e of this.items) {
				let r = `span ${Math.ceil((e.getBoundingClientRect().height + n) / (t + n))}`;
				e.style.gridRowEnd !== r && (e.style.gridRowEnd = r);
			}
		}));
	}
};
customElements.define("bambu-detail-masonry", _r);
// src/ui/detail-layout.ts
var vr = class extends I {
	constructor(...e) {
		super(...e), this.printerId = "", this.language = "en", this.cards = [], this._draft = lr(), this._editing = !1, this._loading = !1, this._saving = !1, this._error = "", this._notice = "", this.generation = 0, this._dragging = !1, this._expanded = /* @__PURE__ */ new Set(), this._revealed = /* @__PURE__ */ new Set();
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			printerId: { attribute: !1 },
			language: { attribute: !1 },
			cards: { attribute: !1 },
			_saved: { state: !0 },
			_draft: { state: !0 },
			_editing: { state: !0 },
			_loading: { state: !0 },
			_saving: { state: !0 },
			_error: { state: !0 },
			_notice: { state: !0 },
			_dragging: { state: !0 },
			_expanded: { state: !0 },
			_revealed: { state: !0 }
		};
	}
	createRenderRoot() {
		return this;
	}
	connectedCallback() {
		super.connectedCallback(), this.requestUpdate();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.generation++, this.context = void 0;
	}
	willUpdate(e) {
		this.isConnected && this.hass && this.printerId && (this.context?.connection !== this.hass.connection || this.context.printerId !== this.printerId) && (this.context = {
			connection: this.hass.connection,
			printerId: this.printerId
		}, this._saved = void 0, this._draft = lr(), this._editing = !1, this._saving = !1, this._notice = "", this.gesture = void 0, this._dragging = !1, this._expanded = /* @__PURE__ */ new Set(), this._revealed = /* @__PURE__ */ new Set(), this.load(++this.generation));
	}
	updated() {
		gn(this);
	}
	t(e) {
		return X(this.language, e);
	}
	get ids() {
		return this.cards.map((e) => e.id);
	}
	async load(e = this.generation) {
		this._loading = !0, this._error = "";
		let t = this.hass, n = this.printerId;
		try {
			let r = await new hr(t).load(n);
			e === this.generation && (this._saved = r);
		} catch (t) {
			e === this.generation && (this._error = R(t).message);
		} finally {
			e === this.generation && (this._loading = !1);
		}
	}
	edit() {
		this._draft = this._saved, this._editing = !0, this._error = "", this._notice = "";
	}
	cancel() {
		this.gesture = void 0, this._dragging = !1, this._editing = !1, this._error = "", this._notice = "";
	}
	startGesture() {
		this._dragging = !0, this.gesture = {
			generation: this.generation,
			preference: this._draft,
			notice: this._notice,
			error: this._error
		};
	}
	endGesture(e) {
		let t = this.gesture;
		this.gesture = void 0, this._dragging = !1, e && t && t.generation === this.generation && this._editing && (this._draft = t.preference, this._notice = t.notice, this._error = t.error);
	}
	move(e) {
		if (this._editing && !this._saving) try {
			this._draft = {
				...this._draft,
				order: mr(this.ids, this._draft.order, e)
			}, this._error = "", this._notice = this.t("layoutUnsaved");
		} catch (e) {
			this._error = R(e).message;
		}
	}
	step(e, t) {
		let n = pr(this.ids, this._draft.order), r = n[n.indexOf(e) + t];
		r !== void 0 && this.move({
			source: e,
			target: r,
			after: t > 0
		});
	}
	async save() {
		if (this._saving) return;
		let e = this.generation, t = this._draft;
		this._saving = !0, this._error = "";
		try {
			if (await new hr(this.hass).save(this.printerId, t), e !== this.generation) return;
			this._saved = t, this._expanded = /* @__PURE__ */ new Set(), this._revealed = /* @__PURE__ */ new Set(), this._editing = !1, this._notice = this.t("layoutSaved");
		} catch (t) {
			e === this.generation && (this._error = R(t).message);
		} finally {
			e === this.generation && (this._saving = !1);
		}
	}
	presentation(e, t) {
		!this._editing || this._saving || this._dragging || (this._draft = dr(this._draft, e, t), this._notice = this.t("layoutUnsaved"));
	}
	async revealCard(e) {
		if (!this.cards.some((t) => t.id === e)) throw Error("The requested detail card is unavailable.");
		let t = this.generation;
		if (this._revealed = new Set(this._revealed).add(e), await this.updateComplete, !this.isConnected || t !== this.generation) return;
		let n = [...this.querySelectorAll("[data-layout-id]")].find((t) => t.dataset.layoutId === e);
		n.focus({ preventScroll: !0 }), n.scrollIntoView({
			block: "center",
			behavior: "auto"
		});
	}
	toggleExpanded(e) {
		let t = new Set(this._expanded);
		t.has(e) ? t.delete(e) : t.add(e), this._expanded = t;
	}
	render() {
		let e = this._editing ? this._draft : this._saved || lr(), t = pr(this.ids, e.order), n = new Map(t.map((e, t) => [e, t])), r = this._editing && !this._saving, i = this._saving || this._dragging, a = this.cards.filter((t) => this._editing || !ur(e, t.id).hidden || this._revealed.has(t.id));
		return j`<div class="layout-toolbar"><div class="layout-caption"><span>${this.t(this._editing ? "layoutEditing" : "detailLayout")}</span><small role="status">${this._loading ? this.t("loading") : this._notice || this.t("layoutAccount")}</small></div><div class="layout-actions">
      ${this._editing ? j`<button class="button small" ?disabled=${i} @click=${() => {
			this._draft = lr(), this._notice = this.t("layoutUnsaved");
		}}>${this.t("layoutReset")}</button><button class="button small" ?disabled=${this._saving} @click=${() => this.cancel()}>${this.t("cancel")}</button><button class="button primary small" ?disabled=${i} @click=${() => void this.save()}>${this.t(this._saving ? "saving" : "layoutSave")}</button>` : j`<button class="button small" ?disabled=${this._loading || this._saved === void 0} @click=${() => this.edit()}>${Z("move")}${this.t("layoutEdit")}</button>`}
    </div></div>
    ${this._editing ? j`<p class="layout-help">${this.t("layoutDragHelp")}</p>` : N}
    ${this._error ? j`<div class="banner error" role="alert"><div class="copy">${this.t("layoutError")}: ${this._error}</div>${this._saved === void 0 ? j`<button class="button small" ?disabled=${this._loading} @click=${() => void this.load()}>${this.t("retry")}</button>` : N}</div>` : N}
    <bambu-detail-masonry class="detail-grid ${this._editing ? "layout-editing" : ""}" .editing=${r} @layout-drag-start=${() => this.startGesture()} @layout-drag-end=${() => this.endGesture(!1)} @layout-drag-cancel=${() => this.endGesture(!0)} @layout-move=${(e) => this.move(e.detail)}>
      ${We(a, (e) => e.id, (r) => {
			let a = ur(e, r.id), o = !this._editing && this._revealed.has(r.id), s = a.collapsed && (this._editing || !this._expanded.has(r.id)) && !o, c = this._editing && a.hidden;
			return j`<div class="layout-item ${a.width === "wide" ? "layout-wide" : ""} ${o ? "layout-revealed" : ""}" tabindex="-1" data-layout-id=${r.id} data-layout-label=${r.label} style=${cr({ order: n.get(r.id) })}>
        <div class="layout-card">
        ${this._editing ? j`<div class="layout-handlebar"><button class="layout-grip" data-layout-handle aria-label=${`${this.t("layoutDrag")} ${r.label}`} ?disabled=${this._saving}>${Z("grip")}<span>${r.label}</span></button><button class="layout-step" aria-label=${`${this.t("layoutEarlier")} ${r.label}`} ?disabled=${i || n.get(r.id) === 0} @click=${() => this.step(r.id, -1)}>↑</button><button class="layout-step" aria-label=${`${this.t("layoutLater")} ${r.label}`} ?disabled=${i || n.get(r.id) === t.length - 1} @click=${() => this.step(r.id, 1)}>↓</button></div><div class="layout-options"><label><input type="checkbox" aria-label=${`${this.t("layoutVisible")} ${r.label}`} .checked=${!a.hidden} ?disabled=${i} @change=${(e) => this.presentation(r.id, { hidden: !e.target.checked })}>${this.t("layoutVisible")}</label><label><input type="checkbox" aria-label=${`${this.t("layoutCollapsed")} ${r.label}`} .checked=${a.collapsed} ?disabled=${i} @change=${(e) => this.presentation(r.id, { collapsed: e.target.checked })}>${this.t("layoutCollapsed")}</label><select aria-label=${`${this.t("layoutWidth")} ${r.label}`} data-value=${a.width} ?disabled=${i} @change=${(e) => this.presentation(r.id, { width: e.target.value })}><option value="normal">${this.t("layoutNormal")}</option><option value="wide">${this.t("layoutWide")}</option></select></div>` : N}
        ${!this._editing && a.collapsed && !o ? j`<button class="layout-fold-toggle" aria-expanded=${!s} @click=${() => this.toggleExpanded(r.id)}><b>${r.label}</b><span>${this.t(s ? "layoutExpand" : "layoutCollapse")} ${s ? "▾" : "▴"}</span></button>` : N}
        <div class="layout-card-content" ?inert=${this._editing}>${c || s ? this._editing ? j`<div class="layout-summary">${this.t(c ? "layoutHiddenHelp" : "layoutCollapsedHelp")}</div>` : N : r.content}</div>
        </div>
      </div>`;
		})}
    </bambu-detail-masonry>${a.length ? N : j`<p class="layout-summary">${this.t("layoutAllHidden")}</p>`}`;
	}
};
customElements.define("bambu-detail-layout", vr);
// src/editor.ts
var yr = class extends I {
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
		gn(this.renderRoot), e.has("hass") && this.hass && this.connection !== this.hass.connection && (this.unsubscribe?.(), this.connection = this.hass.connection, this.unsubscribe = Je(this.hass).subscribe((e) => {
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
		let e = this.hass?.language.startsWith("zh") ? "zh" : "en", t = (t) => X(e, t), n = this._config.devices || [], r = this._catalog.snapshot && this.hass ? rt(this._catalog.snapshot, this.hass, {
			...this._config,
			discovery: "auto"
		}) : [];
		return j`<label>${t("title")}<input type="text" .value=${this._config.title || ""} @input=${(e) => this.change({ title: e.target.value })}/></label>
      <label>${t("language")}<select data-value=${this._config.language || "auto"} @change=${(e) => this.change({ language: e.target.value })}><option value="auto">${t("automatic")}</option><option value="en">English</option><option value="zh">简体中文</option></select></label>
      <label class="check"><input type="checkbox" .checked=${this._config.discovery === "selected"} @change=${(e) => this.change({
			discovery: e.target.checked ? "selected" : "auto",
			devices: this._config.devices || []
		})}/>${t("selectedDevices")}</label>
      ${this._config.discovery === "selected" ? j`${r.map((e) => j`<div class="row"><label class="check"><input type="checkbox" .checked=${n.includes(e.id)} @change=${(t) => this.change({ devices: t.target.checked ? [...n, e.id] : n.filter((t) => t !== e.id) })}/>${e.name} <small>${e.model}</small></label>${n.includes(e.id) ? j`<button aria-label="Move up" @click=${() => this.move(e.id, -1)}>↑</button><button aria-label="Move down" @click=${() => this.move(e.id, 1)}>↓</button>` : N}</div>`)}` : j`<small>${t("allPrinters")} · ${r.length}</small>`}
      ${this._catalog.error ? j`<p class="error">${this._catalog.error.message}</p>` : N}`;
	}
};
customElements.define("bambu-dashboard-card-editor", yr);
// src/card.ts
var br = 6e4, xr = class extends I {
	constructor(...e) {
		super(...e), this._config = {
			type: "custom:bambu-dashboard-card",
			discovery: "auto"
		}, this._catalogState = { loading: !0 }, this._selected = null, this._tab = "overview", this._search = "", this._fleetFilter = "all", this._error = "", this._notice = "", this._filesError = "", this._filesLoading = !1, this._pending = /* @__PURE__ */ new Map(), this._transfer = "", this.dialogGeneration = 0, this._now = Date.now();
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
			_transfer: { state: !0 },
			_now: { state: !0 },
			_fleetFilter: { state: !0 }
		};
	}
	static {
		this.styles = a(bn);
	}
	set hass(e) {
		let t = this._hass;
		this._hass = e, this._now = Date.now(), this.isConnected && this.attachCatalog(), this.requestUpdate("hass", t);
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
		super.connectedCallback(), this.attachCatalog(), this._now = Date.now(), this.clock = setInterval(() => {
			this._now = Date.now();
		}, br);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.unsubscribe?.(), this.unsubscribe = void 0, this.connection = void 0, clearInterval(this.clock), this.clock = void 0, this.downloadUrl && URL.revokeObjectURL(this.downloadUrl);
	}
	attachCatalog() {
		this._hass && this.connection !== this._hass.connection && (this.unsubscribe?.(), this.connection = this._hass.connection, this.unsubscribe = Je(this._hass).subscribe((e) => {
			this._catalogState = e;
		}));
	}
	get language() {
		return this._config.language && this._config.language !== "auto" ? this._config.language : this._hass?.language.startsWith("zh") ? "zh" : "en";
	}
	t(e) {
		return X(this.language, e);
	}
	get printers() {
		return this._catalogState.snapshot && this._hass ? rt(this._catalogState.snapshot, this._hass, this._config) : [];
	}
	get currentPrinters() {
		return this.printers.filter((e) => !this._selected || e.id === this._selected);
	}
	get client() {
		if (!this._hass) throw Error("Home Assistant is not connected.");
		return new $t(this._hass);
	}
	target(e) {
		let t = (this._catalogState.snapshot && this._hass ? rt(this._catalogState.snapshot, this._hass, {
			type: this._config.type,
			discovery: "auto"
		}) : []).find((t) => t.id === e);
		if (!t) throw Error("The target printer is no longer registered.");
		return t;
	}
	willUpdate(e) {
		if (!e.has("hass") && !e.has("_catalogState")) return;
		let t = this.printers, n = this._catalogState.snapshot && this._hass ? rt(this._catalogState.snapshot, this._hass, {
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
		gn(this.renderRoot);
	}
	value(e) {
		return _n(this.language, e);
	}
	sensor(e, t) {
		return this.value(z(e.entities, t));
	}
	remaining(e) {
		let t = z(e.entities, "remaining_time"), n = tn(e);
		if (n === null) return this.value(t);
		let r = Math.round(n / 6e4), i = Math.floor(r / 60), a = r % 60;
		return [i ? `${i} ${this.t("hourUnit")}` : "", a || !i ? `${a} ${this.t("minuteUnit")}` : ""].filter(Boolean).join(" ");
	}
	completionEstimate(e) {
		let t = nn(e, this._now), n = t === null ? null : new Intl.DateTimeFormat(this.language, {
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: !1,
			timeZone: this._hass?.config?.time_zone
		}).format(t);
		return j`<div class="completion-estimate"><span>${this.t("estimatedFinish")}</span>${t === null ? j`<small>${e.status === "pause" ? this.t("estimatePaused") : "—"}</small>` : j`<time datetime=${new Date(t).toISOString()}>${n}</time>`}</div>`;
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
		return j`<span class="status ${e.status}"><span class="dot ${e.status}"></span>${this.status(e)}</span>`;
	}
	selectPrinter(e) {
		this._selected = e, this._search = "";
	}
	async openPrinterAlerts(e) {
		if (this.selectPrinter(e), this._tab = "overview", await this.updateComplete, this._selected !== e || !this.isConnected) return;
		let t = this.renderRoot.querySelector("bambu-detail-layout");
		t && t.printerId === e && (await t.updateComplete, this._selected === e && this._tab === "overview" && t.isConnected && await t.revealCard("alerts"));
	}
	setTab(e) {
		this._tab = e, e === "files" && !this._files && !this._filesLoading && this.loadFiles();
	}
	progress(e) {
		let t = e.progress !== null && e.progress >= 0 && e.progress <= 100;
		return j`<div class="progress-label"><span>${this.t("progress")}</span><strong>${e.progress === null ? "—" : `${e.progress}%`}</strong></div>
      <div class="progress-track" role="progressbar" aria-label=${this.t("progress")} aria-valuenow=${t ? e.progress : N} style=${`--progress:${t ? e.progress : 0}%`}><div class="progress-fill"></div></div>`;
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
				this.clearPending(e), this._error = `${t}: ${R(n).message}`;
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
			this._filesError = R(e).message;
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
			this._error = R(e).message;
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
			let e = Jt(await this.client.fileBytes(t.path));
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
				error: R(e).message
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
			if (Zt(e.options, e.metadata?.plates), e.file) {
				if (!e.metadata) throw Error("Project metadata has not been verified.");
				let t = Xt(e.metadata, n.model, Qe(z(n.entities, "nozzle_diameter")));
				if (t.length) throw Error(t.join(" "));
			} else if (!e.acknowledged) throw Error(this.t("manualConfirm"));
			if (e.options.useAms && !n.ams.some((e) => !e.external)) throw Error("No AMS is registered for this printer.");
		} catch (t) {
			this._dialog = {
				...e,
				error: R(t).message
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
		let e = this.printers, t = e.find((e) => e.id === this._selected), n = pn(e);
		return j`<div class="shell">
      <header class="topbar"><div class="brand"><span class="brand-mark">${Z("printer")}</span><div><div class="brand-title">${this._config.title || "Bambu Dashboard"}</div><div class="brand-subtitle">HOME ASSISTANT · PRINT WORKSPACE</div></div></div>
      <div class="top-actions"><span class="connection"><span class="dot ${this._catalogState.error ? "failed" : "ready"}"></span>ha-bambulab</span><button class="icon-button" aria-label=${this.t("refresh")} @click=${() => this._hass && void Je(this._hass).refresh()}>${Z("refresh")}</button></div></header>
      <div class="workspace">${this.renderSidebar(e)}<main class="main">
        <div class="mobile-picker"><select aria-label=${this.t("printers")} data-value=${this._selected || ""} @change=${(e) => this.selectPrinter(e.target.value || null)}><option value="">${this.t("allPrinters")}</option>${e.map((e) => j`<option value=${e.id}>${e.name}</option>`)}</select></div>
        <div class="page-heading"><div><div class="eyebrow">${t ? t.model : "YOUR PRINT FARM"}</div><h1>${t?.name || this.t("workspace")}</h1>${t ? j`<p class="description ha-name">${this.t("haName")}: ${t.haName}</p>` : N}<p class="description">${t ? `${this.status(t)} · ${this.value(t.stage)}` : this.t("subtitle")}</p></div>
        <div class="stats"><span class="stat"><b>${e.length}</b>${this.t("printers")}</span><span class="stat"><b>${n.printing}</b>${this.t("fleetPrinting")}</span><button class="stat ${n.attention ? "stat-alert" : ""}" @click=${() => {
			this.selectPrinter(null), this._tab = "overview", this._fleetFilter = "attention";
		}}><b>${n.attention}</b>${this.t("fleetAttention")}</button><button class="stat" @click=${() => {
			this.selectPrinter(null), this._tab = "overview", this._fleetFilter = "offline";
		}}><b>${n.offline}</b>${this.t("offline")}</button></div></div>
        ${this.renderBanners()}
        ${this._catalogState.error ? j`<div class="banner error">${Z("alert")}<div>${this.t("registryError")}: ${this._catalogState.error.message}</div></div>` : N}
        <nav class="tabs" aria-label="Workspace">${[
			"overview",
			"ams",
			"files",
			"parameters"
		].map((e, t) => j`<button class=${this._tab === e ? "active" : ""} @click=${() => this.setTab(e)}>${Z([
			"grid",
			"spool",
			"folder",
			"tune"
		][t])}${this.t(e)}</button>`)}</nav>
        ${this._catalogState.loading && !this._catalogState.snapshot ? this.renderEmpty("refresh", this.t("discover")) : e.length ? this.renderContent(t) : this.renderEmpty("printer", this.t("noPrinters"))}
      </main></div></div>${this.renderDialog()}`;
	}
	renderSidebar(e) {
		return j`<aside class="sidebar"><div class="sidebar-label">WORKSPACE</div><button class=${this._selected ? "" : "selected"} @click=${() => this.selectPrinter(null)}>${Z("grid")}${this.t("allPrinters")}</button><div class="sidebar-rule"></div><div class="sidebar-label">${this.t("printers")}</div>
      ${We(e, (e) => e.id, (e) => j`<button class="printer-link ${this._selected === e.id ? "selected" : ""}" title=${`${e.name} · ${e.haName}`} @click=${() => this.selectPrinter(e.id)}>${Z("printer")}<span class="name">${e.name}<small class="model">${e.haName === e.name ? e.model : e.haName}</small></span><span class="dot ${e.status}"></span></button>`)}
      <div class="sidebar-foot">Bambu Dashboard Card<br>v${Ge} · Community project</div></aside>`;
	}
	renderBanners() {
		return j`${this._error ? j`<div class="banner error" role="alert">${Z("alert")}<div class="copy">${this._error}</div><button class="icon-button" aria-label=${this.t("close")} @click=${() => {
			this._error = "";
		}}>${Z("close")}</button></div>` : N}
      ${this._notice ? j`<div class="banner notice" role="status">${Z("check")}<div class="copy">${this._notice}</div><button class="icon-button" aria-label=${this.t("close")} @click=${() => {
			this._notice = "";
		}}>${Z("close")}</button></div>` : N}
      ${[...this._pending].map(([e, t]) => j`<div class="banner notice" role="status">${Z("clock")}<div class="copy"><b>${t.name}</b><br>${t.phase === "request" ? this._transfer || this.t("loading") : this.t("submitted")}</div>${t.phase === "submitted" ? j`<button class="button small" @click=${() => this.clearPending(e)}>${this.t("dismiss")}</button>` : N}</div>`)}`;
	}
	renderEmpty(e, t) {
		return j`<div class="panel empty">${Z(e)}<p>${t}</p></div>`;
	}
	renderContent(e) {
		if (this._tab === "files") return this.renderFiles();
		if (this._tab === "parameters") return this.renderParameters();
		if (this._tab === "ams") return j`${this.currentPrinters.map((e) => this.renderAms(e, !0))}`;
		if (e) return this.renderDetail(e);
		let t = pn(this.printers), n = [
			{
				id: "all",
				label: "allPrinters"
			},
			{
				id: "printing",
				label: "fleetPrinting"
			},
			{
				id: "attention",
				label: "fleetAttention"
			},
			{
				id: "idle",
				label: "idle"
			},
			{
				id: "offline",
				label: "offline"
			}
		], r = this.printers.filter((e) => fn(e, this._fleetFilter));
		return j`<div class="fleet-filters" role="group" aria-label=${this.t("fleetFilter")}>${n.map(({ id: e, label: n }) => j`<button class="button small ${this._fleetFilter === e ? "selected" : ""}" aria-pressed=${this._fleetFilter === e} @click=${() => {
			this._fleetFilter = e;
		}}>${this.t(n)}<b>${t[e]}</b></button>`)}</div>${r.length ? j`<div class="printer-grid">${We(r, (e) => e.id, (e) => this.renderTile(e))}</div>` : this.renderEmpty("search", this.t("fleetNoMatches"))}`;
	}
	renderTile(e) {
		let t = dn(e), n = V(z(e.entities, "subtask_name")), r = $e(e), i = z(e.entities, "speed_profile"), a = r === null ? V(i) === null ? this.value(i) : this.t("unknown") : `${r}%`;
		return j`<article class="panel printer-card"><button class="card-heading" @click=${() => this.selectPrinter(e.id)}><span class="machine-badge">${Z("printer")}</span><span class="heading-copy"><b>${e.name}</b><small>${e.haName === e.name ? e.model : `${e.model} · ${e.haName}`}</small></span>${this.statusBadge(e)}</button>
      <button class="tile-diagnostics ${t.attention ? "fault" : t.diagnostic.status}" aria-label=${`${this.t("openAlerts")} · ${e.name}`} @click=${() => void this.openPrinterAlerts(e.id)}>${Z("alert")}<span>${this.t(t.offline ? "alertsOffline" : t.attention ? "alertsActive" : t.diagnostic.status === "clear" ? "alertsClear" : "alertsUnknown")}</span>${Z("arrow")}</button>
      <div class="tile-media"><bambu-printer-camera .hass=${this._hass} .printer=${e} .registry=${this._catalogState.snapshot} .language=${this.language}></bambu-printer-camera>
      <div class="project-preview" aria-label=${this.t("projectPreview")}>${e.cover && V(e.cover) ? j`<bambu-dashboard-file-image .hass=${this._hass} .entity=${e.cover.entry.entity_id} .version=${V(e.cover) || ""}></bambu-dashboard-file-image>` : j`<div class="preview-empty">${Z("folder")}<span>${this.t("noProjectPreview")}</span></div>`}<span class="preview-caption">${this.t("projectPreview")}</span></div></div>
      <div class="tile-content"><div class="task-line">${Z("folder")}<span>${n || this.t("noTask")}</span></div>${this.progress(e)}<div class="tile-metrics"><div><span>${this.t("remaining")}</span><strong>${this.remaining(e)}</strong>${this.completionEstimate(e)}</div><div><span>${this.t("nozzle")}</span><strong>${this.sensor(e, "nozzle_temp")}</strong></div><div><span>${this.t("bed")}</span><strong>${this.sensor(e, "bed_temp")}</strong></div><div class="tile-speed"><span>${this.t("speed")}</span><strong>${a}</strong></div></div>
      <div class="tile-footer"><div class="filament-groups">${e.ams.map((e) => j`<div class="filament-group" role="group" aria-label=${this.filamentSourceLabel(e)} title=${e.device.name_by_user || e.device.name || this.filamentSourceLabel(e)}><span class="filament-source">${Z("spool")}${this.filamentSourceLabel(e)}</span><div class="filament-dots">${e.slots.map(({ entity: e }) => j`<span title=${et(e)} class="filament-dot ${e.state?.attributes.active ? "active" : ""}" style=${`--filament:${st(e.state?.attributes.color) || "transparent"}`}></span>`)}</div></div>`)}</div><button class="button small" @click=${() => this.selectPrinter(e.id)}>${this.t("details")}${Z("arrow")}</button></div></div></article>`;
	}
	filamentSourceLabel(e) {
		return e.external ? this.t("external") : e.device.model || e.device.name_by_user || e.device.name || "AMS";
	}
	renderDetail(e) {
		let t = [
			{
				id: "camera",
				label: this.t("camera"),
				content: j`<bambu-printer-camera .hass=${this._hass} .printer=${e} .registry=${this._catalogState.snapshot} .language=${this.language} variant="detail"></bambu-printer-camera>`
			},
			{
				id: "job",
				label: this.t("task"),
				content: j`<section class="panel current-job"><div class="panel-head"><h2>${Z("folder")} ${this.t("task")}</h2>${this.statusBadge(e)}</div><div class="panel-body"><div class="job-top">${e.cover && V(e.cover) ? j`<div class="job-cover"><bambu-dashboard-file-image .hass=${this._hass} .entity=${e.cover.entry.entity_id} .version=${V(e.cover) || ""}></bambu-dashboard-file-image></div>` : N}<div class="job-name">${V(z(e.entities, "subtask_name")) || this.t("noTask")}</div></div><div class="job-stage"><span>${this.t("stage")}</span><b>${yn(this.language, e.stage)}</b></div>${this.progress(e)}<div class="job-summary"><div><span>${this.t("remaining")}</span><b>${this.remaining(e)}</b>${this.completionEstimate(e)}</div><div><span>${this.t("layers")}</span><b>${this.sensor(e, "current_layer")} / ${this.sensor(e, "total_layers")}</b></div></div></div></section>`
			},
			{
				id: "controls",
				label: this.t("controls"),
				content: j`<section class="panel controls-panel"><div class="panel-head"><h2>${Z("tune")} ${this.t("controls")}</h2></div><div class="panel-body">${this.renderControls(e)}</div></section>`
			},
			{
				id: "alerts",
				label: this.t("alerts"),
				content: j`<bambu-printer-diagnostics .printer=${e} .language=${this.language}></bambu-printer-diagnostics>`
			},
			{
				id: "temperature-history",
				label: this.t("temperatureHistory"),
				content: j`<bambu-printer-history .hass=${this._hass} .printer=${e} .language=${this.language} .now=${this._now}></bambu-printer-history>`
			},
			{
				id: "metrics",
				label: this.t("liveParameters"),
				content: j`<section class="panel live-metrics"><div class="panel-head"><h2>${Z("heat")} ${this.t("liveParameters")}</h2></div><div class="detail-metrics">${[
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
						"heatbreakFan",
						"heatbreak_fan_speed",
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
				].map(([t, n, r]) => j`<div class="metric"><div class="metric-top">${Z(t === "nozzle" || t === "bed" ? "heat" : "tune")}${this.t(t)}</div><strong>${this.sensor(e, n)}</strong>${r ? j`<small>→ ${this.sensor(e, r)}</small>` : N}</div>`)}</div></section>`
			},
			{
				id: "device-health",
				label: this.t("deviceHealth"),
				content: j`<bambu-printer-diagnostics .printer=${e} .language=${this.language} variant="device"></bambu-printer-diagnostics>`
			}
		];
		return e.ams.length ? t.push(...e.ams.map((t) => ({
			id: `ams:${t.device.id}`,
			label: this.filamentSourceLabel(t),
			content: this.renderAmsUnit(e, t, !1)
		}))) : t.push({
			id: "filament-empty",
			label: this.t("ams"),
			content: j`<section class="panel empty">${Z("spool")}<p>${this.t("noAms")}</p></section>`
		}), t.push({
			id: "recent-events",
			label: this.t("recentEvents"),
			content: j`<bambu-printer-history .hass=${this._hass} .printer=${e} .language=${this.language} .now=${this._now} variant="events"></bambu-printer-history>`
		}), t.push({
			id: "notifications",
			label: this.t("completionNotifications"),
			content: j`<bambu-completion-notifications .hass=${this._hass} .printer=${e} .registry=${this._catalogState.snapshot} .language=${this.language} .compact=${!0}></bambu-completion-notifications>`
		}), j`<bambu-detail-layout .hass=${this._hass} .printerId=${e.id} .language=${this.language} .cards=${t}></bambu-detail-layout>`;
	}
	renderControls(e) {
		let t = this._pending.has(e.id), n = e.speed?.state?.attributes.options;
		return j`<button class="button primary" style="width:100%" ?disabled=${!H(e) || t} @click=${() => void this.openStart(e)}>${Z("play")}${this.t("start")}</button><div class="control-row"><button class="button" ?disabled=${t || !(e.status === "running" ? B(e.pause) : e.status === "pause" && B(e.resume))} @click=${() => this.press(e, e.status === "pause" ? "resume" : "pause")}>${Z(e.status === "pause" ? "play" : "pause")}${this.t(e.status === "pause" ? "resumeAction" : "pauseAction")}</button><button class="button danger" ?disabled=${t || !["running", "pause"].includes(e.status) || !B(e.stop)} @click=${() => this.press(e, "stop")}>${Z("stop")}${this.t("stopAction")}</button></div>
      <div class="control-divider"></div><label class="field"><span>${this.t("speed")}</span><select data-value=${V(e.speed) || ""} ?disabled=${t || e.status !== "running" || !B(e.speed)} @change=${(t) => {
			let n = t.target.value;
			this.runAction(e.id, `${e.name} · ${this.t("speed")}`, (e) => this.client.speed(e, n), (e) => V(e.speed) === n);
		}}><option value="" disabled>${this.value(e.speed)}</option>${Array.isArray(n) ? n.map((e) => j`<option value=${String(e)}>${String(e)}</option>`) : N}</select></label><div class="helper">${this.t("speedHelp")}</div>
      <div class="control-divider"></div><div class="light-control"><span>${Z("light")} ${this.t("light")}</span><button class="button small ${V(e.light) === "on" ? "on" : ""}" ?disabled=${t || !B(e.light) || !["on", "off"].includes(V(e.light) || "")} @click=${() => {
			let t = V(e.light) === "on" ? "off" : "on";
			this.runAction(e.id, `${e.name} · ${this.t("light")}`, (e) => this.client.light(e), (e) => V(e.light) === t);
		}}>${V(e.light) === "on" ? this.t("on") : V(e.light) === "off" ? this.t("off") : this.value(e.light)}</button></div><div class="helper">${this.t("lightHelp")}</div>`;
	}
	renderAms(e, t) {
		return e.ams.length ? j`${e.ams.map((n) => this.renderAmsUnit(e, n, t))}` : j`<div class="ams-section">${this.renderEmpty("spool", `${t ? `${e.name} · ` : ""}${this.t("noAms")}`)}</div>`;
	}
	renderAmsUnit(e, t, n) {
		let r = z(t.entities, "humidity"), i = z(t.entities, "ams_temp");
		return j`<section class="panel ams-section"><div class="panel-head"><h2>${Z("spool")} ${n ? `${e.name} · ` : ""}${t.external ? this.t("external") : t.device.name_by_user || t.device.model}</h2><span class="description">${t.slots.length} ${t.external ? "" : "slots"}</span></div><div class="ams-grid">${t.slots.map(({ index: e, entity: n }) => {
			let r = n.state?.attributes || {}, i = ct(n);
			return j`<div class="spool ${r.active === !0 ? "active" : ""}" style=${`--filament:${st(r.color) || "var(--bd-raised)"}`}><div class="spool-index">${t.external ? this.t("external") : `SLOT ${String(e).padStart(2, "0")}`}</div>${r.active === !0 ? j`<span class="active-label">● ${this.t("active")}</span>` : N}<div class="spool-visual"></div><h3>${r.empty === !0 ? this.t("empty") : this.value(n)}</h3><div class="material">${typeof r.type == "string" ? r.type : "—"} ${st(r.color) || ""}</div><div class="remain">${i === null ? this.t("remainingUnknown") : `${i}%`}</div></div>`;
		})}</div>${r || i ? j`<div class="ams-extra">${r ? j`<span>${this.t("humidity")}: ${this.value(r)}</span>` : N}${i ? j`<span>${this.t("temperature")}: ${this.value(i)}</span>` : N}</div>` : N}</section>`;
	}
	renderFiles() {
		let e = this._files?.filter((e) => !this._selected || e.printer_device_id === this._selected);
		return j`<div class="section-heading"><div><h2>${this.t("cachedFiles")}</h2><p class="description">${this.t("cacheHelp")}</p></div><button class="button small" ?disabled=${this._filesLoading} @click=${() => void this.loadFiles()}>${Z("refresh")}${this.t("refresh")}</button></div>
      ${this._filesError ? j`<div class="banner error" style="margin-top:18px" role="alert">${Z("alert")}<div>${this._filesError}</div></div>` : N}
      ${this._filesLoading ? this.renderEmpty("refresh", this.t("loading")) : e?.length ? j`<section class="panel file-list">${e.map((e) => {
			let t = this.printers.find((t) => t.id === (this._selected || e.printer_device_id)), n = t && H(t) ? t : this.printers.find((e) => H(e) && !this._pending.has(e.id));
			return j`<div class="file-row"><div class="file-preview">${e.thumbnail_path ? j`<bambu-dashboard-file-image .hass=${this._hass} .path=${e.thumbnail_path}></bambu-dashboard-file-image>` : Z("folder")}</div><div><div class="file-title">${e.filename}</div><div class="file-meta"><span>${e.printer_name}</span><span>${e.size_human || `${e.size.toLocaleString()} B`}</span><span>${this.date(e.modified)}</span></div></div><div class="file-actions"><button class="icon-button" aria-label=${this.t("download")} @click=${() => void this.download(e)}>${Z("download")}</button><button class="button small" ?disabled=${!n || !H(n) || this._pending.has(n.id)} @click=${() => n && void this.openStart(n, e)}>${Z("play")}${this.t("printAgain")}</button></div></div>`;
		})}</section>` : this._filesError ? N : this.renderEmpty("folder", this.t("noFiles"))}`;
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
		}))).filter(({ printer: t, entity: n }) => `${t.name} ${t.haName} ${et(n)} ${n.entry.entity_id} ${n.state?.state || ""}`.toLocaleLowerCase().includes(e));
		return j`<div class="section-heading"><div><h2>${this.t("parameters")}</h2><p class="description">${t.length} entities · ha-bambulab</p></div></div><label class="search-box">${Z("search")}<input aria-label=${this.t("search")} placeholder=${this.t("search")} .value=${this._search} @input=${(e) => {
			this._search = e.target.value;
		}}/></label>
      ${t.length ? j`<section class="panel" style="overflow-x:auto"><table class="parameter-table"><thead><tr><th>${this.t("entity")}</th><th>${this.t("value")}</th><th>${this.t("details")}</th></tr></thead><tbody>${We(t, ({ entity: e }) => e.entry.entity_id, ({ printer: e, entity: t }) => j`<tr><td><div class="entity-name">${et(t)}</div><div class="entity-id">${e.name} · ${Ye(t.entry.entity_id)}</div></td><td><span class="entity-value">${this.value(t)}</span></td><td><details><summary>${this.t("attributes")}</summary><div class="entity-id">${t.entry.entity_id}</div><dl class="attribute-grid"><dt>${this.t("updated")}</dt><dd>${this.date(t.state?.last_updated)}</dd>${Object.entries(it(t)).map(([e, t]) => j`<dt>${e}</dt><dd>${typeof t == "object" ? JSON.stringify(t, null, 2) : String(t)}</dd>`)}</dl><button class="button small" @click=${() => this.dispatchEvent(new CustomEvent("hass-more-info", {
			detail: { entityId: t.entry.entity_id },
			bubbles: !0,
			composed: !0
		}))}>${this.t("details")}</button></details></td></tr>`)}</tbody></table></section>` : this.renderEmpty("search", this.t("noParameters"))}`;
	}
	renderDialog() {
		let e = this._dialog;
		if (!e) return N;
		let t = this.printers.find((t) => t.id === e.printerId);
		if (!t) return j`<div class="overlay"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-body">The target printer was removed.</div><div class="dialog-footer"><button class="button" @click=${() => this.closeDialog()}>${this.t("close")}</button></div></section></div>`;
		let n = this._pending.has(t.id), r = e.kind === "start" && e.metadata ? Xt(e.metadata, t.model, Qe(z(t.entities, "nozzle_diameter"))).length > 0 : !1;
		return j`<div class="overlay" @keydown=${(e) => {
			e.key === "Escape" && !n && this.closeDialog();
		}}><section class="dialog" role="dialog" aria-modal="true" aria-label=${this.t(e.kind === "stop" ? "stopAction" : "start")}><div class="panel-head"><h2>${this.t(e.kind === "stop" ? "stopAction" : "start")}</h2><button class="icon-button" ?disabled=${n} aria-label=${this.t("close")} @click=${() => this.closeDialog()}>${Z("close")}</button></div><div class="dialog-body"><div class="dialog-target"><div><span>${this.t("target")}</span><b>${t.name}</b></div><div><span>${t.model}</span><b>${this.sensor(t, "nozzle_diameter")}</b></div></div>
      ${e.kind === "stop" ? j`<p>${this.t("stopHelp")}</p>` : this.renderStartFields(t, e, n)}</div><div class="dialog-footer"><button class="button" ?disabled=${n} @click=${() => this.closeDialog()}>${this.t("cancel")}</button>${e.kind === "stop" ? j`<button class="button danger" ?disabled=${n} @click=${() => {
			this.closeDialog(), this.runAction(t.id, `${t.name} · ${this.t("stopAction")}`, (e) => this.client.press(e, "stop"), (e) => [
				"idle",
				"finish",
				"failed"
			].includes(e.status));
		}}>${this.t("stopAction")}</button>` : j`<button class="button primary" ?disabled=${n || r || e.loading || !(!e.file || e.metadata && !e.error) || !H(t)} @click=${() => void this.confirmStart()}>${Z("play")}${this.t("confirmStart")}</button>`}</div></section></div>`;
	}
	renderStartFields(e, t, n) {
		if (t.loading) return j`<p>${this.t("checking")}</p>`;
		let r = t.metadata ? Xt(t.metadata, e.model, Qe(z(e.entities, "nozzle_diameter"))) : [];
		return j`<label class="field"><span>${this.t("target")}</span><select aria-label=${this.t("target")} data-value=${e.id} ?disabled=${n} @change=${(e) => {
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
		}}>${this.printers.map((e) => j`<option value=${e.id} ?disabled=${!H(e) || this._pending.has(e.id)}>${e.name} · ${e.model}</option>`)}</select></label>
      ${t.error ? j`<div class="banner error" role="alert">${t.error}</div>` : N}${r.length ? j`<div class="banner error">${r.join(" ")}</div>` : N}
      ${t.file ? j`<div class="field"><span>${this.t("task")}</span><b>${t.file.filename}</b></div>` : j`<label class="field"><span>${this.t("sdPath")}</span><input placeholder="cache/project.3mf" .value=${t.path} ?disabled=${n} @input=${(e) => {
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
      <label class="field"><span>${this.t("plate")}</span>${t.metadata ? j`<select data-value=${String(t.options.plate)} ?disabled=${n} @change=${(e) => this.updateOptions({ plate: Number(e.target.value) })}>${t.metadata.plates.map((e) => j`<option value=${e.id}>${e.id} · ${e.name}</option>`)}</select>` : j`<input type="number" min="1" max="100" .value=${String(t.options.plate)} ?disabled=${n} @input=${(e) => this.updateOptions({ plate: Number(e.target.value) })}/>`}</label>
      <div class="two-fields">${[
			["bedLeveling", "bedLevel"],
			["timelapse", "timelapse"],
			["flowCalibration", "flowCali"],
			["vibrationCalibration", "vibrationCali"]
		].map(([e, r]) => j`<label class="check"><input type="checkbox" .checked=${!!t.options[e]} ?disabled=${n} @change=${(t) => this.updateOptions({ [e]: t.target.checked })}/>${this.t(r)}</label>`)}</div>
      ${e.ams.some((e) => !e.external) ? j`<div class="control-divider"></div><label class="check"><input type="checkbox" .checked=${t.options.useAms} ?disabled=${n} @change=${(e) => this.updateOptions({ useAms: e.target.checked })}/>${this.t("useAms")}</label>${t.options.useAms ? j`<label class="field"><span>${this.t("mapping")}</span><input placeholder="0,1,2" .value=${t.options.amsMapping} ?disabled=${n} @input=${(e) => this.updateOptions({ amsMapping: e.target.value })}/></label><p class="helper">${this.t("mappingHelp")}</p>` : N}` : N}
      <div class="control-divider"></div><p class="helper">${this.t("startHelp")}</p>${this._transfer ? j`<p class="progress-caption">${this._transfer}</p>` : N}`;
	}
};
customElements.define("bambu-dashboard-card", xr), window.customCards = window.customCards || [], window.customCards.push({
	type: "bambu-dashboard-card",
	name: "Bambu Dashboard",
	preview: !0,
	description: "Complete multi-printer workspace for ha-bambulab."
}), console.info(`%c BAMBU DASHBOARD %c ${Ge} `, "background:#00ae42;color:#08291f;font-weight:bold;padding:4px", "background:#15201b;color:#cfe9de;padding:4px");
export { xr as BambuDashboardCard };
