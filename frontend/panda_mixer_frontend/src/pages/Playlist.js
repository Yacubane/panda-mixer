import React, { Component } from 'react';

import 'antd/dist/antd.css';
import './Index.css';

import { Button, Modal, Input } from 'antd';

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
  updateInputValue(evt) {
    console.log(evt.target.value);
    this.setState({
      inputValue: evt.target.value
    });
  }

  handleAddToPlaylistClick() {
    let status;
    fetch('http://127.0.0.1:8000/api/playlists/' + this.props.match.params.id + "/elements/", {
      method: 'POST',
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({ data: this.state.inputValue })
    }).then(function (response) {
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
  render() {
    return (
      <SiteLayout>
        <Modal
          title="Vertically centered modal dialog"
          centered
          visible={this.state.modalVisible}
          onOk={() => this.setModalVisible(false)}
          onCancel={() => this.setModalVisible(false)}
        >

          Enter YouTube link:
          <div>
            <Input value={this.state.inputValue} onChange={this.updateInputValue.bind(this)} placeholder="Basic usage" />
            <Button
              style={{ width: "5em" }}
              type="primary"
              onClick={this.handleAddToPlaylistClick.bind(this)}
            > Add </Button>
          </div>

          Or search in YouTube:
          <Input placeholder="Basic usage2" />


          <div style={{ height: "10em", overflow: "auto" }}>
            <p>some contents...</p>
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

