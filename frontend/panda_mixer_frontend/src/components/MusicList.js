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
        Auth.fetch('http://127.0.0.1:8000/api/playlists/' + this.props.playlistId + "/elements/" + item.order + "/",
            'DELETE', null)
            .then((response) => {
                if (response.status == 200)
                    this.update();
            }).catch((err) => {
                console.log(err)
            })
    }
    handleMoveClick = (up, item) => {
        Auth.fetch('http://127.0.0.1:8000/api/playlists/' + this.props.playlistId + "/elements/" + item.order + "/",
            'PATCH', JSON.stringify({ order: item.order + (up ? -1 : 1) }))
            .then((response) => {
                if (response.status == 200)
                    this.update();
            }).catch((err) => {
                console.log(err)
            })
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
                                <div className={styles.itemContainer} style={{ width: "100%", display: 'flex' }}>
                                    <p className={styles.leftItem}>{item.title}</p>
                                    <p className={styles.rightItem} >
                                        {this.props.showEditOptions() &&
                                            <Button className={styles.musicButton} icon="caret-up" shape="round" type="dashed" htmlType="submit" onClick={() => this.handleMoveClick(true, item)} />}
                                        {this.props.showEditOptions() &&
                                            <Button className={styles.musicButton} icon="caret-down" shape="round" type="dashed" htmlType="submit" onClick={() => this.handleMoveClick(false, item)} />}
                                        {this.props.showEditOptions() &&
                                            <Button className={styles.musicButton} icon="close" shape="round" type="dashed" htmlType="submit" onClick={() => this.handleDeleteClick(item)} />}
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

