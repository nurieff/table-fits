export default class TableFits_Prepare {

    /**
     * @param {HTMLTableElement} table
     * @returns {TableFits_Prepare}
     */
    static make(table) {
        return new TableFits_Prepare(table)
    }

    /**
     * @param {HTMLTableElement} table
     */
    constructor(table) {
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

    _prepare() {
        let thead_trs = this._table.querySelectorAll('thead tr');
        [].forEach.call(thead_trs, (el) => {
            this._nextGroupIndex = 0;
            [].forEach.call(el.querySelectorAll('th'), this._prepareTH.bind(this));
        });

        this._prepareRows();
    }

    _prepareRows() {
        let trs = this._table.querySelectorAll('tr');
        let i = 0;
        [].forEach.call(trs, (tr) => {

            let tds = tr.querySelectorAll('td');

            if (tds.length < 1) return;

            if (tr.classList.length > 0) {
                this.rowsClasses[i] = Array.prototype.slice.call(tr.classList);
            }

            let row = [];

            [].forEach.call(tds, (td) => {
                row.push({
                    parent: td,
                    childNodes: Array.prototype.slice.call(td.childNodes)
                });
            });

            this.rows.push(row);
            ++i;
        });
    }

    /**
     * @param {HTMLTableCellElement} th
     * @param {Number} index
     * @private
     */
    _prepareTH(th, index) {
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
    }

    /**
     * @param {HTMLTableCellElement} th
     * @param {Number} index
     * @private
     */
    _prepareTHColspan(th, index) {
        for (let i = 0; i < th.colSpan; ++i) {
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
    _prepareTHGroup(th, index) {
        let groupIndex = th.dataset.tableFitsGroup;

        if (!(groupIndex in this._namingGroupIndex)) {
            this._namingGroupIndex[groupIndex] = index;
        }

        if (!(this._namingGroupIndex[groupIndex] in this.thead)) {
            this.thead[this._namingGroupIndex[groupIndex]] = {
                index: this._namingGroupIndex[groupIndex],
                title: groupIndex,
                columns: []
            }
        }
        this.thead[this._namingGroupIndex[groupIndex]].columns.push(th.innerText);
        this._groups[index] = this._namingGroupIndex[groupIndex];
    }
}