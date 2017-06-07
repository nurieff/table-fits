import DomChange from './dom_change.js';
import Prepare from './prepare.js';
import Create from './create.js';

export default class TableFits {

    static make(el_table, config) {
        return new TableFits(el_table, config);
    }

    /**
     * data-option
     * data-table-fits-group="My group" (thead > tr > td) -- combine columns
     * data-table-fits="no" (table) -- Skip
     * data-table-fits="title" (thead > tr > td) -- For block's headers
     * data-table-fits-width -- Handing change to responsive
     *
     * @param el_table
     * @param config
     */
    constructor(el_table, config) {

        this._config = {
            mainClass: 'table-fits',
            width: null,
            resize: true,
            watch: true
        };

        /**
         * @type {HTMLTableElement}
         * @private
         */
        this._el = typeof el_table === 'string' ? document.querySelector(el_table) : el_table;

        /**
         * @type {Node|HTMLDivElement}
         * @private
         */
        this._parent = this._el.parentNode;
        this._parentCS = getComputedStyle(this._parent);
        this._widthPoint = this._config.width ? this._config.width : null;

        if (!this._el || !this._el.querySelector('thead')) {
            return;
        }

        if ('tableFits' in this._el.dataset) {
            if (this._el.dataset.tableFits === 'no') {
                return;
            }
        }

        this._config = Object.assign({}, this._config, config);

        if ('tableFitsWidth' in this._el.dataset) {
            this._widthPoint = parseInt(this._el.dataset.tableFitsWidth,10);
        }

        if (this._el._tableFits) {
            this._el._tableFits.destroy();
        }

        this._el._tableFits = this;

        /**
         * Статус мобил не мобил
         * @type {boolean}
         * @private
         */
        this._isTableFits = false;
        this._elMinWidth = null;

        /**
         * @type {Number[]}
         * @private
         */
        this._mainTitleIndex = [];

        /**
         * @type {Array}
         * @private
         */
        this._thead = [];

        /**
         * @type {Array}
         * @private
         */
        this._rows = [];

        /**
         * @type {Array}
         * @private
         */
        this._rowsClasses = [];

        /**
         * @type {HTMLDivElement}
         * @private
         */
        this._tableFitsEl = null;

        this._initHadler = this.onResize.bind(this);
        this._reloadHadler = this.onReload.bind(this);

        this._init();
        this._initEvent();
    }

    _initEvent() {
        if (this._config.resize) {
            window.addEventListener('resize', this._initHadler, true);
        }

        if (this._config.watch && this._isTableFits) {
            DomChange.addEvent(this._el, this._reloadHadler);
        }
    }

    _offEvent() {
        if (this._config.resize) {
            window.removeEventListener('resize', this._initHadler, true);
        }

        if (this._config.watch) {
            DomChange.removeEvent(this._el, this._reloadHadler);
        }
    }

    onResize() {
        this._offEvent();

        this._init();
        this._initEvent();
    }

    onReload() {
        this._offEvent();
        this._showTableDefault();
        this.reset();

        this._init();
        this._initEvent();
    }

    reset() {
        this._isTableFits = false;
        this._tableFitsEl = null;
        this._elMinWidth = null;
        this._mainTitleIndex = [];
        this._thead = [];
        this._rows = [];
        this._rowsClasses = [];
    }

    destroy() {
        this._offEvent();
        this._showTableDefault();
        this.reset();
        this._el._tableFits = null;
    }

    _returnChildrenTo(t)
    {
        this._rows.forEach((row) => {
            row.forEach((item) => {
                item.childNodes.forEach((el) => {
                    if (t === 'table') {
                        item.parent.appendChild(el);
                    } else {
                        item.newParent.appendChild(el);
                    }
                })
            })
        });
    }

    _showTableDefault() {
        if (!this._tableFitsEl || !this._isTableFits) return;

        this._isTableFits = false;

        this._returnChildrenTo('table');

        this._el.style.display = 'table';
        this._tableFitsEl.parentNode.removeChild(this._tableFitsEl);
    }

    _isNeedTableFits() {
        let parentW =
            this._parent.clientWidth -
            parseFloat(this._parentCS.getPropertyValue('padding-left')) -
            parseFloat(this._parentCS.getPropertyValue('padding-right'))
        ;

        if (this._widthPoint) {
            return parentW <= this._widthPoint;
        }

        let tableW = this._elMinWidth ? this._elMinWidth : this._el.offsetWidth;

        return parentW < tableW;
    }

    _init() {

        if (!this._isNeedTableFits()) {
            this._showTableDefault();
            return;
        }

        if (this._isTableFits) return;

        this._isTableFits = true;

        if (!this._elMinWidth) this._elMinWidth = this._el.offsetWidth;

        if (!this._tableFitsEl) {
            this._prepareTableFits();
            this._createTableFits();
        } else {
            this._returnChildrenTo('mobile-block');
        }

        this._el.style.display = 'none';

        let parent = this._el.parentNode;
        let next = this._el.nextSibling;
        if (next) {
            parent.insertBefore(this._tableFitsEl, next);
        } else {
            parent.appendChild(this._tableFitsEl);
        }
    }

    _prepareTableFits()
    {
        this._prepare = Prepare.make(this._el);
        this._thead = this._prepare.thead;
        this._mainTitleIndex = this._prepare.mainTitleIndex;
        this._rows = this._prepare.rows;
        this._rowsClasses = this._prepare.rowsClasses;
    }

    _createTableFits() {
        this._tableFitsEl = document.createElement('div');
        this._tableFitsEl.classList.add(this._config.mainClass);

        Create.make(this._tableFitsEl)
            .setMainClass(this._config.mainClass)
            .setPrepare(this._prepare)
            .create();
    }

}