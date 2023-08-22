import { initMixin } from './initMixin';
import { lifeCycleMixin } from './lifeCycle';
import { renderMixin } from './vdom';

function Ember(options) {
    this._init(options);
}

initMixin(Ember);
lifeCycleMixin(Ember);
renderMixin(Ember);

export default Ember;