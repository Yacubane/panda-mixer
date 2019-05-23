import React, {Component} from 'react';
import {Menu} from 'antd';
import {Layout} from 'antd';
import {NavLink} from 'react-router-dom';
import 'antd/dist/antd.css';
import './SiteFooter.css';

const {Header, Content, Footer} = Layout;

export default class SiteFooter extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Footer className="Footer" style={{textAlign: 'center'}}>
                Panda Mixer 2019
            </Footer>
        );
    }

}
