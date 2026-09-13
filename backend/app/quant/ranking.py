from typing import Dict, List, Tuple
import pandas as pd
import numpy as np

def rank_cross_sectional_assets(predictions: Dict[str, float]) -> List[Tuple[str, float, int]]:
    """
    Ranks assets cross-sectionally by predicted alpha descending.
    Returns list of (symbol, predicted_alpha, rank).
    """
    sorted_assets = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
    return [(sym, alpha, rank + 1) for rank, (sym, alpha) in enumerate(sorted_assets)]

def select_top_bottom_quantiles(
    predictions: Dict[str, float],
    top_k: int = 3,
    long_only: bool = True
) -> Tuple[List[str], List[str]]:
    """
    Picks top-K assets for long positions and bottom-K for short positions (if long-short).
    """
    ranked = rank_cross_sectional_assets(predictions)
    if not ranked:
        return [], []

    top_assets = [item[0] for item in ranked[:top_k] if item[1] > 0]
    bottom_assets = []
    if not long_only:
        bottom_assets = [item[0] for item in ranked[-top_k:] if item[1] < 0]

    return top_assets, bottom_assets
