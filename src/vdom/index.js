import { createCommetVnode, createElement, createTextVnode } from './vnode';

function renderMixin(Ember) {
    Ember.prototype._c = function () {
        return createElement(...arguments);
    }
    Ember.prototype._s = function (value) {
        if (value === undefined || value === null) {
            return;
        }
        return typeof value === 'object' ? JSON.stringify(value) : value;
    }
    Ember.prototype._v = function (text) {
        return createTextVnode(text);
    }

    Ember.prototype._comment = function (text) {
        return createCommetVnode(text);
    }

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
        return vnode;
    }
}

export {
    renderMixin
};

