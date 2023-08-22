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
    Ember.prototype._v = function () {
        return createTextVnode(text);
    }

    Ember.prototype._render = function () {
        const vm = this;
        const render = vm.$options.render;
        const vnode = render.call(vm);
        console.log(vnode);
        return vnode;
    }
}

export {
    renderMixin
};

