import React, {Component} from 'react';

import 'antd/dist/antd.css';
import './Index.css';
import {withRouter} from 'react-router-dom'
import SiteLayout from '../components/SiteLayout';
import CenterBox from '../components/CenterBox';
import RegisterBox from '../components/RegisterBox';
import {Modal, Button} from 'antd';

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {visible: false}
    }

    showRegisteredDialog() {
        this.setState({
            visible: true,
        });
    }

    handleOk = e => {
        this.setState({
            visible: false,
        });
        this.props.history.push('/login')
    };

    render() {
        return (
            <SiteLayout>
                <Modal
                    title="Register dialog"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                >
                    <p>You may login now.</p>
                </Modal>
                <CenterBox>
                    <RegisterBox onRegister={() => this.showRegisteredDialog()}/>
                </CenterBox>
            </SiteLayout>
        );
    }

}

export default withRouter(Register);