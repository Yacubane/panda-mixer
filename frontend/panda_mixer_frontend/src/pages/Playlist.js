import React, { Component } from 'react';

import 'antd/dist/antd.css';
import './Playlist.css';

import { Button, Modal, Input, List } from 'antd';

import SiteLayout from '../components/SiteLayout';
import CenterBox from '../components/CenterBox';
import MusicList from '../components/MusicList';

export default class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    }
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
  updateInputValue2 = (evt) => {
    console.log(evt.target.value);
    this.setState({
      inputValue2: evt.target.value
    });
    this.handleYoutubeQueryUpdate();
  }

  handleAddToPlaylistClick = () => {
    let status;
    fetch('http://127.0.0.1:8000/api/playlists/' + this.props.match.params.id + "/elements/", {
      method: 'POST',
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({ data: this.state.inputValue })
    }).then((response) => {
      console.log(response);
      status = response.status;
      if (status == 201) {
        this.setModalVisible(false);
      }
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

  handleYoutubeQueryUpdate = () => {
    let status;
    fetch('http://127.0.0.1:8000/api/ytquery/' + this.state.inputValue2 + "/", {
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json; charset=UTF-8"
      },
    }).then((response) => {
      console.log(response);
      status = response.status;
      if (status == 201) {
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


  render() {
    return (
      <SiteLayout>
        <Modal
          title="Vertically centered modal dialog"
          centered
          visible={this.state.modalVisible}
          onOk={() => this.setModalVisible(false)}
          onCancel={() => this.setModalVisible(false)}
          style={{width: "100px"}}
        >

          Enter YouTube link:
          <div>
            <Input value={this.state.inputValue} onChange={this.updateInputValue} placeholder="Basic usage" />
            <Button
              style={{ width: "5em" }}
              type="primary"
              onClick={this.handleAddToPlaylistClick.bind(this)}
            > Add </Button>
          </div>

          Or search in YouTube:
          <Input placeholder="Basic usage2" onChange={this.updateInputValue2} />

          <div style={{ height: "10em", overflow: "auto" }}>
            <p>some contents...</p>
            <List
              className="List"
              itemLayout="horizontal"
              dataSource={this.state.youtubeQueryData}
              renderItem={item => (
                <List.Item>
                  <div style={{display: 'flex', width: "100%"}}>
                    <div style={{flex: '0 0 30%',}}>
                      <div style={{ display: 'flex', 'align-items': 'center', height: '100%' }}>
                      <img src={item.thumbnailUrl} alt="" width="100%" />
                    </div>
                  </div>
                  <div style={{flex: '0 0 70%', overflow:'hidden', border: '1px solid #0000001a', padding: '0.25em'}}>
                    <div style={{width:'100%', height:'100%', display: 'flex', 'flex-direction': 'column',}}>
                      <h5> {item.title} </h5>
                      <div style={{'margin-top': 'auto'}}>
                        <a href="#" class="btn btn-primary mr-2">Play</a>
                        <a href="#" class="btn btn-primary" onclick="add_link_from(\''+ id + '\')">Add</a>
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
            <MusicList playlistId={this.props.match.params.id} />
            <br />
            <Button style={{ width: "50%" }} type="primary" htmlType="submit" onClick={this.handleAddClick.bind(this)}>
              Add
          </Button>
          </div>
        </CenterBox>
      </SiteLayout >
    );
  }

}

