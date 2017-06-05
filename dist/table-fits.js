var TableFits = (function () {
'use strict';

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var eventListenerSupported = window.addEventListener;

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

        var tr = document.createElement('div');
        tr.classList.add(this$1._mainClass + '__tr');
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
        var b = document.createElement('div');
        b.classList.add(this$1._mainClass + '__body');
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
    var h = document.createElement('div');
    h.classList.add(this._mainClass + '__head');
    this._mainTitleIndex.forEach(function (i) {
        var el = document.createElement('div');
        el.classList.add(this$1._mainClass + '__head__item');

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
            th.classList.add(this$1._mainClass + '__th');
            th.appendChild(document.createTextNode(this$1._thead[i]));

            var td = document.createElement('div');
            td.classList.add(this$1._mainClass + '__td');

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

            var item = document.createElement('div');
            item.classList.add(this$1._mainClass + '__item');

            if (typeof thead_th !== 'string') {
                // Столбцы
                var columns_title = document.createElement('div');
                columns_title.classList.add(this$1._mainClass + '__columns_title');
                columns_title.appendChild(document.createTextNode(thead_th.title));

                var columns = document.createElement('div');
                columns.classList.add(this$1._mainClass + '__columns');

                thead_th.columns.forEach(function (title) {

                    if (this$1._mainTitleIndex.indexOf(i) !== -1) {
                        ++i;
                        return;
                    }

                    var c = document.createElement('div');
                    c.classList.add(this$1._mainClass + '__columns__col');

                    var th = document.createElement('div');
                    th.classList.add(this$1._mainClass + '__th');
                    th.appendChild(document.createTextNode(title));

                    var td = document.createElement('div');
                    td.classList.add(this$1._mainClass + '__td');
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

                var th = document.createElement('div');
                th.classList.add(this$1._mainClass + '__th');
                th.appendChild(document.createTextNode(thead_th));

                var td = document.createElement('div');
                td.classList.add(this$1._mainClass + '__td');

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
    if (this._config.resize) {
        window.addEventListener('resize', this._initHadler, true);
    }

    if (this._config.watch) {
        TableFits_Prepare_DomChange.addEvent(this._el, this._reloadHadler);
    }
};

TableFits.prototype._offEvent = function _offEvent () {
    if (this._config.resize) {
        window.removeEventListener('resize', this._initHadler, true);
    }

    if (this._config.watch) {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZml0cy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2RvbV9jaGFuZ2UuanMiLCIuLi9zcmMvcHJlcGFyZS5qcyIsIi4uL3NyYy9jcmVhdGUuanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsibGV0IE11dGF0aW9uT2JzZXJ2ZXIgPSB3aW5kb3cuTXV0YXRpb25PYnNlcnZlciB8fCB3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlcixcbiAgICBldmVudExpc3RlbmVyU3VwcG9ydGVkID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmxlRml0c19QcmVwYXJlX0RvbUNoYW5nZSB7XG5cbiAgICBzdGF0aWMgYWRkRXZlbnQob2JqLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICAgICAgLy8gZGVmaW5lIGEgbmV3IG9ic2VydmVyXG4gICAgICAgICAgICB2YXIgb2JzID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obXV0YXRpb25zLCBvYnNlcnZlcikge1xuICAgICAgICAgICAgICAgIGlmIChtdXRhdGlvbnNbMF0uYWRkZWROb2Rlcy5sZW5ndGggfHwgbXV0YXRpb25zWzBdLnJlbW92ZWROb2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgb2JzLm9ic2VydmUob2JqLCB7Y2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlfSk7XG5cbiAgICAgICAgICAgIGlmICghKG9iaiBpbiBUYWJsZUZpdHNfUHJlcGFyZV9Eb21DaGFuZ2UuX3N0b3JhZ2UpKSB7XG4gICAgICAgICAgICAgICAgVGFibGVGaXRzX1ByZXBhcmVfRG9tQ2hhbmdlLl9zdG9yYWdlW29ial0gPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgVGFibGVGaXRzX1ByZXBhcmVfRG9tQ2hhbmdlLl9zdG9yYWdlW29ial1bY2FsbGJhY2tdID0gb2JzO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRMaXN0ZW5lclN1cHBvcnRlZCkge1xuICAgICAgICAgICAgb2JqLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTVN1YnRyZWVNb2RpZmllZCcsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgICAgICBvYmouYWRkRXZlbnRMaXN0ZW5lcignRE9NTm9kZUluc2VydGVkJywgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyKCdET01Ob2RlUmVtb3ZlZCcsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcmVtb3ZlRXZlbnQob2JqLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICAgICAgaWYgKCEob2JqIGluIFRhYmxlRml0c19QcmVwYXJlX0RvbUNoYW5nZS5fc3RvcmFnZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghKGNhbGxiYWNrIGluIFRhYmxlRml0c19QcmVwYXJlX0RvbUNoYW5nZS5fc3RvcmFnZVtvYmpdKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgVGFibGVGaXRzX1ByZXBhcmVfRG9tQ2hhbmdlLl9zdG9yYWdlW29ial1bY2FsbGJhY2tdLmRpc2Nvbm5lY3QoKTtcblxuICAgICAgICAgICAgZGVsZXRlIFRhYmxlRml0c19QcmVwYXJlX0RvbUNoYW5nZS5fc3RvcmFnZVtvYmpdW2NhbGxiYWNrXTtcblxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50TGlzdGVuZXJTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgIG9iai5yZW1vdmVFdmVudExpc3RlbmVyKCdET01TdWJ0cmVlTW9kaWZpZWQnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICAgICAgb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ0RPTU5vZGVJbnNlcnRlZCcsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgICAgICBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NTm9kZVJlbW92ZWQnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5UYWJsZUZpdHNfUHJlcGFyZV9Eb21DaGFuZ2UuX3N0b3JhZ2UgPSB7fTsiLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJsZUZpdHNfUHJlcGFyZSB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxUYWJsZUVsZW1lbnR9IHRhYmxlXG4gICAgICogQHJldHVybnMge1RhYmxlRml0c19QcmVwYXJlfVxuICAgICAqL1xuICAgIHN0YXRpYyBtYWtlKHRhYmxlKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGFibGVGaXRzX1ByZXBhcmUodGFibGUpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MVGFibGVFbGVtZW50fSB0YWJsZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHRhYmxlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7SFRNTFRhYmxlRWxlbWVudH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3RhYmxlID0gdGFibGU7XG5cbiAgICAgICAgdGhpcy5fZ3JvdXBzID0ge307XG4gICAgICAgIHRoaXMuX25hbWluZ0dyb3VwSW5kZXggPSB7fTtcbiAgICAgICAgdGhpcy5fbmV4dEdyb3VwSW5kZXggPSAwO1xuXG4gICAgICAgIHRoaXMudGhlYWQgPSBbXTtcbiAgICAgICAgdGhpcy5tYWluVGl0bGVJbmRleCA9IFtdO1xuICAgICAgICB0aGlzLnJvd3NDbGFzc2VzID0gW107XG4gICAgICAgIHRoaXMucm93cyA9IFtdO1xuXG4gICAgICAgIHRoaXMuX3ByZXBhcmUoKTtcbiAgICB9XG5cbiAgICBfcHJlcGFyZSgpIHtcbiAgICAgICAgbGV0IHRoZWFkX3RycyA9IHRoaXMuX3RhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RoZWFkIHRyJyk7XG4gICAgICAgIFtdLmZvckVhY2guY2FsbCh0aGVhZF90cnMsIChlbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fbmV4dEdyb3VwSW5kZXggPSAwO1xuICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RoJyksIHRoaXMuX3ByZXBhcmVUSC5iaW5kKHRoaXMpKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9wcmVwYXJlUm93cygpO1xuICAgIH1cblxuICAgIF9wcmVwYXJlUm93cygpIHtcbiAgICAgICAgbGV0IHRycyA9IHRoaXMuX3RhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RyJyk7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgW10uZm9yRWFjaC5jYWxsKHRycywgKHRyKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCB0ZHMgPSB0ci5xdWVyeVNlbGVjdG9yQWxsKCd0ZCcpO1xuXG4gICAgICAgICAgICBpZiAodGRzLmxlbmd0aCA8IDEpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKHRyLmNsYXNzTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3dzQ2xhc3Nlc1tpXSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRyLmNsYXNzTGlzdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCByb3cgPSBbXTtcblxuICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKHRkcywgKHRkKSA9PiB7XG4gICAgICAgICAgICAgICAgcm93LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHRkLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0ZC5jaGlsZE5vZGVzKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucm93cy5wdXNoKHJvdyk7XG4gICAgICAgICAgICArK2k7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTFRhYmxlQ2VsbEVsZW1lbnR9IHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcHJlcGFyZVRIKHRoLCBpbmRleCkge1xuICAgICAgICBpZiAodGguY29sU3BhbiAmJiB0aC5jb2xTcGFuID4gMSkge1xuICAgICAgICAgICAgdGhpcy5fcHJlcGFyZVRIQ29sc3Bhbih0aCwgaW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCd0YWJsZUZpdHNHcm91cCcgaW4gdGguZGF0YXNldCkge1xuICAgICAgICAgICAgdGhpcy5fcHJlcGFyZVRIR3JvdXAodGgsIGluZGV4KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGgucm93U3BhbiB8fCB0aC5yb3dTcGFuIDw9IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX25leHRHcm91cEluZGV4ICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZ3JvdXBzW2luZGV4XSkge1xuICAgICAgICAgICAgLy8g0JTQvtC70LbQvdGLINCx0YvRgtGMINCyINCz0YDRg9C/0L/QtVxuICAgICAgICAgICAgdGhpcy50aGVhZFt0aGlzLl9ncm91cHNbaW5kZXhdXS5jb2x1bW5zLnB1c2godGguaW5uZXJUZXh0KTtcblxuICAgICAgICAgICAgaWYgKCd0YWJsZUZpdHMnIGluIHRoLmRhdGFzZXQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGguZGF0YXNldC50YWJsZUZpdHMgPT09ICd0aXRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWluVGl0bGVJbmRleC5wdXNoKHRoaXMuX2dyb3Vwc1tpbmRleF0uaW5kZXggKyBpbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXG4gICAgICAgIHRoaXMudGhlYWRbaW5kZXhdID0gdGguaW5uZXJUZXh0O1xuXG4gICAgICAgIGlmICgndGFibGVGaXRzJyBpbiB0aC5kYXRhc2V0KSB7XG4gICAgICAgICAgICBpZiAodGguZGF0YXNldC50YWJsZUZpdHMgPT09ICd0aXRsZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1haW5UaXRsZUluZGV4LnB1c2goaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MVGFibGVDZWxsRWxlbWVudH0gdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9wcmVwYXJlVEhDb2xzcGFuKHRoLCBpbmRleCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoLmNvbFNwYW47ICsraSkge1xuICAgICAgICAgICAgdGhpcy5fZ3JvdXBzW3RoaXMuX25leHRHcm91cEluZGV4XSA9IGluZGV4O1xuICAgICAgICAgICAgKyt0aGlzLl9uZXh0R3JvdXBJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGhlYWRbaW5kZXhdID0ge1xuICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgdGl0bGU6IHRoLmlubmVyVGV4dCxcbiAgICAgICAgICAgIGNvbHVtbnM6IFtdXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MVGFibGVDZWxsRWxlbWVudH0gdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9wcmVwYXJlVEhHcm91cCh0aCwgaW5kZXgpIHtcbiAgICAgICAgbGV0IGdyb3VwSW5kZXggPSB0aC5kYXRhc2V0LnRhYmxlRml0c0dyb3VwO1xuXG4gICAgICAgIGlmICghKGdyb3VwSW5kZXggaW4gdGhpcy5fbmFtaW5nR3JvdXBJbmRleCkpIHtcbiAgICAgICAgICAgIHRoaXMuX25hbWluZ0dyb3VwSW5kZXhbZ3JvdXBJbmRleF0gPSBpbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRoaXMuX25hbWluZ0dyb3VwSW5kZXhbZ3JvdXBJbmRleF0gaW4gdGhpcy50aGVhZCkpIHtcbiAgICAgICAgICAgIHRoaXMudGhlYWRbdGhpcy5fbmFtaW5nR3JvdXBJbmRleFtncm91cEluZGV4XV0gPSB7XG4gICAgICAgICAgICAgICAgaW5kZXg6IHRoaXMuX25hbWluZ0dyb3VwSW5kZXhbZ3JvdXBJbmRleF0sXG4gICAgICAgICAgICAgICAgdGl0bGU6IGdyb3VwSW5kZXgsXG4gICAgICAgICAgICAgICAgY29sdW1uczogW11cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRoZWFkW3RoaXMuX25hbWluZ0dyb3VwSW5kZXhbZ3JvdXBJbmRleF1dLmNvbHVtbnMucHVzaCh0aC5pbm5lclRleHQpO1xuICAgICAgICB0aGlzLl9ncm91cHNbaW5kZXhdID0gdGhpcy5fbmFtaW5nR3JvdXBJbmRleFtncm91cEluZGV4XTtcbiAgICB9XG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGVGaXRzX0NyZWF0ZSB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxEaXZFbGVtZW50fSB2XG4gICAgICogQHJldHVybnMge1RhYmxlRml0c19DcmVhdGV9XG4gICAgICovXG4gICAgc3RhdGljIG1ha2Uodikge1xuICAgICAgICByZXR1cm4gbmV3IFRhYmxlRml0c19DcmVhdGUodilcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTERpdkVsZW1lbnR9IHZcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih2KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7SFRNTERpdkVsZW1lbnR9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jb250YWluZXIgPSB2O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl90aGVhZCA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9tYWluVGl0bGVJbmRleCA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yb3dzID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3Jvd3NDbGFzc2VzID0gW107XG5cbiAgICAgICAgdGhpcy5fbWFpbkNsYXNzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdlxuICAgICAqL1xuICAgIHNldE1haW5DbGFzcyh2KSB7XG4gICAgICAgIHRoaXMuX21haW5DbGFzcyA9IHY7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VGFibGVGaXRzX1ByZXBhcmV9IHByZXBhcmVcbiAgICAgKiBAcmV0dXJucyB7VGFibGVGaXRzX0NyZWF0ZX1cbiAgICAgKi9cbiAgICBzZXRQcmVwYXJlKHByZXBhcmUpIHtcbiAgICAgICAgdGhpcy5fdGhlYWQgPSBwcmVwYXJlLnRoZWFkO1xuICAgICAgICB0aGlzLl9tYWluVGl0bGVJbmRleCA9IHByZXBhcmUubWFpblRpdGxlSW5kZXg7XG4gICAgICAgIHRoaXMuX3Jvd3MgPSBwcmVwYXJlLnJvd3M7XG4gICAgICAgIHRoaXMuX3Jvd3NDbGFzc2VzID0gcHJlcGFyZS5yb3dzQ2xhc3NlcztcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHRoaXMuX3Jvd3MuZm9yRWFjaCgocm93LCByb3dJbmRleCkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHRyLmNsYXNzTGlzdC5hZGQodGhpcy5fbWFpbkNsYXNzICsgJ19fdHInKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0cik7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9yb3dzQ2xhc3Nlc1tyb3dJbmRleF0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yb3dzQ2xhc3Nlc1tyb3dJbmRleF0uZm9yRWFjaCgoY2xhc3NfbmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ci5jbGFzc0xpc3QuYWRkKGNsYXNzX25hbWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFpblRpdGxlSW5kZXgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdHIuYXBwZW5kQ2hpbGQodGhpcy5fY3JlYXRlTWFpblRpdGxlKHJvdykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqINCi0LXQu9C+XG4gICAgICAgICAgICAgKiBAdHlwZSB7SFRNTERpdkVsZW1lbnR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxldCBiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBiLmNsYXNzTGlzdC5hZGQodGhpcy5fbWFpbkNsYXNzICsgJ19fYm9keScpO1xuICAgICAgICAgICAgdHIuYXBwZW5kQ2hpbGQoYik7XG5cbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVJvd0RhdGEoYiwgcm93KTtcblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gcm93XG4gICAgICogQHJldHVybnMge0hUTUxEaXZFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZU1haW5UaXRsZShyb3cpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqINCX0LDQs9C+0LvQvtCy0L7QulxuICAgICAgICAgKiBAdHlwZSB7SFRNTERpdkVsZW1lbnR9IGhcbiAgICAgICAgICovXG4gICAgICAgIGxldCBoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGguY2xhc3NMaXN0LmFkZCh0aGlzLl9tYWluQ2xhc3MgKyAnX19oZWFkJyk7XG4gICAgICAgIHRoaXMuX21haW5UaXRsZUluZGV4LmZvckVhY2goKGkpID0+IHtcbiAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCh0aGlzLl9tYWluQ2xhc3MgKyAnX19oZWFkX19pdGVtJyk7XG5cbiAgICAgICAgICAgIGxldCBpc0hhc0Zvcm0gPSBmYWxzZTtcbiAgICAgICAgICAgIHJvd1tpXS5jaGlsZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNIYXNGb3JtID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpc0hhc0Zvcm0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNIYXNGb3JtKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdGguY2xhc3NMaXN0LmFkZCh0aGlzLl9tYWluQ2xhc3MgKyAnX190aCcpO1xuICAgICAgICAgICAgICAgIHRoLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMuX3RoZWFkW2ldKSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICB0ZC5jbGFzc0xpc3QuYWRkKHRoaXMuX21haW5DbGFzcyArICdfX3RkJyk7XG5cbiAgICAgICAgICAgICAgICByb3dbaV0uY2hpbGROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRkLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJvd1tpXS5uZXdQYXJlbnQgPSB0ZDtcblxuXG4gICAgICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQodGgpO1xuICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKHRkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcm93W2ldLmNoaWxkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByb3dbaV0ubmV3UGFyZW50ID0gZWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGguYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gaDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxEaXZFbGVtZW50fSBibG9ja19ib2R5XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHJvd1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVJvd0RhdGEoYmxvY2tfYm9keSwgcm93KSB7XG4gICAgICAgIGxldCBpID0gMDtcblxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl90aGVhZClcbiAgICAgICAgICAgIC5mb3JFYWNoKChpbmRleCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IHRoZWFkX3RoID0gdGhpcy5fdGhlYWRbaW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQodGhpcy5fbWFpbkNsYXNzICsgJ19faXRlbScpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGVhZF90aCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g0KHRgtC+0LvQsdGG0YtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbHVtbnNfX3RpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnNfX3RpdGxlLmNsYXNzTGlzdC5hZGQodGhpcy5fbWFpbkNsYXNzICsgJ19fY29sdW1uc190aXRsZScpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zX190aXRsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGVhZF90aC50aXRsZSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2x1bW5zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnMuY2xhc3NMaXN0LmFkZCh0aGlzLl9tYWluQ2xhc3MgKyAnX19jb2x1bW5zJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhlYWRfdGguY29sdW1ucy5mb3JFYWNoKCh0aXRsZSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fbWFpblRpdGxlSW5kZXguaW5kZXhPZihpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5jbGFzc0xpc3QuYWRkKHRoaXMuX21haW5DbGFzcyArICdfX2NvbHVtbnNfX2NvbCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoLmNsYXNzTGlzdC5hZGQodGhpcy5fbWFpbkNsYXNzICsgJ19fdGgnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRpdGxlKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGQuY2xhc3NMaXN0LmFkZCh0aGlzLl9tYWluQ2xhc3MgKyAnX190ZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcm93W2ldLmNoaWxkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRkLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3dbaV0ubmV3UGFyZW50ID0gdGQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGMuYXBwZW5kQ2hpbGQodGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5hcHBlbmRDaGlsZCh0ZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zLmFwcGVuZENoaWxkKGMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoY29sdW1uc19fdGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmFwcGVuZENoaWxkKGNvbHVtbnMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vINCf0YDQvtGB0YLQvlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fbWFpblRpdGxlSW5kZXguaW5kZXhPZihpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICsraTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxldCB0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICB0aC5jbGFzc0xpc3QuYWRkKHRoaXMuX21haW5DbGFzcyArICdfX3RoJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoZWFkX3RoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRkLmNsYXNzTGlzdC5hZGQodGhpcy5fbWFpbkNsYXNzICsgJ19fdGQnKTtcblxuICAgICAgICAgICAgICAgICAgICByb3dbaV0uY2hpbGROb2Rlcy5mb3JFYWNoKChuZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGQuYXBwZW5kQ2hpbGQobmQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcm93W2ldLm5ld1BhcmVudCA9IHRkO1xuXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQodGgpO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmFwcGVuZENoaWxkKHRkKTtcblxuICAgICAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYmxvY2tfYm9keS5hcHBlbmRDaGlsZChpdGVtKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn0iLCJpbXBvcnQgRG9tQ2hhbmdlIGZyb20gJy4vZG9tX2NoYW5nZS5qcyc7XHJcbmltcG9ydCBQcmVwYXJlIGZyb20gJy4vcHJlcGFyZS5qcyc7XHJcbmltcG9ydCBDcmVhdGUgZnJvbSAnLi9jcmVhdGUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGVGaXRzIHtcclxuXHJcbiAgICBzdGF0aWMgbWFrZShlbF90YWJsZSwgY29uZmlnKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUYWJsZUZpdHMoZWxfdGFibGUsIGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkYXRhLW9wdGlvblxyXG4gICAgICogZGF0YS10YWJsZS1maXRzLWdyb3VwPVwiTXkgZ3JvdXBcIiAodGhlYWQgPiB0ciA+IHRkKSAtLSBjb21iaW5lIGNvbHVtbnNcclxuICAgICAqIGRhdGEtdGFibGUtZml0cz1cIm5vXCIgKHRhYmxlKSAtLSBTa2lwXHJcbiAgICAgKiBkYXRhLXRhYmxlLWZpdHM9XCJ0aXRsZVwiICh0aGVhZCA+IHRyID4gdGQpIC0tIEZvciBibG9jaydzIGhlYWRlcnNcclxuICAgICAqIFRPRE8gZGF0YS10YWJsZS1maXRzLXdpZHRoICh0YWJsZSkgLS0gSGFuZGluZyBjaGFuZ2UgdG8gcmVzcG9uc2l2ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBlbF90YWJsZVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbF90YWJsZSwgY29uZmlnKSB7XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWFpbkNsYXNzOiAndGFibGUtZml0cycsXHJcbiAgICAgICAgICAgIHJlc2l6ZTogdHJ1ZSxcclxuICAgICAgICAgICAgd2F0Y2g6IHRydWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAdHlwZSB7SFRNTFRhYmxlRWxlbWVudH1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX2VsID0gdHlwZW9mIGVsX3RhYmxlID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxfdGFibGUpIDogZWxfdGFibGU7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEB0eXBlIHtOb2RlfEhUTUxEaXZFbGVtZW50fVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fcGFyZW50ID0gdGhpcy5fZWwucGFyZW50Tm9kZTtcclxuICAgICAgICB0aGlzLl9wYXJlbnRDUyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5fcGFyZW50KTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9lbCB8fCAhdGhpcy5fZWwucXVlcnlTZWxlY3RvcigndGhlYWQnKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoJ3RhYmxlRml0cycgaW4gdGhpcy5fZWwuZGF0YXNldCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fZWwuZGF0YXNldC50YWJsZUZpdHMgPT09ICdubycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fY29uZmlnLCBjb25maWcpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fZWwuX3RhYmxlRml0cykge1xyXG4gICAgICAgICAgICB0aGlzLl9lbC5fdGFibGVGaXRzLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2VsLl90YWJsZUZpdHMgPSB0aGlzO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQodGC0LDRgtGD0YEg0LzQvtCx0LjQuyDQvdC1INC80L7QsdC40LtcclxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX2lzVGFibGVGaXRzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fZWxNaW5XaWR0aCA9IG51bGw7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJbXX1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX21haW5UaXRsZUluZGV4ID0gW107XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3RoZWFkID0gW107XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3Jvd3MgPSBbXTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fcm93c0NsYXNzZXMgPSBbXTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQHR5cGUge0hUTUxEaXZFbGVtZW50fVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fdGFibGVGaXRzRWwgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLl9pbml0SGFkbGVyID0gdGhpcy5vblJlc2l6ZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3JlbG9hZEhhZGxlciA9IHRoaXMub25SZWxvYWQuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIF9pbml0RXZlbnQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy5yZXNpemUpIHtcclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2luaXRIYWRsZXIsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy53YXRjaCkge1xyXG4gICAgICAgICAgICBEb21DaGFuZ2UuYWRkRXZlbnQodGhpcy5fZWwsIHRoaXMuX3JlbG9hZEhhZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9vZmZFdmVudCgpIHtcclxuICAgICAgICBpZiAodGhpcy5fY29uZmlnLnJlc2l6ZSkge1xyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faW5pdEhhZGxlciwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fY29uZmlnLndhdGNoKSB7XHJcbiAgICAgICAgICAgIERvbUNoYW5nZS5yZW1vdmVFdmVudCh0aGlzLl9lbCwgdGhpcy5fcmVsb2FkSGFkbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25SZXNpemUoKSB7XHJcbiAgICAgICAgdGhpcy5fb2ZmRXZlbnQoKTtcclxuICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgdGhpcy5faW5pdEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25SZWxvYWQoKSB7XHJcbiAgICAgICAgdGhpcy5fb2ZmRXZlbnQoKTtcclxuICAgICAgICB0aGlzLl9zaG93VGFibGVEZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICB0aGlzLl9pbml0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLl9pc1RhYmxlRml0cyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3RhYmxlRml0c0VsID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9lbE1pbldpZHRoID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9tYWluVGl0bGVJbmRleCA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3RoZWFkID0gW107XHJcbiAgICAgICAgdGhpcy5fcm93cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3Jvd3NDbGFzc2VzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl9vZmZFdmVudCgpO1xyXG4gICAgICAgIHRoaXMuX3Nob3dUYWJsZURlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5fZWwuX3RhYmxlRml0cyA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgX3JldHVybkNoaWxkcmVuVG8odClcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9yb3dzLmZvckVhY2goKHJvdykgPT4ge1xyXG4gICAgICAgICAgICByb3cuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5jaGlsZE5vZGVzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgPT09ICd0YWJsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJlbnQuYXBwZW5kQ2hpbGQoZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubmV3UGFyZW50LmFwcGVuZENoaWxkKGVsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9zaG93VGFibGVEZWZhdWx0KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fdGFibGVGaXRzRWwgfHwgIXRoaXMuX2lzVGFibGVGaXRzKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2lzVGFibGVGaXRzID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuX3JldHVybkNoaWxkcmVuVG8oJ3RhYmxlJyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2VsLnN0eWxlLmRpc3BsYXkgPSAndGFibGUnO1xyXG4gICAgICAgIHRoaXMuX3RhYmxlRml0c0VsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fdGFibGVGaXRzRWwpO1xyXG4gICAgfVxyXG5cclxuICAgIF9pc05lZWRUYWJsZUZpdHMoKSB7XHJcbiAgICAgICAgbGV0IHBhcmVudFcgPVxyXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY2xpZW50V2lkdGggLVxyXG4gICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuX3BhcmVudENTLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctbGVmdCcpKSAtXHJcbiAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5fcGFyZW50Q1MuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpKVxyXG4gICAgICAgIDtcclxuXHJcbiAgICAgICAgbGV0IHRhYmxlVyA9IHRoaXMuX2VsTWluV2lkdGggPyB0aGlzLl9lbE1pbldpZHRoIDogdGhpcy5fZWwub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJlbnRXIDwgdGFibGVXO1xyXG4gICAgfVxyXG5cclxuICAgIF9pbml0KCkge1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuX2lzTmVlZFRhYmxlRml0cygpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3dUYWJsZURlZmF1bHQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2lzVGFibGVGaXRzKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2lzVGFibGVGaXRzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9lbE1pbldpZHRoKSB0aGlzLl9lbE1pbldpZHRoID0gdGhpcy5fZWwub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5fdGFibGVGaXRzRWwpIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJlcGFyZVRhYmxlRml0cygpO1xyXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVUYWJsZUZpdHMoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXR1cm5DaGlsZHJlblRvKCdtb2JpbGUtYmxvY2snKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2VsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgIGxldCBwYXJlbnQgPSB0aGlzLl9lbC5wYXJlbnROb2RlO1xyXG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5fZWwubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgaWYgKG5leHQpIHtcclxuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSh0aGlzLl90YWJsZUZpdHNFbCwgbmV4dCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuX3RhYmxlRml0c0VsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3ByZXBhcmVUYWJsZUZpdHMoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3ByZXBhcmUgPSBQcmVwYXJlLm1ha2UodGhpcy5fZWwpO1xyXG4gICAgICAgIHRoaXMuX3RoZWFkID0gdGhpcy5fcHJlcGFyZS50aGVhZDtcclxuICAgICAgICB0aGlzLl9tYWluVGl0bGVJbmRleCA9IHRoaXMuX3ByZXBhcmUubWFpblRpdGxlSW5kZXg7XHJcbiAgICAgICAgdGhpcy5fcm93cyA9IHRoaXMuX3ByZXBhcmUucm93cztcclxuICAgICAgICB0aGlzLl9yb3dzQ2xhc3NlcyA9IHRoaXMuX3ByZXBhcmUucm93c0NsYXNzZXM7XHJcbiAgICB9XHJcblxyXG4gICAgX2NyZWF0ZVRhYmxlRml0cygpIHtcclxuICAgICAgICB0aGlzLl90YWJsZUZpdHNFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHRoaXMuX3RhYmxlRml0c0VsLmNsYXNzTGlzdC5hZGQodGhpcy5fY29uZmlnLm1haW5DbGFzcyk7XHJcblxyXG4gICAgICAgIENyZWF0ZS5tYWtlKHRoaXMuX3RhYmxlRml0c0VsKVxyXG4gICAgICAgICAgICAuc2V0TWFpbkNsYXNzKHRoaXMuX2NvbmZpZy5tYWluQ2xhc3MpXHJcbiAgICAgICAgICAgIC5zZXRQcmVwYXJlKHRoaXMuX3ByZXBhcmUpXHJcbiAgICAgICAgICAgIC5jcmVhdGUoKTtcclxuICAgIH1cclxuXHJcbn0iXSwibmFtZXMiOlsibGV0IiwidGhpcyIsImNvbHVtbnNfX3RpdGxlIiwiRG9tQ2hhbmdlIiwiUHJlcGFyZSIsIkNyZWF0ZSJdLCJtYXBwaW5ncyI6Ijs7O0FBQUFBLElBQUksZ0JBQWdCLEdBQUcsTUFBTSxD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