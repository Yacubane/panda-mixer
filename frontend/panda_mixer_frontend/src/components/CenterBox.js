
import React, { Component } from 'react';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';

export default class CenterBox extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div style={{ width: "100%", height: "auto",     display: "flex",
            "align-items": "center", }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: "100%", height: "100%" }}>
                        {this.props.children}
                    </div>
            </div>
        );
    }

}
