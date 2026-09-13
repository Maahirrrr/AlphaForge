from typing import Dict, List
import pandas as pd
import numpy as np

def generate_alpha_signals(
    predictions: Dict[str, float],
    long_threshold: float = 0.005,
    short_threshold: float = -0.005,
    long_only: bool = True
) -> Dict[str, float]:
    """
    Converts raw predicted returns E[r_{t+h}] into directional alpha signals.
    """
    signals = {}
    for symbol, alpha in predictions.items():
        if alpha >= long_threshold:
            signals[symbol] = 1.0
        elif not long_only and alpha <= short_threshold:
            signals[symbol] = -1.0
        else:
            signals[symbol] = 0.0
    return signals
