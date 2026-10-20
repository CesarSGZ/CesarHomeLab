"""Plantilla de la agencia. Para contratar a alguien nuevo, añade su clase a TEAM (el Director va primero)."""
from .director import Director
from .karma_farmer import KarmaFarmer

TEAM = [Director, KarmaFarmer]
