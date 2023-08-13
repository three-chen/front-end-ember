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
    function parseHtmlToAst(html) {
      let total = 0;
      let text = html;
      let status = "tag_open";
      let match = {
        sel: {},
        attrs: {},
        text: ""
      };
      while (text) {
        switch (status) {
          case "tag_open":
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
            end(match);
            break;
          case "text":
            matchText();
            break;
          case "tag_close":
            status = "tag_open";
            break;
        }
      }
      function matchTagOpen() {
        total++;
        let endTagMatch = text.match(endTag);
        console.log(total, endTagMatch, text);
        if (!endTagMatch) {
          if (text.indexOf('<') === 0) {
            status = "tag_start";
          }
        } else {
          text = undefined;
        }
        if (total > 2) {
          text = undefined;
        }
      }
      function matchTagStart() {
        const startTagMatch = text.match(startTagOpen);
        if (startTagMatch) {
          match.sel = startTagMatch[1];
          advance(startTagMatch[0].length);
          status = "tag_attribute";
        } else {
          advance(text.indexOf('>'));
          status = "tag_end";
        }
      }
      function matchTagAttribute() {
        const attributeMatch = text.match(attribute);
        if (attributeMatch) {
          match.attrs[attributeMatch[1]] = attributeMatch[3] || attributeMatch[4] || attributeMatch[5];
          advance(attributeMatch[0].length);
          status = "tag_attribute";
        } else {
          status = "tag_end";
        }
      }
      function matchTagEnd() {
        const endMatch = text.match(startTagClose);
        advance(endMatch[0].length);
        status = "text";
      }
      function matchText() {
        match.text += text.substring(0, text.indexOf('<'));
        if (match.text) {
          advance(match.text.length);
        }
        status = "tag_open";
      }
      function end(match) {
        console.log("end:", match);
      }

      function advance(length) {
        text = text.substring(length);
      }
    }

    function createRenderFunction(html) {
      parseHtmlToAst(html);
    }

    // import initState from './initState';
    function initMixin(Ember) {
      Ember.prototype._init = function (options) {
        const vm = this;
        vm.$options = options;
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
        // options.render();
      };
    }

    function Ember(options) {
      this._init(options);
    }
    initMixin(Ember);

    return Ember;

}));
//# sourceMappingURL=ember.js.map
