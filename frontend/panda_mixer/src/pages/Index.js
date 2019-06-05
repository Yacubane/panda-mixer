import React, {Component} from 'react';
import {Button, Icon} from 'antd';
import 'antd/dist/antd.css';
import './Index.css';
import CenterBox from '../components/CenterBox';
import SiteLayout from '../components/SiteLayout';

import Auth from '../functions/Auth';
import logo from '../assets/logo.png'

export default class Index extends Component {
    handleClick = (e) => {
        Auth.fetch('http://127.0.0.1:8000/api/playlists/', 'POST', JSON.stringify({type: "YT"}))
            .then((response) => {
                if (response.status === 201) {
                    this.props.history.push('/p/' + response.json["link_id"] + "/")
                }
            })
            .catch((err) => {
            })
    };

    render() {
        return (
            <SiteLayout>
                <CenterBox>
                    <div className="Content">
                        <img alt="logo" src={logo} width="400em" style={{ "margin-right": "0.7em", "max-width": "100%" }}></img>
                        <p className="Content-Header"> Panda Mixer</p>
                        <p className="Content-Text">
                            Panda Mixer is an app, where you can make music playlist cooperatively on YouTube.
                            Click to generate link and share it with friends!
                        </p>
                        <Button className="Content-Button" type="primary" shape="round" onClick={this.handleClick}>
                            <Icon style={{"font-size": "2em", "vertical-align": "middle"}} type="youtube"/>
                            Generate link
                        </Button>
                    </div>
                </CenterBox>
            </SiteLayout>
        );
    }

}

