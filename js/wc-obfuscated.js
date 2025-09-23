!function(t) {
    function e(e) {
        for (var n, r, c = e[0], s = e[1], u = e[2], p = 0, d = []; p < c.length; p++)
            r = c[p],
            o[r] && d.push(o[r][0]),
            o[r] = 0;
        for (n in s)
            Object.prototype.hasOwnProperty.call(s, n) && (t[n] = s[n]);
        for (l && l(e); d.length; )
            d.shift()();
        return a.push.apply(a, u || []),
        i()
    }
    function i() {
        for (var t, e = 0; e < a.length; e++) {
            for (var i = a[e], n = !0, c = 1; c < i.length; c++) {
                var s = i[c];
                0 !== o[s] && (n = !1)
            }
            n && (a.splice(e--, 1),
            t = r(r.s = i[0]))
        }
        return t
    }
    var n = {}
      , o = {
        0: 0
    }
      , a = [];
    function r(e) {
        if (n[e])
            return n[e].exports;
        var i = n[e] = {
            i: e,
            l: !1,
            exports: {}
        };
        return t[e].call(i.exports, i, i.exports, r),
        i.l = !0,
        i.exports
    }
    r.m = t,
    r.c = n,
    r.d = function(t, e, i) {
        r.o(t, e) || Object.defineProperty(t, e, {
            enumerable: !0,
            get: i
        })
    }
    ,
    r.r = function(t) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(t, "__esModule", {
            value: !0
        })
    }
    ,
    r.t = function(t, e) {
        if (1 & e && (t = r(t)),
        8 & e)
            return t;
        if (4 & e && "object" == typeof t && t && t.__esModule)
            return t;
        var i = Object.create(null);
        if (r.r(i),
        Object.defineProperty(i, "default", {
            enumerable: !0,
            value: t
        }),
        2 & e && "string" != typeof t)
            for (var n in t)
                r.d(i, n, function(e) {
                    return t[e]
                }
                .bind(null, n));
        return i
    }
    ,
    r.n = function(t) {
        var e = t && t.__esModule ? function() {
            return t.default
        }
        : function() {
            return t
        }
        ;
        return r.d(e, "a", e),
        e
    }
    ,
    r.o = function(t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
    }
    ,
    r.p = "/play/";
    var c = window.webpackJsonp = window.webpackJsonp || []
      , s = c.push.bind(c);
    c.push = e,
    c = c.slice();
    for (var u = 0; u < c.length; u++)
        e(c[u]);
    var l = s;
    a.push([147, 1]),
    i()
}({
    117: function(t, e, i) {
        var n = i(8);
        function o(t) {
            return t && (t.__esModule ? t.default : t)
        }
        t.exports = (n.default || n).template({
            1: function(t, e, n, a, r) {
                return '  <div class="scripttype">Execute the following javascript:</div>\n  <pre class="cm-s-lesser-dark">' + t.escapeExpression(o(i(118)).call(null != e ? e : t.nullContext || {}, null != e ? e.data : e, "text/javascript", {
                    name: "codemirror",
                    hash: {},
                    data: r
                })) + "</pre>\n"
            },
            3: function(t, e, n, a, r) {
                return '  <div class="scripttype">Execute the following commands:</div>\n  <pre class="cm-s-lesser-dark">' + t.escapeExpression(o(i(118)).call(null != e ? e : t.nullContext || {}, null != e ? e.data : e, "text/plain", {
                    name: "codemirror",
                    hash: {},
                    data: r
                })) + "</pre>\n"
            },
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, n, a, r) {
                var c;
                return null != (c = o(i(228)).call(null != e ? e : t.nullContext || {}, null != e ? e.language : e, "==", "javascript", {
                    name: "ifCond",
                    hash: {},
                    fn: t.program(1, r, 0),
                    inverse: t.program(3, r, 0),
                    data: r
                })) ? c : ""
            },
            useData: !0
        })
    },
    118: function(t, e, i) {
        "use strict";
        i.r(e),
        i.d(e, "default", function() {
            return u
        });
        var n = i(11)
          , o = i.n(n)
          , a = i(8)
          , r = i.n(a)
          , c = i(0)
          , s = i.n(c);
        function u(t, e) {
            var i = s()("<div />");
            return o.a.runMode("\n" + t, e, i[0]),
            new r.a.SafeString(i.html())
        }
    },
    125: function(t, e, i) {
        t.exports = i.p + "542fe5051a31d27548deb0bfbb393486.gif"
    },
    126: function(t, e, i) {
        t.exports = i.p + "90148c1106b811cfd4a3b4709abc5537.png"
    },
    127: function(t, e, i) {
        t.exports = i.p + "ba9971853c9e223b57fc26e0267db19e.png"
    },
    132: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, n, o, a) {
                var r, c = t.lambda, s = t.escapeExpression;
                return '<div class="selection">\n  <div class="list"></div>\n  <div class="empty">' + s(c(null != (r = null != e ? e.text : e) ? r.empty : r, e)) + '</div>\n  <div class="actions">\n    <a href="#" class="addentry"><img src="' + i(227) + '"> ' + s(c(null != (r = null != e ? e.text : e) ? r.add : r, e)) + '</a>\n  </div>\n</div>\n<div class="data">\n</div>\n'
            },
            useData: !0
        })
    },
    133: function(t, e, i) {
        t.exports = i.p + "eaa94d6737af483b35cfc292afdb00d4.gif"
    },
    134: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            1: function(t, e, i, n, o) {
                return "  Name: " + t.escapeExpression(t.lambda(null != e ? e.name : e, e)) + "<br>\n"
            },
            3: function(t, e, n, o, a) {
                var r;
                return null != (r = t.invokePartial(i(117), e, {
                    name: "script",
                    data: a,
                    indent: "  ",
                    helpers: n,
                    partials: o,
                    decorators: t.decorators
                })) ? r : ""
            },
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, i, n, o) {
                var a, r = null != e ? e : t.nullContext || {}, c = t.lambda, s = t.escapeExpression;
                return (null != (a = i.if.call(r, null != e ? e.name : e, {
                    name: "if",
                    hash: {},
                    fn: t.program(1, o, 0),
                    inverse: t.noop,
                    data: o
                })) ? a : "") + "Type: " + s(c(null != e ? e.type : e, e)) + "<br>\nPattern: " + s(c(null != e ? e.value : e, e)) + "<br>\n<br>\n" + (null != (a = i.with.call(r, null != e ? e.script : e, {
                    name: "with",
                    hash: {},
                    fn: t.program(3, o, 0),
                    inverse: t.noop,
                    data: o
                })) ? a : "") + "<br>\n"
            },
            usePartial: !0,
            useData: !0
        })
    },
    135: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, i, n, o) {
                var a, r, c = null != e ? e : t.nullContext || {}, s = i.helperMissing, u = t.escapeExpression;
                return '<div>\n  <h4>Trigger Name</h4>\n  <input class="trigger-name" type="text" value="' + u("function" == typeof (r = null != (r = i.name || (null != e ? e.name : e)) ? r : s) ? r.call(c, {
                    name: "name",
                    hash: {},
                    data: o
                }) : r) + '">\n</div>\n\n<div>\n  <h4>Trigger Type</h4>\n  <div class="trigger-type radio-buttons">\n    <button data-type="plain">Text</button>\n    <button data-type="regexp">Regexp</button>\n    <button data-type="gmcp">GMCP</button>\n  </div>\n\n  <button class="case-sensitive">CASE SENSITIVE</button>\n</div>\n\n<div>\n  <h4>Pattern</h4>\n  <input class="trigger-pattern" type="text" value="' + u("function" == typeof (r = null != (r = i.value || (null != e ? e.value : e)) ? r : s) ? r.call(c, {
                    name: "value",
                    hash: {},
                    data: o
                }) : r) + '">\n</div>\n\n<div>\n  <h4>Script Type</h4>\n  <div class="script-type radio-buttons">\n    <button data-type="plain">Commands</button>\n    <button data-type="javascript">Javascript</button>\n  </div>\n</div>\n\n<div class="results"></div>\n\n<div>\n  <textarea name="script">' + u(t.lambda(null != (a = null != e ? e.script : e) ? a.data : a, e)) + "</textarea>\n</div>\n"
            },
            useData: !0
        })
    },
    136: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, i, n, o) {
                var a;
                return "Are you sure you want to remove the trigger for " + t.escapeExpression("function" == typeof (a = null != (a = i.title || (null != e ? e.title : e)) ? a : i.helperMissing) ? a.call(null != e ? e : t.nullContext || {}, {
                    name: "title",
                    hash: {},
                    data: o
                }) : a) + "?\n"
            },
            useData: !0
        })
    },
    137: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, i, n, o) {
                var a, r = null != e ? e : t.nullContext || {}, c = i.helperMissing, s = t.escapeExpression;
                return '<div>\n<div class="input-dialog">\n    <div class="input-pusher-container">\n        <div class="input-pusher">\n            ' + s("function" == typeof (a = null != (a = i.push || (null != e ? e.push : e)) ? a : c) ? a.call(r, {
                    name: "push",
                    hash: {},
                    data: o
                }) : a) + '\n        </div>\n        <div class="input-line-container">\n            <div class="input-guide-line"></div>\n        </div>\n    </div>\n    <textarea>' + s("function" == typeof (a = null != (a = i.initial || (null != e ? e.initial : e)) ? a : c) ? a.call(r, {
                    name: "initial",
                    hash: {},
                    data: o
                }) : a) + "</textarea>\n</div>\n</div>\n"
            },
            useData: !0
        })
    },
    138: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, n, o, a) {
                return '<br>\n<center>\n    <img src="' + i(242) + '"></center><br>\n    <p>Welcome to Genesis, a free text based fantasy game where your own imagination is the only limit. Join the countless players that have been calling Genesis their home for more then 20 years.</p>\n<br>\n'
            },
            useData: !0
        })
    },
    139: function(t, e) {
        t.exports = "<h3 id=welcome-to-genesis>Welcome to Genesis</h3> <p>You&#39;ve found one of the oldest games on the internet. Welcome! Let&#39;s get you started ...</p> <h3 id=getting-started>Getting Started</h3> <p>To get started with a new character just type <strong>new</strong> and follow the instructions. Genesis is a fantasy roleplaying game so please try to think of a suitable name for a fantasy environment.</p> <h3 id=playing-the-game>Playing the game</h3> <p>We&#39;ve prepared a tutorial that will get you started. Explore it and learn how to play the game by reading the signs.</p> <p>You might not be used to old-school games like this which let the visuals exist in your head (like a novel) so the most important thing to remember is that the game is played by typing text commands that start with a verb. Examples:</p> <ul> <li>kill bunny</li> <li>get all from corpse</li> </ul> <h3 id=getting-help>Getting Help</h3> <p>The newbie pin you will get once you&#39;ve created your character gives you the ability to use the <ntell> command to get help from other players.</ntell></p> <p>We have a friendly community, so don&#39;t be afraid to use it!</p> "
    },
    140: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            1: function(t, e, n, o, a) {
                var r;
                return null != (r = t.invokePartial(i(117), e, {
                    name: "script",
                    data: a,
                    indent: "  ",
                    helpers: n,
                    partials: o,
                    decorators: t.decorators
                })) ? r : ""
            },
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, i, n, o) {
                var a;
                return "Pattern: " + t.escapeExpression(t.lambda(null != e ? e.value : e, e)) + "<br>\n<br>\n" + (null != (a = i.with.call(null != e ? e : t.nullContext || {}, null != e ? e.script : e, {
                    name: "with",
                    hash: {},
                    fn: t.program(1, o, 0),
                    inverse: t.noop,
                    data: o
                })) ? a : "") + "<br>\n"
            },
            usePartial: !0,
            useData: !0
        })
    },
    141: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, i, n, o) {
                var a, r, c = t.escapeExpression;
                return '<div>\n  <h4>Command</h4>\n  <input type="text" value="' + c("function" == typeof (r = null != (r = i.value || (null != e ? e.value : e)) ? r : i.helperMissing) ? r.call(null != e ? e : t.nullContext || {}, {
                    name: "value",
                    hash: {},
                    data: o
                }) : r) + '">\n</div>\n\n<div>\n  <h4>Script Type</h4>\n  <div class="script-type radio-buttons">\n    <button data-type="plain">Commands</button>\n    <button data-type="javascript">Javascript</button>\n  </div>\n</div>\n\n<div class="results"></div>\n\n<div>\n  <textarea name="script">' + c(t.lambda(null != (a = null != e ? e.script : e) ? a.data : a, e)) + "</textarea>\n</div>\n"
            },
            useData: !0
        })
    },
    142: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, i, n, o) {
                var a;
                return "Are you sure you want to remove the alias for " + t.escapeExpression("function" == typeof (a = null != (a = i.title || (null != e ? e.title : e)) ? a : i.helperMissing) ? a.call(null != e ? e : t.nullContext || {}, {
                    name: "title",
                    hash: {},
                    data: o
                }) : a) + "?\n"
            },
            useData: !0
        })
    },
    143: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, i, n, o) {
                var a;
                return '\n<div class="version">\n    Version: ' + t.escapeExpression("function" == typeof (a = null != (a = i.VERSION || (null != e ? e.VERSION : e)) ? a : i.helperMissing) ? a.call(null != e ? e : t.nullContext || {}, {
                    name: "VERSION",
                    hash: {},
                    data: o
                }) : a) + "\n</div>\n\n"
            },
            useData: !0
        })
    },
    144: function(t, e, i) {
        var n = i(8);
        t.exports = (n.default || n).template({
            compiler: [7, ">= 4.0.0"],
            main: function(t, e, i, n, o) {
                return "Settings are only available when logged in."
            },
            useData: !0
        })
    },
    147: function(t, e, i) {
        i(148),
        t.exports = i(288)
    },
    227: function(t, e, i) {
        t.exports = i.p + "d07cd87ac681cec2534899d58bb0f42a.gif"
    },
    228: function(t, e, i) {
        "use strict";
        function n(t, e, i, n) {
            switch (e) {
            case "==":
                return t == i ? n.fn(this) : n.inverse(this);
            case "===":
                return t === i ? n.fn(this) : n.inverse(this);
            case "<":
                return t < i ? n.fn(this) : n.inverse(this);
            case "<=":
                return t <= i ? n.fn(this) : n.inverse(this);
            case ">":
                return t > i ? n.fn(this) : n.inverse(this);
            case ">=":
                return t >= i ? n.fn(this) : n.inverse(this);
            default:
                return n.inverse(this)
            }
        }
        i.r(e),
        i.d(e, "default", function() {
            return n
        })
    },
    242: function(t, e, i) {
        t.exports = i.p + "dbe67945a281016a77542275b3967fb9.png"
    },
    243: function(t, e, i) {
        var n = i(244);
        "string" == typeof n && (n = [[t.i, n, ""]]);
        var o = {
            transform: void 0
        };
        i(31)(n, o);
        n.locals && (t.exports = n.locals)
    },
    244: function(t, e, i) {
        (t.exports = i(30)(!1)).push([t.i, "#general .version{position:absolute;right:.5em;bottom:.5em}", ""])
    },
    247: function(t, e, i) {
        var n = i(248);
        "string" == typeof n && (n = [[t.i, n, ""]]);
        var o = {
            transform: void 0
        };
        i(31)(n, o);
        n.locals && (t.exports = n.locals)
    },
    248: function(t, e, i) {
        var n = i(124);
        (t.exports = i(30)(!1)).push([t.i, "*{padding:0}*,body{margin:0}body{background-image:url(" + n(i(249)) + ");height:100%}body,button{font-family:Source Code Pro,sans-serif}button{font-size:14px;color:#fff;padding:5px 10px;background:-moz-linear-gradient(top,#a3a3a3 0,#3b3b3b 50%,#242424 50%,#000);background:-webkit-gradient(linear,left top,left bottom,from(#a3a3a3),color-stop(.5,#3b3b3b),color-stop(.5,#242424),to(#000));border:1px solid #000;-moz-box-shadow:0 1px 3px rgba(0,0,0,.5),inset 0 0 1px hsla(0,0%,100%,.6);-webkit-box-shadow:0 1px 3px rgba(0,0,0,.5),inset 0 0 1px hsla(0,0%,100%,.6);box-shadow:0 1px 3px rgba(0,0,0,.5),inset 0 0 1px hsla(0,0%,100%,.6);text-shadow:0 -1px 0 #000,0 1px 0 hsla(0,0%,100%,.2)}pre{font-family:Source Code Pro,monospace}a,a:visited{color:#d0d0d0}.clear{clear:both}.message{top:100px;width:-moz-calc(100% - 100px);width:-webkit-calc(100% - 100px);width:calc(100% - 100px);text-align:center;color:#d0d0d0;padding-left:50px;padding-right:50px}#client,.message{position:absolute;left:0}#client{outline:none;top:0;width:100%;height:100%;display:none}.js.websockets #client{display:block}#uncompatible,.js #missingjs{display:none}.js #uncompatible{display:block}.js.websockets #uncompatible{display:none}#welcome{max-width:500px}#welcome img{max-width:100%}#main{position:relative;float:left;width:60%;height:100%}.output-wrapper{font-size:14px;height:-moz-calc(100% - 116px);height:-webkit-calc(100% - 116px);height:calc(100% - 116px);width:-moz-calc(100% - 42px);width:-webkit-calc(100% - 42px);width:calc(100% - 42px);background-color:rgba(0,0,0,.5);border:1px solid #999;margin:10px;color:#d0d0d0;padding:10px}#mudoutput{height:100%;width:100%;white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;overflow:auto}#mudoutput span.system{color:#b30000}#mudoutput span.input{color:#d68936}#char-size{position:absolute;visibility:hidden;height:auto;width:auto}#statusbars{position:absolute;bottom:10px;left:0;width:100%;height:22px}#statusbars>div{float:left;position:relative;width:-moz-calc(33% - 12px);width:-webkit-calc(33% - 12px);width:calc(33% - 12px);margin-left:10px;height:20px;border:1px solid #999;background-color:rgba(0,0,0,.5)}#statusbars div .progress{position:absolute;height:20px}#statusbars div#health .progress{background-color:#b30000}#statusbars div#mana .progress{background-color:#0053b3}#statusbars div#fatigue .progress{background-color:#055705}#statusbars div .text{position:absolute;height:20px;width:100%;text-align:center;color:#d0d0d0;text-shadow:1px 1px #000;font-family:Source Code Pro,sans-serif;font-size:14px;font-variant:small-caps}#inputbar{outline:none;position:absolute;bottom:30px;width:-moz-calc(100% - 22px);width:-webkit-calc(100% - 22px);width:calc(100% - 22px);height:30px;margin:10px;background-color:rgba(0,0,0,.5);border:1px solid #999}#inputbar div{position:relative}#voice-input{position:absolute;right:5px;top:7px;color:#d0d0d0}#input{box-sizing:border-box;border-style:none;border-color:transparent;background-color:transparent;overflow:auto;width:100%;height:100%;resize:none;color:#fff;padding:4px 10px;line-height:22px}#sidebar{float:left;width:40%;height:100%}#sidebar,.tabs{position:relative}.tabs{height:-moz-calc(60% - 32px);height:-webkit-calc(60% - 32px);height:calc(60% - 32px);width:-moz-calc(100% - 10px);width:-webkit-calc(100% - 10px);width:calc(100% - 10px);margin-top:10px;margin-right:10px;color:#d0d0d0}.tabs .idTabs li{list-style:none;float:left}.tabs .idTabs a{font-family:Source Code Pro,sans-serif;font-variant:small-caps;font-size:14px;display:block;padding:4px;height:20px;width:100px;text-decoration:none!important;margin:0;margin-left:0;color:#d0d0d0;border-top:1px solid #999;border-right:1px solid #999;border-bottom:1px solid #999;background-color:rgba(0,0,0,.3);text-align:center}.tabs .idTabs li:first-child a{border-left:1px solid #999}.tabs .idTabs a.selected{font-weight:700;border-bottom-color:rgba(0,0,0,.5);background-color:rgba(0,0,0,.5)}.tabs .filler{top:0;border-bottom:1px solid #999;height:29px;width:100%}.tabs .content{background-color:rgba(0,0,0,.5);border-bottom:1px solid #999;border-left:1px solid #999;border-right:1px solid #999;padding:10px;width:-moz-calc(100% - 22px);width:-webkit-calc(100% - 22px);width:calc(100% - 22px);height:-moz-calc(100% - 52px);height:-webkit-calc(100% - 52px);height:calc(100% - 52px);overflow:auto}#topsidebar .filler{width:-moz-calc(100% - 110px);width:-webkit-calc(100% - 110px);width:calc(100% - 110px);margin-left:110px}#magicmap{font-family:Source Code Pro,sans-serif;font-size:11px;white-space:pre}.text-content{font-family:Inconsolata,Source Code Pro,sans-serif}.text-content ul{margin-left:2em}.text-content h2,.text-content h3,.text-content p{margin-top:.75em;margin-bottom:.75em}#bottomsidebar{height:-moz-calc(40% - 71px);height:-webkit-calc(40% - 71px);height:calc(40% - 71px);width:-moz-calc(100% - 10px);width:-webkit-calc(100% - 10px);width:calc(100% - 10px);margin-top:10px;margin-right:10px}#bottomsidebar .filler{width:-moz-calc(100% - 110px);width:-webkit-calc(100% - 110px);width:calc(100% - 110px);margin-left:110px}#communication{font-family:Source Code Pro,sans-serif;font-size:14px;color:#d0d0d0;padding:10px;white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word}#communication div{margin-bottom:3px}#communication div:nth-child(2n){color:#a0a0a0}.line{display:block;min-height:1em;clear:left}.hanging-indent{padding-left:10px;text-indent:-10px}.notification{color:#b30000}.outgoing{display:inline-block;color:#d68936}.prompt{display:block;float:left;clear:left;color:#fff}.exit{text-decoration:underline;cursor:pointer}#controls{position:absolute;bottom:10px;right:10px;width:-moz-calc(40% - 10px);width:-webkit-calc(40% - 10px);width:calc(40% - 10px);max-height:60px}#controls button{height:34px}#status{color:#d0d0d0;padding-right:130px}#opensettings{right:0}#connect,#opensettings{position:absolute;bottom:0;width:40px}#connect{right:45px}#settings{position:absolute;top:0;left:0;width:100%;height:100%;display:none;background-color:rgba(0,0,0,.9)}#settingscontent{position:relative;top:10%;left:10%;height:80%;width:80%}#settingscontent .idTabs a{width:170px}#settingscontent .filler{width:-moz-calc(100% - 360px);width:-webkit-calc(100% - 360px);width:calc(100% - 360px);margin-left:360px}#closesettings{position:absolute;top:-moz-calc(90% + 20px);top:-webkit-calc(90% + 20px);top:calc(90% + 20px);right:10%}#triggerselection{position:relative;float:left;width:-moz-calc(30% - 1px);width:-webkit-calc(30% - 1px);width:calc(30% - 1px);height:100%;border-right:1px solid #999}#triggerlist{width:-moz-calc(100% - 10px);width:-webkit-calc(100% - 10px);width:calc(100% - 10px);padding-right:10px;height:-moz-calc(100% - 30px);height:-webkit-calc(100% - 30px);height:calc(100% - 30px)}#triggerlist div{position:relative;padding-top:5px;padding-bottom:5px;padding-left:30px;cursor:hand;cursor:pointer}#triggerlist div img{position:absolute;right:0;top:7px}#viewtriggerscripttype{padding-bottom:3px;margin-bottom:5px;border-bottom:1px solid #666}#triggerlist div.enabled{background-image:url(" + n(i(125)) + ");background-repeat:no-repeat;background-position:5px 7px}#triggerlist div.selected{background-color:#303030}#triggersempty{position:absolute;top:0;width:-moz-calc(100% - 10px);width:-webkit-calc(100% - 10px);width:calc(100% - 10px)}#triggeractions{position:absolute;bottom:0;height:20px;width:100%}#newtrigger{text-decoration:none;color:#d0d0d0}#triggerdata{padding-left:10px;height:100%;overflow:auto}.settingslist .selection{position:relative;float:left;width:-moz-calc(30% - 1px);width:-webkit-calc(30% - 1px);width:calc(30% - 1px);height:100%;border-right:1px solid #999}.settingslist .list{width:-moz-calc(100% - 10px);width:-webkit-calc(100% - 10px);width:calc(100% - 10px);padding-right:10px;height:-moz-calc(100% - 30px);height:-webkit-calc(100% - 30px);height:calc(100% - 30px);overflow-y:auto}.settingslist .list div{position:relative;padding-top:5px;padding-bottom:5px;padding-left:30px;cursor:hand;cursor:pointer}.settingslist .list div img{position:absolute;right:0;top:7px}.settingslist .list div.enabled{background-image:url(" + n(i(125)) + ");background-repeat:no-repeat;background-position:5px 7px}.settingslist .list div.selected{background-color:#303030}.settingslist .empty{position:absolute;top:0;width:-moz-calc(100% - 10px);width:-webkit-calc(100% - 10px);width:calc(100% - 10px)}.settingslist .actions{position:absolute;bottom:0;height:20px;width:100%}.settingslist .actions a{text-decoration:none;color:#d0d0d0}.settingslist .data{padding-left:10px;height:100%;overflow:auto}.scripttype{padding-bottom:3px;margin-bottom:5px;border-bottom:1px solid #666}.data>div{margin-top:.2em}.data .CodeMirror{height:auto}.data .CodeMirror-scroll{min-height:150px}.data input[type=text]{width:90%}.radio-buttons{display:inline-flex}button.inactive{color:grey}.input-dialog{position:relative;overflow:hidden;height:100%}.input-dialog,.input-dialog textarea{font-family:Source Code Pro,sans-serif;font-size:14px}.input-dialog textarea{width:98%;height:98%;background-color:rgba(0,0,0,.5);border:1px solid #999;color:#fff;padding:4px;box-sizing:border-box}.input-pusher-container{line-height:0;position:absolute;width:999px}.input-pusher{height:1px;visibility:hidden}.input-line-container,.input-pusher{display:inline-block}.input-guide-line{position:absolute;border-left:1px solid orange;height:10000px}@media screen and (max-width:1124px){#main{width:100%;top:40px;height:-moz-calc(100% - 40px);height:-webkit-calc(100% - 40px);height:calc(100% - 40px)}#sidebar{display:none}#controls{top:0;left:0;right:none;bottom:none;padding:10px;height:20px;width:-moz-calc(100% - 20px);width:-webkit-calc(100% - 20px);width:calc(100% - 20px);background-color:#202020}#opensettings{bottom:5px;right:10px}#connect{right:55px;bottom:5px}}@media screen and (max-width:768px){#controls{height:15px}button{font-size:12px;padding:2px 5px}#connecticon{width:15x;height:15px}#main{width:100%;top:15px;height:-moz-calc(100% - 15px);height:-webkit-calc(100% - 15px);height:calc(100% - 15px)}#status{display:none}pre{font-family:Inconsolata,Source Code Pro,monospace}.output-wrapper{font-size:2.5vw;border:none;margin:0;padding:0;padding-bottom:2px;height:-moz-calc(100% - 51px);height:-webkit-calc(100% - 51px);height:calc(100% - 51px);width:100%;border-top:1px solid #999}#input{outline:none}#inputbar{bottom:22px;width:100%;height:25px;margin:0;border-bottom:none;border-right:none;border-left:none}#statusbars{position:absolute;bottom:0;left:0;width:100%;height:22px}#statusbars>div{width:33%;height:21px;margin-left:0;width:-moz-calc(33% - 2px);width:-webkit-calc(33% - 2px);width:calc(33% - 2px);border-right:none;border-bottom:none}#statusbars>div:first-child{width:33%;border-left:none}#statusbars>div:last-child{width:-moz-calc(34% - 1px);width:-webkit-calc(34% - 1px);width:calc(34% - 1px)}#statusbars div .text{font-size:12px}}", ""])
    },
    249: function(t, e, i) {
        t.exports = i.p + "d3b7d809bea6e530d278c2ef21b4e07f.jpg"
    },
    250: function(t, e, i) {
        var n = i(251);
        "string" == typeof n && (n = [[t.i, n, ""]]);
        var o = {
            transform: void 0
        };
        i(31)(n, o);
        n.locals && (t.exports = n.locals)
    },
    251: function(t, e, i) {
        var n = i(124);
        (t.exports = i(30)(!1)).push([t.i, '/*! jQuery UI - v1.10.3 - 2013-08-03\n* http://jqueryui.com\n* Includes: jquery.ui.core.css, jquery.ui.resizable.css, jquery.ui.button.css, jquery.ui.dialog.css\n* To view and modify this theme, visit http://jqueryui.com/themeroller/?ffDefault=Verdana%2CArial%2Csans-serif&fwDefault=normal&fsDefault=1.1em&cornerRadius=6px&bgColorHeader=444444&bgTextureHeader=highlight_soft&bgImgOpacityHeader=44&borderColorHeader=333333&fcHeader=ffffff&iconColorHeader=ffffff&bgColorContent=000000&bgTextureContent=loop&bgImgOpacityContent=25&borderColorContent=555555&fcContent=ffffff&iconColorContent=cccccc&bgColorDefault=222222&bgTextureDefault=highlight_soft&bgImgOpacityDefault=35&borderColorDefault=444444&fcDefault=eeeeee&iconColorDefault=cccccc&bgColorHover=003147&bgTextureHover=highlight_soft&bgImgOpacityHover=33&borderColorHover=0b93d5&fcHover=ffffff&iconColorHover=ffffff&bgColorActive=0972a5&bgTextureActive=highlight_hard&bgImgOpacityActive=20&borderColorActive=26b3f7&fcActive=ffffff&iconColorActive=222222&bgColorHighlight=eeeeee&bgTextureHighlight=highlight_soft&bgImgOpacityHighlight=80&borderColorHighlight=cccccc&fcHighlight=2e7db2&iconColorHighlight=4b8e0b&bgColorError=ffc73d&bgTextureError=glass&bgImgOpacityError=40&borderColorError=ffb73d&fcError=111111&iconColorError=a83300&bgColorOverlay=5c5c5c&bgTextureOverlay=flat&bgImgOpacityOverlay=50&opacityOverlay=80&bgColorShadow=cccccc&bgTextureShadow=flat&bgImgOpacityShadow=30&opacityShadow=60&thicknessShadow=7px&offsetTopShadow=-7px&offsetLeftShadow=-7px&cornerRadiusShadow=8px\n* Copyright 2013 jQuery Foundation and other contributors Licensed MIT */.ui-helper-hidden{display:none}.ui-helper-hidden-accessible{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.ui-helper-reset{margin:0;padding:0;border:0;outline:0;line-height:1.3;text-decoration:none;font-size:100%;list-style:none}.ui-helper-clearfix:after,.ui-helper-clearfix:before{content:"";display:table;border-collapse:collapse}.ui-helper-clearfix:after{clear:both}.ui-helper-clearfix{min-height:0}.ui-helper-zfix{width:100%;height:100%;top:0;left:0;position:absolute;opacity:0;filter:Alpha(Opacity=0)}.ui-front{z-index:100}.ui-state-disabled{cursor:default!important}.ui-icon{display:block;text-indent:-99999px;overflow:hidden;background-repeat:no-repeat}.ui-widget-overlay{position:fixed;top:0;left:0;width:100%;height:100%}.ui-resizable{position:relative}.ui-resizable-handle{position:absolute;font-size:.1px;display:block}.ui-resizable-autohide .ui-resizable-handle,.ui-resizable-disabled .ui-resizable-handle{display:none}.ui-resizable-n{cursor:n-resize;height:7px;width:100%;top:-5px;left:0}.ui-resizable-s{cursor:s-resize;height:7px;width:100%;bottom:-5px;left:0}.ui-resizable-e{cursor:e-resize;width:7px;right:-5px;top:0;height:100%}.ui-resizable-w{cursor:w-resize;width:7px;left:-5px;top:0;height:100%}.ui-resizable-se{cursor:se-resize;width:12px;height:12px;right:1px;bottom:1px}.ui-resizable-sw{cursor:sw-resize;width:9px;height:9px;left:-5px;bottom:-5px}.ui-resizable-nw{cursor:nw-resize;width:9px;height:9px;left:-5px;top:-5px}.ui-resizable-ne{cursor:ne-resize;width:9px;height:9px;right:-5px;top:-5px}.ui-button{display:inline-block;position:relative;padding:0;line-height:normal;margin-right:.1em;cursor:pointer;vertical-align:middle;text-align:center;overflow:visible}.ui-button,.ui-button:active,.ui-button:hover,.ui-button:link,.ui-button:visited{text-decoration:none}.ui-button-icon-only{width:2.2em}button.ui-button-icon-only{width:2.4em}.ui-button-icons-only{width:3.4em}button.ui-button-icons-only{width:3.7em}.ui-button .ui-button-text{display:block;line-height:normal}.ui-button-text-only .ui-button-text{padding:.4em 1em}.ui-button-icon-only .ui-button-text,.ui-button-icons-only .ui-button-text{padding:.4em;text-indent:-9999999px}.ui-button-text-icon-primary .ui-button-text,.ui-button-text-icons .ui-button-text{padding:.4em 1em .4em 2.1em}.ui-button-text-icon-secondary .ui-button-text,.ui-button-text-icons .ui-button-text{padding:.4em 2.1em .4em 1em}.ui-button-text-icons .ui-button-text{padding-left:2.1em;padding-right:2.1em}input.ui-button{padding:.4em 1em}.ui-button-icon-only .ui-icon,.ui-button-icons-only .ui-icon,.ui-button-text-icon-primary .ui-icon,.ui-button-text-icon-secondary .ui-icon,.ui-button-text-icons .ui-icon{position:absolute;top:50%;margin-top:-8px}.ui-button-icon-only .ui-icon{left:50%;margin-left:-8px}.ui-button-icons-only .ui-button-icon-primary,.ui-button-text-icon-primary .ui-button-icon-primary,.ui-button-text-icons .ui-button-icon-primary{left:.5em}.ui-button-icons-only .ui-button-icon-secondary,.ui-button-text-icon-secondary .ui-button-icon-secondary,.ui-button-text-icons .ui-button-icon-secondary{right:.5em}.ui-buttonset{margin-right:7px}.ui-buttonset .ui-button{margin-left:0;margin-right:-.3em}button.ui-button::-moz-focus-inner,input.ui-button::-moz-focus-inner{border:0;padding:0}.ui-dialog{position:absolute;top:0;left:0;padding:.2em;outline:0}.ui-dialog .ui-dialog-titlebar{padding:.4em 1em;position:relative}.ui-dialog .ui-dialog-title{float:left;margin:.1em 0;white-space:nowrap;width:90%;overflow:hidden;text-overflow:ellipsis}.ui-dialog .ui-dialog-titlebar-close{position:absolute;right:.3em;top:50%;width:21px;margin:-10px 0 0;padding:1px;height:20px}.ui-dialog .ui-dialog-content{position:relative;border:0;padding:.5em 1em;background:none;overflow:auto}.ui-dialog .ui-dialog-buttonpane{text-align:left;border-width:1px 0 0;background-image:none;margin-top:.5em;padding:.3em 1em .5em .4em}.ui-dialog .ui-dialog-buttonpane .ui-dialog-buttonset{float:right}.ui-dialog .ui-dialog-buttonpane button{margin:.5em .4em .5em 0;cursor:pointer}.ui-dialog .ui-resizable-se{width:12px;height:12px;right:-5px;bottom:-5px;background-position:16px 16px}.ui-draggable .ui-dialog-titlebar{cursor:move}.ui-widget{font-family:Verdana,Arial,sans-serif;font-size:1.1em}.ui-widget .ui-widget{font-size:1em}.ui-widget-content{border:1px solid #555;background:#000 url(' + n(i(252)) + ") 50% 50% repeat;color:#fff}.ui-widget-content a{color:#fff}.ui-widget-header{border:1px solid #333;background:#444 url(" + n(i(253)) + ") 50% 50% repeat-x;color:#fff;font-weight:700}.ui-widget-header a{color:#fff}.ui-state-default,.ui-widget-content .ui-state-default,.ui-widget-header .ui-state-default{border:1px solid #444;background:#222 url(" + n(i(254)) + ") 50% 50% repeat-x;font-weight:400;color:#eee}.ui-state-default a,.ui-state-default a:link,.ui-state-default a:visited{color:#eee;text-decoration:none}.ui-state-focus,.ui-state-hover,.ui-widget-content .ui-state-focus,.ui-widget-content .ui-state-hover,.ui-widget-header .ui-state-focus,.ui-widget-header .ui-state-hover{border:1px solid #0b93d5;background:#003147 url(" + n(i(255)) + ") 50% 50% repeat-x;font-weight:400;color:#fff}.ui-state-hover a,.ui-state-hover a:hover,.ui-state-hover a:link,.ui-state-hover a:visited{color:#fff;text-decoration:none}.ui-state-active,.ui-widget-content .ui-state-active,.ui-widget-header .ui-state-active{border:1px solid #26b3f7;background:#0972a5 url(" + n(i(256)) + ") 50% 50% repeat-x;font-weight:400;color:#fff}.ui-state-active a,.ui-state-active a:link,.ui-state-active a:visited{color:#fff;text-decoration:none}.ui-state-highlight,.ui-widget-content .ui-state-highlight,.ui-widget-header .ui-state-highlight{border:1px solid #ccc;background:#eee url(" + n(i(257)) + ") 50% top repeat-x;color:#2e7db2}.ui-state-highlight a,.ui-widget-content .ui-state-highlight a,.ui-widget-header .ui-state-highlight a{color:#2e7db2}.ui-state-error,.ui-widget-content .ui-state-error,.ui-widget-header .ui-state-error{border:1px solid #ffb73d;background:#ffc73d url(" + n(i(258)) + ") 50% 50% repeat-x;color:#111}.ui-state-error-text,.ui-state-error a,.ui-widget-content .ui-state-error-text,.ui-widget-content .ui-state-error a,.ui-widget-header .ui-state-error-text,.ui-widget-header .ui-state-error a{color:#111}.ui-priority-primary,.ui-widget-content .ui-priority-primary,.ui-widget-header .ui-priority-primary{font-weight:700}.ui-priority-secondary,.ui-widget-content .ui-priority-secondary,.ui-widget-header .ui-priority-secondary{opacity:.7;filter:Alpha(Opacity=70);font-weight:400}.ui-state-disabled,.ui-widget-content .ui-state-disabled,.ui-widget-header .ui-state-disabled{opacity:.35;filter:Alpha(Opacity=35);background-image:none}.ui-state-disabled .ui-icon{filter:Alpha(Opacity=35)}.ui-icon{width:16px;height:16px}.ui-icon,.ui-widget-content .ui-icon{background-image:url(" + n(i(126)) + ")}.ui-widget-header .ui-icon{background-image:url(" + n(i(127)) + ")}.ui-state-default .ui-icon{background-image:url(" + n(i(126)) + ")}.ui-state-focus .ui-icon,.ui-state-hover .ui-icon{background-image:url(" + n(i(127)) + ")}.ui-state-active .ui-icon{background-image:url(" + n(i(259)) + ")}.ui-state-highlight .ui-icon{background-image:url(" + n(i(260)) + ")}.ui-state-error-text .ui-icon,.ui-state-error .ui-icon{background-image:url(" + n(i(261)) + ")}.ui-icon-blank{background-position:16px 16px}.ui-icon-carat-1-n{background-position:0 0}.ui-icon-carat-1-ne{background-position:-16px 0}.ui-icon-carat-1-e{background-position:-32px 0}.ui-icon-carat-1-se{background-position:-48px 0}.ui-icon-carat-1-s{background-position:-64px 0}.ui-icon-carat-1-sw{background-position:-80px 0}.ui-icon-carat-1-w{background-position:-96px 0}.ui-icon-carat-1-nw{background-position:-112px 0}.ui-icon-carat-2-n-s{background-position:-128px 0}.ui-icon-carat-2-e-w{background-position:-144px 0}.ui-icon-triangle-1-n{background-position:0 -16px}.ui-icon-triangle-1-ne{background-position:-16px -16px}.ui-icon-triangle-1-e{background-position:-32px -16px}.ui-icon-triangle-1-se{background-position:-48px -16px}.ui-icon-triangle-1-s{background-position:-64px -16px}.ui-icon-triangle-1-sw{background-position:-80px -16px}.ui-icon-triangle-1-w{background-position:-96px -16px}.ui-icon-triangle-1-nw{background-position:-112px -16px}.ui-icon-triangle-2-n-s{background-position:-128px -16px}.ui-icon-triangle-2-e-w{background-position:-144px -16px}.ui-icon-arrow-1-n{background-position:0 -32px}.ui-icon-arrow-1-ne{background-position:-16px -32px}.ui-icon-arrow-1-e{background-position:-32px -32px}.ui-icon-arrow-1-se{background-position:-48px -32px}.ui-icon-arrow-1-s{background-position:-64px -32px}.ui-icon-arrow-1-sw{background-position:-80px -32px}.ui-icon-arrow-1-w{background-position:-96px -32px}.ui-icon-arrow-1-nw{background-position:-112px -32px}.ui-icon-arrow-2-n-s{background-position:-128px -32px}.ui-icon-arrow-2-ne-sw{background-position:-144px -32px}.ui-icon-arrow-2-e-w{background-position:-160px -32px}.ui-icon-arrow-2-se-nw{background-position:-176px -32px}.ui-icon-arrowstop-1-n{background-position:-192px -32px}.ui-icon-arrowstop-1-e{background-position:-208px -32px}.ui-icon-arrowstop-1-s{background-position:-224px -32px}.ui-icon-arrowstop-1-w{background-position:-240px -32px}.ui-icon-arrowthick-1-n{background-position:0 -48px}.ui-icon-arrowthick-1-ne{background-position:-16px -48px}.ui-icon-arrowthick-1-e{background-position:-32px -48px}.ui-icon-arrowthick-1-se{background-position:-48px -48px}.ui-icon-arrowthick-1-s{background-position:-64px -48px}.ui-icon-arrowthick-1-sw{background-position:-80px -48px}.ui-icon-arrowthick-1-w{background-position:-96px -48px}.ui-icon-arrowthick-1-nw{background-position:-112px -48px}.ui-icon-arrowthick-2-n-s{background-position:-128px -48px}.ui-icon-arrowthick-2-ne-sw{background-position:-144px -48px}.ui-icon-arrowthick-2-e-w{background-position:-160px -48px}.ui-icon-arrowthick-2-se-nw{background-position:-176px -48px}.ui-icon-arrowthickstop-1-n{background-position:-192px -48px}.ui-icon-arrowthickstop-1-e{background-position:-208px -48px}.ui-icon-arrowthickstop-1-s{background-position:-224px -48px}.ui-icon-arrowthickstop-1-w{background-position:-240px -48px}.ui-icon-arrowreturnthick-1-w{background-position:0 -64px}.ui-icon-arrowreturnthick-1-n{background-position:-16px -64px}.ui-icon-arrowreturnthick-1-e{background-position:-32px -64px}.ui-icon-arrowreturnthick-1-s{background-position:-48px -64px}.ui-icon-arrowreturn-1-w{background-position:-64px -64px}.ui-icon-arrowreturn-1-n{background-position:-80px -64px}.ui-icon-arrowreturn-1-e{background-position:-96px -64px}.ui-icon-arrowreturn-1-s{background-position:-112px -64px}.ui-icon-arrowrefresh-1-w{background-position:-128px -64px}.ui-icon-arrowrefresh-1-n{background-position:-144px -64px}.ui-icon-arrowrefresh-1-e{background-position:-160px -64px}.ui-icon-arrowrefresh-1-s{background-position:-176px -64px}.ui-icon-arrow-4{background-position:0 -80px}.ui-icon-arrow-4-diag{background-position:-16px -80px}.ui-icon-extlink{background-position:-32px -80px}.ui-icon-newwin{background-position:-48px -80px}.ui-icon-refresh{background-position:-64px -80px}.ui-icon-shuffle{background-position:-80px -80px}.ui-icon-transfer-e-w{background-position:-96px -80px}.ui-icon-transferthick-e-w{background-position:-112px -80px}.ui-icon-folder-collapsed{background-position:0 -96px}.ui-icon-folder-open{background-position:-16px -96px}.ui-icon-document{background-position:-32px -96px}.ui-icon-document-b{background-position:-48px -96px}.ui-icon-note{background-position:-64px -96px}.ui-icon-mail-closed{background-position:-80px -96px}.ui-icon-mail-open{background-position:-96px -96px}.ui-icon-suitcase{background-position:-112px -96px}.ui-icon-comment{background-position:-128px -96px}.ui-icon-person{background-position:-144px -96px}.ui-icon-print{background-position:-160px -96px}.ui-icon-trash{background-position:-176px -96px}.ui-icon-locked{background-position:-192px -96px}.ui-icon-unlocked{background-position:-208px -96px}.ui-icon-bookmark{background-position:-224px -96px}.ui-icon-tag{background-position:-240px -96px}.ui-icon-home{background-position:0 -112px}.ui-icon-flag{background-position:-16px -112px}.ui-icon-calendar{background-position:-32px -112px}.ui-icon-cart{background-position:-48px -112px}.ui-icon-pencil{background-position:-64px -112px}.ui-icon-clock{background-position:-80px -112px}.ui-icon-disk{background-position:-96px -112px}.ui-icon-calculator{background-position:-112px -112px}.ui-icon-zoomin{background-position:-128px -112px}.ui-icon-zoomout{background-position:-144px -112px}.ui-icon-search{background-position:-160px -112px}.ui-icon-wrench{background-position:-176px -112px}.ui-icon-gear{background-position:-192px -112px}.ui-icon-heart{background-position:-208px -112px}.ui-icon-star{background-position:-224px -112px}.ui-icon-link{background-position:-240px -112px}.ui-icon-cancel{background-position:0 -128px}.ui-icon-plus{background-position:-16px -128px}.ui-icon-plusthick{background-position:-32px -128px}.ui-icon-minus{background-position:-48px -128px}.ui-icon-minusthick{background-position:-64px -128px}.ui-icon-close{background-position:-80px -128px}.ui-icon-closethick{background-position:-96px -128px}.ui-icon-key{background-position:-112px -128px}.ui-icon-lightbulb{background-position:-128px -128px}.ui-icon-scissors{background-position:-144px -128px}.ui-icon-clipboard{background-position:-160px -128px}.ui-icon-copy{background-position:-176px -128px}.ui-icon-contact{background-position:-192px -128px}.ui-icon-image{background-position:-208px -128px}.ui-icon-video{background-position:-224px -128px}.ui-icon-script{background-position:-240px -128px}.ui-icon-alert{background-position:0 -144px}.ui-icon-info{background-position:-16px -144px}.ui-icon-notice{background-position:-32px -144px}.ui-icon-help{background-position:-48px -144px}.ui-icon-check{background-position:-64px -144px}.ui-icon-bullet{background-position:-80px -144px}.ui-icon-radio-on{background-position:-96px -144px}.ui-icon-radio-off{background-position:-112px -144px}.ui-icon-pin-w{background-position:-128px -144px}.ui-icon-pin-s{background-position:-144px -144px}.ui-icon-play{background-position:0 -160px}.ui-icon-pause{background-position:-16px -160px}.ui-icon-seek-next{background-position:-32px -160px}.ui-icon-seek-prev{background-position:-48px -160px}.ui-icon-seek-end{background-position:-64px -160px}.ui-icon-seek-first,.ui-icon-seek-start{background-position:-80px -160px}.ui-icon-stop{background-position:-96px -160px}.ui-icon-eject{background-position:-112px -160px}.ui-icon-volume-off{background-position:-128px -160px}.ui-icon-volume-on{background-position:-144px -160px}.ui-icon-power{background-position:0 -176px}.ui-icon-signal-diag{background-position:-16px -176px}.ui-icon-signal{background-position:-32px -176px}.ui-icon-battery-0{background-position:-48px -176px}.ui-icon-battery-1{background-position:-64px -176px}.ui-icon-battery-2{background-position:-80px -176px}.ui-icon-battery-3{background-position:-96px -176px}.ui-icon-circle-plus{background-position:0 -192px}.ui-icon-circle-minus{background-position:-16px -192px}.ui-icon-circle-close{background-position:-32px -192px}.ui-icon-circle-triangle-e{background-position:-48px -192px}.ui-icon-circle-triangle-s{background-position:-64px -192px}.ui-icon-circle-triangle-w{background-position:-80px -192px}.ui-icon-circle-triangle-n{background-position:-96px -192px}.ui-icon-circle-arrow-e{background-position:-112px -192px}.ui-icon-circle-arrow-s{background-position:-128px -192px}.ui-icon-circle-arrow-w{background-position:-144px -192px}.ui-icon-circle-arrow-n{background-position:-160px -192px}.ui-icon-circle-zoomin{background-position:-176px -192px}.ui-icon-circle-zoomout{background-position:-192px -192px}.ui-icon-circle-check{background-position:-208px -192px}.ui-icon-circlesmall-plus{background-position:0 -208px}.ui-icon-circlesmall-minus{background-position:-16px -208px}.ui-icon-circlesmall-close{background-position:-32px -208px}.ui-icon-squaresmall-plus{background-position:-48px -208px}.ui-icon-squaresmall-minus{background-position:-64px -208px}.ui-icon-squaresmall-close{background-position:-80px -208px}.ui-icon-grip-dotted-vertical{background-position:0 -224px}.ui-icon-grip-dotted-horizontal{background-position:-16px -224px}.ui-icon-grip-solid-vertical{background-position:-32px -224px}.ui-icon-grip-solid-horizontal{background-position:-48px -224px}.ui-icon-gripsmall-diagonal-se{background-position:-64px -224px}.ui-icon-grip-diagonal-se{background-position:-80px -224px}.ui-corner-all,.ui-corner-left,.ui-corner-tl,.ui-corner-top{border-top-left-radius:6px}.ui-corner-all,.ui-corner-right,.ui-corner-top,.ui-corner-tr{border-top-right-radius:6px}.ui-corner-all,.ui-corner-bl,.ui-corner-bottom,.ui-corner-left{border-bottom-left-radius:6px}.ui-corner-all,.ui-corner-bottom,.ui-corner-br,.ui-corner-right{border-bottom-right-radius:6px}.ui-widget-overlay{background:#5c5c5c url(" + n(i(262)) + ") 50% 50% repeat-x;opacity:.8;filter:Alpha(Opacity=80)}.ui-widget-shadow{margin:-7px 0 0 -7px;padding:7px;background:#ccc url(" + n(i(263)) + ") 50% 50% repeat-x;opacity:.6;filter:Alpha(Opacity=60);border-radius:8px}", ""])
    },
    252: function(t, e, i) {
        t.exports = i.p + "a9b68c26c51bea1e65811d2d3746e747.png"
    },
    253: function(t, e, i) {
        t.exports = i.p + "c0cce7f41096d4bd581c1fd9172c49b2.png"
    },
    254: function(t, e, i) {
        t.exports = i.p + "e9bc075ef6abbb6763ac3611440f056a.png"
    },
    255: function(t, e, i) {
        t.exports = i.p + "61af4c328d2994b8780494535484612c.png"
    },
    256: function(t, e, i) {
        t.exports = i.p + "a00ed03018a2acefd8c3367ae41b4630.png"
    },
    257: function(t, e, i) {
        t.exports = i.p + "4ea78f1d56eabfd8b7bfef692a7ff9ea.png"
    },
    258: function(t, e, i) {
        t.exports = i.p + "3c9b7d56ea175359981a51896a8e7da6.png"
    },
    259: function(t, e, i) {
        t.exports = i.p + "e67edc621729a9a09802e42c2b292693.png"
    },
    260: function(t, e, i) {
        t.exports = i.p + "04d68a1a3722368b7123c72731effbfe.png"
    },
    261: function(t, e, i) {
        t.exports = i.p + "628c347671929f83b803f7705635389f.png"
    },
    262: function(t, e, i) {
        t.exports = i.p + "8e1b1a1ff02dae622a2345bd58fa7ea5.png"
    },
    263: function(t, e, i) {
        t.exports = i.p + "6e23430e7d206a52d77201393bf8d2c5.png"
    },
    264: function(t, e, i) {
        var n = i(265);
        "string" == typeof n && (n = [[t.i, n, ""]]);
        var o = {
            transform: void 0
        };
        i(31)(n, o);
        n.locals && (t.exports = n.locals)
    },
    265: function(t, e, i) {
        (t.exports = i(30)(!1)).push([t.i, ".toast{position:fixed;list-style:none;padding:0;top:0;z-index:999999;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;max-width:100%}.toast li{margin:10px 0 0;display:block;background-color:#fcf8e3;color:#c09853;border:1px solid #fbeed5;padding:5px 10px;border-radius:4px;-webkit-border-radius:4px;text-shadow:0 1px 0 hsla(0,0%,100%,.5);box-shadow:0 2px 5px rgba(0,0,0,.15);-webkit-box-shadow:0 2px 5px rgba(0,0,0,.15)}.toast li:first-child{margin-top:0}.toast li.danger{color:#b94a48;background-color:#f2dede;border-color:#eed3d7}.toast li.info{color:#3a87ad}.toast li.info button{margin-top:.5em;margin-bottom:.2em}.toast li.success{color:#468847;background-color:#dff0d8;border-color:#d6e9c6}.toast button.close{background:none;border:none;font-weight:700;font-size:20px;line-height:20px;float:right;padding:0;margin:0 0 0 5px;color:rgba(0,0,0,.25);cursor:pointer}.toast h1,.toast h2,.toast h3,.toast h4{display:inline}", ""])
    },
    288: function(t, e, i) {
        "use strict";
        i.r(e);
        var n, o = i(146), a = i(0), r = i.n(a);
        i(149),
        i(150),
        i(166),
        i(43),
        i(170);
        (n = r.a).fn.idTabs = function() {
            for (var t = {}, e = 0; e < arguments.length; ++e) {
                var i = arguments[e];
                switch (i.constructor) {
                case Object:
                    n.extend(t, i);
                    break;
                case Boolean:
                    t.change = i;
                    break;
                case Number:
                    t.start = i;
                    break;
                case Function:
                    t.click = i;
                    break;
                case String:
                    "." == i.charAt(0) ? t.selected = i : "!" == i.charAt(0) ? t.event = i : t.start = i
                }
            }
            return "function" == typeof t.return && (t.change = t.return),
            this.each(function() {
                n.idTabs(this, t)
            })
        }
        ,
        n.idTabs = function(t, e) {
            var i = n.metadata ? n(t).metadata() : {}
              , o = n.extend({}, n.idTabs.settings, i, e);
            "." == o.selected.charAt(0) && (o.selected = o.selected.substr(1)),
            "!" == o.event.charAt(0) && (o.event = o.event.substr(1)),
            null == o.start && (o.start = -1);
            var a = function() {
                if (n(this).is("." + o.selected))
                    return o.change;
                var e = "#" + this.href.split("#")[1]
                  , i = []
                  , a = [];
                if (n("a", t).each(function() {
                    this.href.match(/#/) && (i.push(this),
                    a.push("#" + this.href.split("#")[1]))
                }),
                o.click && !o.click.apply(this, [e, a, t, o]))
                    return o.change;
                for (var r in i)
                    n(i[r]).removeClass(o.selected);
                for (var r in a)
                    n(a[r]).hide();
                return n(this).addClass(o.selected),
                n(e).show(),
                o.change
            }
              , r = n("a[href*='#']", t).unbind(o.event, a).bind(o.event, a);
            r.each(function() {
                n("#" + this.href.split("#")[1]).hide()
            });
            var c = !1;
            return (c = r.filter("." + o.selected)).length || "number" == typeof o.start && (c = r.eq(o.start)).length || "string" == typeof o.start && (c = r.filter("[href*='#" + o.start + "']")).length,
            c && (c.removeClass(o.selected),
            c.trigger(o.event)),
            o
        }
        ,
        n.idTabs.settings = {
            start: 0,
            change: !1,
            click: null,
            selected: ".selected",
            event: "!click"
        },
        n.idTabs.version = "2.2",
        n(function() {
            n(".idTabs").idTabs()
        });
        var c = i(11)
          , s = i.n(c)
          , u = (i(74),
        i(56),
        i(75),
        i(76),
        i(77),
        i(78),
        i(79),
        i(80),
        i(45),
        i(179),
        i(38),
        i(32),
        i(85),
        i(61))
          , l = 255
          , p = 250
          , d = 240
          , g = 201
          , h = function(t) {
            for (var e = !1, i = [], n = !1, o = 0; o < t.length; o++) {
                var a = String.fromCharCode(t[o]);
                if (t[o] == l) {
                    switch (t[++o]) {
                    case p:
                        var r = t[o + 1]
                          , c = "";
                        for (o += 2; t[o] != l && t[o + 1] != d; )
                            c += String.fromCharCode(t[o]),
                            o++;
                        o += 1,
                        r == g && st.Process.incoming_gmcp(c);
                        break;
                    case 251:
                        switch (t[++o]) {
                        case g:
                            st.connection.send_binary([l, 253, g]),
                            st.connection.send_binary([l, 251, g]),
                            st.Process.outgoing_gmcp("Core.Hello", {
                                client: "GWC",
                                version: "0.5.4"
                            }),
                            st.Process.outgoing_gmcp("Core.Supports.Set", ["Char 1", "Room 1", "Comm 1"]),
                            st.Process.outgoing_gmcp("Core.Token", "");
                            break;
                        case 1:
                            st.connection.send_binary([l, 253, 1]),
                            st.connection.send_binary([l, 252, 1]),
                            st.echo = !1
                        }
                        console.log("Server WILL", t[o]);
                        break;
                    case 252:
                        switch (t[++o]) {
                        case 1:
                            st.connection.send_binary([l, 254, 1]),
                            st.connection.send_binary([l, 251, 1]),
                            st.echo = !0
                        }
                        break;
                    case 253:
                    case 254:
                        console.log("Server", t[o], t[o + 1]),
                        o++;
                        break;
                    case 249:
                        e ? n = !0 : i.length ? i[i.length - 1].prompt = !0 : st.Process.prompt();
                        break;
                    default:
                        console.error("Unknown command:", t[o]),
                        e += String.fromCharCode(t[o])
                    }
                    a = !1
                }
                if (!1 === e && !1 !== a && (e = ""),
                !1 !== a && "\r" != a && "\n" != a && (e += a),
                !1 === e || "\r" != a && "\n" != a && o + 1 != t.length)
                    ;
                else {
                    "\n" == String.fromCharCode(t[o + 1]) && o++;
                    var s = new st.Line(e);
                    i.push(s),
                    n && (s.prompt = !0),
                    n = !1,
                    e = !1
                }
            }
            return i
        };
        i(188),
        i(189),
        i(110);
        var f = i(22)
          , b = {
            available: !1,
            token: void 0,
            character: void 0,
            check_availability: function() {
                void 0 === this.token || void 0 === this.character || this.available || (console.log("Storage information available"),
                this.available = !0,
                r()(this).trigger("available"))
            },
            set_token: function(t) {
                console.log("Storage token " + t),
                this.token = t,
                this.check_availability()
            },
            set_character: function(t) {
                console.log("Storage character name " + t),
                this.character = t,
                this.check_availability()
            },
            request: function(t, e) {
                return r.a.ajax("https://www.genesismud.org/player_file/" + encodeURIComponent(this.character) + "/" + encodeURIComponent(t), r.a.extend({
                    beforeSend: function(t, e) {
                        t.setRequestHeader("GMCP-Token", b.token)
                    }
                }, e))
            },
            clear: function() {
                this.token = void 0,
                this.available = !1,
                this.character = void 0
            }
        };
        r()(document).ready(function() {
            r()(st).on("disconnected", function() {
                b.clear()
            }),
            r()(st).on("incoming_gmcp", function(t, e, i) {
                "core.token" === e ? b.set_token(i) : "char.status" === e && i.name && b.set_character(i.name.toLowerCase())
            })
        });
        i(57),
        i(115);
        var x = {
            data: {},
            json: "",
            loaded: !1,
            save: function() {
                var t = JSON.stringify(this.data, null, "  ");
                t !== self.json && (self.json = t,
                b.request("userdata.json", {
                    type: "POST",
                    contentType: "application/octet-stream",
                    data: t
                }))
            },
            load: function() {
                var t = this;
                b.request("userdata.json", {
                    dataType: "json"
                }).done(function(e) {
                    r.a.extend(!0, t.data, e),
                    t.json = JSON.stringify(e, null, "  "),
                    Object.keys(t.data).length > 0 && st.Output.write_notification("Loaded user data"),
                    t.loaded = !0
                }).fail(function(e, i, n) {
                    404 !== e.status ? (st.Output.write_notification("Failed to load user data"),
                    t.loaded = !1) : t.loaded = !0
                })
            },
            clear: function() {
                this.data = {},
                this.loaded = !1
            }
        };
        r()(document).ready(function() {
            r()(b).on("available", function() {
                x.load()
            }),
            r()(st).on("disconnected", function() {
                x.clear()
            })
        });
        var m = {
            data: {
                character: {
                    statusvars: {},
                    status: {},
                    vitals: {}
                },
                room: {}
            },
            update: function(t, e) {
                switch (t) {
                case "room.info":
                    m.data.room = e;
                    break;
                case "char.statusvars":
                    r.a.extend(m.data.character.statusvars, e);
                    break;
                case "char.status":
                    r.a.extend(m.data.character.status, e);
                    break;
                case "char.vitals":
                    r.a.extend(m.data.character.vitals, e)
                }
            }
        }
          , v = (i(210),
        i(132))
          , w = i.n(v)
          , y = i(133)
          , k = i.n(y);
        function _(t, e) {
            if (!(t instanceof e))
                throw new TypeError("Cannot call a class as a function")
        }
        function C(t, e) {
            for (var i = 0; i < e.length; i++) {
                var n = e[i];
                n.enumerable = n.enumerable || !1,
                n.configurable = !0,
                "value"in n && (n.writable = !0),
                Object.defineProperty(t, n.key, n)
            }
        }
        function S(t, e, i) {
            return e && C(t.prototype, e),
            i && C(t, i),
            t
        }
        var T, z = function() {
            function t(e, i) {
                _(this, t),
                this.targetElement = e,
                this.insertingEntry = !1,
                this.options = r.a.extend(!0, {
                    text: {
                        add: "Add a new entry",
                        empty: "List is empty",
                        disable: "Disable",
                        enable: "Enable",
                        edit: "Edit",
                        save: "Save",
                        cancel: "Cancel"
                    }
                }, i);
                var n = w()(this.options);
                e.html(n);
                var o = e.find(".addentry")
                  , a = this;
                o.on("click", function() {
                    a.insert_new_entry()
                }),
                this.confirm_delete_dialog = r()("<div />", {
                    title: "Please confirm"
                }).dialog({
                    draggable: !1,
                    autoOpen: !1,
                    resizable: !1,
                    modal: !0,
                    buttons: {
                        Delete: function() {
                            a.entry_to_delete.div.remove(),
                            a.current_select_entry === a.entry_to_delete && a.clear_selection(),
                            a.delete_entry(a.entry_to_delete.data),
                            r()(this).dialog("close")
                        },
                        Cancel: function() {
                            r()(this).dialog("close")
                        }
                    }
                })
            }
            return S(t, [{
                key: "entry_count",
                value: function() {
                    return 0
                }
            }, {
                key: "get_entry",
                value: function(t) {}
            }, {
                key: "describe_entry",
                value: function(t) {
                    return "unknown"
                }
            }, {
                key: "is_enabled",
                value: function(t) {
                    return !1
                }
            }, {
                key: "set_enabled",
                value: function(t, e) {}
            }, {
                key: "view_data",
                value: function(t) {
                    return t
                }
            }, {
                key: "edit_data",
                value: function(t) {
                    return t
                }
            }, {
                key: "edit_view_created",
                value: function(t, e) {}
            }, {
                key: "new_entry",
                value: function() {
                    return {}
                }
            }, {
                key: "save",
                value: function(t, e) {
                    return t
                }
            }, {
                key: "update_entry",
                value: function(t) {}
            }, {
                key: "insert_entry",
                value: function(t) {}
            }, {
                key: "delete_entry",
                value: function(t) {}
            }, {
                key: "clear_selection",
                value: function() {
                    this.targetElement.find(".data").empty(),
                    this.current_select_entry = void 0,
                    this.insertingEntry = !1
                }
            }, {
                key: "update",
                value: function() {
                    var t = this;
                    this.clear_selection();
                    var e = this.entry_count();
                    0 === e ? this.targetElement.find(".empty").show() : this.targetElement.find(".empty").hide();
                    var i = this.targetElement.find(".list");
                    i.empty();
                    for (var n = [], o = 0; o < e; o++) {
                        var a = new O(this,this.get_entry(o));
                        n.push(a)
                    }
                    n.sort(function(e, i) {
                        var n = t.describe_entry(e.data).toLowerCase()
                          , o = t.describe_entry(i.data).toLowerCase();
                        return n > o ? 1 : n < o ? -1 : 0
                    }),
                    n.forEach(function(t, e) {
                        var n = t.div;
                        i.append(n)
                    })
                }
            }, {
                key: "edit_entry",
                value: function(t) {
                    var e = this
                      , i = this.targetElement.find(".data");
                    i.empty();
                    var n = this.options.templates.edit;
                    if (void 0 !== n) {
                        i.html(n(this.edit_data(t.data))),
                        this.edit_view_created(t.data, i);
                        var o = r()("<button />", {
                            class: "buttton",
                            text: this.options.text.save
                        });
                        o.appendTo(i),
                        o.on("click", function() {
                            var n = e.save(t.data, i);
                            !1 !== n && (e.insertingEntry ? (e.insertingEntry = !1,
                            e.insert_entry(n)) : e.update_entry(n),
                            e.view_entry(e.current_select_entry),
                            e.current_select_entry.update())
                        });
                        var a = r()("<button />", {
                            class: "buttton",
                            text: this.options.text.cancel
                        });
                        a.appendTo(i),
                        a.on("click", function() {
                            e.insertingEntry ? (e.insertingEntry = !1,
                            e.current_select_entry.div.remove(),
                            e.clear_selection()) : e.view_entry(e.current_select_entry)
                        })
                    }
                }
            }, {
                key: "view_entry",
                value: function(t) {
                    var e = this
                      , i = this.targetElement.find(".data");
                    i.empty();
                    var n = this.options.templates.view;
                    if (void 0 !== n) {
                        i.html(n(this.view_data(t.data)));
                        var o = r()("<button />", {
                            class: "buttton",
                            text: this.is_enabled(t.data) ? this.options.text.disable : this.options.text.enable
                        });
                        o.appendTo(i),
                        o.on("click", function() {
                            e.set_enabled(t.data, !e.is_enabled(t.data)),
                            o.text(e.is_enabled(t.data) ? e.options.text.disable : e.options.text.enable),
                            t.update()
                        });
                        var a = r()("<button />", {
                            class: "buttton",
                            text: this.options.text.edit
                        });
                        a.appendTo(i),
                        a.on("click", function() {
                            e.edit_entry(t)
                        })
                    }
                }
            }, {
                key: "insert_new_entry",
                value: function() {
                    this.insertingEntry = !0;
                    var t = this.targetElement.find(".list")
                      , e = new O(this,this.new_entry());
                    t.append(e.div),
                    this.targetElement.find(".empty").hide(),
                    t.find(".selected").removeClass("selected"),
                    e.div.addClass("selected"),
                    this.edit_entry(e),
                    this.current_select_entry = e
                }
            }, {
                key: "selected_entry",
                value: function(t) {
                    var e = this.targetElement.find(".list");
                    this.current_select_entry != t && (this.insertingEntry && (this.current_select_entry.div.remove(),
                    this.insertingEntry = !1),
                    e.find(".selected").removeClass("selected"),
                    t.div.addClass("selected"),
                    this.view_entry(t),
                    this.current_select_entry = t)
                }
            }, {
                key: "confirm_delete_entry",
                value: function(t) {
                    var e = this.options.templates.remove;
                    this.entry_to_delete = t,
                    this.confirm_delete_dialog.html(e({
                        title: this.describe_entry(t.data)
                    })),
                    this.confirm_delete_dialog.dialog("open")
                }
            }]),
            t
        }(), O = function() {
            function t(e, i) {
                _(this, t),
                this.list = e,
                this.data = i,
                this.div = r()("<div/>"),
                this.title = document.createTextNode("empty entry"),
                this.div.append(this.title);
                var n = this
                  , o = r()("<img />", {
                    src: k.a
                });
                o.appendTo(this.div),
                o.on("click", function(t) {
                    n.list.confirm_delete_entry(n),
                    t.stopPropagation()
                }),
                this.div.on("click", function() {
                    e.selected_entry(n)
                }),
                this.update()
            }
            return S(t, [{
                key: "update",
                value: function() {
                    this.title.data = this.list.describe_entry(this.data),
                    this.list.is_enabled(this.data) ? (this.div.removeClass("disabled"),
                    this.div.addClass("enabled")) : (this.div.removeClass("enabled"),
                    this.div.addClass("disabled"))
                }
            }]),
            t
        }(), E = {
            asi: !0,
            debug: !0,
            esversion: 9
        }, j = i(134), I = i.n(j), A = i(135), P = i.n(A), M = i(136), H = i.n(M);
        function D(t, e) {
            for (var i = 0; i < T.entry_count(); i++) {
                var n = T.get_entry(i);
                if (console.log(n),
                n.name === t)
                    return T.set_enabled(n, e),
                    !0
            }
            return st.Output.write_notification("Could not " + (e ? "enable" : "disable") + " trigger: " + t),
            !1
        }
        window.JSHINT = f.JSHINT,
        r()(document).ready(function() {
            (T = new z(r()("#triggers"),{
                text: {
                    add: "Add new trigger",
                    empty: "You haven't defined any triggers.",
                    enable: "Enable trigger",
                    disable: "Disable trigger"
                },
                templates: {
                    view: I.a,
                    edit: P.a,
                    remove: H.a
                }
            })).entry_count = function() {
                return et.triggers.length
            }
            ,
            T.get_entry = function(t) {
                return et.triggers[t]
            }
            ,
            T.describe_entry = function(t) {
                var e = t.name
                  , i = t.value;
                return e || i
            }
            ,
            T.is_enabled = function(t) {
                return t.enabled
            }
            ,
            T.set_enabled = function(t, e) {
                t.enabled = e,
                et.save()
            }
            ,
            T.edit_data = function(t) {
                var e = r.a.extend(!0, {}, t);
                return e.type = {
                    plain: "plain" === t.type,
                    regexp: "regexp" === t.type,
                    gmcp: "gmcp" === t.type
                },
                e.scripttype = {
                    plain: "plain" === t.script.language,
                    javascript: "javascript" === t.script.language
                },
                e
            }
            ,
            T.edit_view_created = function(t, e) {
                var i = {
                    type: t.type,
                    language: t.script.language,
                    caseInsensitive: t.caseInsensitive
                };
                e.data("model", i);
                var n = function(t) {
                    return "javascript" === t ? "text/javascript" : "text/plain"
                };
                function o() {
                    var t = "You killed";
                    "regexp" === i.type && (t = "^You killed (.*)"),
                    "gmcp" === i.type && (t = "char.vitals"),
                    e.find(".trigger-pattern").prop("placeholder", t)
                }
                e.find("button").addClass("inactive"),
                e.find(".trigger-type [data-type=".concat(i.type, "]")).removeClass("inactive"),
                e.find(".script-type [data-type=".concat(i.language, "]")).removeClass("inactive"),
                i.caseInsensitive || e.find(".case-sensitive").removeClass("inactive"),
                e.find(".radio-buttons button").on("click", function() {
                    r()(this).parent().find("button").addClass("inactive"),
                    r()(this).removeClass("inactive")
                }),
                e.on("click", ".trigger-type button", function(t) {
                    i.type = r()(this).data("type"),
                    o()
                }),
                o(),
                e.on("click", ".script-type button", function(t) {
                    i.language = r()(this).data("type"),
                    c.setOption("mode", n(i.language))
                }),
                e.on("click", ".case-sensitive", function(t) {
                    r()(this).toggleClass("inactive"),
                    i.caseInsensitive = !i.caseInsensitive
                });
                var a = e.find("textarea[name=script]")
                  , c = s.a.fromTextArea(a[0], {
                    theme: "lesser-dark",
                    lineNumbers: !0,
                    lint: E,
                    viewportMargin: 1 / 0,
                    mode: n(t.script.language),
                    gutters: ["CodeMirror-lint-markers"]
                })
            }
            ,
            T.save = function(t, e) {
                var i = e.data("model")
                  , n = e.find(".results");
                n.empty();
                var o = e.find(".CodeMirror")[0].CodeMirror.getValue()
                  , a = t.script.checkSyntax(o, i.language);
                if (!0 !== a) {
                    for (var c = 0; c < Math.min(3, a.length); c++) {
                        var s = r()("<div/>").html(a[c]);
                        n.append(s)
                    }
                    return !1
                }
                return !!e.find(".trigger-pattern").val() && (t.type = i.type,
                t.name = e.find(".trigger-name").val(),
                t.value = e.find(".trigger-pattern").val(),
                t.caseInsensitive = i.caseInsensitive,
                t.script.language = i.language,
                t.script.compile(o),
                t)
            }
            ,
            T.delete_entry = function(t) {
                r.a.each(et.triggers, function(e) {
                    if (et.triggers[e] === t)
                        return et.triggers.splice(e, 1),
                        !1
                }),
                et.save()
            }
            ,
            T.update_entry = function(t) {
                et.save()
            }
            ,
            T.insert_entry = function(t) {
                et.triggers.push(t),
                et.save()
            }
            ,
            T.new_entry = function() {
                return new tt(new K("plain"))
            }
        });
        var N = {
            connection: {
                send: function(t, e) {
                    !0 === e && Z && Z.execute(t) || st.Process.outgoing(t, !1)
                }
            },
            output: {
                color: function(t, e) {
                    var i = r()("#mudoutput .line").last();
                    void 0 !== t && i.css("color", t),
                    void 0 !== e && i.css("background-color", e)
                },
                append: function(t, e, i) {
                    st.Output.write(new st.Line(t)),
                    N.output.color(e, i)
                },
                replace: function(t, e, i) {
                    if (void 0 !== t)
                        if (void 0 !== e) {
                            var n = r()("#mudoutput .line").last()
                              , o = i ? n.html() : n.text();
                            n.html(o.replace(t, e))
                        } else
                            st.Output.write_notification("Missing newvalue for gwc.output.replace");
                    else
                        st.Output.write_notification("Missing searchvalue for gwc.output.replace")
                }
            },
            gmcp: {},
            trigger: {
                enable: function(t) {
                    return D(t, !0)
                },
                disable: function(t) {
                    return D(t, !1)
                }
            }
        };
        r()(document).ready(function() {
            N.userdata = x.data,
            N.gmcp.data = m.data
        });
        i(229),
        i(230),
        i(234);
        function L(t, e) {
            for (var i = 0; i < e.length; i++) {
                var n = e[i];
                n.enumerable = n.enumerable || !1,
                n.configurable = !0,
                "value"in n && (n.writable = !0),
                Object.defineProperty(t, n.key, n)
            }
        }
        function R(t, e) {
            return function(t) {
                if (Array.isArray(t))
                    return t
            }(t) || function(t, e) {
                var i = []
                  , n = !0
                  , o = !1
                  , a = void 0;
                try {
                    for (var r, c = t[Symbol.iterator](); !(n = (r = c.next()).done) && (i.push(r.value),
                    !e || i.length !== e); n = !0)
                        ;
                } catch (t) {
                    o = !0,
                    a = t
                } finally {
                    try {
                        n || null == c.return || c.return()
                    } finally {
                        if (o)
                            throw a
                    }
                }
                return i
            }(t, e) || function() {
                throw new TypeError("Invalid attempt to destructure non-iterable instance")
            }()
        }
        var q = function() {
            try {
                return new Function("return async function bar() { }")().constructor
            } catch (t) {
                return Function
            }
        }()
          , U = []
          , J = 1;
        function V(t) {
            U = U.filter(function(e) {
                return e[0] !== t
            })
        }
        function G(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 600;
            return new Promise(function(i, n) {
                var o = 0
                  , a = 0;
                e > 0 && (o = setTimeout(function() {
                    V(a),
                    n(Error("Timeout waiting for pattern ".concat(t)))
                }, 1e3 * e)),
                a = function(t, e) {
                    return U.push([J, t, e]),
                    J++
                }(t, function(t) {
                    clearTimeout(o),
                    i(t)
                })
            }
            )
        }
        function B() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 60;
            return new Promise(function(e, i) {
                setTimeout(e, 1e3 * t)
            }
            )
        }
        var W = function() {
            function t(e) {
                !function(t, e) {
                    if (!(t instanceof e))
                        throw new TypeError("Cannot call a class as a function")
                }(this, t),
                console.log("Constructor", q);
                try {
                    this.function = q("gwc", "mud", "waitUntil", "wait", "args", e)
                } catch (t) {
                    console.error("Unable to compile script", t)
                }
            }
            var e, i, n;
            return e = t,
            (i = [{
                key: "execute",
                value: function(t) {
                    console.log("Executing Trigger");
                    var e = this.function(N, st, G, B, t);
                    e && Promise.resolve(e).then(function() {
                        console.log("Trigger was executed")
                    }, function(t) {
                        console.error("Trigger resulted in an error: ".concat(t))
                    })
                }
            }]) && L(e.prototype, i),
            n && L(e, n),
            t
        }();
        function F(t, e) {
            if (!(t instanceof e))
                throw new TypeError("Cannot call a class as a function")
        }
        function $(t, e) {
            for (var i = 0; i < e.length; i++) {
                var n = e[i];
                n.enumerable = n.enumerable || !1,
                n.configurable = !0,
                "value"in n && (n.writable = !0),
                Object.defineProperty(t, n.key, n)
            }
        }
        function Y(t, e, i) {
            return e && $(t.prototype, e),
            i && $(t, i),
            t
        }
        r()(document).ready(function() {
            r()(st).on("incoming", function(t, e) {
                !function(t) {
                    U.slice(0).forEach(function(e, i) {
                        var n = R(e, 3)
                          , o = n[0]
                          , a = n[1]
                          , r = n[2]
                          , c = a.exec(t);
                        c && (V(o),
                        r(c))
                    })
                }(e.text)
            })
        });
        var K = function() {
            function t(e) {
                F(this, t),
                this.language = e || "plain"
            }
            return Y(t, [{
                key: "checkSyntax",
                value: function(t, e) {
                    if ("javascript" !== e)
                        return !0;
                    if (Object(f.JSHINT)(t, E))
                        return !0;
                    var i = [];
                    for (var n in f.JSHINT.errors) {
                        var o = f.JSHINT.errors[n];
                        i.push("".concat(o.id, " line ").concat(o.line, ", column ").concat(o.character, ": ").concat(o.reason))
                    }
                    return i
                }
            }, {
                key: "compile",
                value: function(t) {
                    var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1]
                      , i = this.checkSyntax(t, this.language);
                    return "javascript" === this.language ? (e || !0 === i) && (this.data = t,
                    this.user_function = new W(t)) : this.data = t,
                    i
                }
            }, {
                key: "execute",
                value: function(t) {
                    if ("javascript" === this.language && void 0 !== this.user_function)
                        this.user_function.execute(t),
                        x.save();
                    else {
                        var e = this.data.split(/\r?\n/)
                          , i = []
                          , n = [];
                        for (var o in t)
                            /^\d+$/.test(o) && (i.push("$".concat(o)),
                            n.push(t[o]));
                        e.forEach(function(t) {
                            var e = t.replaceArray(i, n).trim();
                            e.length > 0 && N.connection.send(e)
                        })
                    }
                }
            }]),
            t
        }();
        function Q(t) {
            var e, i = t.statistics, n = Date.now();
            e = n - (i.lastUpdate || n),
            i.rate = Math.exp(-e / 1e4) * (i.rate || 1) + (1 - Math.exp(-.1)),
            i.lastUpdate = n,
            i.count = (i.count || 0) + 1,
            i.rate > 100 && (st.Output.write_notification("Trigger ".concat(t.name || t.pattern, " automatically disabled after executing too often. (").concat(i.rate, " #/s).")),
            t.enabled = !1)
        }
        var X = function() {
            function t(e) {
                F(this, t),
                this.script = e,
                this.enabled = !0
            }
            return Y(t, [{
                key: "execute",
                value: function(t) {
                    if (!this.enabled)
                        return !1;
                    if (t !== this.value && t.slice(0, this.value.length + 1) !== "".concat(this.value, " "))
                        return !1;
                    for (var e = {}, i = "", n = t.slice(this.value.length).trim(), o = new RegExp("[^\\s\"']+|\"([^\"]*)\"|'([^']*)'","g"), a = null, r = 0; null !== (a = o.exec(n)); ) {
                        r++;
                        var c = "";
                        c = void 0 !== a[1] ? a[1] : void 0 !== a[2] ? a[2] : a[0],
                        e[r] = c,
                        r > 1 && (i += " "),
                        i += c
                    }
                    return e[0] = t,
                    e["$*"] = i,
                    e["*"] = i,
                    this.script.execute(e),
                    !0
                }
            }]),
            t
        }()
          , Z = {
            aliases: [],
            save: function() {
                var t = JSON.stringify(this.aliases, null, "  ");
                b.request("aliases.json", {
                    type: "POST",
                    contentType: "application/octet-stream",
                    data: t
                })
            },
            load: function() {
                var t = this;
                b.request("aliases.json", {
                    dataType: "json"
                }).done(function(e) {
                    var i = 0;
                    for (var n in t.aliases = [],
                    e) {
                        var o = e[n];
                        if (o.script && o.script.language) {
                            var a = new K(o.script.language)
                              , c = a.compile(o.script.data, !0)
                              , s = new X(a);
                            s.type = o.type,
                            s.value = o.value,
                            s.enabled = void 0 === o.enabled || o.enabled,
                            !0 !== c && (s.enabled = !1),
                            t.aliases.push(s),
                            s.enabled && i++
                        } else
                            st.Output.write_notification("Unable to load alias ".concat(o.value))
                    }
                    t.aliases.length > 0 && st.Output.write_notification("Loaded ".concat(t.aliases.length, " aliases (").concat(i, " enabled)")),
                    r()(Z).trigger("loaded")
                }).fail(function(e, i, n) {
                    console.error("Error loading aliases", e),
                    t.aliases = []
                })
            },
            clear: function() {
                this.aliases = []
            },
            execute: function(t) {
                for (var e in this.aliases) {
                    var i = this.aliases[e];
                    try {
                        if (i.execute(t))
                            return !0
                    } catch (t) {
                        st.Output.write_notification("Error in alias ".concat(t))
                    }
                }
                return !1
            }
        }
          , tt = function() {
            function t(e) {
                F(this, t),
                this.type = "plain",
                this.script = e,
                this.enabled = !0,
                this.statistics = {}
            }
            return Y(t, [{
                key: "received_line",
                value: function(t) {
                    if (!this.enabled)
                        return !1;
                    switch (this.type) {
                    case "plain":
                        var e = this.value;
                        if (this.caseInsensitive && (t = t.toLowerCase(),
                        e = e.toLowerCase()),
                        t.includes(e))
                            return this.script.execute({
                                0: t
                            }),
                            Q(this),
                            !0;
                        break;
                    case "regexp":
                        var i = new RegExp(this.value,this.caseInsensitive ? "i" : "").exec(t);
                        if (i)
                            return i["$*"] = i.input,
                            this.script.execute(i),
                            Q(this),
                            !0
                    }
                    return !1
                }
            }, {
                key: "received_gmcp",
                value: function(t, e) {
                    return !!this.enabled && ("gmcp" === this.type && (this.value === t && (this.script.execute(e),
                    !0)))
                }
            }]),
            t
        }()
          , et = {
            triggers: [],
            save: function() {
                var t = JSON.stringify(this.triggers, null, "  ");
                b.request("triggers.json", {
                    type: "POST",
                    contentType: "application/octet-stream",
                    data: t
                })
            },
            load: function() {
                var t = this;
                b.request("triggers.json", {
                    dataType: "json"
                }).done(function(e) {
                    var i = 0;
                    for (var n in t.triggers = [],
                    e) {
                        var o = e[n];
                        if (o.script && o.script.language) {
                            var a = new K(o.script.language)
                              , c = a.compile(o.script.data, !0)
                              , s = new tt(a);
                            s.type = o.type,
                            s.value = o.value,
                            s.name = o.name,
                            s.enabled = !!c && (void 0 === o.enabled || o.enabled),
                            t.triggers.push(s),
                            s.enabled && i++
                        } else
                            st.Output.write_notification("Unable to load trigger ".concat(o.name))
                    }
                    t.triggers.length > 0 && st.Output.write_notification("Loaded ".concat(t.triggers.length, " triggers (").concat(i, " enabled)")),
                    r()(et).trigger("loaded")
                }).fail(function(e, i, n) {
                    console.error("Error loading triggers", e),
                    t.triggers = []
                })
            },
            clear: function() {
                this.triggers = []
            },
            trigger_line: function(t) {
                var e = t.text;
                for (var i in this.triggers) {
                    var n = this.triggers[i];
                    try {
                        n.received_line(e)
                    } catch (t) {
                        st.Output.write_notification("Error in trigger ".concat(t))
                    }
                }
            },
            trigger_gmcp: function(t, e) {
                for (var i in this.triggers) {
                    var n = this.triggers[i];
                    try {
                        n.received_gmcp(t, e)
                    } catch (t) {
                        st.Output.write_notification("Error in trigger ".concat(t))
                    }
                }
            }
        };
        r()(document).ready(function() {
            r()(b).on("available", function() {
                et.load(),
                Z.load()
            }),
            r()(st).on("disconnected", function() {
                et.clear(),
                Z.clear()
            }),
            r()(st).on("incoming", function(t, e) {
                et.trigger_line(e)
            }),
            r()(st).on("incoming_gmcp", function(t, e, i) {
                et.trigger_gmcp(e, i)
            })
        });
        var it = i(137)
          , nt = i.n(it);
        function ot(t, e) {
            for (var i = 0; i < e.length; i++) {
                var n = e[i];
                n.enumerable = n.enumerable || !1,
                n.configurable = !0,
                "value"in n && (n.writable = !0),
                Object.defineProperty(t, n.key, n)
            }
        }
        var at = function() {
            function t(e) {
                var i = this;
                !function(t, e) {
                    if (!(t instanceof e))
                        throw new TypeError("Cannot call a class as a function")
                }(this, t),
                this.element = e,
                this.lockScrollToBottom = !0,
                this.autoScroll = !1;
                new MutationObserver(function(t) {
                    i.scrollUpdate()
                }
                ).observe(e, {
                    childList: !0
                }),
                e.addEventListener("scroll", function(t) {
                    if (i.autoScroll)
                        i.autoScroll = !1;
                    else {
                        var e = t.target;
                        e.scrollHeight - e.scrollTop - e.clientHeight < e.clientHeight / 3 ? i.lockScrollToBottom = !0 : i.lockScrollToBottom = !1
                    }
                })
            }
            var e, i, n;
            return e = t,
            (i = [{
                key: "scrollUpdate",
                value: function() {
                    this.lockScrollToBottom && this.scrollDown()
                }
            }, {
                key: "scrollDown",
                value: function() {
                    this.autoScroll = !0,
                    this.lockScrollToBottom = !0,
                    this.element.scrollTop = this.element.scrollHeight
                }
            }]) && ot(e.prototype, i),
            n && ot(e, n),
            t
        }()
          , rt = i(138)
          , ct = i.n(rt)
          , st = {
            connect: function() {
                return console.log("Connection is opening"),
                this.connection = new st.Connection("wss://www.genesismud.org/websocket"),
                {}
            },
            disconnect: function() {
                this.connection && this.connection.disconnect()
            },
            is_connected: function() {
                return !!this.connection && this.connection.is_connected()
            },
            isConnecting: function() {
                return !!this.connection && this.connection.isConnecting()
            },
            gmcp: {},
            echo: !0,
            settings: {
                hangingIndent: !0,
                clearInput: !1,
                scrollBack: 3e3,
                commandSeparator: "\n",
                logGmcp: !1
            }
        };
        st.Line = function(t) {
            this.outgoing = !1,
            this.prompt = !1,
            this.notification = !1,
            this.text = t
        }
        ,
        st.Output = {
            container: r()("#mudoutput"),
            lineCount: 0,
            scrollTimer: null,
            escapeHtml: function(t) {
                var e = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                };
                return String(t).replace(/[&<>"']/g, function(t) {
                    return e[t]
                })
            },
            trimScrollback: function() {
                var t = st.Output.container.find(".line")
                  , e = t.length - st.settings.scrollBack;
                if (!(e <= 0)) {
                    for (var i = 0; i < e; i++)
                        t[i].parentNode.removeChild(t[i]);
                    this.lineCount = 0
                }
            },
            updateScroll: function() {},
            write: function(t) {
                t.text = this.escapeHtml(t.text),
                r()(st).trigger("display", t);
                var e = st.Output.container
                  , i = document.createDocumentFragment()
                  , n = document.createElement("div");
                n.className = "line",
                n.innerHTML = t.text,
                st.settings.hangingIndent && n.classList.add("hanging-indent"),
                t.prompt ? n.classList.add("prompt") : this.lineCount += 1,
                t.outgoing && n.classList.add("outgoing"),
                t.notification && n.classList.add("notification"),
                i.appendChild(n),
                t.outgoing && (n = document.createElement("div"),
                i.appendChild(n)),
                e[0].appendChild(i),
                this.lineCount % (st.settings.scrollBack / 10) == 0 && this.trimScrollback()
            },
            prompt: function() {
                r()("#mudoutput .line:last").addClass("prompt")
            },
            write_notification: function(t) {
                var e = new st.Line(t);
                e.notification = !0,
                this.write(e)
            }
        },
        st.InputHistory = {
            history: [],
            offset: 0,
            push: function(t) {
                if (this.offset = 0,
                t.length > 3) {
                    var e = this.history.indexOf(t);
                    -1 !== e && this.history.splice(e, 1),
                    this.history.push(t)
                }
            },
            previous: function() {
                var t = this.history.length;
                return this.offset >= t ? null : (this.offset++,
                this.history[this.history.length - this.offset])
            },
            next: function() {
                return this.offset <= 1 ? null : (this.offset--,
                this.history[this.history.length - this.offset])
            },
            lastAutocomplete: null,
            lastAutocompleteIndex: 0,
            lastAutocomplateResults: [],
            autocomplete: function(t, e) {
                if (this.lastAutocomplete === t)
                    return e && this.lastAutocompleteIndex > 0 && this.lastAutocompleteIndex--,
                    !e && this.lastAutocompleteIndex < this.lastAutocomplateResults.length && this.lastAutocompleteIndex++,
                    this.lastAutocomplateResults[this.lastAutocompleteIndex];
                this.lastAutocomplete = t,
                this.lastAutocomplateResults = [],
                this.lastAutocompleteIndex = 0;
                for (var i = 0, n = this.history.length; i < n; i++)
                    0 === this.history[i].indexOf(t) && this.lastAutocomplateResults.push(this.history[i]);
                return this.lastAutocomplateResults[this.lastAutocompleteIndex]
            }
        },
        st.Process = {
            incoming: function(t) {
                t.length && t.forEach(function(t) {
                    st.Output.write(t),
                    r()(st).trigger("incoming", t)
                })
            },
            outgoing: function(t, e) {
                t = t.trim();
                var i = new st.Line(t);
                i.outgoing = !0,
                st.echo && (!1 !== e && st.InputHistory.push(i.text),
                r()(st).trigger("outgoing", i),
                st.Output.write(i)),
                void 0 !== st.connection && st.connection.send(t)
            },
            incoming_gmcp: function(t) {
                var e = t.indexOf(" ")
                  , i = t.slice(0, e);
                t = JSON.parse(t.slice(e + 1)),
                st.gmcp[i] = r.a.extend(!0, st.gmcp[i] || {}, t),
                !0 === st.settings.logGmcp && console.log("[gmcp] in", i, t),
                r()(st).trigger("incoming_gmcp", [i, t]),
                r()(st).trigger(i, t),
                m.update(i, t)
            },
            outgoing_gmcp: function(t, e) {
                var i = function(t, e) {
                    for (var i = [], n = "".concat(t, " ").concat(JSON.stringify(e)), o = 0, a = n.length; o < a; ++o)
                        i[o] = n.charCodeAt(o);
                    return [].concat([l, p, g], i, [l, d])
                }(t, e);
                st.connection.send_binary(i)
            },
            prompt: function() {
                st.Output.prompt()
            }
        },
        st.Connection = function(t) {
            var e;
            function i(t) {
                var e;
                if ("string" == typeof t.data)
                    e = [new st.Line(t.data)];
                else {
                    var i = new Uint8Array(t.data);
                    e = h(i)
                }
                st.Process.incoming(e)
            }
            this.url = t;
            var n = !1;
            this.connect = function(t) {
                (e = new WebSocket(t)).binaryType = "arraybuffer",
                e.onopen = function(t) {
                    r()(st).trigger("connected", e),
                    st.Output.write_notification("Connection established"),
                    n = !0
                }
                ,
                e.onmessage = i,
                e.onclose = function() {
                    r()(st).trigger("disconnected", e),
                    st.Output.write_notification("Disconnected")
                }
                ,
                e.onerror = function(t) {
                    r()(st).trigger("error", e),
                    st.Output.write_notification("A connection error has occured."),
                    n || st.Output.write_notification("This could bedue to a firewall or proxy setting which is restricting websocket connections.")
                }
            }
            ,
            this.disconnect = function() {
                void 0 !== e && e.close()
            }
            ,
            this.is_connected = function() {
                return 1 === e.readyState
            }
            ,
            this.isConnecting = function() {
                return 0 === e.readyState || 1 === e.readyState
            }
            ,
            this.send = function(t) {
                return !(!e || !this.is_connected()) && (e.send(t + "\n"),
                !0)
            }
            ,
            this.send_binary = function(t) {
                var i = new Uint8Array(t);
                e.send(i.buffer)
            }
            ,
            this.connect(t)
        }
        ,
        r()(document).ready(function() {
            r()(st).on("display", function(t, e) {
                e.text = e.text.replace(/(https?:\/\/[^\s]+)/g, function(t) {
                    return '<a href="' + t + '" target="_blank">' + t + "</a>"
                })
            }),
            r()(st).on("display", function(t, e) {
                e.text = e.text.replace(/&lt;([a-z ]{2,15})&gt;/g, function(t, e) {
                    return '&lt;<span class="exit">' + e + "</span>&gt;"
                })
            }),
            r()(st).on("display", function(t, e) {
                e.text = e.text.replace(/^(There \w+ \w+ obvious exit[s]?:) (.*)\.$/, function(t, e, i) {
                    var n = "";
                    return i.split(/[,]? /).forEach(function(t, e, i) {
                        "and" === t ? n += " and" : (n += ' <span class="exit">' + t + "</span>",
                        e < i.length - 3 && (n += ","))
                    }),
                    e + n + "."
                })
            })
        });
        var ut, lt, pt, dt, gt, ht, ft = {
            27: {
                name: "Escape",
                action: function() {
                    r()("#input").val("")
                }
            },
            97: {
                name: "Numpad 1",
                action: "southwest"
            },
            98: {
                name: "Numpad 2",
                action: "south"
            },
            99: {
                name: "Numpad 3",
                action: "southeast"
            },
            100: {
                name: "Numpad 4",
                action: "west"
            },
            101: {
                name: "Numpad 5",
                action: "look"
            },
            102: {
                name: "Numpad 6",
                action: "east"
            },
            103: {
                name: "Numpad 7",
                action: "northwest"
            },
            104: {
                name: "Numpad 8",
                action: "north"
            },
            105: {
                name: "Numpad 9",
                action: "northeast"
            },
            107: {
                name: "Numpad +",
                action: "down"
            },
            109: {
                name: "Numpad -",
                action: "up"
            },
            38: {
                name: "Up",
                action: function(t) {
                    var e = st.InputHistory.previous();
                    e && (r()("#input").val(e),
                    r()("#input")[0].setSelectionRange(0, e.length)),
                    t.preventDefault()
                }
            },
            40: {
                name: "Down",
                action: function(t) {
                    var e = r()("#input")
                      , i = st.InputHistory.next();
                    i ? (e.val(i),
                    e[0].setSelectionRange(0, i.length)) : e.val(""),
                    t.preventDefault()
                }
            },
            9: {
                name: "Tab",
                action: function(t) {
                    var e = r()("#input")
                      , i = e.val()
                      , n = e.prop("selectionStart");
                    n && (i = i.substr(0, n));
                    var o = i.length;
                    void 0 !== (i = st.InputHistory.autocomplete(i, !0 === t.shiftKey)) && (e.val(i),
                    e[0].setSelectionRange(o, i.length)),
                    t.preventDefault()
                }
            }
        };
        function bt() {
            if (st.is_connected()) {
                var t = r()("#char-size")
                  , e = t.width()
                  , i = t.height()
                  , n = (Math.floor(r()("#mudoutput").width() / e),
                Math.floor(r()("#mudoutput").height() / i));
                st.Process.outgoing_gmcp("core.client", {
                    height: n
                })
            }
        }
        function xt(t, e) {
            for (var i = 0; i < e.length; i++) {
                var n = e[i];
                n.enumerable = n.enumerable || !1,
                n.configurable = !0,
                "value"in n && (n.writable = !0),
                Object.defineProperty(t, n.key, n)
            }
        }
        r()(document).ready(function() {
            r()("#input").focus(),
            st.Output.container = r()("#mudoutput");
            var t, e, i = new at(r()("#mudoutput")[0]), n = new at(r()("#communication")[0]);
            function o() {
                bt(),
                i.scrollUpdate(),
                n.scrollUpdate()
            }
            r()(window).resize(function() {
                clearTimeout(t),
                t = setTimeout(o, 10)
            }),
            u.get("hide_welcome") ? (console.log("Not showing welcome screen"),
            u.set("hide_welcome", !0, {
                expires: 365
            }),
            st.connect()) : r()("<div id='welcome'/>").html(ct()()).dialog({
                appendTo: "#client",
                modal: !0,
                draggable: !1,
                width: "auto",
                close: function(t, e) {
                    u.set("hide_welcome", !0, {
                        expires: 365
                    }),
                    st.connect(),
                    r()("#input").focus()
                },
                buttons: [{
                    text: "Play!",
                    click: function() {
                        r()(this).dialog("close")
                    }
                }]
            }).siblings(".ui-dialog-titlebar").remove(),
            r()("#input").keydown(function(t) {
                var n;
                if ((e = ft[t.which]) && ("function" == typeof e.action ? (n = e.action(t),
                t.preventDefault()) : (n = e.action,
                t.preventDefault()),
                n && (st.Process.outgoing(e.action, !1),
                i.scrollDown())),
                13 === t.which) {
                    if (!0 === t.ctrlKey) {
                        var o = r()("#input").val();
                        r()("#input").val(""),
                        function(t) {
                            for (var e = "", i = 80; --i; )
                                e += "A";
                            r()(nt()({
                                initial: t,
                                push: e
                            })).dialog({
                                appendTo: "#main",
                                modal: !1,
                                height: 500,
                                width: 700,
                                title: "Command Editor",
                                close: function(t, e) {
                                    r()("#input").focus()
                                },
                                buttons: [{
                                    text: "Send",
                                    click: function() {
                                        r()(this).find("textarea").val().split("\n").forEach(function(t) {
                                            (t = t.trim()).length > 0 && st.connection.send(t)
                                        })
                                    }
                                }]
                            })
                        }(o)
                    } else
                        !function() {
                            var t = r()("#input").val();
                            st.echo && !st.settings.clearInput ? r()("#input")[0].setSelectionRange(0, t.length) : r()("#input").val(""),
                            t.split(st.settings.commandSeparator).forEach(function(t) {
                                t = t.trim(),
                                Z && Z.execute(t) ? st.InputHistory.push(t) : st.Process.outgoing(t)
                            })
                        }(),
                        i.scrollDown();
                    t.preventDefault()
                }
            }),
            r()("#client").on("keydown", function(t) {
                t.target === this && !1 === t.ctrlKey && r()("#input").focus()
            }),
            window.onbeforeunload = function() {
                if (st.is_connected())
                    return "If you navigate away you will be disconnected from the game"
            }
            ,
            r()(window).focus(function() {
                r()("#input").focus()
            }),
            r()("#mudoutput").on("click", ".exit", function(t) {
                st.Process.outgoing(r()(this).text()),
                r()("#input").focus()
            }),
            r()("#connect").on("click", function() {
                st.isConnecting() ? st.disconnect() : st.connect()
            }),
            r()(st).on("connected", function() {
                bt(),
                r()("#connect .disconnect").show(),
                r()("#connect .connect").hide()
            }),
            r()(st).on("disconnected", function() {
                r()("#connect .disconnect").hide(),
                r()("#connect .connect").show()
            })
        }),
        ut = window,
        lt = document,
        pt = "script",
        dt = "ga",
        ut.GoogleAnalyticsObject = dt,
        ut.ga = ut.ga || function() {
            for (var t = arguments.length, e = new Array(t), i = 0; i < t; i++)
                e[i] = arguments[i];
            (ut.ga.q = ut.ga.q || []).push(e)
        }
        ,
        ut.ga.l = 1 * new Date,
        gt = lt.createElement(pt),
        ht = lt.getElementsByTagName(pt)[0],
        gt.async = 1,
        gt.src = "https://www.google-analytics.com/analytics.js",
        ht.parentNode.insertBefore(gt, ht),
        window.ga("create", "UA-25561391-2", "genesismud.org"),
        window.ga("send", "pageview"),
        r()(document).ready(function() {
            var t = null;
            r()(st).on("connected", function(e) {
                window.ga("send", "event", "connection", "connect"),
                null !== t && clearInterval(t),
                t = setInterval(function() {
                    window.ga("send", "event", "connection", "keepalive")
                }, 18e5)
            }),
            r()(st).on("disconnected", function(t) {
                window.ga("send", "event", "connection", "disconnect")
            }),
            r()(st).on("error", function(t) {
                window.ga("send", "event", "connection", "error"),
                r.a.ajax("https://www.genesismud.org/websocket?connection-error")
            }),
            r()(st).on("char.created", function(t, e) {
                window.ga("send", "event", "char", "create", e.name)
            }),
            r()(st).on("char.login", function(t, e) {
                window.ga("set", "&uid", e.uid),
                window.ga("send", "event", "connection", "loggedin")
            });
            var e = /^Please enter the name for your new character: /
              , i = /^Character Creation -= Phase ([\d]+): ([\w ]+)=-/;
            r()(st).on("incoming", function(t, n) {
                var o = n.text
                  , a = i.exec(o);
                a && window.ga("send", "event", "char", "creation", a[2], parseInt(a[1], 10)),
                (a = e.exec(o)) && window.ga("send", "event", "char", "creation", "start")
            })
        }),
        String.prototype.replaceArray = function(t, e) {
            for (var i, n = this, o = 0; o < t.length; o++)
                i = new RegExp(RegExp.escape(t[o]),"g"),
                n = n.replace(i, e[o]);
            return n
        }
        ,
        RegExp.escape = function(t) {
            return t.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
        }
        ;
        var mt = function() {
            function t(e, i, n) {
                !function(t, e) {
                    if (!(t instanceof e))
                        throw new TypeError("Cannot call a class as a function")
                }(this, t),
                this.identifier = e,
                this.possibleValues = ["foo"],
                this.inverse = n
            }
            var e, i, n;
            return e = t,
            (i = [{
                key: "update",
                value: function(t) {
                    r()(this.identifier).find(".text").text(t);
                    var e = -1 === this.possibleValues.indexOf(t) ? 0 : 100 * this.possibleValues.indexOf(t) / (this.possibleValues.length - 1);
                    this.inverse && (e = 100 - e),
                    r()(this.identifier).find(".progress").css("width", "".concat(e, "%"))
                }
            }]) && xt(e.prototype, i),
            n && xt(e, n),
            t
        }()
          , vt = {
            health: new mt("#health","health",!1),
            mana: new mt("#mana","mana",!1),
            fatigue: new mt("#fatigue","fatigue",!0)
        };
        r()(st).on("incoming_gmcp", function(t, e, i) {
            "char.vitals" === e && Object.keys(vt).forEach(function(t) {
                i[t] && vt[t].update(i[t])
            }),
            "char.vitals.levels" === e && Object.keys(vt).forEach(function(t) {
                i[t] && (vt[t].possibleValues = i[t])
            })
        }),
        r()(document).ready(function() {
            r()(st).on("connected", function() {
                st.Process.outgoing_gmcp("Char.Vitals.Get", ["health", "fatigue", "mana"])
            })
        }),
        r()(document).ready(function() {
            r()(st).on("incoming_gmcp", function(t, e, i) {
                if ("comm.channel" === e) {
                    var n = r()("<div/>").html(st.Output.escapeHtml(i.message));
                    st.settings.hangingIndent && n.addClass("hanging-indent"),
                    r()("#communication").append(n),
                    st.Output.updateScroll()
                }
            })
        });
        var wt = i(139)
          , yt = i.n(wt)
          , kt = !1
          , _t = {
            mapData: {},
            currentMapFile: "",
            currentMapText: "",
            displayInitialMap: function() {
                r()("#welcome-content").html(yt.a),
                this.displayEmptyMap()
            },
            displayEmptyMap: function() {
                r()("#magicmap").text("There is no map for this area")
            },
            displayAndHighlightMap: function(t, e, i) {
                for (var n = t.split("\n"), o = 0; o < n.length; o++)
                    if (o === i) {
                        for (var a = n[o].split(""), c = 0; c < a.length; c++)
                            a[c] = c === e ? "<font color='red'>X</font>" : st.Output.escapeHtml(a[c]);
                        n[o] = a.join("")
                    } else
                        n[o] = st.Output.escapeHtml(n[o]);
                r()("#magicmap").html(n.join("\n")),
                this.scrollToMarker()
            },
            scrollToMarker: function() {
                var t = r()("#magicmap")
                  , e = r()("#map")
                  , i = t.find("font").position();
                if (void 0 !== i) {
                    var n = i.top + e.scrollTop()
                      , o = i.left + e.scrollLeft()
                      , a = n - e.height() / 2
                      , c = o - e.width() / 2;
                    e.scrollTop(a),
                    e.scrollLeft(c)
                }
            },
            showMap: function(t) {
                var e = st.gmcp["room.map"];
                if (void 0 !== t.x && void 0 !== t.y || void 0 !== t.zoomx || void 0 !== t.zoomy)
                    return e && (e.map || e.zoom) ? void (e.map ? this.displayAndHighlightMap(e.map, t.x, t.y) : e.zoom && this.displayAndHighlightMap(e.zoom, t.zoomx, t.zoomy)) : (console.log("Couldn't determine which map to display", t, e),
                    void this.displayEmptyMap());
                this.displayEmptyMap()
            }
        };
        r()(document).ready(function() {
            _t.displayInitialMap(),
            r()(st).on("incoming_gmcp", function(t, e, i) {
                "room.info" === e && r()("#sidebar").is(":visible") && (_t.showMap(i),
                kt || (kt = !0,
                r()("#welcome-box").hide(),
                r()("#map").show(),
                r()('a[href="#welcome-box"]').removeClass("selected"),
                r()('a[href="#map"]').addClass("selected")))
            })
        });
        var Ct, St = i(140), Tt = i.n(St), zt = i(141), Ot = i.n(zt), Et = i(142), jt = i.n(Et);
        window.JSHINT = f.JSHINT,
        r()(document).ready(function() {
            (Ct = new z(r()("#aliases"),{
                text: {
                    add: "Add new alias",
                    empty: "You haven't defined any aliases.",
                    enable: "Enable alias",
                    disable: "Disable alias"
                },
                templates: {
                    view: Tt.a,
                    edit: Ot.a,
                    remove: jt.a
                }
            })).entry_count = function() {
                return Z.aliases.length
            }
            ,
            Ct.get_entry = function(t) {
                return Z.aliases[t]
            }
            ,
            Ct.describe_entry = function(t) {
                return t.value
            }
            ,
            Ct.is_enabled = function(t) {
                return t.enabled
            }
            ,
            Ct.set_enabled = function(t, e) {
                t.enabled = e,
                Z.save()
            }
            ,
            Ct.edit_data = function(t) {
                var e = r.a.extend(!0, {}, t);
                return e.scripttype = {
                    plain: "plain" === t.script.language,
                    javascript: "javascript" === t.script.language
                },
                e
            }
            ,
            Ct.edit_view_created = function(t, e) {
                var i = {
                    language: t.script.language
                };
                e.data("model", i);
                var n = function(t) {
                    return "javascript" === t ? "text/javascript" : "text/plain"
                };
                e.find("button").addClass("inactive"),
                e.find(".script-type [data-type=" + i.language + "]").removeClass("inactive"),
                e.find(".radio-buttons button").on("click", function() {
                    r()(this).parent().find("button").addClass("inactive"),
                    r()(this).removeClass("inactive")
                }),
                e.on("click", ".script-type button", function(t) {
                    i.language = r()(this).data("type"),
                    a.setOption("mode", n(i.language))
                });
                var o = e.find("textarea[name=script]")
                  , a = s.a.fromTextArea(o[0], {
                    theme: "lesser-dark",
                    lint: {
                        options: E
                    },
                    lineNumbers: !0,
                    viewportMargin: 1 / 0,
                    mode: n(t.script.language),
                    gutters: ["CodeMirror-lint-markers"]
                })
            }
            ,
            Ct.save = function(t, e) {
                var i = e.data("model")
                  , n = e.find(".results");
                n.empty();
                var o = e.find(".CodeMirror")[0].CodeMirror.getValue()
                  , a = t.script.checkSyntax(o, i.language);
                if (!0 !== a) {
                    for (var c = 0; c < Math.min(3, a.length); c++) {
                        var s = r()("<div/>").html(a[c]);
                        n.append(s)
                    }
                    return !1
                }
                return t.value = e.find("input[type=text]").val(),
                t.script.language = i.language,
                t.script.compile(o),
                t
            }
            ,
            Ct.delete_entry = function(t) {
                r.a.each(Z.aliases, function(e) {
                    if (Z.aliases[e] === t)
                        return Z.aliases.splice(e, 1),
                        !1
                }),
                Z.save()
            }
            ,
            Ct.update_entry = function(t) {
                Z.save()
            }
            ,
            Ct.insert_entry = function(t) {
                Z.aliases.push(t),
                Z.save()
            }
            ,
            Ct.new_entry = function() {
                return new X(new K("plain"))
            }
        });
        var It = i(143)
          , At = i.n(It);
        i(243);
        function Pt(t, e) {
            for (var i = 0; i < e.length; i++) {
                var n = e[i];
                n.enumerable = n.enumerable || !1,
                n.configurable = !0,
                "value"in n && (n.writable = !0),
                Object.defineProperty(t, n.key, n)
            }
        }
        var Mt = function() {
            function t() {
                !function(t, e) {
                    if (!(t instanceof e))
                        throw new TypeError("Cannot call a class as a function")
                }(this, t)
            }
            var e, i, n;
            return e = t,
            n = [{
                key: "update",
                value: function() {
                    r()("#general").html(At()({
                        VERSION: "0.5.4"
                    }))
                }
            }],
            (i = null) && Pt(e.prototype, i),
            n && Pt(e, n),
            t
        }()
          , Ht = i(144)
          , Dt = i.n(Ht);
        r()(document).ready(function() {
            var t = r()("<div />").html(Dt()()).dialog({
                autoOpen: !1,
                appendTo: "#client",
                modal: !0,
                draggable: !1,
                width: 500,
                close: function(t, e) {
                    r()("#input").focus()
                },
                buttons: [{
                    text: "Ok",
                    click: function() {
                        r()(this).dialog("close")
                    }
                }]
            });
            t.siblings(".ui-dialog-titlebar").remove(),
            r()("#opensettings").click(function() {
                b.available ? (T.update(),
                Ct.update(),
                Mt.update(),
                r()("#settings").show()) : t.dialog("open")
            }),
            r()("#closesettings").click(function() {
                r()("#settings").hide(),
                r()("#input").focus()
            })
        });
        i(245);
        var Nt = {
            update_status: function() {
                var t = Math.floor((new Date - this.connect_time) / 1e3)
                  , e = Math.floor(t / 3600);
                t %= 3600;
                var i = Math.floor(t / 60);
                t = Math.floor(t % 60);
                var n = e.toString()
                  , o = i.toString()
                  , a = t.toString()
                  , c = "00".substr(n.length) + n + ":" + "00".substr(o.length) + o + ":" + "00".substr(a.length) + a;
                r()("#status").text("Connected to Genesis for " + c)
            },
            start_timer: function() {
                this.connect_time = new Date;
                var t = this;
                this.update_interval = setInterval(function() {
                    t.update_status()
                }, 500)
            },
            stop_timer: function() {
                clearInterval(this.update_interval)
            }
        };
        r()(document).ready(function() {
            r()("#status").text("Connecting ... "),
            r()(st).on("connected", function(t) {
                Nt.start_timer()
            }),
            r()(st).on("disconnected", function(t) {
                Nt.stop_timer(),
                r()("#status").text("Disconnected")
            })
        }),
        r()(document).ready(function() {
            if ("webkitSpeechRecognition"in window) {
                var t, e = !1;
                (t = new webkitSpeechRecognition).lang = "en-US",
                t.continuous = !0,
                t.interimResults = !0,
                t.onstart = function() {
                    e = !0,
                    r()("#voice-input").css("color", "red")
                }
                ,
                t.onend = function() {
                    e = !1,
                    r()("#voice-input").css("color", "#d0d0d0")
                }
                ,
                t.onerror = function() {
                    console.log("error", arguments)
                }
                ,
                t.onresult = function(t) {
                    console.log(arguments);
                    for (var e = "", i = "", n = t.resultIndex; n < t.results.length; ++n)
                        t.results[n].isFinal ? e += t.results[n][0].transcript : i += t.results[n][0].transcript;
                    e && st.Process.outgoing(e),
                    console.log("final", e),
                    console.log("interim", i)
                }
                ,
                r()("#voice-input").on("click", function() {
                    e ? t.stop() : t.start()
                })
            } else
                r()("#voice-input").hide()
        });
        i(247),
        i(250),
        i(264);
        var Lt = i(145)
          , Rt = i.n(Lt)
          , qt = i(89)
          , Ut = i(49);
        if (o.init({
            dsn: "https://ceec3af5677643cb9113615bcb4e4bec@sentry.io/224373",
            release: "0.5.4"
        }),
        window.$ = window.jQuery = r.a,
        "serviceWorker"in navigator)
            Rt.a.register({
                scope: "/play/"
            });
        qt.b.add(Ut.c, Ut.a, Ut.b, Ut.d),
        qt.a.watch()
    }
});
//# sourceMappingURL=app.c1cfe3a86c7dc76a4cf6.min.js.map
