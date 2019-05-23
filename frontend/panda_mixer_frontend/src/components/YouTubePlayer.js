import React, {Component, PropTypes} from 'react';
import styles from './YouTubePlayer.module.scss';
import CenterBox from "../pages/Playlist";
import hidden from "../assets/not_visible.png";

let loadYT;

export default class YouTubePlayer extends Component {
    componentDidMount() {
        if (!loadYT) {
            loadYT = new Promise((resolve) => {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                window.onYouTubeIframeAPIReady = () => resolve(window.YT)
            })
        }
        loadYT.then((YT) => {
            this.player = new YT.Player(this.youtubePlayerAnchor, {
                height: this.props.height || "100%",
                width: this.props.width || "100%",
                videoId: this.props.YTid,
                volume: 100,
                events: {
                    onStateChange: this.onPlayerStateChange
                }

            })
        })
    }

    playVideo = (id) => {
        this.player.loadVideoById(id, 0, "large");
        this.player.playVideo()
    };

    onPlayerStateChange = (e) => {
        if (typeof this.props.onPlayerStateChange === 'function') {
            this.props.onPlayerStateChange(e)
        }
    };

    render() {
        return (
            <section className='youtubeComponent-wrapper'>
                <div style={{width: "320px", height: "180px", margin: "auto", display: "block"}} ref={(r) => {
                    this.youtubePlayerAnchor = r
                }}></div>
            </section>
        )
    }
}
