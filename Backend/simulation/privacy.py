import math
import random


def laplace_noise(value: float, sensitivity: float = 1.0, epsilon: float = 1.0) -> float:
    """Add calibrated Laplace noise and clamp to [0, 100].

    Uses the standard two-exponential decomposition for numerical stability.
    """
    scale = sensitivity / epsilon
    noise = random.expovariate(1 / scale) - random.expovariate(1 / scale)
    return max(0.0, min(100.0, value + noise))


def randomized_response(true_value: bool, p: float = 0.75) -> bool:
    """Coin-flip mechanism: returns true_value with probability p, random bit otherwise."""
    if random.random() < p:
        return true_value
    return random.random() < 0.5
