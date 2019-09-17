import React, { Component } from "react"
import { FormErrors } from './FormErrors';
import TextInput from "react-autocomplete-input"
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Route';
import Items from "./Items";
import "./ListMain.css";
import { RouteTooltip } from './RouteTooltip';

class RouteReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            formErrors: { routeName: '' },
            friendlyNames: { routeName: 'Pole nazwa drogi' },
            routeNameValid: '',
            options: [
                //this.props.fuelItems.fuels.map(function (item) { return item.fuelType }),
                this.props.cars.map(function (item) { return item.carType })
            ].flat(),
            // ["dom", "wakacje", "praca", "inne", "Cactus"], //To trzeba ściągnąć z reduktora
            value: '',
            enteredOptions: [],
            friendlyText: ''
        }

        this.localTimeout = 'undefined';
        this.start = 100;
        this.startReverse = 100;

        //Working long press:
        //https://codesandbox.io/s/6jm33jz08z

        this.onMouseDown = this.onMouseDown.bind(this);
        this.repeat = this.repeat.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseUpReverse = this.onMouseUpReverse.bind(this);
        this.repeatReverse = this.repeatReverse.bind(this);
        this.onMouseDownReverse = this.onMouseDownReverse.bind(this);
        this.addItem = this.addItem.bind(this);
    }

    //#region kilometersCounter mouse events
    onMouseDown() {
        this.repeat();
    }

    repeat() {
        this.props.increment()
        this.t = setTimeout(this.repeat, this.start);
        this.start = this.start / 2;
    }

    onMouseDownReverse() {
        this.repeatReverse()
    }

    repeatReverse() {
        if (this.props.kmCounter.count > 0) {
            this.props.decrement();
            this.tReverse = setTimeout(this.repeatReverse, this.startReverse);
            this.startReverse = this.startReverse / 2;
        }
    }

    onMouseUpReverse() {
        clearTimeout(this.tReverse);
        this.startReverse = 100;
    }

    onMouseUp() {
        clearTimeout(this.t);
        this.start = 100;
    }
    //#endregion

    addItem(e) {
        //ściągnij raport spalania dla tego samochodu i policz koszt        
        var value = this._inputElementRouteName.recentValue;

        var options = this.state.enteredOptions;
        var kmCount = this.props.kmCounter;
        var fuels = this.props.fuelItems.fuels;

        var enteredCars = this.props.cars.map(function (car, idx) {
            if (options.includes(idx)
                && car.combustionRoutePoly !== 'undefined'
                && car.combustionVelocityPoly !== 'undefined') {
                var foundFuel = fuels.find(function (element) {
                    return element.key === car.carFuelKey
                });

                var averageCombustion = car.combustionRoutePoly.predict(kmCount.count);
                var averageVelocity = car.combustionVelocityPoly.predict(kmCount.count)
                //koszt 100km
                var routeCost100 = parseFloat(averageCombustion[1]) * parseFloat(foundFuel.fuelPrice);
                //koszt konkretnie tej trasy:
                var routeCost = (kmCount.count * routeCost100) / 100;
                return {
                    ...car,
                    averageCombustion: averageCombustion,
                    averageVelocity: averageVelocity,
                    routeCost: routeCost.toFixed(2)
                };
            }
        })

        for (var i = 0; i < enteredCars.length; i++) {
            if (typeof enteredCars[i] !== 'undefined') {
                var routeCost = enteredCars[i].routeCost;
                var carName = enteredCars[i].carType

                var itemToAdd = { // Tutaj dodajemy tyle rekordów ile samochodów wpisanu
                    description: this.state.friendlyText + " " + carName + ": " + routeCost + "zł",
                    key: i + Date.now() //Żeby nie było błędu, jak za szybko będzie chciał dodać komponenty
                }
                this.props.addRoute(itemToAdd);
            }
        }

        this.setState({ value: '' });
        e.preventDefault();
    }

    //#region Funkcje walidacyjne
    setEventState(e, value = '') {
        const name = e.target.name;
        this.setState(
            { [name]: value },
            () => { this.validateField(name, value) });
    }

    blurUserInput(e) {
        if (e.target.value.length > 0) {
            return;
        }
        this.setEventState(e);
    }

    handleAutosuggestTextInput(textValue) {
        //W tej metodzie, za każdym wpisaniem tekstu sprawdzamy jego wartość

        var enteredOptions = this.state.enteredOptions;

        //https://stackoverflow.com/a/4009768/5493318
        //var count = (textValue.match(/@/g) || []).length; //tutaj tego nie stosujemy, bo niekoniecznie w tym miejscu textValue jest stringiem
        var isText = typeof textValue === 'string'
        var thenum = 0;
        if (isText && textValue) {
            thenum = textValue.match(/\d+\s?km/g);
            if (thenum !== null) {
                this.props.kmCounter.count = parseInt(thenum[0]);
            } else {
                this.props.kmCounter.count = 0;
            }
        }
        var friendlyTextValue = this.state.friendlyText;
        if (isText && (textValue.match(/@/g) || []).length >= enteredOptions.length) { //To znaczy że łykamy proxy
            var textValueSplited = textValue.split(" ").map(function (item) { return item.split("@") }).flat()
            var options = this.state.options;
            enteredOptions = []
            friendlyTextValue = textValue
            //W tym miejscu uzupełniamy, które indeksy zostały wybrane, i zapisujemy je do state'a
            textValueSplited.forEach(function (r) {
                if (options.indexOf(r) >= 0) {
                    var opt = options.indexOf(r)
                    enteredOptions.push(opt)

                    friendlyTextValue = friendlyTextValue.replace("@" + r, "")
                }
            });
            //Tutaj powinna być funkcja try to fill empty fields (typ samochodu itp.)
        } else { //to jest w wypadku wywołania funkcji onBlur
            textValue = this._inputElementRouteName.recentValue;
        }

        friendlyTextValue = friendlyTextValue.replace(/[0-9]|km/g, "");

        this.setState({
            'routeName': textValue,
            value: textValue,
            enteredOptions: enteredOptions,
            friendlyText: friendlyTextValue
        },
            () => { this.validateField('routeName', textValue) });
    }

    handleUserInput(e) {
        this.setEventState(e, e.target.value);
    }

    // stringLengthValidation(value, minLength, maxLength) {
    //     var str = new String(value);
    //     routeNameValid = str.length > minLength
    //     var isempty = str.length === 0
    //     if (isempty) {
    //         routeNameValid = ''
    //         fieldValidationErrors.routeName = ''

    //     }
    //     fieldValidationErrors.routeName = routeNameValid ? '' : 'jest za krótkie (przynajmniej 3 znaki)!';
    // }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let routeNameValid = this.state.routeNameValid;

        switch (fieldName) {
            case 'routeName':
                var str = new String(value);
                routeNameValid = str.length > 3
                var isempty = str.length === 0
                if (isempty) {
                    routeNameValid = ''
                    fieldValidationErrors.routeName = ''
                    break;
                }
                fieldValidationErrors.routeName = routeNameValid ? '' : 'jest za krótkie (przynajmniej 3 znaki)!';
                break;
            case 'clean':
                routeNameValid = false
                fieldValidationErrors.routeNameValid = ''
                break;
            default:
                break;
        }

        this.setState({
            formErrors: fieldValidationErrors,
            routeNameValid: routeNameValid
        }, this.validateForm);
    }

    validateForm() {
        this.setState(
            { formValid: this.state.routeNameValid });
    }

    errorFuelTypeClass(error) {
        if (typeof error === 'string' || typeof error === 'undefined') {
            return '';
        }
        return (error ? 'is-valid' : 'is-invalid');//Bootstrap v4
    }
    //#endregion

    render() {
        var routes = this.props.kmCounter.routes.map(function (value) {
            return {
                value: value.key,
                label: value.description
            };
        });

        var routeNameTooltip = "Wprowadź swoją nazwę drogi, następnie po '@' uzupełniaj samochód z podpowiedzi."
        var routeKilometerTooltip = "Wprowadź liczbę kilometrów, które potrzebujesz do przebycia drogi."

        return (
            <div className="listMain">
                <h2>Wprowadź swoją drogę.</h2>
                <div>
                    <FormErrors formErrors={this.state.formErrors} friendlyNames={this.state.friendlyNames} />
                </div>
                <div className="header">
                    <form role="form" onSubmit={this.addItem}>
                        <div className="container">
                            <div className="row">
                                <div className="col-1">
                                    <i className="fas fa-car-side" />
                                </div>
                                <div className="col-10">
                                    <TextInput
                                        name="routeName"
                                        className={`form-control ${this.errorFuelTypeClass(this.state.routeNameValid)}`}
                                        ref={(a) => this._inputElementRouteName = a}
                                        placeholder="Nazwa drogi + @<Samochód>"
                                        onChange={(event) => this.handleAutosuggestTextInput(event)}
                                        onBlur={(event) => this.handleAutosuggestTextInput(event)}
                                        options={this.state.options}
                                        value={`${this.state.value}`}
                                    />
                                </div>
                                <RouteTooltip id="routeName" text={routeNameTooltip} />
                            </div>
                            <div className="row">
                                <div className="col-1">
                                    <i className="fas fa-tachometer-alt" />
                                </div>
                                <div className="col-5">
                                    Wprowadź ilość kilometrów:
                                </div>
                                <div className="col-5">
                                    <button
                                        type="button"
                                        className="buttons"
                                        onMouseUp={this.onMouseUp}
                                        onMouseLeave={this.onMouseUp}
                                        onMouseDown={this.onMouseDown}
                                    >+</button>
                                    {this.props.kmCounter.count} [KM]
                                    <button
                                        type="button"
                                        onMouseUp={this.onMouseUpReverse}
                                        onMouseLeave={this.onMouseUpReverse}
                                        onMouseDown={this.onMouseDownReverse}
                                    >-</button>
                                </div>
                                <RouteTooltip id="routeKilometers" text={routeKilometerTooltip} />
                            </div>
                        </div>
                        <button type="submit" disabled={!this.state.formValid}>Dodaj</button>
                    </form>
                </div>
                <div className="internalItems">
                    <Items
                        entries={routes.map(function (item) {
                            return {
                                friendlyName: item.label,
                                key: item.value
                            }
                        })}
                        delete={this.props.removeRoute} />
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        fuelItems: state.fuelItems,
        cars: state.cars,
        combustionReports: state.combustionReports,
        kmCounter: state.kmCounter
    }),
    dispatch => bindActionCreators(actionCreators, dispatch)
)(RouteReport);