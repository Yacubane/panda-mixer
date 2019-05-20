import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { List, Button } from 'antd';
import styles from './MusicList.module.scss';
import Auth from '../functions/Auth';

export default class MusicList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        };
    }

    update = () => {
        Auth.fetch('http://127.0.0.1:8000/api/playlists/' + this.props.playlistId + '/elements/',
            'GET', null)
            .then((response) => {
                if (response.status == 200) {
                    response.json.sort((a, b) => a.order < b.order ? -1 : 1)
                    this.setState({
                        data: response.json,
                    });
                }
            }).catch((err) => {
                console.log(err)
            })
    }



    componentDidMount() {
        this.update()
    }
    componentWillUnmount() {
    }
    getVideoIDByOrder = (order) => {
        try {
            return this.state.data.filter(a => a.order == order)[0]['data']
        }
        catch (error) {
            console.error(error);
        }
        return false
    }

    handlePlayClick = (item) => {
        this.props.onPlayClick(item.order, item.data)
    }
    handleDeleteClick = (item) => {
        fetch('http://127.0.0.1:8000/api/playlists/' + this.props.playlistId + "/elements/" + item.order + "/", {
            method: 'delete',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
        }).then((response) => {
            if (response.status == 204)
                this.update();
            return response.json();
        }
        )
            .then((data) => {

            })
            .catch((err) => {
                console.log(err)
            }
            )
    }
    handleMoveClick = (up, item) => {
        fetch('http://127.0.0.1:8000/api/playlists/' + this.props.playlistId + "/elements/" + item.order + "/", {
            method: 'PATCH',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({ order: item.order + (up ? -1 : 1) }),

        }).then((response) => {
            console.log(response);
            if (response.status == 200)
                this.update();
            return response.json();
        }
        )
            .then((data) => {
            })
            .catch((err) => {
                console.log(err)
            }
            )
    }
    render() {


        return (
            <div className={styles.container}>
                <div style={{ width: "100%" }}>
                    <List
                        className={styles.list}
                        itemLayout="horizontal"
                        dataSource={this.state.data}
                        renderItem={item => (
                            <List.Item>
                                <div style={{ width: "100%", display: 'flex' }}>
                                    <p className={styles.leftItem}>{item.title}</p>
                                    <p className={styles.rightItem} >
                                        <Button className={styles.musicButton} icon="caret-up" shape="round" type="dashed" htmlType="submit" onClick={() => this.handleMoveClick(true, item)} />
                                        <Button className={styles.musicButton} icon="caret-down" shape="round" type="dashed" htmlType="submit" onClick={() => this.handleMoveClick(false, item)} />
                                        <Button className={styles.musicButton} icon="close" shape="round" type="dashed" htmlType="submit" onClick={() => this.handleDeleteClick(item)} />
                                        <Button className={styles.musicButton} icon="caret-right" shape="round" type="dashed" htmlType="submit" onClick={() => this.handlePlayClick(item)} />
                                    </p>
                                </div>
                            </List.Item>
                        )}
                    />

                </div>
            </div>

        );
    }

}

