/* eslint-disable class-methods-use-this */
import Component from '../../component.js';
import Filter from './filter.js';
import Paginator from './paginator.js';

export default class Datatable extends Component {
  constructor({ element, items = [], columnConfig }) {
    super({ element });

    this._state = {
      currentPage: 1,
      orderedItems: [...items],
      defaultItems: [...items],
      isAllSelected: false,
      perPage: 5,
      columnConfig,
      currentQuery: '',
    };

    this._props = {
      items,
      sortKey: '',
      sortOrder: '',
    };

    this._render();

    this._initFilter();

    this._initPaginator();

    this._addEventListeners();
  }

  _addEventListeners() {
    this.on('click', 'sortable', (event) => {
      const th = event.target.closest('[data-sort-key]');
      if (!th) {
        return;
      }
      this._sortItems(th.dataset.sortKey);
    });

    this.on('click', 'allSelector', (event) => {
      const allSelector = event.target.closest('[data-element="allSelector"]');
      if (!allSelector) {
        return;
      }

      let flag = true;
      if (this._state.isAllSelected) {
        flag = false;
      }

      this._setSelectedToEveryItem(flag);

      this.setState({
        isAllSelected: flag,
      });
    });

    this.on('click', 'checker', (event) => {
      const itemId = event.target.dataset.id;
      const itemIndex = this._state.orderedItems.findIndex(item => item.id === itemId);
      if (itemIndex >= 0) {
        const isElemSelected = this._state.orderedItems[itemIndex].selected;
        this._state.orderedItems[itemIndex].selected = !isElemSelected;

        this._checkForAllSelected();
      }
    });
  }

