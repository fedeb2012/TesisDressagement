import { useEffect, useState } from "react";
import * as React from 'react';
import ReactPlayer from 'react-player'
import {
    useParams
} from "react-router-dom";
import {
    Chart,
    LineSeries,
    ArgumentAxis,
    ValueAxis,
    Legend,
    Title,
    ZoomAndPan
} from '@devexpress/dx-react-chart-material-ui';
import { makeStyles } from '@material-ui/core/styles';

import axios from "axios"
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHorseHead, faUser, faCalendar} from '@fortawesome/free-solid-svg-icons'

import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

// Import images
import pataDelanteraIzq from '../assets/pataDelanteraIzq.png'; 
import pataDelanteraDer from '../assets/pataDelanteraDer.png'; 
import pataTraseraIzq from '../assets/pataTraseraIzq.png';
import pataTraseraDer from '../assets/pataTraseraDer.png';

// Import css
import "../styles/verEntrenamiento.css"


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
      },
    gridList: {
        width: "98%",
        height: "auto",
    },
    gridInside: {
        height: 200,
    },
    chart: {
        flexDirection: 'row',
    },
    paper: {
        marginTop: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    paper2: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: '#303f9f',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
        background: '#303f9f',
        color: '#FFFFFF',
    },
    playerWrapper: {
        position: 'relative',
    },
    reactPlayer: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    columnPata: {
        marginTop: theme.spacing(10),
    },
    columnSemaforo: {
        marginTop: theme.spacing(12),
    },
    pepe:{
        left: '4em',
    }
}));

function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
        {value === index && (
            <Box p={3}>
            <Typography>{children}</Typography>
            </Box>
        )}
        </div>
    );
}

