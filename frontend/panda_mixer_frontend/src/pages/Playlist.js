import React, { Component } from 'react';

import 'antd/dist/antd.css';
import styles from './Playlist.module.scss';

import { Button, Modal, Input, List } from 'antd';

import SiteLayout from '../components/SiteLayout';
import CenterBox from '../components/CenterBox';
import MusicList from '../components/MusicList';
import YouTubePlayer from '../components/YouTubePlayer';

export default class Playlist extends Component {


  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    }
    this.YTPlayer = React.createRef();
    this.musicList = React.createRef();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }


  handleAddClick() {
    this.setModalVisible(true);
  }


  updateInputValue = (evt) => {
    console.log(evt.target.value);
    this.setState({
      inputValue: evt.target.value
    });
  }


  updateInputValueYT = (evt) => {
    console.log(evt.target.value);
    this.setState({
      inputValueYT: evt.target.value,
    });

    clearInterval(this.interval);
    this.interval = setTimeout(() => this.handleYoutubeQueryUpdate(), 1000);
  }


  handleAddToPlaylistClick = (id) => {

    if (id === false) {

      alert("Wrong link");
      return;
    }

    let status;
    fetch('http://127.0.0.1:8000/api/playlists/' + this.props.match.params.id + "/elements/", {
      method: 'POST',
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({ id: id })
    }).then((response) => {
      console.log(response);
      status = response.status;
      if (status === 201) {
        this.setModalVisible(false);
      }
      return response.json();
    }).then((data) => {

    }).catch((err) => {
      console.log(err)
    })
  }


  handleYoutubeQueryUpdate = () => {
    let status;
    fetch('http://127.0.0.1:8000/api/ytquery/' + this.state.inputValueYT + "/", {
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json; charset=UTF-8"
      },
    }).then((response) => {
      console.log(response);
      status = response.status;
      if (status === 201) {
        this.setModalVisible(false);
      }
      return response.json();
    }
    )
      .then((data) => {
        var youtubeQueryData = [];
        for (let i = 0; i < data['items'].length; i++) {
          let item = data['items'][i];
          let id = item['id']['videoId'];
          let thumbnail = item['snippet']['thumbnails']['medium']['url'];
          let title = item['snippet']['title'];
          let description = item['snippet']['description'];

          youtubeQueryData.push({
            id: id,
            thumbnailUrl: thumbnail,
            title: title,
            description: description,
          })
        }
        this.setState({
          youtubeQueryData: youtubeQueryData
        });
      })
      .catch((err) => {
        console.log(err)
      }
      )
  }


  get_link_id = (link) => {
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = link.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
  }


  render() {
    return (
      <SiteLayout className={styles.root}>
        <Modal
          title="Vertically centered modal dialog"
          centered
          visible={this.state.modalVisible}
          onOk={() => this.setModalVisible(false)}
          onCancel={() => this.setModalVisible(false)}
          width="50em"
        >

          Enter YouTube link:
          <div>
            <Input value={this.state.inputValue} onChange={this.updateInputValue} placeholder="Basic usage" />
            <Button
              style={{ width: "5em", }}
              type="primary"
              onClick={() => this.handleAddToPlaylistClick(this.get_link_id(this.state.inputValue))}
            > Add </Button>
          </div>

          Or search in YouTube:
          <Input placeholder="Basic usage2" onChange={this.updateInputValueYT} />

          <div style={{ height: "25em", overflow: "auto" }}>
            <List
              className="List"
              itemLayout="horizontal"
              dataSource={this.state.youtubeQueryData}
              renderItem={item => (
                <List.Item>
                  <div style={{ display: 'flex', width: "100%" }}>
                    <div style={{ flex: '0 0 30%', }}>
                      <div style={{ display: 'flex', 'align-items': 'center', height: '100%' }}>
                        <img src={item.thumbnailUrl} alt="" width="100%" />
                      </div>
                    </div>
                    <div style={{ flex: '0 0 70%', overflow: 'hidden', border: '1px solid #0000001a', padding: '0.25em' }}>
                      <div style={{ width: '100%', height: '100%', display: 'flex', 'flex-direction': 'column', }}>
                        <h5> {item.title} </h5>
                        <div style={{ 'margin-top': 'auto' }}>
                          <Button style={{ width: "5em" }} type="primary" htmlType="submit" onClick={() => this.handleAddToPlaylistClick(item.id)}>
                            Add
                          </Button>
                          <Button style={{ width: "5em" }} type="primary" htmlType="submit" onClick={() => this.handleDeleteClick(item)}>
                            Play
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div class="w-100"></div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Modal>
        <CenterBox>
          <div>
            <MusicList ref={this.musicList} playlistId={this.props.match.params.id} onPlayClick={(order, id) => { this.setState({ lastVideoOrder: order }); this.YTPlayer.current.playVideo(id) }} />
            <br />
            <div>
              <div style={{ 'text-align': 'center', }}>
                <Button style={{ width: "50%", }} type="primary" htmlType="submit" onClick={this.handleAddClick.bind(this)}>
                  Add
                </Button>
              </div>

            </div>
            <div>
              <YouTubePlayer ref={this.YTPlayer} YTid={''} onPlayerStateChange={(e) => {
                if (e.data === 0) {
                  this.setState({ lastVideoOrder: this.state.lastVideoOrder + 1 });
                  let videoId = this.musicList.current.getVideoIDByOrder(this.state.lastVideoOrder)
                  console.log(videoId)
                  if (videoId === false) {
                    this.setState({ lastVideoOrder: 0 });
                  } else {
                    this.YTPlayer.current.playVideo(videoId)
                  }
                }
              }
              } />
            </div>
          </div>
        </CenterBox>
      </SiteLayout >
    );
  }

}

