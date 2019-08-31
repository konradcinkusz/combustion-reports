import React from 'react';

export const FormErrors = ({ formErrors, friendlyNames }) =>
    <div className='formErrors'>
        {Object.keys(formErrors).map((fieldName, i) => {
            if (formErrors[fieldName].length > 0) {
                return (
                    <p key={i}>{friendlyNames[fieldName]} {formErrors[fieldName]}</p>
                )
            } else {
                return '';
            }
        })}
    </div>