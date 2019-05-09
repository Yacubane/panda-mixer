import React, { Component } from 'react';

import 'antd/dist/antd.css';
import './Index.css';

import SiteLayout from '../components/SiteLayout';
import CenterBox from '../components/CenterBox';
import RegisterBox from '../components/RegisterBox';

export default class Register extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <SiteLayout>
          <CenterBox>
            <RegisterBox />
          </CenterBox>
      </SiteLayout >
    );
  }

}

