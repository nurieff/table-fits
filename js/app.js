var App = (function () {
    'use strict';

    var App_DragBlock = function App_DragBlock(el,cfg) {

        this._config = {
            callback: null
        };

        this._config = Object.assign({},this._config, cfg);

        /**
         * @type {HTMLDivElement}
         * @private
         */
        this._el = typeof el === 'string' ? document.querySelector(el) : el;

        this._maxWidth = parseInt(getComputedStyle(this._el).width,10);

        /**
         * @type {CSSStyleDeclaration}
         * @private
         */
        this._elCS = getComputedStyle(this._el);

        /**
         * @type {HTMLDivElement}
         * @private
         */
        this._container = null;

        /**
         * @type {HTMLDivElement}
         * @private
         */
        this._hand = null;

        this._init();
    };

    App_DragBlock.make = function make (el,cfg) {
        return new App_DragBlock(el,cfg);
    };

    App_DragBlock.prototype._init = function _init () {
        var p = this._elCS.position;

        if (['fixed', 'relative', 'absolution'].indexOf(p) === -1) {
            this._el.style.position = 'relative';
        }

        this._createHand();

        this._el.appendChild(this._container);
    };

    App_DragBlock.prototype._createHand = function _createHand () {
        this._container = document.createElement('div');
        this._container.classList.add('drag-block');

        this._hand = document.createElement('div');
        this._hand.classList.add('drag-block__hand');
        this._container.appendChild(this._hand);

        this._hand.onmousedown = this._handDown.bind(this);
    };

    App_DragBlock.prototype._handDown = function _handDown (e) {
            var this$1 = this;

        var width = parseInt(getComputedStyle(this._el).width,10);

        var x1 = e.pageX;

        document.body.classList.add('noselect');
        document.body.onmousemove = function (e) {
            var w = width - (x1 - e.pageX);

            if (w < 0.1 * this$1._maxWidth) { w = Math.round(this$1._maxWidth * 0.1); }

            if (w > this$1._maxWidth) { w = this$1._maxWidth; }

            this$1._el.style.width = w + 'px';

            if (this$1._config.callback) {
                this$1._config.callback();
            }
        };

        document.body.onmouseup = function () {
            document.body.classList.remove('noselect');
            document.body.onmouseup = document.body.onmousemove = null;
        };
    };

    var App = function App () {};

    App.DragBlock = App_DragBlock;

    return App;

}());
//# sourceMappingURL=app.js.map
