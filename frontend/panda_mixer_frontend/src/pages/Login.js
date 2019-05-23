import React, {Component} from 'react';

import 'antd/dist/antd.css';
import './Index.css';

import SiteLayout from '../components/SiteLayout';
import CenterBox from '../components/CenterBox';
import LoginBox from '../components/LoginBox';

export default class Index extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <SiteLayout>
                <CenterBox>
                    <LoginBox/>
                </CenterBox>
            </SiteLayout>
        );
    }

}

