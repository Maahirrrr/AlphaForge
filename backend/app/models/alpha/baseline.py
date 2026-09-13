import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge

class BaselineAlphaModel:
    """
    Standard linear baseline model (Ridge regression) for benchmarking against ML models.
    """
    def __init__(self, alpha: float = 1.0):
        self.model = Ridge(alpha=alpha)
        self.feature_names = []

    def fit(self, X: pd.DataFrame, y: pd.Series):
        self.feature_names = list(X.columns)
        self.model.fit(X.values, y.values)
        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        return self.model.predict(X[self.feature_names].values)
