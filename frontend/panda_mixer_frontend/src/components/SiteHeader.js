import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Menu } from 'antd';
import { Layout, Icon } from 'antd';
import { NavLink } from 'react-router-dom';
import 'antd/dist/antd.css';
import './SiteHeader.css';
import { Button } from 'antd/lib/radio';
import { withRouter } from 'react-router-dom'
import Auth from '../functions/Auth'

const { Header, Content, Footer } = Layout;

const mapStateToProps = (state) => {
    return { loggedIn: state.login.loggedIn };
};
const mapDispatchToProps = (dispatch) => {
    return {
        onLoggedOut: () => {
            dispatch({ type: 'LOGGED_OUT' })
        },
    }
};


class SiteHeader extends Component {
    constructor(props) {
        super(props);
    }

    handleClick = e => {
        if (e.key == "login") {
            this.props.history.push("/login/")
        } else if (e.key == "logout") {
            Auth.logout()
        }
    };

    render() {
        const { loggedIn, onLoggedIn } = this.props;

        return (
            <Header className="Header" style={{ padding: 0 }}>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    style={{ lineHeight: '64px' }}
                    selectable={false}
                    className="Menu"
                    onClick={this.handleClick}
                >
                    <Menu.Item style={{ float: 'left' }} key="homepage">
                        <NavLink to="/"> <Icon type="home" />PANDA Mixer </NavLink>
                    </Menu.Item>

                    {!this.props.loggedIn && (
                        <Menu.Item style={{ float: 'right' }} key="login">
                            <Icon type="login" /> Login
                        </Menu.Item>
                    )}
                    {this.props.loggedIn && (
                        <Menu.Item style={{ float: 'right' }} key="logout">
                            <Icon type="logout" /> Logout
                    </Menu.Item>
                    )}
                    {!this.props.loggedIn && (
                        <Menu.Item style={{ float: 'right' }} key="3">
                            <NavLink to="/register"> <Icon type="form" />Register </NavLink>
                        </Menu.Item>
                    )}
                    {this.props.loggedIn && (
                        <Menu.Item style={{ float: 'right' }} key="4">
                            <NavLink to="/playlists"> Your playlists </NavLink>
                        </Menu.Item>
                    )}
                </Menu>
            </Header>
        );
    }

}



export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SiteHeader))