###  Este scrips crea los datasets filtrados para el caballo y además les agrega datos como los ángulos de éules para la predicción,
### tambieín filtrados 

from time import *
import numpy as np
from madgwickahrs import MadgwickAHRS
from scipy.signal import butter, lfilter
import pandas as pd
import csv


f_sample = 40
madgwick = MadgwickAHRS(1/f_sample)

#filtro de butterworth
def butter_lowpass(cutoff, fs, order=5):
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    return b, a

def butter_lowpass_filter(data, cutoff, fs, order=5):
    b, a = butter_lowpass(cutoff, fs, order=order)
    y = lfilter(b, a, data)
    return y

def calculo_angulos_Euler_magwick(ax,ay,az,gx,gy,gz):

    # Ts = 1/fs, donde fs=41.66 hz
    toRad = 2*np.pi/360
    
    #algoritmo de madgwick
    madgwick.update_imu([gx*toRad, gy*toRad,gz*toRad], [ax, ay, az])
    eulerAngle = madgwick.quaternion.to_euler_angles()
    
    # usando los quaternions obtenemos los angulos de euler    
    roll = eulerAngle[0]
    pitch = eulerAngle[1]
    yaw = eulerAngle[2]

    return roll, pitch, yaw 

def calculo_angulo(acc_x, acc_y, acc_z, gyr_x, gyr_y, gyr_z):

    rolls =  np.array([0])
    pitchs =  np.array([0])
    yaws =  np.array([0])

    # Filter requirements.
    order = 6
    # sample rate, Hz (cantidad de muestras por segundo obtenidas por cada pata)
    fs = 41.66
    cutoff = 3.667  # desired cutoff frequency of the filter, Hz

    # acc_z is the "Noisy" data.  We want to recover the 1.2 Hz signal from this.
    #datos_acc_z = data[:,'ax']

    filtered_ax = butter_lowpass_filter(acc_x, cutoff, fs, order)
    filtered_ay = butter_lowpass_filter(acc_y, cutoff, fs, order)
    filtered_az = butter_lowpass_filter(acc_z, cutoff, fs, order)
    filtered_gx = butter_lowpass_filter(gyr_x, cutoff, fs, order)
    filtered_gy = butter_lowpass_filter(gyr_y, cutoff, fs, order)
    filtered_gz = butter_lowpass_filter(gyr_z, cutoff, fs, order)

    for i in range(len(acc_x)-1):  
        roll, pitch, yaw = calculo_angulos_Euler_magwick(acc_x[i],acc_y[i],acc_z[i],gyr_x[i],gyr_y[i],gyr_z[i])        
        rolls = np.append(rolls, [roll])
        pitchs = np.append(pitchs, [pitch])
        yaws = np.append(yaws, [yaw])
    
    filtered_roll = butter_lowpass_filter(rolls, cutoff, fs, order)
    filtered_pitch = butter_lowpass_filter(pitchs, cutoff, fs, order)
    filtered_yaw = butter_lowpass_filter(yaws, cutoff, fs, order)

    return filtered_roll, filtered_pitch, filtered_yaw, filtered_ax, filtered_ay, filtered_az, filtered_gx, filtered_gy, filtered_gz
    
data = pd.read_csv("./analytics/d1_Paso_Trote.csv",delimiter=",")

t_muestra = data['fecha_hora']
acc_x = data['ax']
acc_y = data['ay']
acc_z = data['az']
gyr_x = data['gx']
gyr_y = data['gy']
gyr_z = data['gz']
hay_paso = data['hay_paso']

filtered_roll, filtered_pitch, filtered_yaw, acc_x_filtered, acc_y_filtered, acc_z_filtered, gyr_x_filtered, gyr_y_filtered, gyr_z_filtered = calculo_angulo(acc_x, acc_y, acc_z, gyr_x, gyr_y, gyr_z)

# t_muestra_original = t_muestra.copy()

# for i in range(t_muestra.size):
#     t_muestra[:][i] = t_muestra[:][i] - 200 

# construccion del dataset para entrenamiento del GBM - se debe cambiar por cada sensor para ir crearndo el dataset correspondiente 

fieldnames = ["fecha_hora", "roll", "pitch", "yaw", "ax", "ay", "az", "gx", "gy", "gz" , "hay_paso"]

with open('./analytics/datasets_filtrados_modelo_2/d1_Paso_Trote_filtrado.csv', 'w') as csv_file:
    csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    csv_writer.writeheader()

for i in range(filtered_roll.size):

    with open('./analytics/datasets_filtrados_modelo_2/d1_Paso_Trote_filtrado.csv', 'a') as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

        info = {
            "fecha_hora": t_muestra[i],
            "roll": filtered_roll[i],
            "pitch": filtered_pitch[i],
            "yaw": filtered_yaw[i],
            "ax": acc_x_filtered[i],
            "ay": acc_y_filtered[i],
            "az": acc_z_filtered[i],
            "gx": gyr_x_filtered[i],
            "gy": gyr_y_filtered[i],
            "gz": gyr_z_filtered[i],
            "hay_paso": data['hay_paso'][i]
        }

        csv_writer.writerow(info)

