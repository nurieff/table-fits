export default class App_DragBlock {

    static make(el,cfg) {
        return new App_DragBlock(el,cfg);
    }

    constructor(el,cfg) {

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
    }

    _init() {
        let p = this._elCS.position;

        if (['fixed', 'relative', 'absolution'].indexOf(p) === -1) {
            this._el.style.position = 'relative';
        }

        this._createHand();

        this._el.appendChild(this._container);
    }

    _createHand() {
        this._container = document.createElement('div');
        this._container.classList.add('drag-block');

        this._hand = document.createElement('div');
        this._hand.classList.add('drag-block__hand');
        this._container.appendChild(this._hand);

        this._hand.onmousedown = this._handDown.bind(this);
    }

    _handDown(e) {
        let width = parseInt(getComputedStyle(this._el).width,10);

        let x1 = e.pageX;

        document.body.onmousemove = (e) => {
            let w = width - (x1 - e.pageX);

            if (w < 0.1 * this._maxWidth) w = Math.round(this._maxWidth * 0.1);
            if (w > this._maxWidth) w = this._maxWidth;

            this._el.style.width = w + 'px';

            if (this._config.callback) {
                this._config.callback();
            }
        };

        document.body.onmouseup = () => {
            document.body.onmouseup = document.body.onmousemove = null;
        };
    }

}