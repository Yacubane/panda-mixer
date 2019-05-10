import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { List, Button } from 'antd';
import './MusicList.css';

export default class MusicList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        };

    }


    update() {
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

                }
            })
            .catch((err) => {
                console.log(err)
            }
            )
    }
    componentDidMount() {
        console.log(this.state.data)
        this.update()

        this.interval = setInterval(this.update.bind(this), 1000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    handleDeleteClick = (item) => {
        fetch('http://127.0.0.1:8000/api/playlists/' + this.props.playlistId + "/elements/" + item.order + "/", {
            method: 'delete',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
        }).then(function (response) {
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
            <div className="Container">
                <div style={{ width: "100%" }}>
                    <List
                        className="List"
                        itemLayout="horizontal"
                        dataSource={this.state.data}
                        renderItem={item => (
                            <List.Item>
                                <div style={{ width: "100%" }}>
                                    <p className="Left-Item">{item.data}</p>
                                    <p className="Right-Item" >
                                        <Button style={{ width: "5em" }} type="primary" htmlType="submit" onClick={() => this.handleDeleteClick(item)}>
                                            Delete
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

