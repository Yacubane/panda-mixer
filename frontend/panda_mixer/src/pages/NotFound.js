import React, {Component} from 'react';
import 'antd/dist/antd.css';
import styles from './NotFound.module.scss';

import CenterBox from '../components/CenterBox';
import SiteLayout from '../components/SiteLayout';
import image from '../assets/404.png'

export default class Index extends Component {
    render() {
        return (
            <SiteLayout>
                <CenterBox>
                    <div className={styles.Content}>
                        <img alt="404" className={styles.Image} src={image}/>
                    </div>
                </CenterBox>
            </SiteLayout>
        );
    }

}

