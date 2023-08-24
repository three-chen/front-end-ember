import { patch } from "./vdom/patch";

function mountComponent(vm) {
    vm._update(vm._render());
}

function lifeCycleMixin(Ember) {
    Ember.prototype._update = function (vnode) {
        const vm = this;
        patch(vm.$el, vnode);
    }
}

export {
    lifeCycleMixin, mountComponent
};

