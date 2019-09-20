import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Car';
import { FormErrors } from './FormErrors';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import Items from './Items';
import regression from 'regression';

class Car extends Component {
  constructor(props) {
    super(props);

    this.state = {
      carType: '',
      carAverageCatalogueCityCombusiton: 0,
      carAverageCatalogueRouteCombusiton: 0,
      formErrors: {
        carType: '',
        carFuelDropDown: '',
        carAverageCatalogueCityCombusiton: 0,
        carAverageCatalogueRouteCombusiton: 0
      },
      friendlyNames: {
        carType: 'Pole typ/marka samochodu',
        carFuelDropDown: 'Pole wybierz paliwo',
        carAverageCatalogueCityCombusiton: 'Pole średnie spalanie w mieście',
        carAverageCatalogueRouteCombusiton: 'Pole średnie spalanie w trasie'
      },
      carTypeValid: '',
      carFuelDropDownValid: '',
      carAverageCatalogueCityCombusitonValid: '',
      carAverageCatalogueRouteCombusitonValid: '',
      formValid: false
    };

    this.addItem = this.addItem.bind(this);
  }

  addItem(e) {
    var fuelKey = this._dropDownElement.state.selected.value;
    if (fuelKey === '') {
      let fieldValidationErrors = this.state.formErrors;
      fieldValidationErrors.carFuelDropDown = 'nie wybrano z listy.';
      this.setState(
        {
          formErrors: fieldValidationErrors,
          carFuelDropDownValid: false
        },
        this.validateForm
      );
    } else {
      var itemToAdd = {
        carType: this._inputElementName.value,
        carFuelKey: fuelKey,
        carAverageCatalogueCityCombusiton: this._inputElementCityCombustion
          .value,
        carAverageCatalogueRouteCombusiton: this._inputElementRouteCombustion
          .value,
        carCoefficient: 'undefined',
        key: Date.now()
      };

      this.props.addCar(itemToAdd);

      this._inputElementName.value = '';
      this._inputElementCityCombustion.value = '';
      this._inputElementRouteCombustion.value = '';

      var value = '';

      this.setState(
        {
          carType: '',
          carAverageCatalogueCityCombusiton: 0,
          carAverageCatalogueRouteCombusiton: 0
        },
        () => {
          this.validateField('clean', value);
        }
      );
    }

    e.preventDefault();
  }

  // #region Funkcje walidacyjne
  blurUserInput(e) {
    if (e.target.value.length > 0) {
      return;
    }
    const name = e.target.name;
    const value = '';
    this.setState({ [name]: value }, () => {
      this.validateField(name, value);
    });
  }

