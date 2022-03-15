from vpython import *
from time import *
import numpy as np
from madgwickahrs import MadgwickAHRS
from scipy.signal import butter, lfilter
import pandas as pd


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

def calculo_Euler(ax,ay,az,gx,gy,gz,madgwick):

    #aplica el algoritmo de Madgwick, calcula el ángulo y lo devuelve.

    toRad = 2*np.pi/360
   
    madgwick.update_imu([gx*toRad, gy*toRad,gz*toRad], [ax, ay, az])
    eulerAngle = madgwick.quaternion.to_euler_angles()

    # usando los quaternions obtenemos los angulos de euler

    roll = eulerAngle[0]
    pitch = eulerAngle[1]
    yaw = eulerAngle[2]

    return roll, pitch, yaw  


def calculo_Datos_filtrados(datosMedidas):

    rolls =  np.array([0])
    pitchs =  np.array([0])
    yaws =  np.array([0])

    axs =  np.array([0])
    ays =  np.array([0])
    azs =  np.array([0])
    gxs =  np.array([0])
    gys =  np.array([0])
    gzs =  np.array([0])
    t_muestra = np.array([0])

    # Filter requirements.
    order = 6
    # sample rate, Hz (cantidad de muestras por segundo obtenidas por cada pata)
    fs = 40
    cutoff = 4  # desired cutoff frequency of the filter, Hz

    # Ts = 1/fs, donde fs=40 hz
    madgwick = MadgwickAHRS(1/fs)
   
    for medida in datosMedidas:

        #datos de la medida
        ax = medida['ax']        
        ay = medida['ay']       
        az = medida['az']
        gx = medida['gx']        
        gy = medida['gy']        
        gz = medida['gz']

        axs =  np.append(axs, [ax])
        ays =  np.append(ays, [ay])
        azs =  np.append(azs, [az])

        gxs =  np.append(gxs, [gx])
        gys =  np.append(gys, [gy])
        gzs =  np.append(gzs, [gz])

        t_muestra = np.append(t_muestra, [medida['fecha_hora']])

        #aplica Madgwick y calcula el angulos Euler
        roll, pitch, yaw = calculo_Euler(ax,ay,az,gx,gy,gz,madgwick)  
        
        rolls = np.append(rolls, [roll])  
        pitchs = np.append(pitchs, [pitch]) 
        yaws = np.append(yaws, [yaw])
    

    #aplica filtrados
    filtered_roll = butter_lowpass_filter(rolls, cutoff, fs, order)
    filtered_pitch = butter_lowpass_filter(pitchs, cutoff, fs, order)
    filtered_yaw = butter_lowpass_filter(yaws, cutoff, fs, order)

    acc_x_filtered = butter_lowpass_filter(axs, cutoff, fs, order)
    acc_y_filtered = butter_lowpass_filter(ays, cutoff, fs, order)
    acc_z_filtered = butter_lowpass_filter(azs, cutoff, fs, order)

    gyr_x_filtered = butter_lowpass_filter(gxs, cutoff, fs, order)
    gyr_y_filtered = butter_lowpass_filter(gys, cutoff, fs, order)
    gyr_z_filtered = butter_lowpass_filter(gzs, cutoff, fs, order)

    return t_muestra, filtered_roll, filtered_pitch, filtered_yaw, acc_x_filtered, acc_y_filtered, acc_z_filtered, gyr_x_filtered, gyr_y_filtered, gyr_z_filtered
