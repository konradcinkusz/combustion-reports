import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Items from './Items';
import './ListMain.css';
import { actionCreators } from '../store/Fuel';
import { FormErrors } from './FormErrors';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

class Fuel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fuelType: '',
      fuelPrice: 0,
      formErrors: { fuelType: '', fuelPrice: '' },
      friendlyNames: {
        fuelType: 'Pole typ paliwa',
        fuelPrice: 'Pole cena paliwa'
      },
      fuelTypeValid: '',
      fuelPriceValid: '',
      formValid: false
    };

    this.addItem = this.addItem.bind(this);
  }

  addItem(e) {
    var itemToAdd = {
      fuelType: this._inputElementName.value,
      fuelPrice: this._inputElementPrice.value,
      key: Date.now()
    };

    this.props.addFuel(itemToAdd);

    this._inputElementName.value = '';
    this._inputElementPrice.value = '';

    var value = '';

    this.setState(
      {
        fuelType: value,
        fuelPrice: value
      },
      () => {
        this.validateField('clean', value);
      }
    );

    e.preventDefault();
  }

  // #region Funkcje walidacyjne
  setEventState(e, value = '') {
    const name = e.target.name;
    this.setState({ [name]: value }, () => {
      this.validateField(name, value);
    });
  }

  blurUserInput(e) {
    if (e.target.value.length > 0) {
      return;
    }
    this.setEventState(e);
  }

  handleUserInput(e) {
    this.setEventState(e, e.target.value);
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let fuelTypeValid = this.state.fuelTypeValid;
    let fuelPriceValid = this.state.fuelPriceValid;

    switch (fieldName) {
      case 'fuelType':
        var str = new String(value);
        fuelTypeValid = str.length > 3;
        var isempty = str.length === 0;
        if (isempty) {
          fuelTypeValid = '';
          fieldValidationErrors.fuelType = '';
          break;
        }
        fieldValidationErrors.fuelType = fuelTypeValid
          ? ''
          : 'jest za krótkie (przynajmniej 3 znaki)!';
        if (
          this.props.fuelItems.fuels.filter(
            data => data.fuelType.toLowerCase() === value.toLowerCase()
          ).length > 0
        ) {
          fuelTypeValid = false;
          fieldValidationErrors.fuelType =
            'zawiera paliwo, które już zostało dodane, wprowadź inna nazwę.';
        }
        break;
      case 'fuelPrice':
        var str = new String(value);
        if (str.length === 0) {
          fuelPriceValid = '';
          fieldValidationErrors.fuelPrice = '';
          break;
        }
        fuelPriceValid = !isNaN(parseFloat(value));
        fieldValidationErrors.fuelPrice = fuelPriceValid
          ? ''
          : 'może zawierać tylko liczby! (Mogą być zmiennoprzecinkowe).';
        break;
      case 'clean':
        fuelTypeValid = '';
        fieldValidationErrors.fuelType = '';
        fuelPriceValid = '';
        fieldValidationErrors.fuelPrice = '';
        break;
      default:
        break;
    }

    this.setState(
      {
        formErrors: fieldValidationErrors,
        fuelTypeValid: fuelTypeValid,
        fuelPriceValid: fuelPriceValid
      },
      this.validateForm
    );
  }

  validateForm() {
    this.setState({
      formValid: this.state.fuelTypeValid && this.state.fuelPriceValid
    });
  }

  errorFuelTypeClass(error) {
    if (typeof error === 'string' || typeof error === 'undefined') {
      return '';
    }
    return error ? 'is-valid' : 'is-invalid'; //Bootstrap v4
  }
  // #endregion

  render() {
    var fuelItems = this.props.fuelItems.fuels.map(function(value) {
      return {
        value: value.key,
        label: value.fuelType + ' ' + value.fuelPrice
      };
    });

    return (
      <div className="listMain">
        <h2>Wprowadź swoje paliwo lub wybierz proponowane z listy.</h2>
        <div>
          <FormErrors
            formErrors={this.state.formErrors}
            friendlyNames={this.state.friendlyNames}
          />
        </div>
        <div className="header">
          <form role="form" onSubmit={this.addItem}>
            <div className="form-group">
              <input
                name="fuelType"
                className={`form-control ${this.errorFuelTypeClass(
                  this.state.fuelTypeValid
                )}`}
                ref={a => (this._inputElementName = a)}
                placeholder="Nazwa paliwa"
                onChange={event => this.handleUserInput(event)}
                onBlur={event => this.blurUserInput(event)}
              />
            </div>
            <div className="form-group">
              <input
                name="fuelPrice"
                className={`form-control ${this.errorFuelTypeClass(
                  this.state.fuelPriceValid
                )}`}
                ref={a => (this._inputElementPrice = a)}
                placeholder="Cena paliwa"
                onChange={event => this.handleUserInput(event)}
                onBlur={event => this.blurUserInput(event)}
              />
            </div>
            <div className="form-group">
              <Dropdown
                ref={a => (this._dropDownElement = a)}
                className="buttons"
                options={fuelItems}
                placeholder="Proponowane paliwa"
              />
            </div>
            <button type="submit" disabled={!this.state.formValid}>
              Dodaj
            </button>
          </form>
        </div>
        <div className="internalItems">
          <Items
            entries={fuelItems.map(function(item) {
              return {
                friendlyName: item.label,
                key: item.value
              };
            })}
            delete={this.props.removeFuel}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({ fuelItems: state.fuelItems }),
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Fuel);