  handleUserInput(e) {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value }, () => {
      this.validateField(name, value);
    });
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let carTypeValid = this.state.carTypeValid;
    let carAverageCatalogueCityCombusitonValid = this.state
      .carAverageCatalogueCityCombusitonValid;
    let carAverageCatalogueRouteCombusitonValid = this.state
      .carAverageCatalogueRouteCombusitonValid;

    switch (fieldName) {
      case 'carType':
        var str = new String(value);
        carTypeValid = str.length > 3;
        var isempty = str.length === 0;
        if (isempty) {
          carTypeValid = '';
          fieldValidationErrors.carType = '';
          break;
        }
        fieldValidationErrors.carType = carTypeValid
          ? ''
          : 'jest za krótkie (przynajmniej 3 znaki)!';
        if (
          this.props.cars.filter(
            data => data.carType.toLowerCase() === value.toLowerCase()
          ).length > 0
        ) {
          carTypeValid = false;
          fieldValidationErrors.carType =
            'zawiera paliwo, które już zostało dodane, wprowadź inna nazwę.';
        }
        break;
      case 'carAverageCatalogueCityCombusiton':
        var str = new String(value);
        if (str.length === 0) {
          carAverageCatalogueCityCombusitonValid = '';
          fieldValidationErrors.carAverageCatalogueCityCombusiton = '';
          break;
        }
        var floatValue = parseFloat(value);
        carAverageCatalogueCityCombusitonValid = !isNaN(floatValue);
        fieldValidationErrors.carAverageCatalogueCityCombusiton = carAverageCatalogueCityCombusitonValid
          ? ''
          : 'może zawierać tylko liczby! (Mogą być zmiennoprzecinkowe).';
        break;
      case 'carAverageCatalogueRouteCombusiton':
        var str = new String(value);
        if (str.length === 0) {
          carAverageCatalogueRouteCombusitonValid = '';
          fieldValidationErrors.carAverageCatalogueRouteCombusiton = '';
          break;
        }
        var floatValue = parseFloat(value);
        carAverageCatalogueRouteCombusitonValid = !isNaN(floatValue);
        fieldValidationErrors.carAverageCatalogueRouteCombusiton = carAverageCatalogueRouteCombusitonValid
          ? ''
          : 'może zawierać tylko liczby! (Mogą być zmiennoprzecinkowe).';
        break;
      case 'clean':
        carTypeValid = '';
        fieldValidationErrors.carType = '';
        carAverageCatalogueCityCombusitonValid = '';
        fieldValidationErrors.carAverageCatalogueCityCombusiton = '';
        carAverageCatalogueRouteCombusitonValid = '';
        fieldValidationErrors.carAverageCatalogueRouteCombusiton = '';
        break;
      default:
        break;
    }

    this.setState(
      {
        formErrors: fieldValidationErrors,
        carTypeValid: carTypeValid,
        carAverageCatalogueCityCombusitonValid: carAverageCatalogueCityCombusitonValid,
        carAverageCatalogueRouteCombusitonValid: carAverageCatalogueRouteCombusitonValid
      },
      this.validateForm
    );
  }

  validateForm() {
    this.setState({
      formValid:
        this.state.carTypeValid && this.state.carAverageCatalogueCityCombusiton
    });
  }

  errorFuelTypeClass(error) {
    if (typeof error === 'string' || typeof error === 'undefined') {
      return '';
    }
    return error ? 'is-valid' : 'is-invalid'; //Bootstrap v4
  }
  // #endregion

  componentWillMount() {
    var combustionReports = this.props.combustionReports;
    var cars = this.props.cars;

    cars.forEach(function(carItem) {
      //x - spalanie, prędkość na y
      var combustionVelocityData = [];
      combustionVelocityData.push([0, 0]);
      combustionReports.forEach(function(item) {
        if (carItem.key === item.carKey) {
          combustionVelocityData.push([
            item.averageSpeed,
            item.averageCombusiton
          ]);
        }
      });

      var data = combustionVelocityData;
      var resultCombustionVelocityData = regression.polynomial(data, {
        order: 2
      }); //degree of polynomial

      var combustionRouteData = [];
      combustionRouteData.push([0, 0]);
      combustionReports.forEach(function(item) {
        if (carItem.key === item.carKey) {
          combustionRouteData.push([
            item.routeKilometers,
            item.averageCombusiton
          ]);
        }
      });

      var dataRoute = combustionRouteData;
      var resultCombustionRouteData = regression.polynomial(dataRoute, {
        order: 2
      }); //degree of polynomial

      carItem.combustionVelocityPoly = resultCombustionVelocityData;
      carItem.combustionRoutePoly = resultCombustionRouteData;
    });
    for (var i = 0; i < cars.length; i++) {
      this.props.updateCarPoly(cars[i]);
    }
  }
  render() {
    var fuelItems = this.props.fuelItems.fuels.map(function(value) {
      return {
        value: value.key,
        label: value.fuelType + ' - cena: ' + value.fuelPrice
      };
    });
    var defaultFuelOption = fuelItems.length > 0 ? fuelItems[0] : '';
    return (
      <div className="listMain">
        <h2>Wprowadź samochód</h2>
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
                name="carType"
                className={`form-control ${this.errorFuelTypeClass(
                  this.state.carTypeValid
                )}`}
                ref={a => (this._inputElementName = a)}
                placeholder="Nazwa samochodu"
                onChange={event => this.handleUserInput(event)}
                onBlur={event => this.blurUserInput(event)}
              />
            </div>
            <div className="form-group">
              <input
                name="carAverageCatalogueCityCombusiton"
                className={`form-control ${this.errorFuelTypeClass(
                  this.state.carAverageCatalogueCityCombusitonValid
                )}`}
                ref={a => (this._inputElementCityCombustion = a)}
                placeholder="W mieście"
                onChange={event => this.handleUserInput(event)}
                onBlur={event => this.blurUserInput(event)}
              />
            </div>
            <div className="form-group">
              <input
                name="carAverageCatalogueRouteCombusiton"
                className={`form-control ${this.errorFuelTypeClass(
                  this.state.carAverageCatalogueRouteCombusitonValid
                )}`}
                ref={a => (this._inputElementRouteCombustion = a)}
                placeholder="W trasie"
                onChange={event => this.handleUserInput(event)}
                onBlur={event => this.blurUserInput(event)}
              />
            </div>
            <div className="form-group">
              <Dropdown
                ref={a => (this._dropDownElement = a)}
                className={`${this.errorFuelTypeClass(
                  this.state.carFuelDropDownValid
                )}`}
                options={fuelItems}
                placeholder="Wybierz paliwo"
                value={defaultFuelOption}
              />
            </div>
            <button type="submit" disabled={!this.state.formValid}>
              Dodaj
            </button>
          </form>
        </div>
        <div className="internalItems">
          <Items
            entries={this.props.cars.map(function(item) {
              var x = '{0}; miasto: {1}; trasa: {2}; paliwo: {3}';
              x = x.replace(/\{0\}/g, item.carType);
              x = x.replace(/\{1\}/g, item.carAverageCatalogueCityCombusiton);
              x = x.replace(/\{2\}/g, item.carAverageCatalogueRouteCombusiton);
              return {
                friendlyName: x,
                key: item.key
              };
            })}
            delete={this.props.removeCar}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    fuelItems: state.fuelItems,
    cars: state.cars,
    combustionReports: state.combustionReports
  }),
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Car);
