import React, {Component} from 'react';
import {
    Form, Icon, Input, Button,
} from 'antd';
import 'antd/dist/antd.css';
import styles from './RegisterBox.module.scss';
import buttonStyles from './LoginBox.module.scss';
import {withRouter} from 'react-router-dom'

class RegisterBox extends Component {
    state = {
        loading: false,
    };

    setFormError(formElement, text) {
        this.props.form.setFields({
            [formElement]: {
                value: this.props.form.getFieldValue(formElement),
                errors: [new Error(text)],
            },
        });
    }

    register(username, password, email) {
        let status;
        fetch('http://127.0.0.1:8000/api/users/', {
            method: 'POST',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({username: username, password: password, email: email})
        }).then(function (response) {
                status = response.status;
                return response.json();
            }
        )
            .then((data) => {
                this.setState({loading: false});
                if (status == 201) {
                    this.props.onRegister()
                } else {
                    if (data.hasOwnProperty('email')) this.setFormError('email', data['email']);
                    if (data.hasOwnProperty('username')) this.setFormError('username', data['username']);
                    if (data.hasOwnProperty('password')) this.setFormError('password', data['password'])
                }
            })
            .catch((err) => {
                    console.log(err)
                }
            )
    }


    handleSubmit = (e) => {
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (this.props.form.getFieldValue('email').length < 6) {
                    this.setFormError('password', 'Email must have at least 6 letter');
                    err = true;
                }
                if (this.props.form.getFieldValue('username').length < 6) {
                    this.setFormError('password', 'Username must have at least 6 letter');
                    err = true;
                }
                if (this.props.form.getFieldValue('password').length < 6) {
                    this.setFormError('password', 'Password must have at least 6 letter');
                    err = true;
                }
                if (this.props.form.getFieldValue('password') != this.props.form.getFieldValue('confirm')) {
                    this.setFormError('confirm', 'Password doesn\'t match');
                    err = true;
                }
                if (!err) {
                    this.setState({loading: true});
                    this.register(values.username, values.password, values.email);
                }
            }

        });
    };
    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            console.log('Two passwords that you enter is inconsistent!');
        }
    };

    render() {
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 10},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 14},
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 14,
                    offset: 10,
                },
            },
        };
        const {getFieldDecorator} = this.props.form;
        return (
            <Form className={styles.loginForm} {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item className="Hint" label="Email">
                    {getFieldDecorator('email', {
                        rules: [{required: true, message: 'Please input your email!'}],
                    })(
                        <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>} placeholder="Email"/>
                    )}
                </Form.Item>
                <Form.Item label="Username">
                    {getFieldDecorator('username', {
                        rules: [{required: true, message: 'Please input your username!'}],
                    })(
                        <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>} placeholder="Username"/>
                    )}
                </Form.Item>
                <Form.Item label="Password">
                    {getFieldDecorator('password', {
                        rules: [{required: true, message: 'Please input your Password!'}],
                    })(
                        <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>} type="password"
                               placeholder="Password"/>
                    )}
                </Form.Item>
                <Form.Item label="Confirm password">
                    {getFieldDecorator('confirm', {
                        rules: [{required: true, message: 'Please confirm your password!',}, {}],
                    })(
                        <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>} type="password"
                               placeholder="Confirm password"/>
                    )}
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" className={buttonStyles.loginButton}
                            loading={this.state.loading}>
                        Register
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default withRouter(Form.create()(RegisterBox));