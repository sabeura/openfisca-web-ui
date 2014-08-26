/** @jsx React.DOM */
'use strict';

var React = require('react');


var EditForm = React.createClass({
  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
  },
  render: function() {
    return (
      <form onSubmit={event => { event.preventDefault(); this.props.onClose(); }} role="form">
        <button className="close" title='Fermer' type="submit">
          <span aria-hidden="true">×</span>
          <span className="sr-only">Fermer</span>
        </button>
        <h2 className='text-center' style={{margin: 0}}>{this.props.title}</h2>
        <hr/>
        {this.props.children}
        <button className="btn btn-primary" type="submit">Fermer</button>
      </form>
    );
  }
});

module.exports = EditForm;
