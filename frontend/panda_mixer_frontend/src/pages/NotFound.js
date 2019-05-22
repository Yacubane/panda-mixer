import React, { Component } from 'react';
import 'antd/dist/antd.css';
import styles from './NotFound.module.scss';

import CenterBox from '../components/CenterBox';
import SiteLayout from '../components/SiteLayout';
import image from '../assets/404.png'

export default class Index extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SiteLayout>
        <CenterBox>
          <div className={styles.Content} >
            <img src={image} width="35%" />
          </div>
        </CenterBox>
      </SiteLayout >
    );
  }

}

