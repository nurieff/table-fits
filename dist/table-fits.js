var TableFits = (function () {
'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var eventListenerSupported = window.addEventListener;

var TableFits_Prepare_DomChange = function () {
    function TableFits_Prepare_DomChange() {
        classCallCheck(this, TableFits_Prepare_DomChange);
    }

    createClass(TableFits_Prepare_DomChange, null, [{
        key: 'addEvent',
        value: function addEvent(obj, callback) {
            if (MutationObserver) {
                // define a new observer
                var obs = new MutationObserver(function (mutations, observer) {
                    if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) callback();
                });

                obs.observe(obj, { childList: true, subtree: true });

                if (!(obj in TableFits_Prepare_DomChange._storage)) {
                    TableFits_Prepare_DomChange._storage[obj] = {};
                }

                TableFits_Prepare_DomChange._storage[obj][callback] = obs;
            } else if (eventListenerSupported) {
                obj.addEventListener('DOMSubtreeModified', callback, false);
                obj.addEventListener('DOMNodeInserted', callback, false);
                obj.addEventListener('DOMNodeRemoved', callback, false);
            }
        }
    }, {
        key: 'removeEvent',
        value: function removeEvent(obj, callback) {
            if (MutationObserver) {
                if (!(obj in TableFits_Prepare_DomChange._storage)) {
                    return;
                }

                if (!(callback in TableFits_Prepare_DomChange._storage[obj])) {
                    return;
                }

                TableFits_Prepare_DomChange._storage[obj][callback].disconnect();

                delete TableFits_Prepare_DomChange._storage[obj][callback];
            } else if (eventListenerSupported) {
                obj.removeEventListener('DOMSubtreeModified', callback, false);
                obj.removeEventListener('DOMNodeInserted', callback, false);
                obj.removeEventListener('DOMNodeRemoved', callback, false);
            }
        }
    }]);
    return TableFits_Prepare_DomChange;
}();

TableFits_Prepare_DomChange._storage = {};

var TableFits_Prepare = function () {
    createClass(TableFits_Prepare, null, [{
        key: 'make',


        /**
         * @param {HTMLTableElement} table
         * @returns {TableFits_Prepare}
         */
        value: function make(table) {
            return new TableFits_Prepare(table);
        }

        /**
         * @param {HTMLTableElement} table
         */

    }]);

    function TableFits_Prepare(table) {
        classCallCheck(this, TableFits_Prepare);

        /**
         * @type {HTMLTableElement}
         * @private
         */
        this._table = table;

        this._groups = {};
        this._namingGroupIndex = {};
        this._nextGroupIndex = 0;

        this.thead = [];
        this.mainTitleIndex = [];
        this.rowsClasses = [];
        this.rows = [];

        this._prepare();
    }

    createClass(TableFits_Prepare, [{
        key: '_prepare',
        value: function _prepare() {
            var _this = this;

            var thead_trs = this._table.querySelectorAll('thead tr');
            [].forEach.call(thead_trs, function (el) {
                _this._nextGroupIndex = 0;
                [].forEach.call(el.querySelectorAll('th'), _this._prepareTH.bind(_this));
            });

            if (this.mainTitleIndex.length === 0) {
                this.mainTitleIndex = [0];
            }

            this._prepareRows();
        }
    }, {
        key: '_prepareRows',
        value: function _prepareRows() {
            var _this2 = this;

            var trs = this._table.querySelectorAll('tr');
            var i = 0;
            [].forEach.call(trs, function (tr) {

                var tds = tr.querySelectorAll('td');

                if (tds.length < 1) return;

                if (tr.classList.length > 0) {
                    _this2.rowsClasses[i] = Array.prototype.slice.call(tr.classList);
                }

                var row = [];

                [].forEach.call(tds, function (td) {
                    row.push({
                        parent: td,
                        childNodes: Array.prototype.slice.call(td.childNodes)
                    });
                });

                _this2.rows.push(row);
                ++i;
            });
        }

        /**
         * @param {HTMLTableCellElement} th
         * @param {Number} index
         * @private
         */

    }, {
        key: '_prepareTH',
        value: function _prepareTH(th, index) {
            if (th.colSpan && th.colSpan > 1) {
                this._prepareTHColspan(th, index);
                return;
            }

            if ('tableFitsGroup' in th.dataset) {
                this._prepareTHGroup(th, index);
                return;
            }

            if (!th.rowSpan || th.rowSpan <= 1) {
                this._nextGroupIndex += 1;
            }

            if (this._groups[index]) {
                // Должны быть в группе
                this.thead[this._groups[index]].columns.push(th.innerText);

                if ('tableFits' in th.dataset) {
                    if (th.dataset.tableFits === 'title') {
                        this.mainTitleIndex.push(this._groups[index].index + index);
                    }
                }

                return;
            }

            this.thead[index] = th.innerText;

            if ('tableFits' in th.dataset) {
                if (th.dataset.tableFits === 'title') {
                    this.mainTitleIndex.push(index);
                }
            }
        }

        /**
         * @param {HTMLTableCellElement} th
         * @param {Number} index
         * @private
         */

    }, {
        key: '_prepareTHColspan',
        value: function _prepareTHColspan(th, index) {
            for (var i = 0; i < th.colSpan; ++i) {
                this._groups[this._nextGroupIndex] = index;
                ++this._nextGroupIndex;
            }

            this.thead[index] = {
                index: index,
                title: th.innerText,
                columns: []
            };
        }

        /**
         * @param {HTMLTableCellElement} th
         * @param {Number} index
         * @private
         */

    }, {
        key: '_prepareTHGroup',
        value: function _prepareTHGroup(th, index) {
            var groupIndex = th.dataset.tableFitsGroup;

            if (!(groupIndex in this._namingGroupIndex)) {
                this._namingGroupIndex[groupIndex] = index;
            }

            if (!(this._namingGroupIndex[groupIndex] in this.thead)) {
                this.thead[this._namingGroupIndex[groupIndex]] = {
                    index: this._namingGroupIndex[groupIndex],
                    title: groupIndex,
                    columns: []
                };
            }
            this.thead[this._namingGroupIndex[groupIndex]].columns.push(th.innerText);
            this._groups[index] = this._namingGroupIndex[groupIndex];
        }
    }]);
    return TableFits_Prepare;
}();

var TableFits_Create = function () {
    createClass(TableFits_Create, null, [{
        key: 'make',


        /**
         * @param {HTMLDivElement} v
         * @returns {TableFits_Create}
         */
        value: function make(v) {
            return new TableFits_Create(v);
        }

        /**
         *
         * @param {HTMLDivElement} v
         */

    }]);

    function TableFits_Create(v) {
        classCallCheck(this, TableFits_Create);

        /**
         * @type {HTMLDivElement}
         * @private
         */
        this._container = v;

        /**
         *
         * @type {Array}
         * @private
         */
        this._thead = [];

        /**
         *
         * @type {Array}
         * @private
         */
        this._mainTitleIndex = [];

        /**
         * @type {Array}
         * @private
         */
        this._rows = [];

        /**
         *
         * @type {Array}
         * @private
         */
        this._rowsClasses = [];

        this._mainClass = null;
    }

    /**
     * @param {String} v
     */


    createClass(TableFits_Create, [{
        key: 'setMainClass',
        value: function setMainClass(v) {
            this._mainClass = v;
            return this;
        }

        /**
         * @param {TableFits_Prepare} prepare
         * @returns {TableFits_Create}
         */

    }, {
        key: 'setPrepare',
        value: function setPrepare(prepare) {
            this._thead = prepare.thead;
            this._mainTitleIndex = prepare.mainTitleIndex;
            this._rows = prepare.rows;
            this._rowsClasses = prepare.rowsClasses;

            return this;
        }
    }, {
        key: 'create',
        value: function create() {
            var _this = this;

            this._rows.forEach(function (row, rowIndex) {

                var tr = document.createElement('div');
                tr.classList.add(_this._mainClass + '__tr');
                _this._container.appendChild(tr);

                if (_this._rowsClasses[rowIndex]) {
                    _this._rowsClasses[rowIndex].forEach(function (class_name) {
                        tr.classList.add(class_name);
                    });
                }

                tr.appendChild(_this._createMainTitle(row));

                /**
                 * Тело
                 * @type {HTMLDivElement}
                 */
                var b = document.createElement('div');
                b.classList.add(_this._mainClass + '__body');
                tr.appendChild(b);

                _this._createRowData(b, row);
            });
        }

        /**
         * @param row
         * @returns {HTMLDivElement}
         * @private
         */

    }, {
        key: '_createMainTitle',
        value: function _createMainTitle(row) {
            var _this2 = this;

            /**
             * Заголовок
             * @type {HTMLDivElement} h
             */
            var h = document.createElement('div');
            h.classList.add(this._mainClass + '__head');
            this._mainTitleIndex.forEach(function (i) {
                var el = document.createElement('div');
                el.classList.add(_this2._mainClass + '__head__item');

                var isHasForm = false;
                row[i].childNodes.forEach(function (node) {
                    if (node instanceof HTMLInputElement) {
                        isHasForm = true;
                    } else if (node instanceof HTMLSelectElement) {
                        isHasForm = true;
                    }
                });

                if (isHasForm) {
                    var th = document.createElement('div');
                    th.classList.add(_this2._mainClass + '__th');
                    th.appendChild(document.createTextNode(_this2._thead[i]));

                    var td = document.createElement('div');
                    td.classList.add(_this2._mainClass + '__td');

                    row[i].childNodes.forEach(function (node) {
                        td.appendChild(node);
                    });
                    row[i].newParent = td;

                    el.appendChild(th);
                    el.appendChild(td);
                } else {
                    row[i].childNodes.forEach(function (node) {
                        el.appendChild(node);
                    });
                    row[i].newParent = el;
                }

                h.appendChild(el);
            });

            return h;
        }

        /**
         * @param {HTMLDivElement} block_body
         * @param {Object} row
         * @private
         */

    }, {
        key: '_createRowData',
        value: function _createRowData(block_body, row) {
            var _this3 = this;

            var i = 0;

            Object.keys(this._thead).forEach(function (index) {

                var thead_th = _this3._thead[index];

                var item = document.createElement('div');
                item.classList.add(_this3._mainClass + '__item');

                if (typeof thead_th !== 'string') {
                    // Столбцы
                    var columns__title = document.createElement('div');
                    columns__title.classList.add(_this3._mainClass + '__columns_title');
                    columns__title.appendChild(document.createTextNode(thead_th.title));

                    var columns = document.createElement('div');
                    columns.classList.add(_this3._mainClass + '__columns');

                    thead_th.columns.forEach(function (title) {

                        if (_this3._mainTitleIndex.indexOf(i) !== -1) {
                            ++i;
                            return;
                        }

                        var c = document.createElement('div');
                        c.classList.add(_this3._mainClass + '__columns__col');

                        var th = document.createElement('div');
                        th.classList.add(_this3._mainClass + '__th');
                        th.appendChild(document.createTextNode(title));

                        var td = document.createElement('div');
                        td.classList.add(_this3._mainClass + '__td');
                        row[i].childNodes.forEach(function (node) {
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
                    if (_this3._mainTitleIndex.indexOf(i) !== -1) {
                        ++i;
                        return;
                    }

                    var th = document.createElement('div');
                    th.classList.add(_this3._mainClass + '__th');
                    th.appendChild(document.createTextNode(thead_th));

                    var td = document.createElement('div');
                    td.classList.add(_this3._mainClass + '__td');

                    row[i].childNodes.forEach(function (nd) {
                        td.appendChild(nd);
                    });
                    row[i].newParent = td;

                    item.appendChild(th);
                    item.appendChild(td);

                    ++i;
                }

                block_body.appendChild(item);
            });
        }
    }]);
    return TableFits_Create;
}();

var TableFits = function () {
    createClass(TableFits, null, [{
        key: 'make',
        value: function make(el_table, config) {
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

    }]);

    function TableFits(el_table, config) {
        classCallCheck(this, TableFits);


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

    createClass(TableFits, [{
        key: '_initEvent',
        value: function _initEvent() {
            if (this._config.resize) {
                window.addEventListener('resize', this._initHadler, true);
            }

            if (this._config.watch) {
                TableFits_Prepare_DomChange.addEvent(this._el, this._reloadHadler);
            }
        }
    }, {
        key: '_offEvent',
        value: function _offEvent() {
            if (this._config.resize) {
                window.removeEventListener('resize', this._initHadler, true);
            }

            if (this._config.watch) {
                TableFits_Prepare_DomChange.removeEvent(this._el, this._reloadHadler);
            }
        }
    }, {
        key: 'onResize',
        value: function onResize() {
            this._offEvent();
            this._init();
            this._initEvent();
        }
    }, {
        key: 'onReload',
        value: function onReload() {
            this._offEvent();
            this._showTableDefault();
            this.reset();
            this._init();
            this._initEvent();
        }
    }, {
        key: 'reset',
        value: function reset() {
            this._isTableFits = false;
            this._tableFitsEl = null;
            this._elMinWidth = null;
            this._mainTitleIndex = [];
            this._thead = [];
            this._rows = [];
            this._rowsClasses = [];
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this._offEvent();
            this._showTableDefault();
            this.reset();
            this._el._tableFits = null;
        }
    }, {
        key: '_returnChildrenToTable',
        value: function _returnChildrenToTable() {
            this._rows.forEach(function (row) {
                row.forEach(function (item) {
                    item.childNodes.forEach(function (el) {
                        item.parent.appendChild(el);
                    });
                });
            });
        }
    }, {
        key: '_returnChildrenToMobileBlock',
        value: function _returnChildrenToMobileBlock() {
            this._rows.forEach(function (row) {
                row.forEach(function (item) {
                    item.childNodes.forEach(function (el) {
                        item.newParent.appendChild(el);
                    });
                });
            });
        }
    }, {
        key: '_showTableDefault',
        value: function _showTableDefault() {
            if (!this._tableFitsEl || !this._isTableFits) return;

            this._isTableFits = false;

            this._returnChildrenToTable();

            this._el.style.display = 'table';
            this._tableFitsEl.parentNode.removeChild(this._tableFitsEl);
        }
    }, {
        key: '_isNeedTableFits',
        value: function _isNeedTableFits() {

            if (this._elMinWidth) {
                if (this._el.parentNode.offsetWidth >= this._elMinWidth) {
                    return false;
                }
            } else if (this._el.parentNode.offsetWidth >= this._el.offsetWidth) {
                return false;
            }

            return true;
        }
    }, {
        key: '_init',
        value: function _init() {

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

            var parent = this._el.parentNode;
            var next = this._el.nextSibling;
            if (next) {
                parent.insertBefore(this._tableFitsEl, next);
            } else {
                parent.appendChild(this._tableFitsEl);
            }
        }
    }, {
        key: '_prepareTableFits',
        value: function _prepareTableFits() {
            this._prepare = TableFits_Prepare.make(this._el);
            this._thead = this._prepare.thead;
            this._mainTitleIndex = this._prepare.mainTitleIndex;
            this._rows = this._prepare.rows;
            this._rowsClasses = this._prepare.rowsClasses;
        }
    }, {
        key: '_createTableFits',
        value: function _createTableFits() {
            this._tableFitsEl = document.createElement('div');
            this._tableFitsEl.classList.add(this._config.mainClass);

            TableFits_Create.make(this._tableFitsEl).setMainClass(this._config.mainClass).setPrepare(this._prepare).create();
        }
    }]);
    return TableFits;
}();

return TableFits;

}());
//# sourceMappingURL=table-fits.js.map
