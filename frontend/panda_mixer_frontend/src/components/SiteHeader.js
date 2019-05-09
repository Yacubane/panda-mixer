import React, { Component } from 'react';
import { Menu } from 'antd';
import { Layout } from 'antd';
import { NavLink } from 'react-router-dom';
import 'antd/dist/antd.css';
import './SiteHeader.css';
const { Header, Content, Footer } = Layout;

export default class SiteHeader extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Header className="Header" style={{padding: 0}}>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    style={{ lineHeight: '64px' }}
                    selectable={false}
                    className="Menu"
                >
                    <Menu.Item style={{ float: 'left' }} key="1">
                        <NavLink to="/"> PANDA Mixer </NavLink>
                    </Menu.Item>
                    <Menu.Item style={{ float: 'right' }} key="2">
                        <NavLink to="/login"> Log in </NavLink>
                    </Menu.Item>
                    <Menu.Item style={{ float: 'right' }} key="3">
                        <NavLink to="/register"> Register </NavLink>
                    </Menu.Item>
                </Menu>
            </Header>
        );
    }

}

