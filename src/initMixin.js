// import initState from './initState';
import { createRenderFunction } from './compiler';
import { mountComponent } from './lifeCycle';

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

