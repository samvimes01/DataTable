import Component from '../component.js';
import DataTable from './components/data-table.js';
import PhoneService from './services/phone-service.js';

export default class PhonesPage extends Component {
  constructor({ element }) {
    super({ element });

    this._render();

    this._initDataTable();

    this._getPhones();
  }

  _initDataTable() {
    // eslint-disable-next-line no-unused-vars
    this._dataTable = new DataTable({
      element: document.querySelector('[data-component="data-table"]'),
      items: this._state.phones,

      columnConfig: {
        name: {
          title: 'Название', // в таблице колонка будет так называться
          isSortable: true, // Поиск будет проверять эту и последнюю колонки
          isSearchable: true,
        },
        age: {
          title: 'Возраст',
          isSortable: true, // по этой колонке можно сортировать
        },
        snippet: { // Только для тех ключей которые есть в columnConfig будут колонки в таблице
          title: 'Описание',
          isSearchable: true, // В этой колонке тоже будет происходить поиск query
        },
      },
    });
  }

  _updateView() {
    const { phones } = this._state;
    this._dataTable.setProps({ items: phones });
  }

  async _getPhones() {
    const phones = await PhoneService.getAll();

    this.setState({
      phones,
    });
  }

  _render() {
    this._element.innerHTML = `
      <div data-component="data-table" class="datatable"></div>
    `;
  }
}
