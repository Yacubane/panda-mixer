import React, { Component } from 'react';
import { Layout } from 'antd';
import 'antd/dist/antd.css';
import './SiteLayout.css';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
const { Content } = Layout;

export default class SiteLayout extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Layout className="Root-Layout">
                <SiteHeader />
                <Content style={{ padding: '0 0.5em',     display: "flex" }}>
                    {this.props.children}
                </Content>
                <SiteFooter />
            </Layout >
        );
    }


}

