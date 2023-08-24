(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Ember = factory());
})(this, (function () { 'use strict';

    // Regular Expressions for parsing tags and attributes
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //标签名
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
    const startTagOpen = new RegExp(`^<${qnameCapture}`);
    const startTagClose = /^\s*(\/?)>/;
    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
    const commentTag = /^<!\--/;
    function parseHtmlToAst(html) {
      let text = html;
      let status = "tag_open";
      let ast = {};
      let astStack = [];
      let currentMatch = null;
      let brotherTag = ["img", "br", "hr", "input", "link", "meta", "param", "source", "track", "comment"];
      let nextType = "";
      while (text) {
        switch (status) {
          case "tag_open":
            currentMatch = createAstElement("", {}, "", 0, [], null);
            matchTagOpen();
            break;
          case "tag_start":
            matchTagStart();
            break;
          case "tag_attribute":
            matchTagAttribute();
            break;
          case "tag_end":
            matchTagEnd();
            break;
          case "tag_children":
            matchTagChildren();
            break;
          case "tag_brother":
            matchTagBrother();
            break;
          case "tag_father":
            matchTagFather();
            break;
          case "text":
            matchText();
            break;
          case "tag_close":
            status = "tag_father";
            break;
        }
      }
      return ast;
      function matchTagOpen() {
        let endTagMatch = text.match(endTag);
        if (!endTagMatch) {
          if (text.indexOf('<') === 0) {
            status = "tag_start";
          } else {
            status = "text";
          }
        } else {
          advance(endTagMatch[0].length);
          status = "tag_close";
        }
      }
      function matchTagStart() {
        const startTagMatch = text.match(startTagOpen);
        // normal tag
        if (startTagMatch) {
          currentMatch.sel = startTagMatch[1];
          currentMatch.type = 1;
          advance(startTagMatch[0].length);
          status = "tag_attribute";
        }
        //abnomal tag such as annotation
        else {
          const commentTagMatch = text.match(commentTag);
          if (commentTagMatch) {
            currentMatch.sel = "comment";
            currentMatch.type = 8;
            currentMatch.text = text.substring(0, text.indexOf('-->'));
            advance(currentMatch.text.length + 2);
            currentMatch.text += '-->';
          }
          status = "tag_end";
        }
      }
      function matchTagAttribute() {
        const attributeMatch = text.match(attribute);
        if (attributeMatch) {
          currentMatch.attrs[attributeMatch[1]] = attributeMatch[3] || attributeMatch[4] || attributeMatch[5] || '';
          advance(attributeMatch[0].length);
          status = "tag_attribute";
        } else {
          status = "tag_end";
        }
      }
      function matchTagEnd() {
        const endMatch = text.match(startTagClose);
        if (brotherTag.includes(currentMatch.sel)) {
          status = "tag_brother";
        } else {
          status = "tag_children";
        }
        advance(endMatch[0].length);
      }
      function matchText() {
        let tempText = text.substring(0, text.indexOf('<'));
        if (tempText) {
          advance(tempText.length);
          currentMatch.type = 3;
          tempText = tempText.trim();
          if (!tempText) {
            status = "tag_open";
            return;
          }
          // let temp = tempText.match(templateText);
          // if (temp) {
          //     currentMatch["token"] = temp[1];
          // }
          currentMatch.text = tempText;
        }
        status = "tag_brother";
      }
      function matchTagChildren() {
        pushMatch(currentMatch, "children");
        status = "tag_open";
      }
      function matchTagBrother() {
        pushMatch(currentMatch, "brother");
        status = "tag_open";
      }
      function matchTagFather() {
        pushMatch(currentMatch, "father");
        status = "tag_open";
      }
      function createAstElement(sel, attrs, text, type, children, parent) {
        return {
          sel,
          attrs,
          text,
          type,
          children,
          parent
        };
      }
      function pushMatch(match, type) {
        let lastType;
        if (type === "father") {
          lastType = nextType;
          nextType = "father";
        }
        if (astStack.length > 0) {
          if (nextType === "children") {
            astStack[astStack.length - 1].children.push(match);
            match.parent = astStack[astStack.length - 1];
            astStack.push(match);
          } else if (nextType === "brother") {
            astStack.pop();
            astStack[astStack.length - 1].children.push(match);
            match.parent = astStack[astStack.length - 1];
            astStack.push(match);
          } else if (nextType === "father") {
            if (astStack[astStack.length - 1].children.length !== 0 || lastType !== "children") {
              astStack.pop();
            }
            type = "brother";
          }
        } else {
          ast = match;
          astStack.push(match);
        }
        nextType = type;
      }
      function advance(length) {
        text = text.substring(length);
      }
    }

    /*
    _c('div',
        {id:"app",style:{"color":"red","font-size":1rem}},
        _v("hello,"+_s(name)+"welcom"),
        _c('span',{class:"text"},_v(_s(age))),
        _c('p',undefined,_v("welcom"))
    )

    */

    const doubleBrace = /\{\{((?:.|\r?\n)+?)\}\}/g;
    function generateChild(node) {
      if (node.type === 1) {
        return generate(node);
      } else if (node.type === 3) {
        let text = node.text;
        if (!doubleBrace.test(text)) {
          return `_v(${JSON.stringify(text)})`;
        } else {
          let match;
          let code = [];
          let index = 0;
          let lastIndex = doubleBrace.lastIndex = 0;
          while (match = doubleBrace.exec(text)) {
            index = match.index;
            if (index > lastIndex) {
              code.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            code.push(`_s(${match[1].trim()})`);
            lastIndex = doubleBrace.lastIndex;
          }
          if (lastIndex < text.length) {
            code.push(JSON.stringify(text.slice(lastIndex)));
          }
          return `_v(${code.join('+')})`;
        }
      } else if (node.type === 8) {
        return `_v(${JSON.stringify(node.text)})`;
      }
    }
    function getChildren(ast) {
      let children = ast.children;
      if (children) {
        return children.map(c => {
          return generateChild(c);
        }).join(',');
      }
    }
    function formatAttrs(attrs) {
      let attrStr = "";
      for (const key in attrs) {
        if (Object.hasOwnProperty.call(attrs, key)) {
          let value = attrs[key];
          if (key === "style") {
            let style = {};
            let styleArray = value.split(';');
            styleArray.forEach(el => {
              let [key, value] = el.split(':');
              style[key] = value;
            });
            value = style;
          }
          attrStr += `${key}:${JSON.stringify(value)},`;
        }
      }
      attrStr = attrStr.substring(0, attrStr.length - 1);
      return attrStr;
    }
    function generate(ast) {
      let children = getChildren(ast);
      let code = `_c('${ast.sel}',${Object.keys(ast.attrs).length > 0 ? `{${formatAttrs(ast.attrs)}}` : 'undefined'}${children.length > 0 ? `,${children}` : ''})`;
      return code;
    }

    function createRenderFunction(html) {
      const ast = parseHtmlToAst(html);
      const code = generate(ast);
      return new Function(`with(this){return ${code}}`);
    }

    function mountComponent(vm) {
      vm._update(vm._render());
    }
    function lifeCycleMixin(Ember) {
      Ember.prototype._update = function (vnode) {
      };
    }

    // import initState from './initState';
    function initMixin(Ember) {
      Ember.prototype._init = function (options) {
        const vm = this;
        vm.$options = options;
        vm.$data = options.data;
        for (let key in vm.$data) {
          if (vm.$data.hasOwnProperty(key)) {
            Object.defineProperty(vm, key, {
              get: function () {
                return vm.$data[key];
              },
              set: function (value) {
                vm.$data[key] = value;
              }
            });
          }
        }
        // initState(vm);
        // initRender(vm);
        if (vm.$options.el) {
          vm.$mount(vm.$options.el);
        }
      };
      Ember.prototype.$mount = function (el) {
        const vm = this,
          options = vm.$options;
        vm.$el = document.querySelector(el);
        if (!options.render) {
          options.render = createRenderFunction(vm.$el.outerHTML);
        }
        mountComponent(vm);
      };
    }

    function createElement(tag, attrs = {}, ...children) {
      return vnode(tag, attrs, children);
    }
    function createTextVnode(text) {
      return vnode(undefined, undefined, undefined, text);
    }
    function vnode(tag, props, children, text) {
      return {
        tag,
        props,
        children,
        text
      };
    }

    function renderMixin(Ember) {
      Ember.prototype._c = function () {
        return createElement(...arguments);
      };
      Ember.prototype._s = function (value) {
        if (value === undefined || value === null) {
          return;
        }
        return typeof value === 'object' ? JSON.stringify(value) : value;
      };
      Ember.prototype._v = function (text) {
        return createTextVnode(text);
      };
      Ember.prototype._render = function () {
        const vm = this;
        const render = vm.$options.render;
        // const proxyInstance = new Proxy(vm, {
        //     get(target, key) {
        //         if (key in target) {
        //             return target[key];
        //         } else if (key in target.$options.data) {
        //             return target.$options.data[key];
        //         }
        //         return undefined;
        //     },
        // });

        const vnode = render.call(vm);
        console.log(vnode);
        return vnode;
      };
    }

    function Ember(options) {
      this._init(options);
    }
    initMixin(Ember);
    lifeCycleMixin(Ember);
    renderMixin(Ember);

    return Ember;

}));
//# sourceMappingURL=ember.js.map
