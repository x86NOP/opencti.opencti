import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import * as R from 'ramda';
import { QueryRenderer } from '../../../relay/environment';
import ListLines from '../../../components/list_lines/ListLines';
import inject18n from '../../../components/i18n';
import {
  buildViewParamsFromUrlAndStorage,
  convertFilters,
  saveViewParameters,
} from '../../../utils/ListParameters';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../utils/Security';
import ToolBar from '../data/ToolBar';
import ArtifactsLines, {
  artifactsLinesQuery,
} from './artifacts/ArtifactsLines';
import ArtifactCreation from './artifacts/ArtifactCreation';
import { isUniqFilter } from '../common/lists/Filters';

class StixCyberObservables extends Component {
  constructor(props) {
    super(props);
    const params = buildViewParamsFromUrlAndStorage(
      props.history,
      props.location,
      'view-artifacts',
    );
    this.state = {
      sortBy: R.propOr('created_at', 'sortBy', params),
      orderAsc: R.propOr(false, 'orderAsc', params),
      searchTerm: R.propOr('', 'searchTerm', params),
      view: R.propOr('lines', 'view', params),
      filters: R.propOr({}, 'filters', params),
      openExports: false,
      numberOfElements: { number: 0, symbol: '' },
      selectedElements: null,
      selectAll: false,
    };
  }

  saveView() {
    saveViewParameters(
      this.props.history,
      this.props.location,
      'view-artifacts',
      this.state,
    );
  }

  handleSearch(value) {
    this.setState({ searchTerm: value }, () => this.saveView());
  }

  handleSort(field, orderAsc) {
    this.setState({ sortBy: field, orderAsc }, () => this.saveView());
  }

  handleToggleExports() {
    this.setState({ openExports: !this.state.openExports });
  }

  handleToggleSelectEntity(entity, event) {
    event.stopPropagation();
    event.preventDefault();
    const { selectedElements } = this.state;
    if (entity.id in (selectedElements || {})) {
      const newSelectedElements = R.omit([entity.id], selectedElements);
      this.setState({
        selectAll: false,
        selectedElements: newSelectedElements,
      });
    } else {
      const newSelectedElements = R.assoc(
        entity.id,
        entity,
        selectedElements || {},
      );
      this.setState({
        selectAll: false,
        selectedElements: newSelectedElements,
      });
    }
  }

  handleToggleSelectAll() {
    this.setState({ selectAll: !this.state.selectAll, selectedElements: null });
  }

  handleClearSelectedElements() {
    this.setState({ selectAll: false, selectedElements: null });
  }

  handleAddFilter(key, id, value, event = null) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.state.filters[key] && this.state.filters[key].length > 0) {
      this.setState(
        {
          filters: R.assoc(
            key,
            isUniqFilter(key)
              ? [{ id, value }]
              : R.uniqBy(R.prop('id'), [
                { id, value },
                ...this.state.filters[key],
              ]),
            this.state.filters,
          ),
        },
        () => this.saveView(),
      );
    } else {
      this.setState(
        {
          filters: R.assoc(key, [{ id, value }], this.state.filters),
        },
        () => this.saveView(),
      );
    }
  }

  handleRemoveFilter(key) {
    this.setState({ filters: R.dissoc(key, this.state.filters) }, () => this.saveView());
  }

  setNumberOfElements(numberOfElements) {
    this.setState({ numberOfElements });
  }

  renderLines(paginationOptions) {
    const {
      sortBy,
      orderAsc,
      searchTerm,
      filters,
      openExports,
      numberOfElements,
      selectedElements,
      selectAll,
    } = this.state;
    let numberOfSelectedElements = Object.keys(selectedElements || {}).length;
    if (selectAll) {
      numberOfSelectedElements = numberOfElements.original;
    }
    let finalFilters = filters;
    finalFilters = R.assoc(
      'entity_type',
      [{ id: 'Artifact', value: 'Artifact' }],
      finalFilters,
    );
    const dataColumns = {
      observable_value: {
        label: 'Value',
        width: '15%',
        isSortable: false,
      },
      file_name: {
        label: 'File name',
        width: '20%',
        isSortable: false,
      },
      file_mime_type: {
        label: 'Mime/Type',
        width: '15%',
        isSortable: false,
      },
      file_size: {
        label: 'File size',
        width: '10%',
        isSortable: false,
      },
      objectLabel: {
        label: 'Labels',
        width: '15%',
        isSortable: false,
      },
      created_at: {
        label: 'Creation date',
        width: '15%',
        isSortable: true,
      },
      objectMarking: {
        label: 'Marking',
        isSortable: false,
      },
    };
    return (
      <div>
        <ListLines
          sortBy={sortBy}
          orderAsc={orderAsc}
          dataColumns={dataColumns}
          handleSort={this.handleSort.bind(this)}
          handleSearch={this.handleSearch.bind(this)}
          handleAddFilter={this.handleAddFilter.bind(this)}
          handleRemoveFilter={this.handleRemoveFilter.bind(this)}
          handleToggleExports={this.handleToggleExports.bind(this)}
          openExports={openExports}
          handleToggleSelectAll={this.handleToggleSelectAll.bind(this)}
          selectAll={selectAll}
          exportEntityType="Artifact"
          exportContext={null}
          keyword={searchTerm}
          filters={filters}
          iconExtension={true}
          paginationOptions={paginationOptions}
          numberOfElements={numberOfElements}
          availableFilterKeys={[
            'labelledBy',
            'markedBy',
            'created_at_start_date',
            'created_at_end_date',
            'createdBy',
          ]}
        >
          <QueryRenderer
            query={artifactsLinesQuery}
            variables={{ count: 25, ...paginationOptions }}
            render={({ props }) => (
              <ArtifactsLines
                data={props}
                paginationOptions={paginationOptions}
                dataColumns={dataColumns}
                initialLoading={props === null}
                onLabelClick={this.handleAddFilter.bind(this)}
                selectedElements={selectedElements}
                onToggleEntity={this.handleToggleSelectEntity.bind(this)}
                selectAll={selectAll}
                setNumberOfElements={this.setNumberOfElements.bind(this)}
              />
            )}
          />
        </ListLines>
        <ToolBar
          selectedElements={selectedElements}
          numberOfSelectedElements={numberOfSelectedElements}
          selectAll={selectAll}
          filters={finalFilters}
          handleClearSelectedElements={this.handleClearSelectedElements.bind(
            this,
          )}
        />
      </div>
    );
  }

  render() {
    const {
      view, sortBy, orderAsc, searchTerm, filters, openExports,
    } = this.state;
    const finalFilters = convertFilters(filters);
    const paginationOptions = {
      types: ['Artifact'],
      search: searchTerm,
      filters: finalFilters,
      orderBy: sortBy,
      orderMode: orderAsc ? 'asc' : 'desc',
    };
    return (
      <div>
        {view === 'lines' ? this.renderLines(paginationOptions) : ''}
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <ArtifactCreation
            paginationKey="Pagination_stixCyberObservables"
            paginationOptions={paginationOptions}
            openExports={openExports}
          />
        </Security>
      </div>
    );
  }
}

StixCyberObservables.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default R.compose(inject18n, withRouter)(StixCyberObservables);
