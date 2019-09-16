import React, { Component } from "react"
import { FormErrors } from './FormErrors';
import TextInput from "react-autocomplete-input"
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Route';
import Items from "./Items";
import "./ListMain.css";

class RouteReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            formErrors: { routeName: '' },
            friendlyNames: { routeName: 'Pole nazwa drogi' },
            routeNameValid: '',
            options: ["dom", "wakacje", "praca", "inne", "Cactus"], //To trzeba ściągnąć z reduktora
            value: ''
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
        var value = this._inputElementRouteName.recentValue;
        var array = value.split(" ");
        var options = this.state.options;
        var foundOptionsIndex = []
        array.forEach(function (item) {
            if (item.charAt(0) === '@') {
                var tocheck = item.substring(1, item.length);
                options.forEach(function (option, idx) {
                    if (tocheck.includes(option)) {
                        foundOptionsIndex.push(idx);
                    }
                });
            }
        });

        var itemToAdd = {
            description: value,
            key: Date.now()
        }

        this.props.addRoute(itemToAdd);
        this.setState({ value: '' });

        // this._inputElementRouteName.value = "";
        // this._inputElementPrice.value = "";

        // var value = ''
        // this.setState({
        //     'fuelType': value,
        //     'fuelPrice': value
        // }, () => { this.validateField('clean', value) });

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

        if (typeof textValue === "string" && textValue.includes('@')) { //To znaczy że łykamy proxy
            var value = this._inputElementRouteName.recentValue;
            var array = value.split(" ");
            var test = textValue.split(" ").map(function (item) { return item.split("@") }).flat()
            var options = this.state.options;
            var foundOptionsIndex = []
            var tstFoundedIdx = []

            //https://stackoverflow.com/a/39893636/5493318
            // const found = arr1.some(r=> arr2.includes(r))
            // const found = arr1.some(r=> arr2.indexOf(r) >= 0)

            var found = test.some(function (r) {
                if (options.indexOf(r) >= 0) {
                    tstFoundedIdx.push(options.indexOf(r))
                    return true;
                }
                return false;
            });
            var forEachFoundIdx = []
            test.forEach(function (r) {
                if (options.indexOf(r) >= 0) {
                    forEachFoundIdx.push(options.indexOf(r))
                }
            })
            console.log("ForEach foundIndex: " + forEachFoundIdx)
            console.log(tstFoundedIdx)
            array.forEach(function (item) {
                if (item.includes('@')) {
                    options.forEach(function (option, idx) {
                        if (item.includes(option)) {
                            foundOptionsIndex.push(idx);
                            console.log("logged index: " + idx)
                        }
                    });
                }
            });
        } else { //to jest w wypadku wywołania funkcji onBlur
            textValue = this._inputElementRouteName.recentValue;
        }

        this.setState(
            {
                'routeName': textValue,
                value: textValue
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
                                <div className="col-sm">
                                    <TextInput
                                        name="routeName"
                                        className={`form-control ${this.errorFuelTypeClass(this.state.routeNameValid)}`}
                                        ref={(a) => this._inputElementRouteName = a}
                                        placeholder="Moja droga @Cactusem do domu"
                                        onChange={(event) => this.handleAutosuggestTextInput(event)}
                                        onBlur={(event) => this.handleAutosuggestTextInput(event)}
                                        options={this.state.options}
                                        value={`${this.state.value}`}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm">
                                    Wprowadź ilość kilometrów:
                                </div>
                                <div className="col-sm">
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
                                        className="buttons"
                                        onMouseUp={this.onMouseUpReverse}
                                        onMouseLeave={this.onMouseUpReverse}
                                        onMouseDown={this.onMouseDownReverse}
                                    >-</button>
                                </div>
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