function VerEntrenamiento() {
    let { id } = useParams();    

    const [loadingString, setLoadingString] = useState('CARGANDO ENTRENAMIENTO ');
    const [loadingAngulo, setLoadingAngulo] = useState('Angulo de pisada(Cargando)');
    const [loadingImpacto, setLoadingImpacto] = useState('Fuerza de impacto(Cargando)');
    const [loadingPasos, setLoadingPasos] = useState('Pasos(Cargando)');


    const [data, setData] = useState('');
    const [medidasSensor1, setMedidasSensor1] = useState('');
    const [medidasSensor2, setMedidasSensor2] = useState('');
    const [medidasSensor3, setMedidasSensor3] = useState('');
    const [medidasSensor4, setMedidasSensor4] = useState('');

    const [textoSemaforo1, setTextoSemaforo1] = useState('');
    const [textoSemaforo2, setTextoSemaforo2] = useState('');
    const [textoSemaforo3, setTextoSemaforo3] = useState('');
    const [textoSemaforo4, setTextoSemaforo4] = useState('');

    const [maxImpactosSensor1, setMaxImpactosSensor1] = useState('');
    const [maxImpactosSensor2, setMaxImpactosSensor2] = useState('');
    const [maxImpactosSensor3, setMaxImpactosSensor3] = useState('');
    const [maxImpactosSensor4, setMaxImpactosSensor4] = useState('');

    const [pasosSensor1, setPasosSensor1] = useState('');
    const [pasosSensor2, setPasosSensor2] = useState('');
    const [pasosSensor3, setPasosSensor3] = useState('');
    const [pasosSensor4, setPasosSensor4] = useState('');

    const [angulosSensor1, setAngulosSensor1] = useState('');
    const [angulosSensor2, setAngulosSensor2] = useState('');
    const [angulosSensor3, setAngulosSensor3] = useState('');
    const [angulosSensor4, setAngulosSensor4] = useState('');
    
    const [maxAngulosSensor1, setMaxAngulosSensor1] = useState('');
    const [maxAngulosSensor2, setMaxAngulosSensor2] = useState('');
    const [maxAngulosSensor3, setMaxAngulosSensor3] = useState('');
    const [maxAngulosSensor4, setMaxAngulosSensor4] = useState('');
    
    const [impactosSensor1, setImpactosSensor1] = useState('');
    const [impactosSensor2, setImpactosSensor2] = useState('');
    const [impactosSensor3, setImpactosSensor3] = useState('');
    const [impactosSensor4, setImpactosSensor4] = useState('');

    const [semaforo1, setSemaforo1] = useState('circleGreen');
    const [semaforo2, setSemaforo2] = useState('circleGreen');
    const [semaforo3, setSemaforo3] = useState('circleGreen');
    const [semaforo4, setSemaforo4] = useState('circleGreen');

    const [duration, setDuration] = useState('0');
    const [played, setPlayed] = useState('0');
    const [progressBar, setProgressBar] = useState('0');

    const classes = useStyles();

    const [tabs, setTabs] = React.useState(0);

    const handleDuration = (duration) => {
        //console.log('onDuration', duration)
        setDuration(duration)
    }

    const handleProgress = state => {
        //console.log('onProgress', state)
        // We only want to update time slider if we are not currently seeking
        if (!state.seeking) {
            setPlayed(state.played);
            setProgressBar(state.playedSeconds*100/duration);
            //console.log('AnguloSensor: ', medidasSensor1)
            console.log('Played: ', Math.round(state.playedSeconds));
            console.log(impactosSensor1);
            if(tabs==0){
                if(Math.round((maxImpactosSensor1[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100>=10){
                    setSemaforo1('circleRed');
                }else if(Math.round((maxImpactosSensor1[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100>=5){
                    setSemaforo1('circleOrange');
                } else{
                    setSemaforo1('circleGreen');
                }
                setTextoSemaforo1(Math.round((maxImpactosSensor1[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100);
                
                if(Math.round((maxImpactosSensor2[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100>=10){
                    setSemaforo2('circleRed');
                }else if(Math.round((maxImpactosSensor2[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100>=5){
                    setSemaforo2('circleOrange');
                } else{
                    setSemaforo3('circleGreen');
                }
                setTextoSemaforo2(Math.round((maxImpactosSensor2[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100);
                
                
                if(Math.round((maxImpactosSensor3[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100>=10){
                    setSemaforo3('circleRed');
                }else if(Math.round((maxImpactosSensor3[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100>=5){
                    setSemaforo3('circleOrange');
                } else{
                    setSemaforo3('circleGreen');
                }
                setTextoSemaforo3(Math.round((maxImpactosSensor3[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100);
                
                if(Math.round((maxImpactosSensor4[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100>=10){
                    setSemaforo4('circleRed');
                }else if(Math.round((maxImpactosSensor4[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100>=5){
                    setSemaforo4('circleOrange');
                } else{
                    setSemaforo4('circleGreen');
                }
                setTextoSemaforo4(Math.round((maxImpactosSensor4[Math.round(state.playedSeconds)].maxImpacto) * 100) / 100);
                
            }else if(tabs==1){
                setSemaforo1('circleHidden');
                setSemaforo2('circleHidden');
                setSemaforo3('circleHidden');
                setSemaforo4('circleHidden');
            }
            else if(tabs==2){
                if(Math.round((maxAngulosSensor1[Math.round(state.playedSeconds)].maxAngulo))>=40){
                    setSemaforo1('circleRed');
                }else if(Math.round((maxAngulosSensor1[Math.round(state.playedSeconds)].maxAngulo))>=35){
                    setSemaforo1('circleOrange');
                } else{
                    setSemaforo1('circleGreen');
                }
                setTextoSemaforo1(Math.round((maxAngulosSensor1[Math.round(state.playedSeconds)].maxAngulo)));
                
                if(Math.round((maxAngulosSensor2[Math.round(state.playedSeconds)].maxAngulo))>=40){
                    setSemaforo2('circleRed');
                }else if(Math.round((maxAngulosSensor2[Math.round(state.playedSeconds)].maxAngulo))>=35){
                    setSemaforo2('circleOrange');
                } else{
                    setSemaforo3('circleGreen');
                }
                setTextoSemaforo2(Math.round((maxAngulosSensor2[Math.round(state.playedSeconds)].maxAngulo)));
                
                
                if(Math.round((maxAngulosSensor3[Math.round(state.playedSeconds)].maxAngulo))>=40){
                    setSemaforo3('circleRed');
                }else if(Math.round((maxAngulosSensor3[Math.round(state.playedSeconds)].maxAngulo))>=35){
                    setSemaforo3('circleOrange');
                } else{
                    setSemaforo3('circleGreen');
                }
                setTextoSemaforo3(Math.round((maxAngulosSensor3[Math.round(state.playedSeconds)].maxAngulo)));
                
                if(Math.round((maxAngulosSensor4[Math.round(state.playedSeconds)].maxAngulo))>=40){
                    setSemaforo4('circleRed');
                }else if(Math.round((maxAngulosSensor4[Math.round(state.playedSeconds)].maxAngulo))>=35){
                    setSemaforo4('circleOrange');
                } else{
                    setSemaforo4('circleGreen');
                }
                setTextoSemaforo4(Math.round((maxAngulosSensor4[Math.round(state.playedSeconds)].maxAngulo)));
            }
        }
    }

    const handleTabs = (event, newValue) => {
        setTabs(newValue);
      };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/entrena/get',
                    data: {
                        entrenamiento_id: id
                    }
                });

                setData(result.data);                

                const dispositivo1 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/medida/dispositivo/get',
                    data: {
                        entrenamiento_id: id
                    }
                });

                setLoadingString("CARGANDO MEDIDAS - SENSOR 1 ");
                
                const medidaSensor1 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/medida/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[0].dispositivo_id
                    }
                });

                setLoadingString("CARGANDO MEDIDAS - SENSOR 2 ");

                const medidaSensor2 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/medida/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[1].dispositivo_id
                    }
                });

                setLoadingString("CARGANDO MEDIDAS - SENSOR 3 ");

                const medidaSensor3 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/medida/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[2].dispositivo_id
                    }
                });

                setLoadingString("CARGANDO MEDIDAS - SENSOR 4 ");

                const medidaSensor4 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/medida/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[3].dispositivo_id
                    }
                });

                setMedidasSensor1(medidaSensor1.data);
                //console.log(medidaSensor1.data);
                setMedidasSensor2(medidaSensor2.data);
                setMedidasSensor3(medidaSensor3.data);
                setMedidasSensor4(medidaSensor4.data);

                setLoadingString("CARGANDO MEDIDAS - SENSOR 1 ");

                setLoadingString("PROCESANDO IMPACTOS - SENSOR 1 ");

                const maxImpactoSensor1 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/maximpacto/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[0].dispositivo_id
                    }
                });
                
                setLoadingString("PROCESANDO IMPACTOS - SENSOR 2 ");

                const maxImpactoSensor2 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/maximpacto/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[1].dispositivo_id
                    }
                });

                setLoadingString("PROCESANDO IMPACTOS - SENSOR 3 ");

                const maxImpactoSensor3 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/maximpacto/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[2].dispositivo_id
                    }
                });

                setLoadingString("PROCESANDO IMPACTOS - SENSOR 4 ");

                const maxImpactoSensor4 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/maximpacto/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[3].dispositivo_id
                    }
                });

                setMaxImpactosSensor1(maxImpactoSensor1.data);    
                setMaxImpactosSensor2(maxImpactoSensor2.data);
                setMaxImpactosSensor3(maxImpactoSensor3.data);
                setMaxImpactosSensor4(maxImpactoSensor4.data);

                const impactoSensor1 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/impacto/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[0].dispositivo_id
                    }
                });
                
                setLoadingString("PROCESANDO IMPACTOS - SENSOR 2 ");

                const impactoSensor2 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/impacto/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[1].dispositivo_id
                    }
                });

                setLoadingString("PROCESANDO IMPACTOS - SENSOR 3 ");

                const impactoSensor3 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/impacto/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[2].dispositivo_id
                    }
                });

                setLoadingString("PROCESANDO IMPACTOS - SENSOR 4 ");

                const impactoSensor4 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/impacto/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[3].dispositivo_id
                    }
                });

                setImpactosSensor1(impactoSensor1.data);    
                setImpactosSensor2(impactoSensor2.data);
                setImpactosSensor3(impactoSensor3.data);
                setImpactosSensor4(impactoSensor4.data);
                
                setLoadingString("PROCESANDO PASOS - SENSOR 1 ");

                const pasoSensor1 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/paso/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[0].dispositivo_id
                    }
                });

                setLoadingString("PROCESANDO PASOS - SENSOR 2 ");

                const pasoSensor2 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/paso/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[1].dispositivo_id
                    }
                });

                setLoadingString("PROCESANDO PASOS - SENSOR 3 ");

                const pasoSensor3 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/paso/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[2].dispositivo_id
                    }
                });

                setLoadingString("PROCESANDO PASOS - SENSOR 4 ");

                const pasoSensor4 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/paso/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[3].dispositivo_id
                    }
                });

                setPasosSensor1(pasoSensor1.data);
                setPasosSensor2(pasoSensor2.data);
                setPasosSensor3(pasoSensor3.data);
                setPasosSensor4(pasoSensor4.data);
                
                setLoadingPasos('Pasos');

                setLoadingImpacto('Fuerza de impacto');
                
                setLoadingString("CALCULANDO MAX ÁNGULOS SENSOR 1 ");
                const maxAnguloSensor1 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/maxangulo/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[0].dispositivo_id
                    }
                });

                setLoadingString("CALCULANDO MAX ÁNGULOS - SENSOR 2 ");

                const maxAnguloSensor2 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/maxangulo/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[1].dispositivo_id
                    }
                });

                setLoadingString("CALCULANDO MAX ÁNGULOS - SENSOR 3 ");

                const maxAnguloSensor3 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/maxangulo/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[2].dispositivo_id
                    }
                });

                setLoadingString("CALCULANDO MAX ÁNGULOS - SENSOR 4 ");

                const maxAnguloSensor4 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/maxangulo/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[3].dispositivo_id
                    }
                });

                setMaxAngulosSensor1(maxAnguloSensor1.data);
                setMaxAngulosSensor2(maxAnguloSensor2.data);
                setMaxAngulosSensor3(maxAnguloSensor3.data);
                setMaxAngulosSensor4(maxAnguloSensor4.data);

                const anguloSensor1 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/angulo/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[0].dispositivo_id
                    }
                });

                setLoadingString("CALCULANDO ÁNGULOS - SENSOR 2 ");

                const anguloSensor2 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/angulo/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[1].dispositivo_id
                    }
                });

                setLoadingString("CALCULANDO ÁNGULOS - SENSOR 3 ");

                const anguloSensor3 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/angulo/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[2].dispositivo_id
                    }
                });

                setLoadingString("CALCULANDO ÁNGULOS - SENSOR 4 ");

                const anguloSensor4 = await axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:5000/api/analytics/angulo/get',
                    data: {
                        entrenamiento_id: id,
                        dispositivo_id: dispositivo1.data[3].dispositivo_id
                    }
                });

                setAngulosSensor1(anguloSensor1.data);
                setAngulosSensor2(anguloSensor2.data);
                setAngulosSensor3(anguloSensor3.data);
                setAngulosSensor4(anguloSensor4.data);
                
                setLoadingAngulo('Angulo de pisada');              
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, []);
    
    if (data && medidasSensor1 && medidasSensor2 && medidasSensor3 && medidasSensor4 && pasosSensor1 && pasosSensor2 && pasosSensor3 && pasosSensor4 && impactosSensor1 && impactosSensor2 && impactosSensor3 && impactosSensor4 && angulosSensor1 && angulosSensor2 && angulosSensor3 && angulosSensor4) {
        return (
            <Container component="main" maxWidth="xg">
                <CssBaseline />
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                    Entrenamiento ({data.entrenamiento.id})
                    </Typography>
                    <Grid 
                        container
                        direction="row"
                        xs={12}
                        className={classes.gridList}
                    >
                        <Grid
                            container
                            direction="column"
                            xs={3}
                        >
                        </Grid>
                        <Grid
                            container
                            xs={4}
                        >   
                                <Grid
                                    container
                                    direction="column"
                                    xs={6}
                                >
                                    <Grid item xs className={classes.gridInside}>   
                                        <Box display="flex" justifyContent="center">
                                            <p><FontAwesomeIcon icon={faHorseHead}  style={{color: "#AC6538 "}} />: {data.caballo.nombre}</p>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid
                                    container
                                    direction="column"
                                    xs={6}
                                >
                                    <Grid item xs className={classes.gridInside}>   
                                        <Box display="flex" justifyContent="center">
                                            <p><FontAwesomeIcon icon={faUser}  style={{color: "#87cb16 "}} />: {data.persona.nombre}</p>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid> 
                        <Grid
                            container
                            direction="column"
                            xs={3}
                        >   
                            <Grid item xs className={classes.gridInside}>   
                                <Box display="flex" justifyContent="center">
                                    <p><FontAwesomeIcon icon={faCalendar}  style={{color: "#1d62f0 "}} />: {data.entrenamiento.fecha_hora} </p>
                                    {/*<p>Duración: {data.entrenamiento.duracion}</p>*/}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                
                    <Grid
                        container
                        direction="row"
                        xs={12}
                        className={classes.gridList}
                    >
                        <Grid
                            container
                            direction="column"
                            xs={5}
                        > 
                            <Tabs value={tabs} onChange={handleTabs} aria-label="simple tabs example">
                                <Tab label={loadingImpacto} {...a11yProps(0)} fullWidth id="Loaded"/>
                                <Tab label={loadingPasos} {...a11yProps(1)} fullWidth id="Loaded"/>
                                <Tab label={loadingAngulo} {...a11yProps(2)} fullWidth id="Loaded"/>  
                            </Tabs>
                            <TabPanel value={tabs} index={0}>
                                <div id="linearProgressBar"><LinearProgress variant="determinate" value={progressBar} /></div>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor1}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor2}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor3}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor4}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                            </TabPanel>
                            <TabPanel value={tabs} index={1}>
                                <div id="linearProgressBar"><LinearProgress variant="determinate" value={progressBar} classname={'pepe'}/></div>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor1.concat(pasosSensor1)}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <LineSeries
                                            name="Paso"
                                            valueField="predict"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor2.concat(pasosSensor2)}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <LineSeries
                                            name="Paso"
                                            valueField="predict"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor3.concat(pasosSensor3)}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <LineSeries
                                            name="Paso"
                                            valueField="predict"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor4.concat(pasosSensor4)}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <LineSeries
                                            name="Paso"
                                            valueField="predict"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                            </TabPanel>
                            
                            
                            <TabPanel value={tabs} index={2}>
                                <div id="linearProgressBar"><LinearProgress variant="determinate" value={progressBar} /></div>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={angulosSensor1}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="angulo"
                                            valueField="angulo"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={angulosSensor2}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="angulo"
                                            valueField="angulo"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={angulosSensor3}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="angulo"
                                            valueField="angulo"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={angulosSensor4}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="angulo"
                                            valueField="angulo"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                            </TabPanel>
                        </Grid>
                        <Grid
                            container
                            direction="column"
                            xs={1}
                            className={classes.columnPata}
                        >
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataDelanteraDer} alt="Pata delantera" height="70%" width="auto" />
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataDelanteraIzq} alt="Pata delantera" height="70%" width="auto" />
                                    </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataTraseraDer} alt="Pata trasera" height="70%" width="auto" />
                                    </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataTraseraIzq} alt="Pata trasera" height="70%" width="auto" />
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="column"
                            xs={1}
                            className={classes.columnSemaforo}
                        >
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo1}>
                                        <p>{textoSemaforo1}</p>
                                    </div>
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo2}>
                                        <p>{textoSemaforo2}</p>
                                    </div>
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo3}>
                                        <p>{textoSemaforo3}</p>
                                    </div>    
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo4}>
                                        <p>{textoSemaforo4}</p>
                                    </div>    
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            xs={5}
                        >
                            <div id="playerEntrenamiento">
                                <ReactPlayer
                                    
                                    url={'../assets/videos/' + id + '.mp4'}
                                    //url={myVideo}
                                    width='100%'
                                    height='90%'
                                    controls={true}
                                    onProgress={handleProgress}
                                    onDuration={handleDuration}
                                    style={{background: '#444444'}}
                                />
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </Container>
        );
    } else if (pasosSensor1 && pasosSensor2 && pasosSensor3 && pasosSensor4) {
        return (
            <Container component="main" maxWidth="xg">
                <CssBaseline />
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                    Entrenamiento ({data.entrenamiento.id})
                    </Typography>
                    <Grid 
                        container
                        direction="row"
                        xs={12}
                        className={classes.gridList}
                    >
                        <Grid
                            container
                            direction="column"
                            xs={3}
                        >
                        </Grid>
                        <Grid
                            container
                            xs={4}
                        >   
                                <Grid
                                    container
                                    direction="column"
                                    xs={6}
                                >
                                    <Grid item xs className={classes.gridInside}>   
                                        <Box display="flex" justifyContent="center">
                                            <p><FontAwesomeIcon icon={faHorseHead}  style={{color: "#AC6538 "}} />: {data.caballo.nombre}</p>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid
                                    container
                                    direction="column"
                                    xs={6}
                                >
                                    <Grid item xs className={classes.gridInside}>   
                                        <Box display="flex" justifyContent="center">
                                            <p><FontAwesomeIcon icon={faUser}  style={{color: "#87cb16 "}} />: {data.persona.nombre}</p>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid> 
                        <Grid
                            container
                            direction="column"
                            xs={3}
                        >   
                            <Grid item xs className={classes.gridInside}>   
                                <Box display="flex" justifyContent="center">
                                    <p><FontAwesomeIcon icon={faCalendar}  style={{color: "#1d62f0 "}} />: {data.entrenamiento.fecha_hora} </p>
                                    {/*<p>Duración: {data.entrenamiento.duracion}</p>*/}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        direction="row"
                        xs={12}
                        className={classes.gridList}
                    >
                        <Grid
                            container
                            direction="column"
                            xs={5}
                        > 
                            <Tabs value={tabs} onChange={handleTabs} aria-label="simple tabs example">
                                <Tab label={loadingImpacto} {...a11yProps(0)} fullWidth id="Loaded"/>
                                <Tab label={loadingPasos} {...a11yProps(1)} fullWidth id="Loaded"/>
                                <Tab label={loadingAngulo} {...a11yProps(2)} fullWidth disabled id="stillLoading"/>
                            </Tabs>
                            <TabPanel value={tabs} index={0}>
                                <div id="linearProgressBar"><LinearProgress variant="determinate" value={progressBar} /></div>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor1}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor2}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor3}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor4}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                            </TabPanel>
                            <TabPanel value={tabs} index={1}>
                                <div id="linearProgressBar"><LinearProgress variant="determinate" value={progressBar} classname={'pepe'}/></div>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor1.concat(pasosSensor1)}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <LineSeries
                                            name="Paso"
                                            valueField="predict"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor2.concat(pasosSensor2)}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <LineSeries
                                            name="Paso"
                                            valueField="predict"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor3.concat(pasosSensor3)}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <LineSeries
                                            name="Paso"
                                            valueField="predict"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor4.concat(pasosSensor4)}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <LineSeries
                                            name="Paso"
                                            valueField="predict"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                            </TabPanel>
                        </Grid>
                        <Grid
                            container
                            direction="column"
                            xs={1}
                            className={classes.columnPata}
                        >
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataDelanteraDer} alt="Pata delantera" height="70%" width="auto" />
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataDelanteraIzq} alt="Pata delantera" height="70%" width="auto" />
                                    </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataTraseraDer} alt="Pata trasera" height="70%" width="auto" />
                                    </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataTraseraIzq} alt="Pata trasera" height="70%" width="auto" />
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="column"
                            xs={1}
                            className={classes.columnSemaforo}
                        >
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo1}>
                                        <p>{textoSemaforo1}</p>
                                    </div>
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo2}>
                                        <p>{textoSemaforo2}</p>
                                    </div>
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo3}>
                                        <p>{textoSemaforo3}</p>
                                    </div>    
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo4}>
                                        <p>{textoSemaforo4}</p>
                                    </div>    
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            xs={5}
                        >
                                <ReactPlayer
                                    
                                    url={'../assets/videos/' + id + '.mp4'}
                                    //url={myVideo}
                                    width='100%'
                                    height='100%'
                                    controls={true}
                                    onProgress={handleProgress}
                                    onDuration={handleDuration}
                                    style={{background: '#444444'}}
                                />
                        </Grid>
                    </Grid>
                </div>
            </Container>
        );
    } else if (impactosSensor1 && impactosSensor2 && impactosSensor3 && impactosSensor4) {
        return (
            <Container component="main" maxWidth="xg">
                <CssBaseline />
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                    Entrenamiento ({data.entrenamiento.id})
                    </Typography>
                    <Grid 
                        container
                        direction="row"
                        xs={12}
                        className={classes.gridList}
                    >
                        <Grid
                            container
                            direction="column"
                            xs={3}
                        >
                        </Grid>
                        <Grid
                            container
                            xs={4}
                        >   
                                <Grid
                                    container
                                    direction="column"
                                    xs={6}
                                >
                                    <Grid item xs className={classes.gridInside}>   
                                        <Box display="flex" justifyContent="center">
                                            <p><FontAwesomeIcon icon={faHorseHead}  style={{color: "#AC6538 "}} />: {data.caballo.nombre}</p>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid
                                    container
                                    direction="column"
                                    xs={6}
                                >
                                    <Grid item xs className={classes.gridInside}>   
                                        <Box display="flex" justifyContent="center">
                                            <p><FontAwesomeIcon icon={faUser}  style={{color: "#87cb16 "}} />: {data.persona.nombre}</p>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid> 
                        <Grid
                            container
                            direction="column"
                            xs={3}
                        >   
                            <Grid item xs className={classes.gridInside}>   
                                <Box display="flex" justifyContent="center">
                                    <p><FontAwesomeIcon icon={faCalendar}  style={{color: "#1d62f0 "}} />: {data.entrenamiento.fecha_hora} </p>
                                    {/*<p>Duración: {data.entrenamiento.duracion}</p>*/}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                
                    <Grid
                        container
                        direction="row"
                        xs={12}
                        className={classes.gridList}
                    >
                        <Grid
                            container
                            direction="column"
                            xs={5}
                        > 
                            <Tabs value={tabs} onChange={handleTabs} aria-label="simple tabs example">
                                <Tab label={loadingImpacto} {...a11yProps(0)} fullWidth id="Loaded"/>
                                <Tab label={loadingPasos} {...a11yProps(1)} fullWidth disabled id="stillLoading"/>
                                <Tab label={loadingAngulo} {...a11yProps(2)} fullWidth disabled id="stillLoading"/>
                            </Tabs>
                            <TabPanel value={tabs} index={0}>
                                <div id="linearProgressBar"><LinearProgress variant="determinate" value={progressBar} /></div>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor1}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor2}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor3}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                                <Grid item xs className={classes.gridInside}>
                                    <Chart
                                        data={impactosSensor4}
                                        height={200}
                                        className={classes.chart}
                                    >
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="impacto"
                                            valueField="impacto"
                                            argumentField="fecha_hora"
                                        />
                                        <Legend position="right" />
                                        <ZoomAndPan />
                                    </Chart>
                                </Grid>
                            </TabPanel>
                        </Grid>
                        <Grid
                            container
                            direction="column"
                            xs={1}
                            className={classes.columnPata}
                        >
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataDelanteraDer} alt="Pata delantera" height="70%" width="auto" />
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataDelanteraIzq} alt="Pata delantera" height="70%" width="auto" />
                                    </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataTraseraDer} alt="Pata trasera" height="70%" width="auto" />
                                    </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center" className={classes.gridInside}>
                                    <img src={pataTraseraIzq} alt="Pata trasera" height="70%" width="auto" />
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="column"
                            xs={1}
                            className={classes.columnSemaforo}
                        >
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo1}>
                                        <p>{textoSemaforo1}</p>
                                    </div>
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo2}>
                                        <p>{textoSemaforo2}</p>
                                    </div>
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo3}>
                                        <p>{textoSemaforo3}</p>
                                    </div>    
                                </Box>
                            </Grid>
                            <Grid item xs className={classes.gridInside}>
                                <Box display="flex" justifyContent="center">
                                    <div className={semaforo4}>
                                        <p>{textoSemaforo4}</p>
                                    </div>    
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            xs={5}
                        >
                            
                                <ReactPlayer
                                    
                                    url={'../assets/videos/' + id + '.mp4'}
                                    //url={myVideo}
                                    width='100%'
                                    height='100%'
                                    controls={true}
                                    onProgress={handleProgress}
                                    onDuration={handleDuration}
                                    style={{background: '#444444'}}
                                />
                        </Grid>
                    </Grid>
                </div>
            </Container>
        );
    } else  
    {
        return (
            <Container component="main" maxWidth="xg">
                <CssBaseline />
                <div className={classes.paper2}>
                    <Typography component="h1" variant="h3">
                        {loadingString} <CircularProgress />
                    </Typography>
                
            </div>
            </Container>);
    }
}

export default VerEntrenamiento;