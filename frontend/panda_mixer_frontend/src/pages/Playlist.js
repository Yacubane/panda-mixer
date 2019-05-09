import React, { Component } from 'react';

import 'antd/dist/antd.css';
import './Index.css';

import SiteLayout from '../components/SiteLayout';
import CenterBox from '../components/CenterBox';
import MusicList from '../components/MusicList';

export default class Playlist extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <SiteLayout>
          <CenterBox>
            {/* <div className="Content" >
                {this.props.match.params.id}
            </div> */}
            <MusicList playlistId={this.props.match.params.id}/>
          </CenterBox>
      </SiteLayout >
    );
  }

}

