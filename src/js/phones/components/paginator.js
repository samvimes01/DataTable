import Component from '../../component.js';

export default class Paginator extends Component {
  constructor({ element, props }) {
    super({ element });

    this._props = { ...props };
    // this._state = { currentPage: 1 };

    this._render();

    this._addEventListeners();
  }

  get pages() {
    const pages = [];
    const { pagesCount } = this._props;

    for (let i = 1; i <= pagesCount; i++) {
      pages.push(i);
    }

    return pages;
  }

  _updateView() {
    this._render();
  }

  _addEventListeners() {
    this.on('click', 'page-button', ({ target }) => {
      this._setPage(target.dataset.page);
    });

    this.on('click', 'prev-button', () => {
      this._setPage(this._props.currentPage - 1);
    });

    this.on('click', 'next-button', () => {
      this._setPage(this._props.currentPage + 1);
    });

    this.on('change', 'per-page-select', ({ target }) => {
      const perPage = +target.value;
      this._setPerPage(perPage);
    });
  }

  _setPage(page) {
    const { pagesCount } = this._props;
    const correctPage = Math.min(
      Math.max(1, page), pagesCount,
    );

    this.emit('page-changed', correctPage);
  }

  _setPerPage(perPage) {
    this.emit('per-page-changed', perPage);
  }

  _render() {
    const {
      currentPage, perPage, selector, info, totalItems,
    } = this._props;
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;

    this._element.innerHTML = `
    ${selector
    ? `<select data-element="per-page-select">
        ${ [3, 5, 10, 20].map(option => `
          <option
            value="${ option }"
            ${ +option === perPage ? 'selected' : '' }
          >
            ${ option }
          </option>
        `).join('') }
        <option></option>
      </select>`
    : ''}
      <span data-element="prev-button" class="paginator__page-button"><-</span>
      
      ${ this.pages.map(page => `
        <span
          data-element="page-button"
          data-page="${ page }"
          class="paginator__page-button${ (page === currentPage) ? ' paginator__page-button--current"' : '' }"
        >
          ${ page }
        </span>
      `).join('')}
      
      <span data-element="next-button" class="paginator__page-button">-></span>
  ${
  info
    ? `<span data-element="page-info" class="paginator__page-info">
         Show ${startIndex + 1} to ${Math.min(endIndex, totalItems)} phones from  ${totalItems}
       </span>`
    : ''}
    `;
  }
}
