import debounce from 'lodash/debounce';
import Component from '../../component.js';
// /* global _: true */
// const { debounce } = _;

const QUERY_CHANGE_DELAY = 600;

export default class Filter extends Component {
  constructor({ element }) {
    super({ element });

    this._render();

    this._queryField = this._element.querySelector('[data-element="query-field"]');
    this._orderField = this._element.querySelector('[data-element="order-field"]');

    this.on('change', 'order-field', () => {
      this.emit('order-changed');
    });

    const emitQueryChangedWithDebounce = debounce(
      () => {
        this.emit('query-changed');
      },
      QUERY_CHANGE_DELAY,
    );

    this.on('input', 'query-field', emitQueryChangedWithDebounce);
  }

  getCurrentData() {
    return this._queryField.value;
  }

  _render() {
    this._element.innerHTML = `
      <p>
        Search:
        <input data-element="query-field">
      </p>
    `;
  }
}
