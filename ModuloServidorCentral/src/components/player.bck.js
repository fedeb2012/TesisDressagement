import React, {useState} from "react"
import ReactPlayer from 'react-player'
import Duration from './duration'

function Player() {
    //const[url, setUrl] = useState(0)
    //const[playing, setPlaying] = useState(0)
    const[played, setPlayed] = useState(0)
    const[duration, setDuration] = useState(0)
    
    const handleProgress = played => {
        console.log('onProgress', played)
        // We only want to update time slider if we are not currently seeking
        if (!this.state.seeking) {
            setPlayed(played)
        }
      }
      
    const handleDuration = (duration) => {
        console.log('onDuration', duration)
        setDuration( duration )
    }

    const handleSeekChange = e => {
        setPlayed(parseFloat(e.target.value))
      }

    return (
        <React.Fragment>
            <ReactPlayer 
                url= 'assets/videos/grabacion.mp4' width='100%'
                height='100%'
                controls = {true} 
                onDuration={handleDuration}
                //onProgress={handleProgress}
                onSeek={e => console.log('onSeek', e)}
            />
            <table>
          <tr>
            <th>duration</th>
            <td><Duration seconds={duration} /></td>
          </tr>
          <tr>
            <th>elapsed</th>
            <td><Duration seconds={duration * played} /></td>
          </tr>
        </table>
        </React.Fragment>
    )
}

export default Player;