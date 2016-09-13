import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.module.css'

const App = React.createClass({
    render: function() {
        return (
            <div>
                <h1>Environment: {__NODE_ENV__}</h1>
            </div>
        );
    }
});

module.exports = App;
