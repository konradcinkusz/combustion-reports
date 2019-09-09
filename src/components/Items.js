import React, { Component } from "react";
import FlipMove from "react-flip-move";

class Items extends Component {
    constructor(props) {
        super(props);

        this.state = {
            listItems: ''
        }

        this.createTask = this.createTask.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps !== this.props;
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

    componentWillMount() {
        var todoEntries = this.props.entries;
        var listItems = todoEntries.map(this.createTask);
        this.setState({
            listItems: listItems
        });
    }

    render() {
        return (
            <ul className="theList">
                <FlipMove duration={250} easing="ease-out">
                    {this.state.listItems}
                </FlipMove>
            </ul>
        );
    }
}

export default Items;