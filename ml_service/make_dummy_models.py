# run this once to create simple placeholder models
from sklearn.dummy import DummyClassifier
import joblib
import numpy as np
import pandas as pd

# Diabetes dummy (expects 8 features)
X = np.random.rand(100,8)
y = np.random.randint(0,2,100)
m = DummyClassifier(strategy="most_frequent")
m.fit(X,y)
joblib.dump(m, "model_diabetes.pkl")

# Heart dummy (13 features)
Xh = np.random.rand(100,13)
yh = np.random.randint(0,2,100)
mh = DummyClassifier(strategy="most_frequent")
mh.fit(Xh,yh)
joblib.dump(mh, "model_heart.pkl")

# Kidney dummy (14 features)
Xk = np.random.rand(100,14)
yk = np.random.randint(0,2,100)
mk = DummyClassifier(strategy="most_frequent")
mk.fit(Xk,yk)
joblib.dump(mk, "model_kidney.pkl")

print("Dummy models saved.")
