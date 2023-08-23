// import initState from './initState';
import { createRenderFunction } from './compiler';
import { mountComponent } from './lifeCycle';

function initMixin(Ember) {
    Ember.prototype._init = function (options) {
        const vm = this;
        vm.$options = options;
        // initState(vm);
        // initRender(vm);
        if (vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    }

    Ember.prototype.$mount = function (el) {
        const vm = this, options = vm.$options;
        vm.$el = document.querySelector(el);
        if (!options.render) {
            options.render = createRenderFunction(vm.$el.outerHTML);
        }

        mountComponent(vm);
    }
}

export {
    initMixin
};

