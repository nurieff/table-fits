import DomChange from './dom_change.js';
import Prepare from './prepare.js';
import Create from './create.js';

export default class TableFits {

    static make(el_table, config) {
        return new TableFits(el_table, config);
    }

    /**
     * Также работают датасеты
     * data-table-fits-group="Тестхуест" для TH -- Ручное объединение колонок
     * data-table-fits="no" для TABLE -- Не использовать скрипт
     * data-table-fits="title" для TH -- Для заголовка, можно у нескольних проставлять
     *
     * @param el_table
     * @param config
     */
    constructor(el_table, config) {

        this._config = {
            mainClass: 'table-fits',
            resize: true,
            watch: true
        };

        /**
         * @type {HTMLTableElement}
         * @private
         */
        this._el = typeof el_table === 'string' ? document.querySelector(el_table) : el_table;

        if (!this._el || !this._el.querySelector('thead')) {
            return;
        }

        if ('tableFits' in this._el.dataset) {
            if (this._el.dataset.tableFits === 'no') {
                return;
            }
        }

        this._config = Object.assign({}, this._config, config);

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

        if (this._config.watch) {
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

    _returnChildrenToTable() {
        this._rows.forEach((row) => {
            row.forEach((item) => {
                item.childNodes.forEach((el) => {
                    item.parent.appendChild(el);
                })
            })
        });
    }

    _returnChildrenToMobileBlock() {
        this._rows.forEach((row) => {
            row.forEach((item) => {
                item.childNodes.forEach((el) => {
                    item.newParent.appendChild(el);
                })
            })
        });
    }

    _showTableDefault() {
        if (!this._tableFitsEl || !this._isTableFits) return;

        this._isTableFits = false;

        this._returnChildrenToTable();

        this._el.style.display = 'table';
        this._tableFitsEl.parentNode.removeChild(this._tableFitsEl);
    }

    _isNeedTableFits() {

        if (this._elMinWidth) {
            if (this._el.parentNode.offsetWidth >= this._elMinWidth) {
                return false;
            }
        } else if (this._el.parentNode.offsetWidth >= this._el.offsetWidth) {
            return false;
        }

        return true;
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
            this._returnChildrenToMobileBlock();
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

        // Перебеираем строки
        this._rows.forEach((row, rowIndex) => {
            let tr = document.createElement('div');
            tr.classList.add(this._config.mainClass + '__tr');
            this._tableFitsEl.appendChild(tr);

            if (this._rowsClasses[rowIndex]) {
                // Переносим класса
                this._rowsClasses[rowIndex].forEach((class_name) => {
                    tr.classList.add(class_name);
                });
            }

            /**
             * Заголовок
             * @type {HTMLDivElement} h
             */
            let h = document.createElement('div');
            h.classList.add(this._config.mainClass + '__head');
            this._mainTitleIndex.forEach((i) => {
                let el = document.createElement('div');
                el.classList.add(this._config.mainClass + '__head__item');

                let isHasForm = false;
                row[i].childNodes.forEach((node) => {
                    if (node instanceof HTMLInputElement) {
                        isHasForm = true;
                    } else if (node instanceof HTMLSelectElement) {
                        isHasForm = true;
                    }
                });

                if (isHasForm) {
                    let th = document.createElement('div');
                    th.classList.add(this._config.mainClass + '__th');
                    th.appendChild(document.createTextNode(this._thead[i]));

                    let td = document.createElement('div');
                    td.classList.add(this._config.mainClass + '__td');

                    row[i].childNodes.forEach((node) => {
                        td.appendChild(node);
                    });
                    row[i].newParent = td;


                    el.appendChild(th);
                    el.appendChild(td);
                } else {
                    row[i].childNodes.forEach((node) => {
                        el.appendChild(node);
                    });
                    row[i].newParent = el;
                }

                h.appendChild(el);
            });
            tr.appendChild(h);

            /**
             * Тело
             * @type {HTMLDivElement}
             */
            let b = document.createElement('div');
            b.classList.add(this._config.mainClass + '__body');
            tr.appendChild(b);

            this._createRowData(b, row);

        });
    }

    /**
     * @param {HTMLDivElement} block_body
     * @param {Object} row
     * @private
     */
    _createRowData(block_body, row) {
        let i = 0;
        Object.keys(this._thead)
            .forEach((index) => {

                let thead_th = this._thead[index];

                let item = document.createElement('div');
                item.classList.add(this._config.mainClass + '__item');

                if (typeof thead_th !== 'string') {
                    // Столбцы
                    let columns__title = document.createElement('div');
                    columns__title.classList.add(this._config.mainClass + '__columns_title');
                    columns__title.appendChild(document.createTextNode(thead_th.title));

                    let columns = document.createElement('div');
                    columns.classList.add(this._config.mainClass + '__columns');

                    thead_th.columns.forEach((title) => {

                        if (this._mainTitleIndex.indexOf(i) !== -1) {
                            ++i;
                            return;
                        }

                        let c = document.createElement('div');
                        c.classList.add(this._config.mainClass + '__columns__col');

                        let th = document.createElement('div');
                        th.classList.add(this._config.mainClass + '__th');
                        th.appendChild(document.createTextNode(title));

                        let td = document.createElement('div');
                        td.classList.add(this._config.mainClass + '__td');
                        row[i].childNodes.forEach((node) => {
                            td.appendChild(node);
                        });
                        row[i].newParent = td;

                        c.appendChild(th);
                        c.appendChild(td);
                        columns.appendChild(c);

                        ++i;
                    });

                    item.appendChild(columns__title);
                    item.appendChild(columns);
                } else {
                    // Просто
                    if (this._mainTitleIndex.indexOf(i) !== -1) {
                        ++i;
                        return;
                    }

                    let th = document.createElement('div');
                    th.classList.add(this._config.mainClass + '__th');
                    th.appendChild(document.createTextNode(thead_th));

                    let td = document.createElement('div');
                    td.classList.add(this._config.mainClass + '__td');

                    row[i].childNodes.forEach((node) => {
                        td.appendChild(node);
                    });
                    row[i].newParent = td;

                    item.appendChild(th);
                    item.appendChild(td);

                    ++i;
                }

                block_body.appendChild(item);
            });
    }
}