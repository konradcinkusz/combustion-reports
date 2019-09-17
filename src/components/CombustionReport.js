import React, { Component } from "react"
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/CombustionReport';
import { FormErrors } from './FormErrors';
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import Items from './Items'
import Polynomial from "./Polynomial";

class CombustionReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            routeKilometers: 0,
            averageCombusiton: 0,
            averageSpeed: 0,
            formErrors: { routeKilometers: 0, averageCombusiton: 0, averageSpeed: 0 },
            friendlyNames: { routeKilometers: 'Pole długość trasy', averageCombusiton: 'Pole średnie spalanie', averageSpeed: 'Pole średnia prędkość' },
            routeKilometersValid: '',
            averageCombusitonValid: '',
            averageSpeedValid: '',
            formValid: false,
            selectedCombustions: [],
            selectedCarKey: ''
        }

        this.addItem = this.addItem.bind(this);
        this.loadReports = this.loadReports.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
    }

    addItem(e) {
        if (typeof this._dropDownElement === 'undefined' || this._dropDownElement.state.selected.value === "") {
            //TODO: To wystąpi w momencie, kiedy nie ustawimy value na dropdownie
            //Tu trzeba wyrzucić jakiś exception
            e.preventDefault();
            return;
        }

        var value = this._dropDownElement.state.selected.value;
        var selectedCar =
            this.props.cars.filter(function (x) {
                return (x.key === value);
            })

        var routeKM = this._inputElementRouteKilometers.value;
        var aveCombustion = this._inputElementAverageCombustion.value;
        var aveSpeed = this._inputElementAverageSpeed.value;

        var itemToAdd = {
            routeKilometers: parseFloat(routeKM),
            averageCombusiton: parseFloat(aveCombustion),
            averageSpeed: parseFloat(aveSpeed),
            carKey: this._dropDownElement.state.selected.value,
            key: Date.now()
        }

        this.props.addReport(itemToAdd);

        this._inputElementRouteKilometers.value = "";
        this._inputElementAverageCombustion.value = "";
        this._inputElementAverageSpeed.value = "";

        var value = ''

        var innerSelectedCombustions = this.state.selectedCombustions;

        var x = "KM: {0}; średnie spalanie: {1}; średnia prędkość: {2}.";
        x = x.replace(/\{0\}/g, itemToAdd.routeKilometers);
        x = x.replace(/\{1\}/g, itemToAdd.averageCombusiton);
        x = x.replace(/\{2\}/g, itemToAdd.averageSpeed);

        this.setState({
            'routeKilometers': value,
            'averageCombusiton': value,
            'averageSpeed': value,
            selectedCombustions: [...innerSelectedCombustions, {
                friendlyName: x,
                key: itemToAdd.key,
                averageCombusiton: itemToAdd.averageCombusiton,
                averageSpeed: itemToAdd.averageSpeed,
                routeKilometers: itemToAdd.routeKilometers
            }]
        }, () => { this.validateField('clean', value) });


        e.preventDefault()
    }

    deleteItem(item) {
        var selectedCarKey = 'undefined'
        if (typeof this._dropDownElement !== 'undefined') {
            selectedCarKey = this._dropDownElement.state.selected.value;
        }
        this.setState({
            selectedCombustions: this.state.selectedCombustions.filter(function (x) {
                return (x.key !== item.key)
            }),
            selectedCarKey: selectedCarKey
        })

        this.props.removeReport(item)
    }

    loadReports(e) {
        var combustions =
            this.props.combustionReports.filter(function (x) {
                return (x.carKey === e.value);
            })
        combustions =
            combustions.map(function (item) {
                var x = "KM: {0}; średnie spalanie: {1}; średnia prędkość: {2}.";
                x = x.replace(/\{0\}/g, item.routeKilometers);
                x = x.replace(/\{1\}/g, item.averageCombusiton);
                x = x.replace(/\{2\}/g, item.averageSpeed);
                return {
                    friendlyName: x,
                    key: item.key,
                    averageCombusiton: item.averageCombusiton,
                    averageSpeed: item.averageSpeed,
                    routeKilometers: item.routeKilometers
                }
            });

        this.setState({
            selectedCombustions: combustions,
            selectedCarKey: e.value
        })
    }

    // #region Funkcje walidacyjne
    blurUserInput(e) {
        if (e.target.value.length > 0) {
            return;
        }
        const name = e.target.name;
        const value = '';
        this.setState({ [name]: value },
            () => { this.validateField(name, value) });
    }

    handleUserInput(e) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value },
            () => { this.validateField(name, value) });
    }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let routeKilometersValid = this.state.routeKilometersValid;
        let averageCombusitonValid = this.state.averageCombusitonValid;
        let averageSpeedValid = this.state.averageSpeedValid;

        switch (fieldName) {
            case 'routeKilometers':
                var str = new String(value);
                if (str.length === 0) {
                    routeKilometersValid = ''
                    fieldValidationErrors.routeKilometers = ''
                    break;
                }
                var floatValue = parseFloat(value);
                routeKilometersValid = !isNaN(floatValue);
                fieldValidationErrors.routeKilometersValid = routeKilometersValid ? '' : 'może zawierać tylko liczby! (Mogą być zmiennoprzecinkowe).';
                break;
            case 'averageCombusiton':
                var str = new String(value);
                if (str.length === 0) {
                    averageCombusitonValid = ''
                    fieldValidationErrors.averageCombusiton = ''
                    break;
                }
                var floatValue = parseFloat(value);
                averageCombusitonValid = !isNaN(floatValue);
                fieldValidationErrors.averageCombusiton = averageCombusitonValid ? '' : 'może zawierać tylko liczby! (Mogą być zmiennoprzecinkowe).';
                break;
            case 'averageSpeed':
                var str = new String(value);
                if (str.length === 0) {
                    averageSpeedValid = ''
                    fieldValidationErrors.averageSpeed = ''
                    break;
                }
                var floatValue = parseFloat(value);
                averageSpeedValid = !isNaN(floatValue);
                fieldValidationErrors.averageSpeed = averageSpeedValid ? '' : 'może zawierać tylko liczby! (Mogą być zmiennoprzecinkowe).';
                break;
            case 'clean':
                routeKilometersValid = ''
                fieldValidationErrors.routeKilometers = ''

                averageCombusitonValid = ''
                fieldValidationErrors.averageCombusiton = ''

                averageSpeedValid = ''
                fieldValidationErrors.averageSpeed = ''
                break;
            default:
                break;
        }

        this.setState({
            formErrors: fieldValidationErrors,
            routeKilometersValid: routeKilometersValid,
            averageCombusitonValid: averageCombusitonValid,
            averageSpeedValid: averageSpeedValid
        }, this.validateForm);
    }

    validateForm() {
        this.setState(
            { formValid: this.state.routeKilometersValid && this.state.routeKilometersValid && this.state.averageSpeedValid });
    }

    errorFuelTypeClass(error) {
        if (typeof error === 'string' || typeof error === 'undefined') {
            return '';
        }
        return (error ? 'is-valid' : 'is-invalid');//Bootstrap v4
    }
    // #endregion

    componentWillUpdate() {
        //TODO: Konrad - tutaj wykonać wszystkie funkcje przed renderem
    }

    componentWillMount() {
        var carItems = this.props.cars.map(function (value) {
            return {
                value: value.key,
                label: value.carType
            };
        });

        var defaultCarOption = carItems.length > 0 ? carItems[0] : ''
        var selectedCarKey = defaultCarOption.value;
        if (typeof this._dropDownElement !== 'undefined') {
            selectedCarKey = this._dropDownElement.state.selected.value;
        }
        var combustions =
            this.props.combustionReports.filter(function (x) {
                return (x.carKey === selectedCarKey);
            })
        combustions =
            combustions.map(function (item) {
                var x = "KM: {0}; średnie spalanie: {1}; średnia prędkość: {2}.";
                x = x.replace(/\{0\}/g, item.routeKilometers);
                x = x.replace(/\{1\}/g, item.averageCombusiton);
                x = x.replace(/\{2\}/g, item.averageSpeed);
                return {
                    friendlyName: x,
                    key: item.key,
                    averageCombusiton: item.averageCombusiton,
                    averageSpeed: item.averageSpeed,
                    routeKilometers: item.routeKilometers
                }
            });
        this.setState({
            selectedCombustions: combustions,
            selectedCarKey: selectedCarKey
        })
    }

    render() {
        var carItems = this.props.cars.map(function (value) {
            return {
                value: value.key,
                label: value.carType
            };
        });
        var defaultCarOption = carItems.length > 0 ? carItems[0] : '';
        var selectedCarKey = this.state.selectedCarKey;
        if (typeof this._dropDownElement !== 'undefined') {
            var carIdx = carItems.map(function (e) { return e.value; }).indexOf(selectedCarKey);
            defaultCarOption = carItems[carIdx]
        }

        return (
            <div className="listMain">
                <h2>Wybierz samochód z listy</h2>
                <div className="row">
                    <div className="col-md-4">
                        <Dropdown
                            ref={a => (this._dropDownElement = a)}
                            //className={`${this.errorFuelTypeClass(this.state.carFuelDropDownValid)}`}
                            options={carItems}
                            placeholder="Wybierz samochód"
                            value={defaultCarOption}
                            onChange={this.loadReports}
                        />
                    </div>
                    <div className="col-md-4">

                    </div>
                    <div className="col-md-4">

                    </div>
                </div>
                <h2>Wprowadź raport spalania</h2>
                <div>
                    <FormErrors formErrors={this.state.formErrors} friendlyNames={this.state.friendlyNames} />
                </div>
                <div>
                    <form role="form" onSubmit={this.addItem}>
                        <div className="form-group">
                            <input
                                name="routeKilometers"
                                className={`form-control ${this.errorFuelTypeClass(this.state.routeKilometersValid)}`}
                                ref={(a) => this._inputElementRouteKilometers = a}
                                placeholder="Długość trasy w km"
                                onChange={(event) => this.handleUserInput(event)}
                                onBlur={(event) => this.blurUserInput(event)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                name="averageCombusiton"
                                className={`form-control ${this.errorFuelTypeClass(this.state.averageCombusitonValid)}`}
                                ref={(a) => this._inputElementAverageCombustion = a}
                                placeholder="Średnie spalanie"
                                onChange={(event) => this.handleUserInput(event)}
                                onBlur={(event) => this.blurUserInput(event)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                name="averageSpeed"
                                className={`form-control ${this.errorFuelTypeClass(this.state.averageSpeedValid)}`}
                                ref={(a) => this._inputElementAverageSpeed = a}
                                placeholder="Średnia prędkość"
                                onChange={(event) => this.handleUserInput(event)}
                                onBlur={(event) => this.blurUserInput(event)}
                            />
                        </div>
                        <button type="submit" disabled={!this.state.formValid}>Dodaj</button>
                    </form>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <h2>Raporty spalania:</h2>
                        <div className="internalItems">
                            <Items
                                entries={this.state.selectedCombustions}
                                delete={this.deleteItem} />
                        </div>
                    </div>
                    <div className="col-md-8">
                        <Polynomial
                            entries={this.state.selectedCombustions.map(function (item) {
                                return { x: item.averageSpeed, y: item.averageCombusiton }
                            })}
                            order={3}
                            plotTitle="<b>Średnia prędkość do spalania</b>"
                            id={123}
                            carKey={selectedCarKey}
                            plotType="combustionSpeed"
                        />
                        <Polynomial
                            entries={this.state.selectedCombustions.map(function (item) {
                                return { x: item.routeKilometers, y: item.averageCombusiton }
                            })}
                            order={3}
                            plotTitle="<b>Średnia dł. trasy do spalania</b>"
                            id={456}
                            carKey={selectedCarKey}
                            plotType="combustionRoute"
                        />
                    </div>
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
)(CombustionReport);