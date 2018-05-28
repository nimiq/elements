// MIT License Copyright (c) 2017 Carl Taylor,
// Version: 1.1.4-SNAPSHOT
export const importVueComponent = (function () {
    var n = "importVueComponent ";
    var e;
    if (!fetch) e = "fetch api polyfill (https://github.com/github/fetch)";
    if (!Promise) e = "Promise api or polyfill (https://github.com/Ziriax/Promistix)";
    if (!Vue) e = "Vue (https://unpkg.com/vue)";
    if (e) throw new Error(n + "requires " + e);

    var w = window;
    var d = document;

    // Active
    var a = 0;
    // Active Listeners
    var l = [];
    // Css Loaded
    var c = [];
    // Promises
    var p = {};

    function r() {
        for (var i = 0; i < l.length; i++) l[i](a === 1);
    }

    function finalize(resolve, obj, template, name, jsName) {
        if (template) {
            if (obj.transformTemplate) template = obj.transformTemplate(template);
            if (obj.functional) {
                var fn = Vue.compile(template);
                obj.render = function (h, ctx) {
                    if (!ctx.$options) {
                        ctx.$options = {};
                        var cache = {};
                        ctx._m = function (idx) {
                            if (!cache[idx]) {
                                cache[idx] = fn.staticRenderFns[idx].call(ctx);
                                cache[idx].isStatic = true;
                            }
                            return cache[idx];
                        }
                    }
                    if (!ctx.$scopedSlots) {
                        ctx.$scopedSlots = {};
                        ctx.$slots = ctx.slots();
                    }
                    return fn.render.call(ctx);
                };
            } else {
                obj.template = template;
            }
        } else if (!obj.render) {
            throw new Error(n + name + " should wrap it's template in one element");
        }
        obj.name = obj.name || name;

        resolve(w[jsName] = obj);
    }

    function ivc(name, location, jsName) {
        var lazy = ivc.lazy;
        if (location && location.constructor === Object) {
            lazy = location.lazy ? location.lazy : lazy;
            jsName = location.jsName || name;
            location = location.location || name;
        } else {
            location = location || name;
            jsName = jsName || name;
        }

        // We may have already loaded this
        if (w[jsName]) {
            if (!lazy && w[jsName].constructor === Function && w[jsName]._lazy) w[jsName]();
            return w[jsName];
        }

        var resolve, reject;
        var promise = new Promise(function (_resolve, _reject) {
            resolve = _resolve;
            reject = _reject
        });

        function retrieve() {
            var resolvedLocation = ivc.location(location, "vue");
            fetch(resolvedLocation).then(function (rsp) {
                return rsp.text();
            }).then(function (content) {
                var div = d.createElement('div');
                div.innerHTML = content;
                var template = '';
                var children = Array.prototype.slice.call(div.children);
                var obj = null;
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (child.tagName === 'STYLE') {
                        d.body.appendChild(ivc.transformStyle(child));
                    } else if (child.tagName === 'SCRIPT') {
                        eval(ivc.transformScript(child.textContent || child.innerText));
                        obj = w[jsName];
                        w[jsName] = promise;
                    } else if (child.outerHTML) {
                        if (template) throw new Error(n + name + " should wrap it's template in one element (" + resolvedLocation + ")");
                        template = ivc.transformTemplate(child.outerHTML);
                    }
                }

                if (!obj) throw new Error(n + jsName + " is not defined after loading component, did you forget to set the definition on the global scope? e.g. window['" + jsName + "'] = {} in (" + resolvedLocation + ")");

                if (obj.require) {
                    var promises = [];
                    for (var jsDepName in obj.require) {
                        if (!obj.require.hasOwnProperty(jsDepName)) continue;
                        var depJsLocation = obj.require[jsDepName];
                        if (w[jsDepName]) {
                            promises.push(w[jsDepName]);
                        } else if (p[jsDepName]) {
                            promises.push(p[jsDepName]);
                        } else {
                            p[jsDepName] = function (src) {
                                return new Promise(function (resolve, reject) {
                                    if (src.lastIndexOf(".js") === src.length - 3) {
                                        var script = d.createElement('script');
                                        script.onload = resolve;
                                        script.onerror = reject;
                                        script.async = true;
                                        script.src = src;
                                        d.head.appendChild(script);
                                    } else {
                                        if (c.indexOf(src) === -1) {
                                            c.push(src);
                                            var link = d.createElement('link');
                                            link.rel = 'stylesheet';
                                            link.type = 'text/css';
                                            link.href = src;
                                            link.media = 'all';
                                            d.head.appendChild(link);
                                        }
                                        // Auto resolve css
                                        resolve();
                                    }
                                });
                            }(ivc.location(depJsLocation, "lib"));
                            promises.push(p[jsDepName]);
                        }
                    }
                    Promise.all(promises).then(function () {
                        for (var jsDepName in obj.require) delete p[jsDepName];
                        if (obj.then) obj = obj.then.constructor === Function ? obj.then() : obj.then;
                        finalize(resolve, obj, template, name, jsName);
                    });
                } else {
                    finalize(resolve, obj, template, name, jsName);
                }
            });
        }

        if (!lazy) retrieve();
        else retrieve._lazy = true;

        Vue.component(name, w[jsName] = function (resolve) {
            if (lazy) retrieve();
            if (++a === 1) r();
            promise.then(resolve).then(function (c) {
                if (--a === 0) r();
            });
        });

        return w[jsName];
    }

    /**
     *  Functions that can process elements/templates/scripts prior to loading them
     */
    ivc.transformScript = ivc.transformTemplate = ivc.transformStyle = function (o) {
        return o;
    };

    /**
     * Define how to resolve a location given a type
     */
    var L = ivc.location = function (location, type) {
        if (!location || location.constructor !== String) throw new Error(n + "could not load:" + type + " resource at " + location);
        if (L.overrides[location]) return r.overrides[location];
        if (location.indexOf("//") === 0 || location.indexOf("http") === 0) return location;
        if (L.prefixes[type]) location = L.prefixes[type] + location;
        if (L.suffixes[type]) location = location + L.suffixes[type];
        if (location.indexOf("$basePath") === 0) {
            var b = L.basePath;
            return b + location.substr((b[b.length - 1] === '/' && location[9] === '/') ? 10 : 9);
        }
        return location;
    };
    L.overrides = {};
    L.prefixes = {
        vue: "$basePath/vue/",
        lib: "$basePath/vendor/"
    };
    L.suffixes = {
        vue: ".vue.html"
    };

    L.basePath = document.location.pathname;

    ivc.lazy = true;

    ivc.track = function (sl) {
        l.push(sl);
        sl(a !== 0);
    };
    ivc.onceLoaded = function (cb) {
        if (a === 0) {
            cb();
            return;
        }
        var fn = function (loaded) {
            if (!loaded) return;
            cb();
            l.splice(l.indexOf(fn), 1);
        };
        l.push(fn);
    };

    return ivc;
})();
