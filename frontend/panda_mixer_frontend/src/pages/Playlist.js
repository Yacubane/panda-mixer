import React, { Component } from 'react';

import 'antd/dist/antd.css';
import styles from './Playlist.module.scss';

import { Button, Modal, Input, List } from 'antd';

import SiteLayout from '../components/SiteLayout';
import CenterBox from '../components/CenterBox';
import MusicList from '../components/MusicList';
import YouTubePlayer from '../components/YouTubePlayer';
import Auth from '../functions/Auth';
import { withRouter } from 'react-router-dom'
import image from "../assets/404.png";
import hidden from "../assets/not_visible.png"

class Playlist extends Component {


  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      playlistData: null,
    }
    this.YTPlayer = React.createRef();
    this.musicList = React.createRef();
  }

  startWebsocket = () => {
    this.websocket = new WebSocket(
      'ws://127.0.0.1:8000/ws/playlist/' + this.props.match.params.id + '/');
    this.websocket.onmessage = (e) => {
      var data = JSON.parse(e.data);
      console.log(data.message)

      if (data.message == "PLAYLIST_ADD" ||
          data.message == "PLAYLIST_PATCH" ||
          data.message == "PLAYLIST_DELETE") {
        if (this.musicList.current != null)
          this.musicList.current.update()
      } else if (data.message == "PERMISSIONS_CHANGE") {
        this.updatePlaylistInfo()
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
    this.updatePlaylistInfo();
    this.startWebsocket();

  }

  componentWillUnmount() {
    this.websocket.onclose = function () { };
    this.websocket.onerror = (error) => { };
    this.websocket.close();
  }

  setModalVisible(modalVisible) {
    this.setState((prevState) => ({ ...prevState, modalVisible: modalVisible }));
  }


  handleAddClick() {
    this.setModalVisible(true);
  }

  updatePlaylistInfo = () => {
    Auth.fetch('http://127.0.0.1:8000/api/playlists/' + this.props.match.params.id + '/', 'GET', null)
      .then((response) => {
        if (response.status == 200) {
          this.setState(prevState => ({
            ...prevState,
            playlistData: {
              publicEditable: response.json.public_editable,
              publicVisible: response.json.public_visible,
              owner: response.json.owner,
              isOwner: Auth.isLoggedIn() && response.json.owner == Auth.getUsername()
            }
          }));
        } else {
          throw null
        }
      })
      .catch((err) => {
        this.props.history.push('/404')
      })
  }

  updatePublicEditable = () => {
    console.log("test " + this.state.publicEditable);
    Auth.fetch('http://127.0.0.1:8000/api/playlists/' + this.props.match.params.id + '/', 'PATCH',
      JSON.stringify({ public_editable: !this.state.playlistData.publicEditable }))
      .then((response) => {
        console.log(response.status)
        if (response.status == 200) {

        }
      })
      .catch((err) => {
        console.log("Error")
      })
  }


  updatePublicVisible = () => {
    Auth.fetch('http://127.0.0.1:8000/api/playlists/' + this.props.match.params.id + '/', 'PATCH',
      JSON.stringify({ public_visible: !this.state.playlistData.publicVisible }))
      .then((response) => {
        console.log(response.status)
        if (response.status == 200) {

        }
      })
      .catch((err) => {

      })
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


  isVisibleOrOwner = () => {
    return this.state.playlistData && (this.state.playlistData.publicVisible || this.state.playlistData.isOwner)
  }
  isntVisibleOrOwner = () => {
    return this.state.playlistData && !(this.state.playlistData.publicVisible || this.state.playlistData.isOwner)
  }

  isEditableOrOwner = () => {
    return this.state.playlistData && (this.state.playlistData.publicEditable || this.state.playlistData.isOwner)
  }
  isntEditableOrOwner = () => {
    return this.state.playlistData && !(this.state.playlistData.publicEditable || this.state.playlistData.isOwner)
  }

  render() {
    return (
      <SiteLayout className={styles.root}>
        <Modal
          title="Add playlist item"
          centered
          visible={this.state.modalVisible}
          onOk={() => this.setModalVisible(false)}
          onCancel={() => this.setModalVisible(false)}
          width="50em"
        >

          Enter YouTube link:
          <div style={{ "display": "flex", margin: "0.25em" }}>
            <Input value={this.state.inputValue} onChange={this.updateInputValue} placeholder="Type YouTube link" />
            <Button
              style={{ width: "5em", }}
              type="primary"
              onClick={() => this.handleAddToPlaylistClick(this.get_link_id(this.state.inputValue))}
            > Add </Button>
          </div>

          Or search in YouTube:
          <div style={{ "display": "flex", margin: "0.25em" }}>
            <Input value={this.state.inputValueYT} onChange={this.updateInputValueYT} placeholder="Search in YouTube" />
            <Button
              style={{ width: "5em", }}
              type="primary"
              onClick={() => this.handleYoutubeQueryUpdate()}
            > Search </Button>
          </div>


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
          <div style={{ "max-width": "100%" }}>
            <div> {this.state.playlistData != null && this.state.playlistData['public_editable']} </div>
            <div style={{ "text-align": "center" }}>
              {this.state.playlistData && this.state.playlistData.isOwner &&
                <Button
                  onClick={this.updatePublicEditable}
                  style={{ width: "10em", }} className={styles.basicButton} icon="edit" type="round" htmlType="submit">
                  {this.state.playlistData && this.state.playlistData.publicEditable && "Lock edit"}
                  {this.state.playlistData && !this.state.playlistData.publicEditable && "Unlock edit"}
                </Button>}

              {this.state.playlistData && this.state.playlistData.isOwner &&
                <Button
                  onClick={this.updatePublicVisible}
                  style={{ width: "10em", }} className={styles.basicButton} icon="eye" type="round" htmlType="submit">
                  {this.state.playlistData && this.state.playlistData.publicVisible && "Lock visible"}
                  {this.state.playlistData && !this.state.playlistData.publicVisible && "Unlock visible"}
                </Button>}
            </div>
            <div>
              {this.isVisibleOrOwner() &&
                <MusicList ref={this.musicList} playlistId={this.props.match.params.id} showEditOptions={() => this.isEditableOrOwner()} onPlayClick={(order, id) => { this.setState({ lastVideoOrder: order }); this.YTPlayer.current.playVideo(id) }} />}
              {this.isntVisibleOrOwner() &&
                <CenterBox>
                    <img className={styles.Image} src={hidden}/>
                </CenterBox>
              }
            </div>
            <div>
              <div style={{ 'text-align': 'center', }}>
                {this.isEditableOrOwner() && this.isVisibleOrOwner() &&
                  <Button
                    style={{
                      width: "50%",
                    }}
                    className={styles.basicButton + ' ' + styles.addButton} icon="plus" type="round" htmlType="submit" onClick={this.handleAddClick.bind(this)}>
                    Add
                </Button>
                }
              </div>

            </div>
            <div>
              {this.isVisibleOrOwner() &&
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
                } />}
            </div>
          </div>
        </CenterBox>
      </SiteLayout >
    );
  }

}

export default withRouter(Playlist)