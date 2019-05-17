import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Menu } from 'antd';
import { Layout } from 'antd';
import { NavLink } from 'react-router-dom';
import 'antd/dist/antd.css';
import './SiteHeader.css';
import { Button } from 'antd/lib/radio';
import { withRouter } from 'react-router-dom'

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
        if (e.key == "2") {
            console.log("dupa2")
            if(this.props.loggedIn) {
                this.props.onLoggedOut()
            } else {
                this.props.history.push("/login/")
            }
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
                    <Menu.Item style={{ float: 'left' }} key="1">
                        <NavLink to="/"> PANDA Mixer </NavLink>
                    </Menu.Item>
                    <Menu.Item style={{ float: 'right' }} key="2">
                        {this.props.loggedIn ? "Log out" : "Login"}
                    </Menu.Item>
                    <Menu.Item style={{ float: 'right' }} key="3">
                        <NavLink to="/register"> Register </NavLink>
                    </Menu.Item>
                </Menu>
            </Header>
        );
    }

}                    //this.props.loggedIn



export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SiteHeader))