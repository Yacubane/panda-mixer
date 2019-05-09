import React, { Component } from 'react';
import { Layout, Button } from 'antd';
import 'antd/dist/antd.css';
import './Index.css';
import CenterBox from '../components/CenterBox';
import SiteLayout from '../components/SiteLayout';
import RegisterBox from '../components/RegisterBox';


export default class Index extends Component {
  constructor(props) {
    super(props);
  }

  handleClick = (e) => {
    let status;
    fetch('http://127.0.0.1:8000/api/playlists/', {
      method: 'POST',
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({ type: "YT" })
    }).then(function (response) {
      status = response.status;
      console.log(response)
      return response.json();
    }
    )
      .then((data) => {
        console.log(data);
        if (status == 201) {
          this.props.history.push('/p/' + data["link_id"] + "/")
        } else {
          console.log("Error")
        }
      })
      .catch((err) => {
        console.log(err)
      }
      )
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
              <Button className="Content-Button" type="primary" shape="round" onClick={this.handleClick}>Generate link (YouTube)</Button>
            </div>
          </CenterBox>
      </SiteLayout >
    );
  }

}

