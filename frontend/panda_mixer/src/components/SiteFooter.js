import React, {Component} from 'react';
import {Layout} from 'antd';
import 'antd/dist/antd.css';
import './SiteFooter.css';

const {Footer} = Layout;

export default class SiteFooter extends Component {
    render() {
        return (
            <Footer className="Footer" style={{textAlign: 'center'}}>
                Panda Mixer 2019
            </Footer>
        );
    }

}
