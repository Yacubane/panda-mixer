import React, { Component } from 'react';
import {Layout, Button, Icon} from 'antd';
import 'antd/dist/antd.css';
import './Index.css';
import CenterBox from '../components/CenterBox';
import SiteLayout from '../components/SiteLayout';
import RegisterBox from '../components/RegisterBox';

import Auth from '../functions/Auth';

export default class Index extends Component {
  constructor(props) {
    super(props);
  }

  handleClick = (e) => {
    Auth.fetch('http://127.0.0.1:8000/api/playlists/', 'POST', JSON.stringify({ type: "YT" }))
      .then((response) => {
        if(response.status == 201) {
          this.props.history.push('/p/' + response.json["link_id"] + "/")
        }
      })
      .catch((err) => {
        console.log("aha2")

      })
  }

  render() {
    return (
      <SiteLayout>
        <CenterBox>
          <div className="Content" >
            <p className="Content-Header"> Panda Mixer</p>
            <p className="Content-Text">
              Panda Mixer is an app, where you can make music playlist cooperatively on YouTube.
              Click to generate link and share it with friends!
              </p>
            <Button className="Content-Button" type="primary" shape="round" onClick={this.handleClick}>
              <Icon style={{ "font-size": "2em", "vertical-align": "middle" }} type="youtube" />
              Generate link
            </Button>
          </div>
        </CenterBox>
      </SiteLayout >
    );
  }

}

