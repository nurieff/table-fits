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
};

TableFits.make = function make (el_table, config) {
    return new TableFits(el_table, config);
};

TableFits.prototype._initEvent = function _initEvent () {
    if (this._config.resize) {
        window.addEventListener('resize', this._initHadler, true);
    }

    if (this._config.watch && this._isTableFits) {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZml0cy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2RvbV9jaGFuZ2UuanMiLCIuLi9zcmMvcHJlcGFyZS5qcyIsIi4uL3NyYy9leHQuanMiLCIuLi9zcmMvY3JlYXRlLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImxldCBNdXRhdGlvbk9ic2VydmVyID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93LldlYktpdE11dGF0aW9uT2JzZXJ2ZXIsXG4gICAgZXZlbnRMaXN0ZW5lclN1cHBvcnRlZCA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJsZUZpdHNfUHJlcGFyZV9Eb21DaGFuZ2Uge1xuXG4gICAgc3RhdGljIGFkZEV2ZW50KG9iaiwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKE11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIC8vIGRlZmluZSBhIG5ldyBvYnNlcnZlclxuICAgICAgICAgICAgdmFyIG9icyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucywgb2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAobXV0YXRpb25zWzBdLmFkZGVkTm9kZXMubGVuZ3RoIHx8IG11dGF0aW9uc1swXS5yZW1vdmVkTm9kZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG9icy5vYnNlcnZlKG9iaiwge2NoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZX0pO1xuXG4gICAgICAgICAgICBpZiAoIShvYmogaW4gVGFibGVGaXRzX1ByZXBhcmVfRG9tQ2hhbmdlLl9zdG9yYWdlKSkge1xuICAgICAgICAgICAgICAgIFRhYmxlRml0c19QcmVwYXJlX0RvbUNoYW5nZS5fc3RvcmFnZVtvYmpdID0ge307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFRhYmxlRml0c19QcmVwYXJlX0RvbUNoYW5nZS5fc3RvcmFnZVtvYmpdW2NhbGxiYWNrXSA9IG9icztcblxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50TGlzdGVuZXJTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyKCdET01TdWJ0cmVlTW9kaWZpZWQnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICAgICAgb2JqLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTU5vZGVJbnNlcnRlZCcsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgICAgICBvYmouYWRkRXZlbnRMaXN0ZW5lcignRE9NTm9kZVJlbW92ZWQnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIHJlbW92ZUV2ZW50KG9iaiwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKE11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIGlmICghKG9iaiBpbiBUYWJsZUZpdHNfUHJlcGFyZV9Eb21DaGFuZ2UuX3N0b3JhZ2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIShjYWxsYmFjayBpbiBUYWJsZUZpdHNfUHJlcGFyZV9Eb21DaGFuZ2UuX3N0b3JhZ2Vbb2JqXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFRhYmxlRml0c19QcmVwYXJlX0RvbUNoYW5nZS5fc3RvcmFnZVtvYmpdW2NhbGxiYWNrXS5kaXNjb25uZWN0KCk7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBUYWJsZUZpdHNfUHJlcGFyZV9Eb21DaGFuZ2UuX3N0b3JhZ2Vbb2JqXVtjYWxsYmFja107XG5cbiAgICAgICAgfSBlbHNlIGlmIChldmVudExpc3RlbmVyU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NU3VidHJlZU1vZGlmaWVkJywgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgICAgIG9iai5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Ob2RlSW5zZXJ0ZWQnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICAgICAgb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ0RPTU5vZGVSZW1vdmVkJywgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuVGFibGVGaXRzX1ByZXBhcmVfRG9tQ2hhbmdlLl9zdG9yYWdlID0ge307IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGVGaXRzX1ByZXBhcmUge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MVGFibGVFbGVtZW50fSB0YWJsZVxuICAgICAqIEByZXR1cm5zIHtUYWJsZUZpdHNfUHJlcGFyZX1cbiAgICAgKi9cbiAgICBzdGF0aWMgbWFrZSh0YWJsZSkge1xuICAgICAgICByZXR1cm4gbmV3IFRhYmxlRml0c19QcmVwYXJlKHRhYmxlKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTFRhYmxlRWxlbWVudH0gdGFibGVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0YWJsZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0hUTUxUYWJsZUVsZW1lbnR9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl90YWJsZSA9IHRhYmxlO1xuXG4gICAgICAgIHRoaXMuX2dyb3VwcyA9IHt9O1xuICAgICAgICB0aGlzLl9uYW1pbmdHcm91cEluZGV4ID0ge307XG4gICAgICAgIHRoaXMuX25leHRHcm91cEluZGV4ID0gMDtcblxuICAgICAgICB0aGlzLnRoZWFkID0gW107XG4gICAgICAgIHRoaXMubWFpblRpdGxlSW5kZXggPSBbXTtcbiAgICAgICAgdGhpcy5yb3dzQ2xhc3NlcyA9IFtdO1xuICAgICAgICB0aGlzLnJvd3MgPSBbXTtcblxuICAgICAgICB0aGlzLl9wcmVwYXJlKCk7XG4gICAgfVxuXG4gICAgX3ByZXBhcmUoKSB7XG4gICAgICAgIGxldCB0aGVhZF90cnMgPSB0aGlzLl90YWJsZS5xdWVyeVNlbGVjdG9yQWxsKCd0aGVhZCB0cicpO1xuICAgICAgICBbXS5mb3JFYWNoLmNhbGwodGhlYWRfdHJzLCAoZWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX25leHRHcm91cEluZGV4ID0gMDtcbiAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChlbC5xdWVyeVNlbGVjdG9yQWxsKCd0aCcpLCB0aGlzLl9wcmVwYXJlVEguYmluZCh0aGlzKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX3ByZXBhcmVSb3dzKCk7XG4gICAgfVxuXG4gICAgX3ByZXBhcmVSb3dzKCkge1xuICAgICAgICBsZXQgdHJzID0gdGhpcy5fdGFibGUucXVlcnlTZWxlY3RvckFsbCgndHInKTtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBbXS5mb3JFYWNoLmNhbGwodHJzLCAodHIpID0+IHtcblxuICAgICAgICAgICAgbGV0IHRkcyA9IHRyLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RkJyk7XG5cbiAgICAgICAgICAgIGlmICh0ZHMubGVuZ3RoIDwgMSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAodHIuY2xhc3NMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvd3NDbGFzc2VzW2ldID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodHIuY2xhc3NMaXN0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHJvdyA9IFtdO1xuXG4gICAgICAgICAgICBbXS5mb3JFYWNoLmNhbGwodGRzLCAodGQpID0+IHtcbiAgICAgICAgICAgICAgICByb3cucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogdGQsXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXM6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRkLmNoaWxkTm9kZXMpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5yb3dzLnB1c2gocm93KTtcbiAgICAgICAgICAgICsraTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MVGFibGVDZWxsRWxlbWVudH0gdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9wcmVwYXJlVEgodGgsIGluZGV4KSB7XG4gICAgICAgIGlmICh0aC5jb2xTcGFuICYmIHRoLmNvbFNwYW4gPiAxKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmVwYXJlVEhDb2xzcGFuKHRoLCBpbmRleCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJ3RhYmxlRml0c0dyb3VwJyBpbiB0aC5kYXRhc2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9wcmVwYXJlVEhHcm91cCh0aCwgaW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aC5yb3dTcGFuIHx8IHRoLnJvd1NwYW4gPD0gMSkge1xuICAgICAgICAgICAgdGhpcy5fbmV4dEdyb3VwSW5kZXggKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5fZ3JvdXBzW2luZGV4XSAhPT0gJ3VuZGVmaW5lZCcgJiYgdGgucGFyZW50Tm9kZS5yb3dJbmRleCA+IDApIHtcbiAgICAgICAgICAgIC8vINCU0L7Qu9C20L3RiyDQsdGL0YLRjCDQsiDQs9GA0YPQv9C/0LVcbiAgICAgICAgICAgIHRoaXMudGhlYWRbdGhpcy5fZ3JvdXBzW2luZGV4XV0uY29sdW1ucy5wdXNoKHRoLmlubmVyVGV4dCk7XG5cbiAgICAgICAgICAgIGlmICgndGFibGVGaXRzJyBpbiB0aC5kYXRhc2V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoLmRhdGFzZXQudGFibGVGaXRzID09PSAndGl0bGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFpblRpdGxlSW5kZXgucHVzaCh0aGlzLl9ncm91cHNbaW5kZXhdLmluZGV4ICsgaW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cblxuICAgICAgICB0aGlzLnRoZWFkW2luZGV4XSA9IHRoLmlubmVyVGV4dDtcblxuICAgICAgICBpZiAoJ3RhYmxlRml0cycgaW4gdGguZGF0YXNldCkge1xuICAgICAgICAgICAgaWYgKHRoLmRhdGFzZXQudGFibGVGaXRzID09PSAndGl0bGUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYWluVGl0bGVJbmRleC5wdXNoKGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTFRhYmxlQ2VsbEVsZW1lbnR9IHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcHJlcGFyZVRIQ29sc3Bhbih0aCwgaW5kZXgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aC5jb2xTcGFuOyArK2kpIHtcbiAgICAgICAgICAgIHRoaXMuX2dyb3Vwc1t0aGlzLl9uZXh0R3JvdXBJbmRleF0gPSBpbmRleDtcbiAgICAgICAgICAgICsrdGhpcy5fbmV4dEdyb3VwSW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRoZWFkW2luZGV4XSA9IHtcbiAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgIHRpdGxlOiB0aC5pbm5lclRleHQsXG4gICAgICAgICAgICBjb2x1bW5zOiBbXVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTFRhYmxlQ2VsbEVsZW1lbnR9IHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcHJlcGFyZVRIR3JvdXAodGgsIGluZGV4KSB7XG4gICAgICAgIGxldCBncm91cEluZGV4ID0gdGguZGF0YXNldC50YWJsZUZpdHNHcm91cDtcblxuICAgICAgICBpZiAoIShncm91cEluZGV4IGluIHRoaXMuX25hbWluZ0dyb3VwSW5kZXgpKSB7XG4gICAgICAgICAgICB0aGlzLl9uYW1pbmdHcm91cEluZGV4W2dyb3VwSW5kZXhdID0gaW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISh0aGlzLl9uYW1pbmdHcm91cEluZGV4W2dyb3VwSW5kZXhdIGluIHRoaXMudGhlYWQpKSB7XG4gICAgICAgICAgICB0aGlzLnRoZWFkW3RoaXMuX25hbWluZ0dyb3VwSW5kZXhbZ3JvdXBJbmRleF1dID0ge1xuICAgICAgICAgICAgICAgIGluZGV4OiB0aGlzLl9uYW1pbmdHcm91cEluZGV4W2dyb3VwSW5kZXhdLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBncm91cEluZGV4LFxuICAgICAgICAgICAgICAgIGNvbHVtbnM6IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aGVhZFt0aGlzLl9uYW1pbmdHcm91cEluZGV4W2dyb3VwSW5kZXhdXS5jb2x1bW5zLnB1c2godGguaW5uZXJUZXh0KTtcbiAgICAgICAgdGhpcy5fZ3JvdXBzW2luZGV4XSA9IHRoaXMuX25hbWluZ0dyb3VwSW5kZXhbZ3JvdXBJbmRleF07XG4gICAgfVxufSIsImV4cG9ydCBmdW5jdGlvbiBjZSh0YWcsY2xhc3NOYW1lKSB7XG4gICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuXG4gICAgaWYgKHR5cGVvZiBjbGFzc05hbWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZWw7XG59IiwiaW1wb3J0IHtjZX0gZnJvbSAnLi9leHQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJsZUZpdHNfQ3JlYXRlIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTERpdkVsZW1lbnR9IHZcbiAgICAgKiBAcmV0dXJucyB7VGFibGVGaXRzX0NyZWF0ZX1cbiAgICAgKi9cbiAgICBzdGF0aWMgbWFrZSh2KSB7XG4gICAgICAgIHJldHVybiBuZXcgVGFibGVGaXRzX0NyZWF0ZSh2KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MRGl2RWxlbWVudH0gdlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHYpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtIVE1MRGl2RWxlbWVudH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IHY7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3RoZWFkID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX21haW5UaXRsZUluZGV4ID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3Jvd3MgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcm93c0NsYXNzZXMgPSBbXTtcblxuICAgICAgICB0aGlzLl9tYWluQ2xhc3MgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2XG4gICAgICovXG4gICAgc2V0TWFpbkNsYXNzKHYpIHtcbiAgICAgICAgdGhpcy5fbWFpbkNsYXNzID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtUYWJsZUZpdHNfUHJlcGFyZX0gcHJlcGFyZVxuICAgICAqIEByZXR1cm5zIHtUYWJsZUZpdHNfQ3JlYXRlfVxuICAgICAqL1xuICAgIHNldFByZXBhcmUocHJlcGFyZSkge1xuICAgICAgICB0aGlzLl90aGVhZCA9IHByZXBhcmUudGhlYWQ7XG4gICAgICAgIHRoaXMuX21haW5UaXRsZUluZGV4ID0gcHJlcGFyZS5tYWluVGl0bGVJbmRleDtcbiAgICAgICAgdGhpcy5fcm93cyA9IHByZXBhcmUucm93cztcbiAgICAgICAgdGhpcy5fcm93c0NsYXNzZXMgPSBwcmVwYXJlLnJvd3NDbGFzc2VzO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgdGhpcy5fcm93cy5mb3JFYWNoKChyb3csIHJvd0luZGV4KSA9PiB7XG5cbiAgICAgICAgICAgIGxldCB0ciA9IGNlKCdkaXYnLHRoaXMuX21haW5DbGFzcyArICdfX3RyJyk7XG5cbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0cik7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9yb3dzQ2xhc3Nlc1tyb3dJbmRleF0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yb3dzQ2xhc3Nlc1tyb3dJbmRleF0uZm9yRWFjaCgoY2xhc3NfbmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ci5jbGFzc0xpc3QuYWRkKGNsYXNzX25hbWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFpblRpdGxlSW5kZXgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdHIuYXBwZW5kQ2hpbGQodGhpcy5fY3JlYXRlTWFpblRpdGxlKHJvdykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqINCi0LXQu9C+XG4gICAgICAgICAgICAgKiBAdHlwZSB7SFRNTERpdkVsZW1lbnR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxldCBiID0gY2UoJ2RpdicsdGhpcy5fbWFpbkNsYXNzICsgJ19fYm9keScpO1xuICAgICAgICAgICAgdHIuYXBwZW5kQ2hpbGQoYik7XG5cbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVJvd0RhdGEoYiwgcm93KTtcblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gcm93XG4gICAgICogQHJldHVybnMge0hUTUxEaXZFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZU1haW5UaXRsZShyb3cpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqINCX0LDQs9C+0LvQvtCy0L7QulxuICAgICAgICAgKiBAdHlwZSB7SFRNTERpdkVsZW1lbnR9IGhcbiAgICAgICAgICovXG4gICAgICAgIGxldCBoID0gY2UoJ2RpdicsdGhpcy5fbWFpbkNsYXNzICsgJ19faGVhZCcpO1xuICAgICAgICB0aGlzLl9tYWluVGl0bGVJbmRleC5mb3JFYWNoKChpKSA9PiB7XG4gICAgICAgICAgICBsZXQgZWwgPSBjZSgnZGl2Jyx0aGlzLl9tYWluQ2xhc3MgKyAnX19oZWFkX19pdGVtJyk7XG5cbiAgICAgICAgICAgIGxldCBpc0hhc0Zvcm0gPSBmYWxzZTtcbiAgICAgICAgICAgIHJvd1tpXS5jaGlsZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNIYXNGb3JtID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpc0hhc0Zvcm0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNIYXNGb3JtKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRoID0gY2UoJ2RpdicsdGhpcy5fbWFpbkNsYXNzICsgJ19fdGgnKTtcbiAgICAgICAgICAgICAgICB0aC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLl90aGVhZFtpXSkpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHRkID0gY2UoJ2RpdicsdGhpcy5fbWFpbkNsYXNzICsgJ19fdGQnKTtcblxuICAgICAgICAgICAgICAgIHJvd1tpXS5jaGlsZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGQuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcm93W2ldLm5ld1BhcmVudCA9IHRkO1xuXG5cbiAgICAgICAgICAgICAgICBlbC5hcHBlbmRDaGlsZCh0aCk7XG4gICAgICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQodGQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3dbaV0uY2hpbGROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJvd1tpXS5uZXdQYXJlbnQgPSBlbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaC5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTERpdkVsZW1lbnR9IGJsb2NrX2JvZHlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcm93XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlUm93RGF0YShibG9ja19ib2R5LCByb3cpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX3RoZWFkKVxuICAgICAgICAgICAgLmZvckVhY2goKGluZGV4KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGhlYWRfdGggPSB0aGlzLl90aGVhZFtpbmRleF07XG5cbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGNlKCdkaXYnLHRoaXMuX21haW5DbGFzcyArICdfX2l0ZW0nKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhlYWRfdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vINCh0YLQvtC70LHRhtGLXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2x1bW5zX190aXRsZSA9IGNlKCdkaXYnLHRoaXMuX21haW5DbGFzcyArICdfX2NvbHVtbnNfdGl0bGUnKTtcblxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zX190aXRsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGVhZF90aC50aXRsZSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2x1bW5zID0gY2UoJ2RpdicsdGhpcy5fbWFpbkNsYXNzICsgJ19fY29sdW1ucycpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoZWFkX3RoLmNvbHVtbnMuZm9yRWFjaCgodGl0bGUpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX21haW5UaXRsZUluZGV4LmluZGV4T2YoaSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKytpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGMgPSBjZSgnZGl2Jyx0aGlzLl9tYWluQ2xhc3MgKyAnX19jb2x1bW5zX19jb2wnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRoID0gY2UoJ2RpdicsdGhpcy5fbWFpbkNsYXNzICsgJ19fdGgnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRpdGxlKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZCA9IGNlKCdkaXYnLHRoaXMuX21haW5DbGFzcyArICdfX3RkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3dbaV0uY2hpbGROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGQuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpXS5uZXdQYXJlbnQgPSB0ZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYy5hcHBlbmRDaGlsZCh0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjLmFwcGVuZENoaWxkKHRkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnMuYXBwZW5kQ2hpbGQoYyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICsraTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChjb2x1bW5zX190aXRsZSk7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoY29sdW1ucyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g0J/RgNC+0YHRgtC+XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tYWluVGl0bGVJbmRleC5pbmRleE9mKGkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgKytpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHRoID0gY2UoJ2RpdicsdGhpcy5fbWFpbkNsYXNzICsgJ19fdGgnKTtcbiAgICAgICAgICAgICAgICAgICAgdGguYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhlYWRfdGgpKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgdGQgPSBjZSgnZGl2Jyx0aGlzLl9tYWluQ2xhc3MgKyAnX190ZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJvd1tpXS5jaGlsZE5vZGVzLmZvckVhY2goKG5kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZC5hcHBlbmRDaGlsZChuZCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByb3dbaV0ubmV3UGFyZW50ID0gdGQ7XG5cbiAgICAgICAgICAgICAgICAgICAgaXRlbS5hcHBlbmRDaGlsZCh0aCk7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQodGQpO1xuXG4gICAgICAgICAgICAgICAgICAgICsraTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBibG9ja19ib2R5LmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufSIsImltcG9ydCBEb21DaGFuZ2UgZnJvbSAnLi9kb21fY2hhbmdlLmpzJztcclxuaW1wb3J0IFByZXBhcmUgZnJvbSAnLi9wcmVwYXJlLmpzJztcclxuaW1wb3J0IENyZWF0ZSBmcm9tICcuL2NyZWF0ZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJsZUZpdHMge1xyXG5cclxuICAgIHN0YXRpYyBtYWtlKGVsX3RhYmxlLCBjb25maWcpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRhYmxlRml0cyhlbF90YWJsZSwgY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRhdGEtb3B0aW9uXHJcbiAgICAgKiBkYXRhLXRhYmxlLWZpdHMtZ3JvdXA9XCJNeSBncm91cFwiICh0aGVhZCA+IHRyID4gdGQpIC0tIGNvbWJpbmUgY29sdW1uc1xyXG4gICAgICogZGF0YS10YWJsZS1maXRzPVwibm9cIiAodGFibGUpIC0tIFNraXBcclxuICAgICAqIGRhdGEtdGFibGUtZml0cz1cInRpdGxlXCIgKHRoZWFkID4gdHIgPiB0ZCkgLS0gRm9yIGJsb2NrJ3MgaGVhZGVyc1xyXG4gICAgICogZGF0YS10YWJsZS1maXRzLXdpZHRoIC0tIEhhbmRpbmcgY2hhbmdlIHRvIHJlc3BvbnNpdmVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZWxfdGFibGVcclxuICAgICAqIEBwYXJhbSBjb25maWdcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxfdGFibGUsIGNvbmZpZykge1xyXG5cclxuICAgICAgICB0aGlzLl9jb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1haW5DbGFzczogJ3RhYmxlLWZpdHMnLFxyXG4gICAgICAgICAgICB3aWR0aDogbnVsbCxcclxuICAgICAgICAgICAgcmVzaXplOiB0cnVlLFxyXG4gICAgICAgICAgICB3YXRjaDogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEB0eXBlIHtIVE1MVGFibGVFbGVtZW50fVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fZWwgPSB0eXBlb2YgZWxfdGFibGUgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbF90YWJsZSkgOiBlbF90YWJsZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQHR5cGUge05vZGV8SFRNTERpdkVsZW1lbnR9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9wYXJlbnQgPSB0aGlzLl9lbC5wYXJlbnROb2RlO1xyXG4gICAgICAgIHRoaXMuX3BhcmVudENTID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLl9wYXJlbnQpO1xyXG4gICAgICAgIHRoaXMuX3dpZHRoUG9pbnQgPSB0aGlzLl9jb25maWcud2lkdGggPyB0aGlzLl9jb25maWcud2lkdGggOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuX2VsIHx8ICF0aGlzLl9lbC5xdWVyeVNlbGVjdG9yKCd0aGVhZCcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgndGFibGVGaXRzJyBpbiB0aGlzLl9lbC5kYXRhc2V0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9lbC5kYXRhc2V0LnRhYmxlRml0cyA9PT0gJ25vJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9jb25maWcsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIGlmICgndGFibGVGaXRzV2lkdGgnIGluIHRoaXMuX2VsLmRhdGFzZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5fd2lkdGhQb2ludCA9IHBhcnNlSW50KHRoaXMuX2VsLmRhdGFzZXQudGFibGVGaXRzV2lkdGgsMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2VsLl90YWJsZUZpdHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZWwuX3RhYmxlRml0cy5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9lbC5fdGFibGVGaXRzID0gdGhpcztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog0KHRgtCw0YLRg9GBINC80L7QsdC40Lsg0L3QtSDQvNC+0LHQuNC7XHJcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9pc1RhYmxlRml0cyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2VsTWluV2lkdGggPSBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyW119XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9tYWluVGl0bGVJbmRleCA9IFtdO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl90aGVhZCA9IFtdO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9yb3dzID0gW107XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3Jvd3NDbGFzc2VzID0gW107XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEB0eXBlIHtIVE1MRGl2RWxlbWVudH1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3RhYmxlRml0c0VsID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5faW5pdEhhZGxlciA9IHRoaXMub25SZXNpemUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9yZWxvYWRIYWRsZXIgPSB0aGlzLm9uUmVsb2FkLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICB0aGlzLl9pbml0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBfaW5pdEV2ZW50KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jb25maWcucmVzaXplKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9pbml0SGFkbGVyLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jb25maWcud2F0Y2ggJiYgdGhpcy5faXNUYWJsZUZpdHMpIHtcclxuICAgICAgICAgICAgRG9tQ2hhbmdlLmFkZEV2ZW50KHRoaXMuX2VsLCB0aGlzLl9yZWxvYWRIYWRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfb2ZmRXZlbnQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy5yZXNpemUpIHtcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2luaXRIYWRsZXIsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy53YXRjaCkge1xyXG4gICAgICAgICAgICBEb21DaGFuZ2UucmVtb3ZlRXZlbnQodGhpcy5fZWwsIHRoaXMuX3JlbG9hZEhhZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uUmVzaXplKCkge1xyXG4gICAgICAgIHRoaXMuX29mZkV2ZW50KCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICB0aGlzLl9pbml0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblJlbG9hZCgpIHtcclxuICAgICAgICB0aGlzLl9vZmZFdmVudCgpO1xyXG4gICAgICAgIHRoaXMuX3Nob3dUYWJsZURlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICB0aGlzLl9pbml0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLl9pc1RhYmxlRml0cyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3RhYmxlRml0c0VsID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9lbE1pbldpZHRoID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9tYWluVGl0bGVJbmRleCA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3RoZWFkID0gW107XHJcbiAgICAgICAgdGhpcy5fcm93cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3Jvd3NDbGFzc2VzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLl9vZmZFdmVudCgpO1xyXG4gICAgICAgIHRoaXMuX3Nob3dUYWJsZURlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5fZWwuX3RhYmxlRml0cyA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgX3JldHVybkNoaWxkcmVuVG8odClcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9yb3dzLmZvckVhY2goKHJvdykgPT4ge1xyXG4gICAgICAgICAgICByb3cuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5jaGlsZE5vZGVzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgPT09ICd0YWJsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJlbnQuYXBwZW5kQ2hpbGQoZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubmV3UGFyZW50LmFwcGVuZENoaWxkKGVsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9zaG93VGFibGVEZWZhdWx0KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fdGFibGVGaXRzRWwgfHwgIXRoaXMuX2lzVGFibGVGaXRzKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2lzVGFibGVGaXRzID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuX3JldHVybkNoaWxkcmVuVG8oJ3RhYmxlJyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2VsLnN0eWxlLmRpc3BsYXkgPSAndGFibGUnO1xyXG4gICAgICAgIHRoaXMuX3RhYmxlRml0c0VsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fdGFibGVGaXRzRWwpO1xyXG4gICAgfVxyXG5cclxuICAgIF9pc05lZWRUYWJsZUZpdHMoKSB7XHJcbiAgICAgICAgbGV0IHBhcmVudFcgPVxyXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuY2xpZW50V2lkdGggLVxyXG4gICAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuX3BhcmVudENTLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctbGVmdCcpKSAtXHJcbiAgICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5fcGFyZW50Q1MuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpKVxyXG4gICAgICAgIDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3dpZHRoUG9pbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudFcgPD0gdGhpcy5fd2lkdGhQb2ludDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0YWJsZVcgPSB0aGlzLl9lbE1pbldpZHRoID8gdGhpcy5fZWxNaW5XaWR0aCA6IHRoaXMuX2VsLm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICByZXR1cm4gcGFyZW50VyA8IHRhYmxlVztcclxuICAgIH1cclxuXHJcbiAgICBfaW5pdCgpIHtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc05lZWRUYWJsZUZpdHMoKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93VGFibGVEZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9pc1RhYmxlRml0cykgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9pc1RhYmxlRml0cyA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5fZWxNaW5XaWR0aCkgdGhpcy5fZWxNaW5XaWR0aCA9IHRoaXMuX2VsLm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuX3RhYmxlRml0c0VsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZXBhcmVUYWJsZUZpdHMoKTtcclxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlVGFibGVGaXRzKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcmV0dXJuQ2hpbGRyZW5UbygnbW9iaWxlLWJsb2NrJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9lbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5fZWwucGFyZW50Tm9kZTtcclxuICAgICAgICBsZXQgbmV4dCA9IHRoaXMuX2VsLm5leHRTaWJsaW5nO1xyXG4gICAgICAgIGlmIChuZXh0KSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGhpcy5fdGFibGVGaXRzRWwsIG5leHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLl90YWJsZUZpdHNFbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9wcmVwYXJlVGFibGVGaXRzKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9wcmVwYXJlID0gUHJlcGFyZS5tYWtlKHRoaXMuX2VsKTtcclxuICAgICAgICB0aGlzLl90aGVhZCA9IHRoaXMuX3ByZXBhcmUudGhlYWQ7XHJcbiAgICAgICAgdGhpcy5fbWFpblRpdGxlSW5kZXggPSB0aGlzLl9wcmVwYXJlLm1haW5UaXRsZUluZGV4O1xyXG4gICAgICAgIHRoaXMuX3Jvd3MgPSB0aGlzLl9wcmVwYXJlLnJvd3M7XHJcbiAgICAgICAgdGhpcy5fcm93c0NsYXNzZXMgPSB0aGlzLl9wcmVwYXJlLnJvd3NDbGFzc2VzO1xyXG4gICAgfVxyXG5cclxuICAgIF9jcmVhdGVUYWJsZUZpdHMoKSB7XHJcbiAgICAgICAgdGhpcy5fdGFibGVGaXRzRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB0aGlzLl90YWJsZUZpdHNFbC5jbGFzc0xpc3QuYWRkKHRoaXMuX2NvbmZpZy5tYWluQ2xhc3MpO1xyXG5cclxuICAgICAgICBDcmVhdGUubWFrZSh0aGlzLl90YWJsZUZpdHNFbClcclxuICAgICAgICAgICAgLnNldE1haW5DbGFzcyh0aGlzLl9jb25maWcubWFpbkNsYXNzKVxyXG4gICAgICAgICAgICAuc2V0UHJlcGFyZSh0aGlzLl9wcmVwYXJlKVxyXG4gICAgICAgICAgICAuY3JlYXRlKCk7XHJcbiAgICB9XHJcblxyXG59Il0sIm5hbWVzIjpbImxldCIsInRoaXMiLCJjb2x1bW5zX190aXRsZSIsIkRvbUNoYW5nZSIsIlByZXBhcmUiLCJDcmVhdGUiXSwibWFwcGluZ3MiOiI7OztBQUFBQSxJQUFJLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxNQUFNLENBQUMsc0JBQXNCO0lBQzNFLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQzs7QUFFckQsSUFBcUIsMkJBQTJCLEdBQUM7O0FBQUEsNEJBRTdDLFFBQWUsc0JBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRTtJQUMv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