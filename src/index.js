import { initMixin } from './initMixin';

function Ember(options) {
    this._init(options);
}

initMixin(Ember);

export default Ember;