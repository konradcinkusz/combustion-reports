import React, { Component } from "react"
import { FormErrors } from './FormErrors';
import TextInput from "react-autocomplete-input"

class RouteReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            formErrors: { routeName: '' },
            friendlyNames: { routeName: 'Pole nazwa drogi' },
            routeNameValid: '',
            options: ["dom", "wakacje", "praca", "inne"]
        }
    }

    // #region Funkcje walidacyjne
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
        debugger
        this.setState(
            { 'routeName': textValue },
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
                routeNameValid = ''
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
        debugger
        return (error ? 'is-valid' : 'is-invalid');//Bootstrap v4
    }
    // #endregion

    render() {
        return (
            <div>
                <FormErrors formErrors={this.state.formErrors} friendlyNames={this.state.friendlyNames} />

                {/* <input
                    name="routeName"
                    className={`form-control ${this.errorFuelTypeClass(this.state.routeNameValid)}`}
                    ref={(a) => this._inputElementRouteName = a}
                    placeholder="Nazwa drogi"
                    onChange={(event) => this.handleUserInput(event)}
                    onBlur={(event) => this.blurUserInput(event)}
                /> */}

                <TextInput
                    name="routeName"
                    className={`form-control ${this.errorFuelTypeClass(this.state.routeNameValid)}`}
                    ref={(a) => this._inputElementRouteName = a}
                    placeholder="Nazwa drogi"
                    onChange={(event) => this.handleAutosuggestTextInput(event)}
                    onBlur={(event) => this.handleAutosuggestTextInput(event)}
                    //onRequestOptions={this.handleRequestOptions} 
                    options={this.state.options} />
            </div>
        );
    }
}

export default RouteReport;