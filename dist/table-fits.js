var TableFits = (function () {
'use strict';

var MutationObserver = typeof window !== 'undefined' ? window.MutationObserver || window.WebKitMutationObserver : undefined;
var eventListenerSupported = typeof window !== 'undefined' ? window.addEventListener : undefined;

var TableFits_Prepare_DomChange = function TableFits_Prepare_DomChange () {};

TableFits_Prepare_DomChange.addEvent = function addEvent (obj, callback) {
    if (MutationObserver) {
        // define a new observer
        var obs = new MutationObserver(function(mutations, observer) {
            if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                { callback(); }
        });

        obs.observe(obj, {childList: true, subtree: true});

        if (!(obj in TableFits_Prepare_DomChange._storage)) {
            TableFits_Prepare_DomChange._storage[obj] = {};
        }

        TableFits_Prepare_DomChange._storage[obj][callback] = obs;

    } else if (eventListenerSupported) {
        obj.addEventListener('DOMSubtreeModified', callback, false);
        obj.addEventListener('DOMNodeInserted', callback, false);
        obj.addEventListener('DOMNodeRemoved', callback, false);
    }
};

TableFits_Prepare_DomChange.removeEvent = function removeEvent (obj, callback) {
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
};

TableFits_Prepare_DomChange._storage = {};

var TableFits_Prepare = function TableFits_Prepare(table) {
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
};

TableFits_Prepare.make = function make (table) {
    return new TableFits_Prepare(table)
};

TableFits_Prepare.prototype._prepare = function _prepare () {
        var this$1 = this;

    var thead_trs = this._table.querySelectorAll('thead tr');
    [].forEach.call(thead_trs, function (el) {
        this$1._nextGroupIndex = 0;
        [].forEach.call(el.querySelectorAll('th'), this$1._prepareTH.bind(this$1));
    });

    this._prepareRows();
};

TableFits_Prepare.prototype._prepareRows = function _prepareRows () {
        var this$1 = this;

    var trs = this._table.querySelectorAll('tr');
    var i = 0;
    [].forEach.call(trs, function (tr) {

        var tds = tr.querySelectorAll('td');

        if (tds.length < 1) { return; }

        if (tr.classList.length > 0) {
            this$1.rowsClasses[i] = Array.prototype.slice.call(tr.classList);
        }

        var row = [];

        [].forEach.call(tds, function (td) {
            row.push({
                parent: td,
                childNodes: Array.prototype.slice.call(td.childNodes)
            });
        });

        this$1.rows.push(row);
        ++i;
    });
};

/**
 * @param {HTMLTableCellElement} th
 * @param {Number} index
 * @private
 */
TableFits_Prepare.prototype._prepareTH = function _prepareTH (th, index) {
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

    if (typeof this._groups[index] !== 'undefined' && th.parentNode.rowIndex > 0) {
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
};

/**
 * @param {HTMLTableCellElement} th
 * @param {Number} index
 * @private
 */
TableFits_Prepare.prototype._prepareTHColspan = function _prepareTHColspan (th, index) {
        var this$1 = this;

    for (var i = 0; i < th.colSpan; ++i) {
        this$1._groups[this$1._nextGroupIndex] = index;
        ++this$1._nextGroupIndex;
    }

    this.thead[index] = {
        index: index,
        title: th.innerText,
        columns: []
    };
};

/**
 * @param {HTMLTableCellElement} th
 * @param {Number} index
 * @private
 */
TableFits_Prepare.prototype._prepareTHGroup = function _prepareTHGroup (th, index) {
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
};

function ce(tag,className) {
    var el = document.createElement(tag);

    if (typeof className !== 'undefined') {
        el.classList.add(className);
    }

    return el;
}

var TableFits_Create = function TableFits_Create(v) {
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
};

/**
 * @param {String} v
 */
TableFits_Create.make = function make (v) {
    return new TableFits_Create(v)
};

TableFits_Create.prototype.setMainClass = function setMainClass (v) {
    this._mainClass = v;
    return this;
};

/**
 * @param {TableFits_Prepare} prepare
 * @returns {TableFits_Create}
 */
TableFits_Create.prototype.setPrepare = function setPrepare (prepare) {
    this._thead = prepare.thead;
    this._mainTitleIndex = prepare.mainTitleIndex;
    this._rows = prepare.rows;
    this._rowsClasses = prepare.rowsClasses;

    return this;
};

TableFits_Create.prototype.create = function create () {
        var this$1 = this;

    this._rows.forEach(function (row, rowIndex) {

        var tr = ce('div',this$1._mainClass + '__tr');

        this$1._container.appendChild(tr);

        if (this$1._rowsClasses[rowIndex]) {
            this$1._rowsClasses[rowIndex].forEach(function (class_name) {
                tr.classList.add(class_name);
            });
        }

        if (this$1._mainTitleIndex.length) {
            tr.appendChild(this$1._createMainTitle(row));
        }

        /**
         * Тело
         * @type {HTMLDivElement}
         */
        var b = ce('div',this$1._mainClass + '__body');
        tr.appendChild(b);

        this$1._createRowData(b, row);

    });
};

/**
 * @param row
 * @returns {HTMLDivElement}
 * @private
 */
TableFits_Create.prototype._createMainTitle = function _createMainTitle (row) {
        var this$1 = this;

    /**
     * Заголовок
     * @type {HTMLDivElement} h
     */
    var h = ce('div',this._mainClass + '__head');
    this._mainTitleIndex.forEach(function (i) {
        var el = ce('div',this$1._mainClass + '__head__item');

        var isHasForm = false;
        row[i].childNodes.forEach(function (node) {
            if (node instanceof HTMLInputElement) {
                isHasForm = true;
            } else if (node instanceof HTMLSelectElement) {
                isHasForm = true;
            }
        });

        if (isHasForm) {
            var th = ce('div',this$1._mainClass + '__th');
            th.appendChild(document.createTextNode(this$1._thead[i]));

            var td = ce('div',this$1._mainClass + '__td');

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
};

/**
 * @param {HTMLDivElement} block_body
 * @param {Object} row
 * @private
 */
TableFits_Create.prototype._createRowData = function _createRowData (block_body, row) {
        var this$1 = this;

    var i = 0;

    Object.keys(this._thead)
        .forEach(function (index) {

            var thead_th = this$1._thead[index];

            var item = ce('div',this$1._mainClass + '__item');

            if (typeof thead_th !== 'string') {
                // Столбцы
                var columns_title = ce('div',this$1._mainClass + '__columns_title');

                columns_title.appendChild(document.createTextNode(thead_th.title));

                var columns = ce('div',this$1._mainClass + '__columns');

                thead_th.columns.forEach(function (title) {

                    if (this$1._mainTitleIndex.indexOf(i) !== -1) {
                        ++i;
                        return;
                    }

                    var c = ce('div',this$1._mainClass + '__columns__col');

                    var th = ce('div',this$1._mainClass + '__th');
                    th.appendChild(document.createTextNode(title));

                    var td = ce('div',this$1._mainClass + '__td');
                    row[i].childNodes.forEach(function (node) {
                        td.appendChild(node);
                    });
                    row[i].newParent = td;

                    c.appendChild(th);
                    c.appendChild(td);
                    columns.appendChild(c);

                    ++i;
                });

                item.appendChild(columns_title);
                item.appendChild(columns);
            } else {
                // Просто
                if (this$1._mainTitleIndex.indexOf(i) !== -1) {
                    ++i;
                    return;
                }

                var th = ce('div',this$1._mainClass + '__th');
                th.appendChild(document.createTextNode(thead_th));

                var td = ce('div',this$1._mainClass + '__td');

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
};

var TableFits = function TableFits(el_table, config) {

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

    if (!this._el || !this._el.querySelector('thead')) {
        return;
    }

    if ('tableFits' in this._el.dataset) {
        if (this._el.dataset.tableFits === 'no') {
            return;
        }
    }

    this._config = Object.assign({}, this._config, config);

    this._widthPoint = this._config.width ? this._config.width : null;

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
};

TableFits.make = function make (el_table, config) {
    return new TableFits(el_table, config);
};

TableFits.prototype._initEvent = function _initEvent () {
    if (this._config.resize && typeof window !== 'undefined') {
        window.addEventListener('resize', this._initHadler, true);
    }

    if (this._config.watch && this._isTableFits && typeof window !== 'undefined') {
        TableFits_Prepare_DomChange.addEvent(this._el, this._reloadHadler);
    }
};

TableFits.prototype._offEvent = function _offEvent () {
    if (this._config.resize && typeof window !== 'undefined') {
        window.removeEventListener('resize', this._initHadler, true);
    }

    if (this._config.watch && typeof window !== 'undefined') {
        TableFits_Prepare_DomChange.removeEvent(this._el, this._reloadHadler);
    }
};

TableFits.prototype.onResize = function onResize () {
    this._offEvent();

    this._init();
    this._initEvent();
};

TableFits.prototype.onReload = function onReload () {
    this._offEvent();
    this._showTableDefault();
    this.reset();

    this._init();
    this._initEvent();
};

TableFits.prototype.reset = function reset () {
    this._isTableFits = false;
    this._tableFitsEl = null;
    this._elMinWidth = null;
    this._mainTitleIndex = [];
    this._thead = [];
    this._rows = [];
    this._rowsClasses = [];
};

TableFits.prototype.destroy = function destroy () {
    this._offEvent();
    this._showTableDefault();
    this.reset();
    this._el._tableFits = null;
};

TableFits.prototype._returnChildrenTo = function _returnChildrenTo (t)
{
    this._rows.forEach(function (row) {
        row.forEach(function (item) {
            item.childNodes.forEach(function (el) {
                if (t === 'table') {
                    item.parent.appendChild(el);
                } else {
                    item.newParent.appendChild(el);
                }
            });
        });
    });
};

TableFits.prototype._showTableDefault = function _showTableDefault () {
    if (!this._tableFitsEl || !this._isTableFits) { return; }

    this._isTableFits = false;

    this._returnChildrenTo('table');

    this._el.style.display = 'table';
    this._tableFitsEl.parentNode.removeChild(this._tableFitsEl);
};

TableFits.prototype._isNeedTableFits = function _isNeedTableFits () {
    var parentW =
        this._parent.clientWidth -
        parseFloat(this._parentCS.getPropertyValue('padding-left')) -
        parseFloat(this._parentCS.getPropertyValue('padding-right'));

    if (this._widthPoint) {
        return parentW <= this._widthPoint;
    }

    var tableW = this._elMinWidth ? this._elMinWidth : this._el.offsetWidth;

    return parentW < tableW;
};

TableFits.prototype._init = function _init () {

    if (!this._isNeedTableFits()) {
        this._showTableDefault();
        return;
    }

    if (this._isTableFits) { return; }

    this._isTableFits = true;

    if (!this._elMinWidth) { this._elMinWidth = this._el.offsetWidth; }

    if (!this._tableFitsEl) {
        this._prepareTableFits();
        this._createTableFits();
    } else {
        this._returnChildrenTo('mobile-block');
    }

    this._el.style.display = 'none';

    var parent = this._el.parentNode;
    var next = this._el.nextSibling;
    if (next) {
        parent.insertBefore(this._tableFitsEl, next);
    } else {
        parent.appendChild(this._tableFitsEl);
    }
};

TableFits.prototype._prepareTableFits = function _prepareTableFits ()
{
    this._prepare = TableFits_Prepare.make(this._el);
    this._thead = this._prepare.thead;
    this._mainTitleIndex = this._prepare.mainTitleIndex;
    this._rows = this._prepare.rows;
    this._rowsClasses = this._prepare.rowsClasses;
};

TableFits.prototype._createTableFits = function _createTableFits () {
    this._tableFitsEl = document.createElement('div');
    this._tableFitsEl.classList.add(this._config.mainClass);

    TableFits_Create.make(this._tableFitsEl)
        .setMainClass(this._config.mainClass)
        .setPrepare(this._prepare)
        .create();
};

return TableFits;

}());
//# sourceMappingURL=table-fits.js.map
