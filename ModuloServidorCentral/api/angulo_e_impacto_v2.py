from vpython import *
from time import *
from math import sqrt
import numpy as np
from madgwickahrs import MadgwickAHRS
from scipy.signal import butter, lfilter, freqz
import pandas as pd
import json


def unit_vector(vector):
    """ Returns the unit vector of the vector.  """
    return vector / np.linalg.norm(vector)


def angle_between(v1, v2):
    """ Returns the angle in radians between vectors 'v1' and 'v2'::

            >>> angle_between((1, 0, 0), (0, 1, 0))
            1.5707963267948966
            >>> angle_between((1, 0, 0), (1, 0, 0))
            0.0
            >>> angle_between((1, 0, 0), (-1, 0, 0))
            3.141592653589793
    """
    v1_u = unit_vector(v1)
    v2_u = unit_vector(v2)
    return np.arccos(np.clip(np.dot(v1_u, v2_u), -1.0, 1.0))


# filtro de butterworth
def butter_lowpass(cutoff, fs, order=5):
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    return b, a


def butter_lowpass_filter(data, cutoff, fs, order=5):
    b, a = butter_lowpass(cutoff, fs, order=order)
    y = lfilter(b, a, data)
    return y

# funcion que devuelve módulo de un vector


def modulo(vector):
    x = np.array(vector)
    module = np.linalg.norm(x)
    return module


def calculo_angulo_magwick(ax, ay, az, gx, gy, gz, madgwick):
    # aplica el algoritmo de Madgwick, calcula el ángulo y lo devuelve.

    # aplica el algoritmo de Madgwick, calcula el ángulo y lo devuelve.

    toRad = 2*np.pi/360
    toDeg = 1/toRad

    madgwick.update_imu([gx*toRad, gy*toRad, gz*toRad], [ax, ay, az])
    eulerAngle = madgwick.quaternion.to_euler_angles()

    # usando los quaternions obtenemos los angulos de euler

    roll = -eulerAngle[0]
    pitch = eulerAngle[1]
    yaw = eulerAngle[2]

    # calculo angulo entre vector direccion y vertical

    k = vector(-sin(yaw)*cos(pitch), sin(pitch), cos(yaw)*cos(pitch))
    y = vector(0, 1, 0)
    s = cross(k, y)
    v = cross(s, k)
    vrot = v*cos(roll)+cross(k, v)*sin(roll)

    v1 = cross(k, vrot).value

    alfa = angle_between(v1, (1, 0, 0))*toDeg

    return alfa


def calculo_angulo(datosMedidas):

    # calcula los ángulos, los filtra y devuelve un string con todos los angulos filtrados.

    angulos = np.array([0])

    # Filter requirements.
    order = 6
    # sample rate, Hz (cantidad de muestras por segundo obtenidas por cada pata)
    fs = 40
    cutoff = 4  # desired cutoff frequency of the filter, Hz

    # Ts = 1/fs, donde fs=40 hz
    madgwick = MadgwickAHRS(1/fs)

    for medida in datosMedidas:

        ax = medida['ax']
        ay = medida['ay']
        az = medida['az']
        gx = medida['gx']
        gy = medida['gy']
        gz = medida['gz']

        # aplica Madgwick y calcula el ángulo

        alfa = calculo_angulo_magwick(ax, ay, az, gx, gy, gz, madgwick)
        angulos = np.append(angulos, [alfa])  # construye el array de ángulos

        angulos_filtrados = butter_lowpass_filter(angulos, cutoff, fs, order)

    i = 0

    angulo_string = '['
    for medida in datosMedidas:

        angulo_string = angulo_string + \
            '{"angulo": ' + str(angulos_filtrados[i]) + ', "fecha_hora": ' + \
            str(medida['fecha_hora']) + '}, '
        i = i+1

    angulo_string = angulo_string[:-2]
    angulo_string = angulo_string + ']'

    return angulo_string


def calculo_max_angulo(datosMedidas):

    # calcula los ángulos, los filtra y devuelve un string con todos los angulos filtrados.

    angulos = np.array([0])

    # Filter requirements.
    order = 6
    # sample rate, Hz (cantidad de muestras por segundo obtenidas por cada pata)
    fs = 40
    cutoff = 4  # desired cutoff frequency of the filter, Hz

    # Ts = 1/fs, donde fs=40 hz
    madgwick = MadgwickAHRS(1/fs)

    for medida in datosMedidas:

        ax = medida['ax']
        ay = medida['ay']
        az = medida['az']
        gx = medida['gx']
        gy = medida['gy']
        gz = medida['gz']

        # aplica Madgwick y calcula el ángulo
        # aplica Madgwick y calcula el ángulo
        alfa = calculo_angulo_magwick(ax, ay, az, gx, gy, gz, madgwick)
        angulos = np.append(angulos, [alfa])  # construye el array de ángulos

        angulos_filtrados = butter_lowpass_filter(angulos, cutoff, fs, order)

    maxAngulo_string = '['

    i = 0
    tiempo = 2000
    tiempoInicial = 0
    maxAngulo = 0

    for medida in datosMedidas:

        if(tiempo > 900):
            maxAngulo_string = maxAngulo_string + \
                '{"maxAngulo": ' + str(maxAngulo) + '}, '

            tiempoInicial = medida['fecha_hora']

            tiempo = 0
            maxAngulo = 0

        else:
            if(angulos_filtrados[i] > maxAngulo):
                maxAngulo = angulos_filtrados[i]

            tiempo = medida['fecha_hora'] - tiempoInicial

        i = i+1

    maxAngulo_string = maxAngulo_string[:-2]
    maxAngulo_string = maxAngulo_string + ']'

    return maxAngulo_string


def calculo_impacto(datosMedidas):

    # calcula la raiz cuadrada de los componentes al cuadrado (el módulo del vector aceleración), y devuelve un string con todos los impactos

    impacto_string = '['

    for medida in datosMedidas:

        ax = np.array(medida['ax'])
        ay = np.array(medida['ay'])
        az = np.array(medida['az'])

        vector = [ax, ay, az]  # vector aceleración

        impacto_string = impacto_string + \
            '{"impacto": ' + str(round(modulo(vector), 2)) + ', "fecha_hora": ' + \
            str(medida['fecha_hora']) + '}, '

    impacto_string = impacto_string[:-2]
    impacto_string = impacto_string + ']'

    return impacto_string


def calculo_max_impacto(datosMedidas):

    # calcula la raiz cuadrada de los componentes al cuadrado (el módulo del vector aceleración), y devuelve un string con todos los impactos

    maxImpacto_string = '['

    tiempo = 2000
    tiempoInicial = 0
    maxImpacto = 0

    for medida in datosMedidas:

        ax = np.array(medida['ax'])
        ay = np.array(medida['ay'])
        az = np.array(medida['az'])

        vector = [ax, ay, az]  # vector aceleración

        if(tiempo > 900):
            maxImpacto_string = maxImpacto_string + \
                '{"maxImpacto": ' + str(maxImpacto) + '}, '

            tiempoInicial = medida['fecha_hora']

            tiempo = 0
            maxImpacto = 0

        else:
            if(modulo(vector) > maxImpacto):
                maxImpacto = modulo(vector)

            tiempo = medida['fecha_hora'] - tiempoInicial

    maxImpacto_string = maxImpacto_string[:-2]
    maxImpacto_string = maxImpacto_string + ']'

    return maxImpacto_string
