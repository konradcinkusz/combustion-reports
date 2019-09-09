import React, { Component } from "react";
import FlipMove from "react-flip-move";
import { isEqual } from "lodash";

class Items extends Component {
    constructor(props) {
        super(props);

        this.createTask = this.createTask.bind(this);
    }

    createTask(item) {
        return (
            <li key={item.key}>
                <div>
                    <button className="buttons" onClick={() => this.props.delete(item)} >
                        {item.friendlyName}
                    </button>
                </div>
            </li>
        );
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(this.props, nextProps);
    }

    render() {
        var todoEntries = this.props.entries;
        var listItems = todoEntries.map(this.createTask);
        return (
            <ul className="theList">
                <FlipMove duration={250} easing="ease-out">
                    {listItems}
                </FlipMove>
            </ul>
        );
    }
}

export default Items;