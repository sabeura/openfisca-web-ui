/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

var Curve = require('./svg/curve'),
  HGrid = require('./svg/h-grid'),
  HoverLegend = require('./svg/hover-legend'),
  Legend = require('./svg/legend'),
  Point = require('./svg/point'),
  VGrid = require('./svg/v-grid'),
  XAxis = require('./svg/x-axis'),
  YAxis = require('./svg/y-axis');


var SituateurVisualization = React.createClass({
  propTypes: {
    curveLabel: React.PropTypes.string.isRequired,
    formatHint: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    legendHeight: React.PropTypes.number.isRequired,
    pointLabel: React.PropTypes.string.isRequired,
    points: React.PropTypes.array.isRequired,
    value: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    xFormatNumber: React.PropTypes.func.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xSnapIntervalValue: React.PropTypes.number.isRequired,
    xSteps: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    yFormatNumber: React.PropTypes.func.isRequired,
    yMaxValue: React.PropTypes.number.isRequired,
    yNbSteps: React.PropTypes.number.isRequired,
  },
  findXFromY: function(y) {
    var points = this.allPoints;
    var yIndex = Lazy(points).pluck('y').sortedIndex(y);
    var high = points[yIndex];
    var x;
    if (yIndex === 0) {
      x = high.x;
    } else if (yIndex === points.length) {
      x = this.props.xMaxValue;
    } else {
      var low = points[yIndex - 1];
      var dY = high.y - low.y;
      var dy = y - low.y;
      var dX = high.x - low.x;
      var dx = dX * dy / dY;
      x = low.x + dx;
    }
    return x;
  },
  findYFromX: function(x) {
    var points = this.allPoints;
    var xIndex = Lazy(points).pluck('x').sortedIndex(x);
    var high = points[xIndex];
    var y;
    if (xIndex === 0) {
      y = high.y;
    } else if (xIndex === points.length) {
      y = this.lastPoint.y;
    } else {
      var low = points[xIndex - 1];
      var dX = high.x - low.x;
      var dx = x - low.x;
      var dY = high.y - low.y;
      var dy = dY * dx / dX;
      y = low.y + dy;
    }
    return y;
  },
  formatHint: function() {
    var point = this.state.snapPoint || {x: this.findXFromY(this.props.value), y: this.props.value};
    return point.x > this.pointsXMaxValue ?
      `Valeurs inconnues au delà de ${this.props.xFormatNumber(this.pointsXMaxValue)} %` : // jshint ignore:line
      this.props.formatHint({
        amount: this.props.yFormatNumber(point.y),
        percent: this.props.xFormatNumber(point.x),
      });
  },
  getDefaultProps: function() {
    return {
      legendHeight: 30,
      marginRight: 5,
      xAxisHeight: 60,
      xMaxValue: 100,
      xSteps: 10,
      yAxisWidth: 80,
      yNbSteps: 10,
    };
  },
  getInitialState: function() {
    return {
      snapPoint: null,
    };
  },
  gridPixelToPoint: function(pixel) {
    return {
      x: (pixel.x / this.gridWidth) * this.props.xMaxValue,
      y: (1 - pixel.y / this.gridHeight) * this.props.yMaxValue,
    };
  },
  gridPointToPixel: function(point) {
    return {
      x: (point.x / this.props.xMaxValue) * this.gridWidth,
      y: (1 - point.y / this.props.yMaxValue) * this.gridHeight,
    };
  },
  handleHoverLegendHover: function(snapX) {
    var snapPoint;
    if (snapX === null) {
      snapPoint = null;
    } else {
      var snapY = this.findYFromX(snapX);
      snapPoint = {x: snapX, y: snapY};
    }
    this.setState({snapPoint: snapPoint});
  },
  render: function() {
    this.pointsXMaxValue = Math.max(...this.props.points.map(point => point.x));
    this.gridHeight = this.props.height - this.props.xAxisHeight - this.props.legendHeight;
    this.gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    this.lastPoint = {x: this.props.xMaxValue * 0.99, y: this.props.yMaxValue};
    this.allPoints = this.props.points.concat(this.lastPoint);
    var xValue = this.findXFromY(this.props.value);
    var xSnapValues = Lazy.range(0, 105, this.props.xSnapIntervalValue).concat(xValue).sort().toArray();
    return (
      <div>
        <svg height={this.props.height} width={this.props.width}>
          <g transform={
            'translate(' + this.props.yAxisWidth + ', ' + (this.props.height - this.props.xAxisHeight) + ')'
          }>
            <HGrid
              height={this.gridHeight}
              nbSteps={this.props.yNbSteps}
              startStep={1}
              width={this.gridWidth}
            />
            <XAxis
              formatNumber={this.props.xFormatNumber}
              height={this.props.xAxisHeight}
              label='% de la population'
              maxValue={this.props.xMaxValue}
              unit='%'
              width={this.gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.legendHeight + ')'}>
            <VGrid
              height={this.gridHeight}
              nbSteps={this.props.xSteps}
              startStep={1}
              width={this.gridWidth}
            />
            <YAxis
              formatNumber={this.props.yFormatNumber}
              height={this.gridHeight}
              maxValue={this.props.yMaxValue}
              nbSteps={this.props.yNbSteps}
              unit='€'
              width={this.props.yAxisWidth}
            />
            <Curve
              points={this.props.points}
              pointToPixel={this.gridPointToPixel}
              style={{stroke: 'rgb(31, 119, 180)'}}
            />
            <Curve
              points={[this.props.points.last(), this.lastPoint]}
              pointToPixel={this.gridPointToPixel}
              style={{
                stroke: 'rgb(31, 119, 180)',
                strokeDasharray: '5 5',
              }}
            />
            <Point
              pointToPixel={this.gridPointToPixel}
              style={{
                fill: xValue > this.pointsXMaxValue ? 'none' : 'rgb(166, 50, 50)',
                stroke: 'rgb(166, 50, 50)',
              }}
              x={xValue}
              y={this.props.value}
            />
            <HoverLegend
              height={this.gridHeight}
              onHover={this.handleHoverLegendHover}
              pixelToPoint={this.gridPixelToPoint}
              pointToPixel={this.gridPointToPixel}
              snapPoint={this.state.snapPoint}
              width={this.gridWidth}
              xFormatNumber={this.props.xFormatNumber}
              xMaxValue={this.props.xMaxValue}
              xSnapValues={xSnapValues}
              yFormatNumber={this.props.yFormatNumber}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', 0)'}>
            <Legend color='rgb(31, 119, 180)'>{this.props.curveLabel}</Legend>
            <g transform={'translate(' + 12 * 0.7 * this.props.curveLabel.length + ', 0)'}>
              <Legend color='rgb(166, 50, 50)'>{this.props.pointLabel}</Legend>
            </g>
          </g>
        </svg>
        <p className='text-center well'>
          {this.formatHint()}
        </p>
      </div>
    );
  },
});

module.exports = SituateurVisualization;
