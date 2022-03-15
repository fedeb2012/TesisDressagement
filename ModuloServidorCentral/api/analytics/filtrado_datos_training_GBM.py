from math import sqrt
import numpy as np
from matplotlib import pyplot as plt
import pandas as pd
from scipy.signal import butter, lfilter, freqz
import csv


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


#data = pd.read_csv('./api_madgwick/ent3_para_analisis_pata2.csv',delimiter=";")
data = pd.read_csv('./dataset_training_250_segundos.csv', delimiter=",")

t_muestra = data['fecha_hora']
acc_x = data['ax']
acc_y = data['ay']
acc_z = data['az']
gyr_x = data['gx']
gyr_y = data['gy']
gyr_z = data['gz']

# Filter requirements.
order = 6
# sample rate, Hz (cantidad de muestras por segundo obtenidas por cada pata)
fs = 47.62
cutoff = 3.667  # desired cutoff frequency of the filter, Hz

# Filter the data, and plot both the original and filtered signals.
acc_x_filtered = butter_lowpass_filter(acc_x, cutoff, fs, order)
acc_y_filtered = butter_lowpass_filter(acc_y, cutoff, fs, order)
acc_z_filtered = butter_lowpass_filter(acc_z, cutoff, fs, order)

gyr_x_filtered = butter_lowpass_filter(gyr_x, cutoff, fs, order)
gyr_y_filtered = butter_lowpass_filter(gyr_y, cutoff, fs, order)
gyr_z_filtered = butter_lowpass_filter(gyr_z, cutoff, fs, order)

# construccion del dataset para entrenamiento del GBM

fieldnames = ["fecha_hora", "ax", "ay", "az", "gx", "gy", "gz", "hay_paso"]

with open('./filtered_data_250sec_test.csv', 'w') as csv_file:
    csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    csv_writer.writeheader()

for i in range(acc_x_filtered.size):

    with open('./filtered_data_250sec_test.csv', 'a') as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

        info = {
            "fecha_hora": data['fecha_hora'][i],
            "ax": acc_x_filtered[i],
            "ay": acc_y_filtered[i],
            "az": acc_z_filtered[i],
            "gx": gyr_x_filtered[i],
            "gy": gyr_y_filtered[i],
            "gz": gyr_z_filtered[i],
            "hay_paso": data['hay_paso'][i]
        }

        csv_writer.writerow(info)
