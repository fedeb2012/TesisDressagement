import React, { useEffect, useState } from "react";
import Player from '../components/player'
import { authFetch } from "../auth";

function Secret() {
    const [message, setMessage] = useState('')
  
    useEffect(() => {
      authFetch("/api/protected").then(response => {
        if (response.status === 401) {
          setMessage("Sorry you aren't authorized!")
          return null
        }
        return response.json()
      }).then(response => {
        if (response && response.message) {
          setMessage(
            <Player />
          )
        }
      })
    }, [])
  
    return (
      <h2>Secret: {message}</h2>
    )
  }

  export default Secret;