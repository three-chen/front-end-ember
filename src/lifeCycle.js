function mountComponent(vm) {
    vm._update(vm._render());
}

function lifeCycleMixin(Ember) {
    Ember.prototype._update = function (vnode) {
        const vm = this;
    }
}

export {
    lifeCycleMixin, mountComponent
};

