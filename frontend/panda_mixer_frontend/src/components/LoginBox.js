import React, { Component } from 'react';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
    Form, Icon, Input, Button, Checkbox,
} from 'antd';
import { NavLink } from 'react-router-dom';
import 'antd/dist/antd.css';
import styles from './LoginBox.module.scss';
import login from '../reducers/Login';


const mapStateToProps = (state) => {
    return { loggedIn: state.login.loggedIn };
};
const mapDispatchToProps = (dispatch) => {
    return {
        onLoggedIn: () => {
            dispatch({ type: 'LOGGED_IN' })
        },
    }
};
class LoginBox extends Component {
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.login(values.username, values.password);
            }
        });
    }


    login = (username, password) => {
        let status;
        fetch('http://127.0.0.1:8000/api/token/', {
            method: 'POST',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({ username: username, password: password })
        }).then((response) => {
            status = response.status;
            return response.json();
        }
        )
            .then((data) => {
                if (status == 200) {
                    localStorage.setItem('JWT_ACCESS_TOKEN', data.access);
                    localStorage.setItem('JWT_REFRESH_TOKEN', data.refresh);
                    localStorage.setItem('JWT_TOKEN_GET_DATE', new Date())
                    localStorage.setItem('JWT_USERNAME', username)
                    this.props.onLoggedIn()
                    this.props.history.push('/')
                } else if (status == 401) {
                    this.props.form.setFields({
                        "username": {
                            value: this.props.form.getFieldValue("username"),
                            errors: [new Error("Wrong credentials")],
                        },
                    });
                } else {
                    this.props.form.setFields({
                        "username": {
                            value: this.props.form.getFieldValue("username"),
                            errors: [new Error("Unknown error")],
                        },
                    });
                }
                console.log(data)
            })
            .catch((err) => {
                console.log(err)
            }
            )
    }




    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
                <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                    )}
                </Form.Item>
                <Form.Item>
                    <Button style={{ width: "100%" }} type="primary" htmlType="submit" className={styles.loginButton}>
                        Log in
                    </Button>
                    <p className={styles.registerNow}>Or <NavLink to="/register" style={{ "color": "red" }}> register now! </NavLink></p>
                </Form.Item>
            </Form>
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form.create()(LoginBox)))