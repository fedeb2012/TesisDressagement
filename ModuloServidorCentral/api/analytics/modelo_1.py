import h2o
import os
from h2o.estimators import H2OGradientBoostingEstimator

import numpy as np
from h2o.frame import H2OFrame

# specify max number of bytes of memory. uses all cores by default.
h2o.init(max_mem_size="8G")
h2o.remove_all()

# Import the prostate dataset into H2O:
datos = h2o.import_file("./filtered_data_250sec_test.csv")

datos.describe()

# split the data as described above
train, valid, test = datos.split_frame([0.6, 0.2], seed=1234)

# # # Set the predictors and response; set the factors:
datos["hay_paso"] = datos["hay_paso"].asfactor()
predictors = ["fecha_hora", "ax", "ay", "az", "gx", "gy", "gz"]
response = "hay_paso"

pros_gbm = H2OGradientBoostingEstimator(
    ntrees=30,
    learn_rate=0.3,
    max_depth=10,
    sample_rate=0.7,
    col_sample_rate=0.7,
    stopping_rounds=2,
    stopping_tolerance=0.01,  # 10-fold increase in threshold as defined in rf_v1
    score_each_iteration=True,
    seed=2000000
)

pros_gbm.train(x=predictors, y=response, training_frame=datos)

# # Eval performance:
perf = pros_gbm.model_performance()
print(perf)

datos_a_probar = h2o.import_file(
    "./filtered_data_250sec_prueba2.csv")

resultado = pros_gbm.predict(datos_a_probar)

h2o.export_file(
    resultado, path="./predicciones/datos_prediccion.csv", force=True)
