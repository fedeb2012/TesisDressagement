import React, { useState } from "react";
import {login, useAuth, logout} from "../auth";
import CssBaseline from '@material-ui/core/CssBaseline';

import {TextField, Paper, Box, Grid} from '@material-ui/core'

import Image from '../assets/imgLogin.jpg';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: `url(${Image})`,
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
  
    const classes = useStyles();

    const onSubmitClick = (e)=>{
      e.preventDefault()
      console.log("You pressed login")
      let opts = {
        'username': username,
        'password': password
      }
      console.log(opts)
      fetch('/api/login', {
        method: 'post',
        body: JSON.stringify(opts)
      }).then(r => r.json())
        .then(token => {
          if (token.access_token){
            login(token)
            console.log(token)          
          }
          else {
            console.log("Please type in correct username/password")
          }
        })
    }
  
    const handleUsernameChange = (e) => {
      setUsername(e.target.value)
    }
  
    const handlePasswordChange = (e) => {
      setPassword(e.target.value)
    }
  
    const [logged] = useAuth();
  
    return (
      <Grid container component="main" className={classes.root}>
          <CssBaseline />
          <Grid item xs={false} sm={4} md={7} className={classes.image} />
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <Box>
              {!logged?     
                <form className="centerMyForm">
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="Username"
                      label="Username"
                      name="Username"
                      autoComplete="Username"
                      autoFocus
                      placeholder="Username" 
                      onChange={handleUsernameChange}
                      value={username} 
                    />
                 <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    onChange={handlePasswordChange}
                    value={password}
                  />
                  
                  <Button
                    onClick={onSubmitClick}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                  >
                    Sign In
                  </Button>
                </form>
              :            
                  <form className="centerMyForm">
                    <Button
                    onClick={() => logout()}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                  >
                    Logout
                  </Button>
                  </form>
              }
          </Box>
          </div>
          </Grid>
        </Grid>
    )
  }

  export default Login;