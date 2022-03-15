#### Este es el script que va alojado en la raspberry ####

import paho.mqtt.client as mqtt
import os
from picamera import PiCamera
from picamera import Color
from time import sleep
import datetime as dt

import requests

MQTT_ADDRESS = '192.168.10.151'
MQTT_USER = 'pi'
MQTT_PASSWORD = 'tesis'
MQTT_TOPIC = 'dressage'

camera = PiCamera()
id_entrenamiento = '0'


def on_connect(client, userdata, flags, rc):
    """ The callback for when the client receives a CONNACK response from the server."""
    print('Connected with result code ' + str(rc))
    client.subscribe(MQTT_TOPIC)


def on_message(client, userdata, msg):
    """The callback for when a PUBLISH message is received from the server."""
    global id_entrenamiento
    print(msg.topic + ' ' + str(msg.payload))
    if msg.payload == '0':
        print("STOP record")
        camera.stop_recording()
        os.system("cd /home/pi/Desktop/")
        conversion = 'MP4Box -fps 30 -add ' + id_entrenamiento + \
            '.h264 ' + id_entrenamiento + '.mp4'
        os.system(conversion)
        print("Termino conversion")

        print("envio")
        url = "http://192.168.10.150:5000/api/setgrabacion"
        data = {'title': id_entrenamiento}
        mp4_filepath = '/home/pi/Desktop/' + id_entrenamiento + '.mp4'
        mp4_f = open(mp4_filepath, 'rb')
        files = {'file': mp4_f}
        print(files)

        req = requests.post(url, files=files, json=data)
        print(req.status_code)
        print(req.content)

    else:
        print("STARTrecord")
        id_entrenamiento = msg.payload
        camera.resolution = (1280, 720)
        camera.framerate = 30
        camera.rotation = 180
        camera.start_recording('/home/pi/Desktop/' +
                               id_entrenamiento + '.h264')


def main():
    mqtt_client = mqtt.Client()
    mqtt_client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message

    mqtt_client.connect(MQTT_ADDRESS, 1883)
    mqtt_client.loop_forever()


if __name__ == '__main__':
    print('MQTT to InfluxDB bridge')
    main()
