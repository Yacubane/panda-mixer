import React, {Component} from 'react';
import {withRouter} from 'react-router-dom'
import 'antd/dist/antd.css';
import styles from './Playlists.module.scss';

import {Button, List} from 'antd';

import SiteLayout from '../components/SiteLayout';
import CenterBox from '../components/CenterBox';
import Auth from '../functions/Auth';

class Playlists extends Component {


    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        this.update()
    }

    componentWillUnmount() {
    }

    handleDeleteClick = (item) => {
        Auth.fetch('http://127.0.0.1:8000/api/playlists/' + item.link_id + "/", 'DELETE', null)
            .then((response) => {
                if (response.status === 200) {
                    this.update()
                }
            }).catch((err) => {
        })
    };

    handleOpenClick = (item) => {
        this.props.history.push('/p/' + item.link_id)
    };

    update = () => {
        Auth.fetch('http://127.0.0.1:8000/api/playlists/',
            'GET', null)
            .then((response) => {
                console.log(response);
                if (response.status === 200) {
                    this.setState({
                        data: response.json,
                    });
                }
            }).catch((err) => {
            console.log(err)
        })


    };


    render() {
        return (
            <SiteLayout>
                <CenterBox>
                    <div>
                        <div className={styles.container}>
                            <div style={{width: "100%"}}>
                                <List
                                    className={styles.list}
                                    itemLayout="horizontal"
                                    dataSource={this.state.data}
                                    renderItem={item => (
                                        <List.Item>
                                            <div style={{width: "100%", display: 'flex'}}>
                                                <p className={styles.leftItem}>{item['link_id']}</p>
                                                <p className={styles.rightItem}>
                                                    <Button className={styles.basicButton} icon="caret-right"
                                                            shape="round" type="primary" htmlType="submit"
                                                            onClick={() => this.handleOpenClick(item)}>
                                                        {/*Open*/}
                                                    </Button>
                                                    <Button className={styles.basicButton} icon="delete" shape="round"
                                                            type="primary" htmlType="submit"
                                                            onClick={() => this.handleDeleteClick(item)}>
                                                        {/*Delete*/}
                                                    </Button>
                                                </p>
                                            </div>
                                        </List.Item>
                                    )}
                                />

                            </div>
                        </div>

                    </div>
                </CenterBox>
            </SiteLayout>
        );
    }

}

export default withRouter(Playlists)