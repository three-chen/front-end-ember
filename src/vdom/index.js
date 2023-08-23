import { createElement, createTextVnode } from './vnode';

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

    Ember.prototype._render = function () {
        const vm = this;
        const render = vm.$options.render;
        const vnode = render(vm._c, vm._s, vm._v, vm.$options.data.message);
        console.log(vnode);
        return vnode;
    }
}

export {
    renderMixin
};

