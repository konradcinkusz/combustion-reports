import React, { Component } from "react";
import regression from "regression";
import Plot from "react-plotly.js";
import * as tf from "@tensorflow/tfjs";
import Collapsible from "react-collapsible"

class Polynomial extends Component {
    constructor(props) {
        super(props);

        this.genData = this.genData.bind(this);
        this.plot = this.plot.bind(this);
    }

    genData(numPoints, predict, max) {
        let x = [];
        let y = [];

        const xs = tf.randomUniform([numPoints], 0, max);
        var data_xs = xs.dataSync();

        for (let i = 0; i < numPoints; i++) {
            x[i] = data_xs[i];
        }

        x = x.sort(function (a, b) {
            return a - b;
        });
        for (let i = 0; i < numPoints; i++) {
            y[i] = predict(x[i])[1];
        }

        return { x: x, y: y };
    }

    plot(data, plotName = '') {
        const layout = {
            title: {
                text: plotName,
                font: {
                    family: 'Courier New, monospace',
                    size: 24
                },
                xref: 'paper'
            },
            margin: { l: 20, r: 20, b: 20, t: 40, pad: 0 },
            legend: { xanchor: "left", yanchor: "top", y: 1, x: 0, orientation: "v" },
            height: 150,
            xaxis: {
                autorange: true,
                showgrid: true,
                zeroline: true,
                showline: true,
                autotick: true,
                ticks: "",
                showticklabels: true
            },
            yaxis: {
                autorange: true,
                showgrid: true,
                zeroline: true,
                showline: true,
                autotick: true,
                ticks: "",
                showticklabels: true
            },
            autosize: true,
            plot_bgcolor: '#C0DFA1',
            paper_bgcolor: '#eee'
        };
        const style = { width: "100%", height: "100%" };
        return (
            <Plot
                data={[
                    data
                        ? {
                            x: data.x,
                            y: data.y,
                            mode: "lines-marker",
                            name: "Poly",
                            marker: { size: 12, color: "black" }
                        }
                        : {}
                ]}
                layout={layout}
                useResizeHandler={true}
                style={style}
            />
        );
    }

    render() {
        const accuracy = 2;
        var max = 0;
        var polyCoords = this.props.entries.map(function (item) {
            if (item.x > max) {
                max = item.x
            }
            return [item.x, item.y];
        });
        var result = { string: "undefined" };
        var data = { x: [0], y: [0] };
        if (polyCoords.length !== 0) {
            result = regression.power(polyCoords, {
                order: this.props.order
            });

            data = this.genData(400, result.predict, max * 3);
        }
        return (
            <div>
                <Collapsible trigger="Regression results (click to show):">
                    <p>{result.string}</p>
                    <div>
                        <strong>x:</strong>
                        {data.x.map(function (item, idx) {
                            if (idx % 10 === 0) {
                                return item.toFixed(accuracy) + ", ";
                            }
                            return;
                        })}
                    </div>
                    <div>
                        <strong>y:</strong>
                        {data.y.map(function (item, idx) {
                            if (idx % 10 === 0) {
                                return item.toFixed(accuracy) + ", ";
                            }
                            return;
                        })}
                    </div>
                </Collapsible>
                <div>
                    {this.plot({ x: data.x, y: data.y }, this.props.plotTitle)}
                </div>
            </div>
        );
    }
}

export default Polynomial;
