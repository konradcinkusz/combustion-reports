import React from 'react';
import ReactTooltip from 'react-tooltip';

export const RouteTooltip = ({ text, id }) =>
    <div className="col-1 center-block text-center">
        <ReactTooltip
            id={id}
            place='bottom'
            type='info'
            effect='float'
            data-id={id}>
            <span>
                {text}
            </span>
        </ReactTooltip>
        <div className="circle"
            data-tip={text}
            data-for={id}>
            <i className="fas fa-info" />
        </div>
    </div>