  _setSelectedToEveryItem(flag) {
    this._state.orderedItems.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.selected = flag;
    });
  }

  _checkForAllSelected() {
    let selectedAmount = 0;
    let isAllSelected = false;
    this._state.orderedItems.forEach((item) => {
      if (item.selected) {
        selectedAmount++;
      }
    });

    if (this._state.orderedItems.length === selectedAmount) {
      isAllSelected = true;
    }

    this.setState({ isAllSelected });
  }

  get pagesCount() {
    const { perPage, orderedItems } = this._state;

    return Math.ceil(orderedItems.length / perPage);
  }

  _setPage(page) {
    const newPage = Math.min(
      Math.max(1, page), this.pagesCount,
    );

    this.setState({
      currentPage: newPage,
    });
  }

  _setPerPage(perPage) {
    this._state = {
      ...this._state,
      perPage,
    };
  }

  _initPaginator() {
    const { perPage, currentPage } = this._state;

    this._paginatorTop = new Paginator({
      element: document.querySelector('[data-component="paginator-top"]'),
      props: {
        perPage,
        currentPage,
        pagesCount: this.pagesCount,
        selector: true,
        info: false,
      },
    });

    this._paginatorBottom = new Paginator({
      element: document.querySelector('[data-component="paginator-bottom"]'),
      props: {
        perPage,
        currentPage,
        pagesCount: this.pagesCount,
        selector: false,
        info: true,
      },
    });

    this._paginatorTop.subscribe('per-page-changed', (perPageCount) => {
      this.setState({ perPage: perPageCount, currentPage: 1 });
    });

    this._paginatorTop.subscribe('page-changed', (currentPageIndex) => {
      this.setState({ currentPage: currentPageIndex });
    });

    this._paginatorBottom.subscribe('page-changed', (currentPageIndex) => {
      this.setState({ currentPage: currentPageIndex });
    });
  }

  _initFilter() {
    this._filter = new Filter({
      element: document.querySelector('[data-component="filter"]'),
    });

    this._filter.subscribe('query-changed', () => {
      this._filterItems(this._filter.getCurrentData());
    });
  }

  _filterItems(query) {
    const config = Object.entries(this._state.columnConfig);
    const regexp = new RegExp(query, 'i');

    const filteredItems = this._state.defaultItems
      .filter((item) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const entry of config) {
          const key = entry[0];
          const columnConfig = entry[1];

          if (columnConfig.isSearchable && regexp.test(item[key])) {
            return true;
          }
        }
        return false;
      });

    this._setSelectedToEveryItem(false);

    this.setState({
      currentPage: 1,
      isAllSelected: false,
      currentQuery: query,
      orderedItems: filteredItems,
    });
  }

  _sortItems(sortBy) {
    const { sortOrder } = this._props;
    let order;
    if (sortOrder === 'asc') {
      order = 'desc';
    } else {
      order = 'asc';
    }

    this._state.orderedItems
      .sort(this._sortCallback(sortBy, order));

    this.setProps({
      sortKey: sortBy,
      sortOrder: order,
    });
  }

  _sortCallback(sortBy, order) {
    if (order === 'desc') {
      return (a, b) => {
        switch (typeof a[sortBy]) {
          case 'number':
            return b[sortBy] - a[sortBy];

          case 'string':
            return b[sortBy].localeCompare(a[sortBy]);

          default:
            return 1;
        }
      };
    }
    return (a, b) => {
      switch (typeof a[sortBy]) {
        case 'number':
          return a[sortBy] - b[sortBy];

        case 'string':
          return a[sortBy].localeCompare(b[sortBy]);

        default:
          return 1;
      }
    };
  }

  _renderFilter() {
    if (!this._filter) {
      return '';
    }
    return this._filter.getCurrentData();
  }

  _setClassName(key, notSortable) {
    let className = '';
    if (this._props.sortOrder && this._props.sortKey === key) {
      className = this._props.sortOrder;
    } else if (notSortable) {
      className = 'unsorted';
    }
    return className;
  }

  _renderHeader() {
    return `
    <thead>
      <tr>
        <th>
          <input 
            type="checkbox" 
            data-element="allSelector" 
            ${this._state.isAllSelected ? 'checked' : ''}
          >
        </th>
        ${ Object.entries(this._state.columnConfig).map(([key, config]) => `
        <th
          data-element="sortable"
          class="${this._setClassName(key, config.isSortable)}"
          ${ config.isSortable ? `data-sort-key="${key}"` : ''}
        >
          ${config.title}
        </th>
        `).join('')}
      </tr>
    </thead>
    `;
  }

  _renderItem(item) {
    return `
    <tr data-element = "data-row">
    <td>
      <input 
        type="checkbox" 
        data-element="checker"
        data-id=${item.id}
        ${item.selected ? 'checked' : ''}
      >
    </td>
    ${ Object.keys(this._state.columnConfig).map(key => `
    <td>${item[key]}</td>
    `).join('')}
    </tr>
    `;
  }

  _renderTable() {
    const table = this._element.querySelector('[data-component="table-data"]');
    table.innerHTML = `
    <table class="tabledata">
      ${this._renderHeader()}
      <tbody>
      ${this._props.items.map(item => this._renderItem(item)).join('')}
      </tbody>
    </table>
    `;
  }

  _render() {
    this._element.innerHTML = `
    <div class="container">
      <div data-component="filter" class="filter">${this._state.currentQuery}</div>
      <div data-component="paginator-top" class="paginator"></div>
      <div data-component="table-data"></div>
      <div data-component="paginator-bottom" class="paginator"></div>
    </div>
    `;
  }

  _updateView() {
    // если при инициализации конструктора items был 0, то при первом запуске setProps(items),
    // инициализируем defaultItems
    if (this._state.defaultItems.length === 0) {
      this._state.defaultItems = [...this._props.items];
      this._state.orderedItems = [...this._props.items];
    }

    const { orderedItems, currentPage, perPage } = this._state;

    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const visibleItems = orderedItems.slice(startIndex, endIndex);
    this._props.items = visibleItems;

    const paginationProps = {
      pagesCount: this.pagesCount,
      currentPage,
      perPage,
      totalItems: orderedItems.length,
    };
    this._paginatorTop.setProps(paginationProps);
    this._paginatorBottom.setProps(paginationProps);

    this._renderTable();
  }

  getData() {
    return this._state.orderedItems;
  }

  getSelected() {
    return this._state.orderedItems.filter(item => item.selected);
  }
}
