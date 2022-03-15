from vpython import *
from time import *
from math import sqrt
import numpy as np
from madgwickahrs import MadgwickAHRS
from scipy.signal import butter, lfilter, freqz
import pandas as pd
import json


# madgwick = MadgwickAHRS(3/125) #24 miliseconds


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


def modulo(vector):
    x = np.array(vector)
    module = np.linalg.norm(x)
    return module


def calculo_angulo(datosMedidas):

    # Ts = 1/fs, donde fs=44 hz
    f_sample = 44
    madgwick = MadgwickAHRS(1/f_sample)

    toRad = 2*np.pi/360
    toDeg = 1/toRad

    v2 = vector(1, 0, 0).value

    ax_buffer = np.array([0])
    ay_buffer = np.array([0])
    az_buffer = np.array([0])
    gx_buffer = np.array([0])
    gy_buffer = np.array([0])
    gz_buffer = np.array([0])

    # Filter requirements.
    order = 6
    # sample rate, Hz (cantidad de muestras por segundo obtenidas por cada pata)
    fs = 40
    cutoff = 4  # desired cutoff frequency of the filter, Hz

    # acc_z is the "Noisy" data.  We want to recover the 1.2 Hz signal from this.
    #datos_acc_z = data[:,'ax']
    i = 0  # Contador de muestras

    angulo_string = '['

    for medida in datosMedidas:

        ax = np.array(medida['ax'])
        ax_buffer = np.append(ax_buffer, [ax])
        ay = np.array(medida['ay'])
        ay_buffer = np.append(ay_buffer, [ay])
        az = np.array(medida['az'])
        az_buffer = np.append(az_buffer, [az])

        gx = np.array(medida['gx'])
        gx_buffer = np.append(gx_buffer, [gx])
        gy = np.array(medida['gy'])
        gy_buffer = np.append(gy_buffer, [gy])
        gz = np.array(medida['gz'])
        gz_buffer = np.append(gz_buffer, [gz])
        i = i+1

        filtered_ax = butter_lowpass_filter(ax_buffer, cutoff, fs, order)
        filtered_ay = butter_lowpass_filter(ay_buffer, cutoff, fs, order)
        filtered_az = butter_lowpass_filter(az_buffer, cutoff, fs, order)
        filtered_gx = butter_lowpass_filter(gx_buffer, cutoff, fs, order)
        filtered_gy = butter_lowpass_filter(gy_buffer, cutoff, fs, order)
        filtered_gz = butter_lowpass_filter(gz_buffer, cutoff, fs, order)

        # actualizamos madgwick IMU con los datos que vienen del serial. Se pasa los valores de giro a rad/s ya que el algoritmo de madgwick así lo requiere
        madgwick.update_imu([filtered_gx[i]*toRad, filtered_gy[i]*toRad,
                            filtered_gz[i]*toRad], [filtered_ax[i], filtered_ay[i], filtered_az[i]])

        # usando los quaternions obtenemos los angulos de euler
        eulerAngle = madgwick.quaternion.to_euler_angles()

        roll = -eulerAngle[0]
        pitch = eulerAngle[1]
        yaw = eulerAngle[2]

        k = vector(-sin(yaw)*cos(pitch), sin(pitch), cos(yaw)*cos(pitch))
        y = vector(0, 1, 0)
        s = cross(k, y)
        v = cross(s, k)
        vrot = v*cos(roll)+cross(k, v)*sin(roll)

        v1 = cross(k, vrot).value

        alfa = angle_between(v1, v2)*toDeg
        #print("Angulod de pisada: ",alfa, "°")

        #alfa = tan((cos(yaw)*cos(pitch))/(-sin(yaw)*cos(pitch)))*toDeg
        # alfa = tan(componenteX/componenteZ)*toDeg
        # units = '°'
        # s = f"Angulo de pisada {alfa:.1f} {units}."
        # print(s) # "imprime el angulo de pisada."

        angulo_string = angulo_string + \
            '{"angulo": ' + str(round(alfa, 2)) + ', "fecha_hora": ' + \
            str(medida['fecha_hora']) + '}, '

    angulo_string = angulo_string[:-2]
    angulo_string = angulo_string + ']'

    return angulo_string


def calculo_impacto(datosMedidas):

    ax_buffer = np.array([0])
    ay_buffer = np.array([0])
    az_buffer = np.array([0])

    # Filter requirements.
    order = 6
    # sample rate, Hz (cantidad de muestras por segundo obtenidas por cada pata)
    fs = 41.67
    cutoff = 4  # desired cutoff frequency of the filter, Hz

    # acc_z is the "Noisy" data.  We want to recover the 1.2 Hz signal from this.
    #datos_acc_z = data[:,'ax']
    i = 0  # Contador de muestras

    impacto_string = '['

    for medida in datosMedidas:

        ax = np.array(medida['ax'])
        ax_buffer = np.append(ax_buffer, [ax])
        ay = np.array(medida['ay'])
        ay_buffer = np.append(ay_buffer, [ay])
        az = np.array(medida['az'])
        az_buffer = np.append(az_buffer, [az])

        i = i+1

        filtered_ax = butter_lowpass_filter(ax_buffer, cutoff, fs, order)
        filtered_ay = butter_lowpass_filter(ay_buffer, cutoff, fs, order)
        filtered_az = butter_lowpass_filter(az_buffer, cutoff, fs, order)

        # calcula la raiz cuadrada de los componentes al cuadrado. (el módulo del vector acceleración)
        vector = [filtered_ax[i], filtered_ay[i], filtered_az[i]]
        impacto_string = impacto_string + \
            '{"impacto": ' + str(round(modulo(vector), 2)) + ', "fecha_hora": ' + \
            str(medida['fecha_hora']) + '}, '

    impacto_string = impacto_string[:-2]
    impacto_string = impacto_string + ']'

    return impacto_string
