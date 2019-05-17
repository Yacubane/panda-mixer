import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { List, Button } from 'antd';
import styles from './MusicList.module.scss';

export default class MusicList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        };

    }


    update = () => {
        console.log("Updating");

        let status;
        fetch('http://127.0.0.1:8000/api/playlists/' + this.props.playlistId + "/elements/", {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
        }).then(function (response) {
            status = response.status;
            return response.json();
        }
        )
            .then((data) => {
                if (status == 200) {
                    data.sort((a, b) => a.order < b.order ? -1 : 1)
                    this.setState({
                        data: data,
                    });
                    console.log("Success");
                } else {
                    console.log("Error");

                }
            })
            .catch((err) => {
                console.log(err)
            }
            )
    }

    startWebsocket = () => {
        this.websocket = new WebSocket(
            'ws://127.0.0.1:8000/ws/playlist/' + this.props.playlistId + '/');
        this.websocket.onmessage = (e) => {
            var data = JSON.parse(e.data);
            if (data.message == "ADD" ||
                data.message == "UPDATE" ||
                data.message == "DELETE") {
                this.update.bind(this)
            }
        };
        this.websocket.onclose = () => {
            console.log('Chat socket closed unexpectedly');
            setTimeout(() => this.startWebsocket(), 1000);
        };

        this.websocket.onerror = (error) => {
            console.log(error);
        };
    }

    componentDidMount() {
        this.update()
        this.startWebsocket();
    }
    componentWillUnmount() {
        this.websocket.onclose = function () { };
        this.websocket.close();
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
                                        <Button style={{ width: "5em" }} type="primary" htmlType="submit" onClick={() => this.handleMoveClick(true, item)}>
                                            Up
                                        </Button>
                                        <Button style={{ width: "5em" }} type="primary" htmlType="submit" onClick={() => this.handleMoveClick(false, item)}>
                                            Down
                                        </Button>
                                        <Button style={{ width: "5em" }} type="primary" htmlType="submit" onClick={() => this.handleDeleteClick(item)}>
                                            Delete
                                        </Button>
                                        <Button style={{ width: "5em" }} type="primary" htmlType="submit" onClick={() => this.handlePlayClick(item)}>
                                            Play
                                        </Button>
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

