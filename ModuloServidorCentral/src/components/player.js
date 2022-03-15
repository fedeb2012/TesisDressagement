import React, { Component } from 'react'
import ReactPlayer from 'react-player'
import myVideo from '../assets/grabacion.mp4'
import Duration from './duration'
//import Chart from './chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

const dataR = [
  createData('00:00', 0),
  createData('03:00', 300),
  createData('03:00', 300),
  createData('03:00', 300),
  createData('06:00', 600),
  createData('09:00', 800),
  createData('12:00', 1500),
  createData('15:00', 2000),
  createData('18:00', 2400),
  createData('21:00', 2400),
  createData('24:00', undefined),
];

var data1 = [
  createData('00:00', 0),
];

var dataPoints = 0;

function createData(time, amount) {
  return { time, amount };
}

class Player extends Component {
  state = {
    url: null,
    pip: false,
    playing: true,
    controls: false,
    light: false,
    volume: 0.8,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false
  }

  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing })
  }

  handlePlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
  }

  handleProgress = state => {
    console.log('onProgress', state)
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
    data1.length = 0;
    dataPoints = this.state.playedSeconds;
    for (let i = 0; i < dataPoints; i++) {
      data1.push(dataR[i]);
    }

    console.log({ data1 })
  }

  handleEnded = () => {
    console.log('onEnded')
    this.setState({ playing: this.state.loop })
  }

  handleDuration = (duration) => {
    console.log('onDuration', duration)
    this.setState({ duration })
  }

  handleSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) })

  }

  render() {
    const { played, duration } = this.state

    return (
      <React.Fragment>
        <ReactPlayer
          className='react-player'
          url={'../assets/videos/' + this.props.id_entrenamiento + '.mp4'}
          //url={myVideo}
          width='100%'
          height='80%'
          controls={true}
          onProgress={this.handleProgress}
          onDuration={this.handleDuration}
          style={{background: '#888888'}}
        />
        {<table>
          <tr>
            <th>duration</th>
            <td><Duration seconds={duration} /></td>
          </tr>
          <tr>
            <th>elapsed</th>
            <td><Duration seconds={duration * played} /></td>
          </tr>
          <tr>
            <th>Played</th>
            <td><progress max={1} value={played} /></td>
          </tr>
        </table>/*
        <LineChart width={500} height={300} data={data1}>
          <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="amount" />
          <YAxis />
        </LineChart>*/}
      </React.Fragment>
    );
  }
}

export default Player;