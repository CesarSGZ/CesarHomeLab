"""Geometría del Fractal Terra para el visor 3D y para preparar el CFD.

Escribe la sección `geometry` de control/data/terra-thermal-summary.json.
Cada cota dice de dónde sale (`certainty`):
  measured  medida por César con calibre o metro
  official  ficha del fabricante
  photo     deducida de las fotos (rejilla calibrada a 8,05 mm por fila)
  assumed   supuesta; hay que medirla antes del CFD

Ejes (mm): x de delante (frontal de nogal, fuente) hacia atrás (I/O de placa y gráfica),
y del panel de la gráfica al panel del procesador, z del suelo de la caja hacia arriba.
Origen: esquina delantera-inferior del lado de la gráfica del cuerpo de la caja (sin patas).

Uso:  python tools/terra-cfd/build_geometry.py          (escribe el JSON)
      python tools/terra-cfd/build_geometry.py --check  (solo comprueba)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "control" / "data" / "terra-thermal-summary.json"

L, W, H = 343.0, 153.0, 198.0          # cuerpo de la caja (oficial)
FEET = 20.0                            # patas (oficial: 218 con patas)
PANEL_T = 1.0                          # chapa de los paneles (supuesta)

# ---- Rejilla de los paneles laterales (calibrada en las fotos, 12 nov 2026) ----
PITCH, SLOT, ROWS = 8.05, 3.5, 37
REAR_STRIP = 35.5                      # chapa sin ranuras junto a la trasera
row_x = [round(L - REAR_STRIP - k * PITCH, 2) for k in range(ROWS)]   # fila 0 = la más trasera
# Panel de arriba (foto desde arriba, 14 nov 2026): 36 filas de delante (28 mm) a detrás (33 mm del final)
TOP_ROWS_X = [round(28 + k * PITCH, 2) for k in range(36)]

# Lado gráfica: ranuras y corte central respecto al centro de los ventiladores (canal_gpu.scad)
GPU_FAN_Z = 100.0                      # 58 mm desde el borde del PCB, centrado en la altura útil
GPU_SLOT_Z = (GPU_FAN_Z - 72.3, GPU_FAN_Z + 77.5)
GPU_GAP = {"even": (GPU_FAN_Z - 15.0, GPU_FAN_Z - 10.0), "odd": (GPU_FAN_Z + 0.2, GPU_FAN_Z + 5.3)}
# Lado procesador: el mismo panel girado 180° sobre el eje x (z' = H - z)
CPU_SLOT_Z = (H - GPU_SLOT_Z[1], H - GPU_SLOT_Z[0])
CPU_GAP = {k: (round(H - v[1], 2), round(H - v[0], 2)) for k, v in GPU_GAP.items()}

# ---- Gráfica ----
GPU_LEN, GPU_T, GPU_H = 304.4, 41.6, 115.8
GPU_DUCT_H = 15.15                      # medida: hueco ventiladores-panel
FAN_PITCH = 96.4                        # medida
MID_FAN_ROW = 15.62                     # fila de la rejilla del ventilador central (foto)
mid_fan_x = round(L - REAR_STRIP - MID_FAN_ROW * PITCH, 1)
gpu_fan_x = [round(mid_fan_x + d, 1) for d in (-FAN_PITCH, 0, FAN_PITCH)]
gpu_x0 = round(mid_fan_x - (GPU_LEN / 2), 1)   # ventilador central a mitad de la tarjeta
gpu_y0 = PANEL_T + GPU_DUCT_H
gpu_z0 = round(GPU_FAN_Z - GPU_H / 2, 1)

# ---- Procesador ----
CPU_FAN_ROW = 7.12                      # fila de la rejilla del ventilador (foto)
cpu_x = round(L - REAR_STRIP - CPU_FAN_ROW * PITCH, 1)
cpu_z = round(H - GPU_FAN_Z + 24.0, 1)  # = 122: encaja las ranuras del panel con el ventilador
CPU_DUCT_H = 20.5                       # medida
cooler_top = W - PANEL_T - CPU_DUCT_H
COOLER = (95.0, 47.0, 95.0)             # AXP90-X47: 95 x 95, 47 de alto con ventilador
cooler_y0 = cooler_top - COOLER[1]
BOARD_Y0, BOARD_T = cooler_y0 - 9.5, 8.0  # PCB + zócalo + CPU (~9,5 mm bajo el disipador)


def box(x, y, z, sx, sy, sz):
    return {"min": [round(x, 2), round(y, 2), round(z, 2)], "size": [round(sx, 2), round(sy, 2), round(sz, 2)]}


def fan(cx, cy, cz, axis, d, t, direction, hub=0.3, frame=None):
    """d = diámetro de las aspas; frame = lado del marco cuadrado (ventiladores de caja), None si no tiene."""
    out = {"centre": [round(cx, 2), round(cy, 2), round(cz, 2)], "axis": axis, "diameter": d,
           "thickness": t, "hub_ratio": hub, "flow": direction}
    if frame:
        out["frame"] = frame
    return out


components = [
    {
        "id": "GPU", "label": "ZOTAC RTX 5070 Ti SOLID SFF OC", "role": "heat", "certainty": "measured",
        "box": box(gpu_x0, gpu_y0, gpu_z0, GPU_LEN, GPU_T, GPU_H),
        "basis": f"Official size; {GPU_DUCT_H} mm gap to the panel and {FAN_PITCH} mm fan pitch measured. "
                 "The display bracket sits at the rear, next to the board I/O.",
        "heat_W": 300, "uncertainty_mm": [3, 1, 3],
    },
    *[{
        "id": f"GPU_FAN_{i + 1}", "label": f"GPU fan {i + 1} (90 mm)", "role": "fan", "certainty": "measured",
        "parent": "GPU",
        "fan": fan(x, gpu_y0 + 5, GPU_FAN_Z, [0, 1, 0], 90, 10, "intake"),
        "box": box(x - 45, gpu_y0, GPU_FAN_Z - 45, 90, 10, 90),
        "basis": "Centres 96.4 mm apart (measured); position along the case read from the grille.",
    } for i, x in enumerate(gpu_fan_x)],
    {
        "id": "GPU_DUCT", "label": "Printed GPU duct (PLA)", "role": "duct", "certainty": "measured",
        "box": box(gpu_fan_x[0] - 50.6, PANEL_T, GPU_FAN_Z - 64, gpu_fan_x[2] - gpu_fan_x[0] + 101.2, GPU_DUCT_H, 128),
        "shape": {"type": "rings", "axis": "y", "centres_x": gpu_fan_x, "centre_z": GPU_FAN_Z, "r_in": 46.5,
                  "r_out": 48.1, "flange_r": 50.6, "flange_t": 1.6, "height": GPU_DUCT_H, "ears_z": [-57, 57]},
        "basis": "Designed here (canal_gpu.scad v5), fitted on 14 Nov 2026 and zip-tied to the grille.",
        "installed": "2026-11-14",
    },
    {
        "id": "SPINE", "label": "Spine (position 3)", "role": "structure", "certainty": "assumed",
        "box": box(0, gpu_y0 + GPU_T + 0.5, 0, L, 1.5, H),
        "basis": "Sheet with large cut-outs. The spec gives 53 mm for the GPU at position 3, but "
                 "15.15 + 41.6 = 56.75 mm measured: its exact plane still has to be measured.",
        "porosity": 0.5,
    },
    {
        "id": "RISER", "label": "PCIe riser cable", "role": "structure", "certainty": "photo",
        "box": box(214, gpu_y0 + GPU_T + 2, 120, 78, BOARD_Y0 - gpu_y0 - GPU_T - 2, H - PANEL_T - 120),
        "basis": "Black ribbon folded over the top of the spine, from the board to the GPU (top photo, 14 Nov).",
    },
    {
        "id": "MOTHERBOARD", "label": "Gigabyte B850I AORUS PRO", "role": "structure", "certainty": "official",
        "box": box(165, BOARD_Y0, 16, 170, BOARD_T, 170),
        "basis": "Mini-ITX, 170 × 170 mm; I/O towards the rear.", "heat_W": 12,
    },
    {
        "id": "RAM", "label": "Corsair Vengeance DDR5 2 × 16 GB", "role": "heat", "certainty": "photo",
        "box": box(cpu_x - COOLER[0] / 2 - 18.5, BOARD_Y0 + BOARD_T, cpu_z - 66.5, 17, 35, 133),
        "basis": "Upright, just in front of the cooler (to its left seen from the board side). "
                 "Corrected by César on 14 Nov 2026.", "heat_W": 8,
    },
    {
        "id": "CPU_COOLER", "label": "Thermalright AXP90-X47 Full Copper", "role": "heat", "certainty": "official",
        "box": box(cpu_x - COOLER[0] / 2, cooler_y0, cpu_z - COOLER[2] / 2, *COOLER),
        "basis": f"Fan centre on grille row {CPU_FAN_ROW} and {cpu_z} mm above the floor "
                 "(matches the slot break). 47 mm + 20.5 mm duct = 67.5 (spec: 67).",
        "heat_W": 107,
    },
    {
        "id": "CPU_FAN", "label": "Noctua 92 mm fan on the cooler", "role": "fan", "certainty": "photo",
        "parent": "CPU_COOLER",
        "fan": fan(cpu_x, cooler_top - 7, cpu_z, [0, -1, 0], 88, 14, "intake", frame=92),
        "box": box(cpu_x - 46, cooler_top - 14, cpu_z - 46, 92, 14, 92),
        "basis": "Top-flow cooler: the fan blows down onto the board. Official 92 × 92 × 14 mm Noctua frame (seen in the photos instead of the stock TL-9015R).",
    },
    {
        "id": "CPU_DUCT", "label": "Printed CPU duct (PLA)", "role": "duct", "certainty": "measured",
        "box": box(cpu_x - 59.4 - 7, cooler_top, cpu_z - 48.85, 119.7, CPU_DUCT_H, 97.7),
        "shape": {"type": "tube", "axis": "y", "centre_x": cpu_x, "centre_z": cpu_z, "r_in": 44.75, "r_out": 46.35,
                  "flange_r": 48.85, "flange_t": 1.6, "height": CPU_DUCT_H, "ears_x": [-59.4, 53.3]},
        "basis": "Designed here (canal_cpu.scad v4), fitted on 13 Nov 2026. Replaces the NA-FD1 foam.",
        "installed": "2026-11-13",
    },
    {
        "id": "PSU", "label": "Corsair SF850 (2024) SFX", "role": "heat", "certainty": "photo",
        "box": box(10, W - PANEL_T - 4 - 63.5, 48, 100, 63.5, 125),
        "basis": "Official size; at the front on the CPU side. Fan towards the CPU-side panel; AC socket and honeycomb exhaust face up, under the top fan (top photo).",
        "exhaust": {"face": "z+", "note": "the SFX rear grille points at the top panel"},
        "heat_W": 36,
    },
    {
        "id": "PSU_FAN", "label": "PSU fan (92 mm, stops at low load)", "role": "fan", "certainty": "measured",
        "parent": "PSU",
        "fan": fan(60, W - PANEL_T - 4 - 6, 110.5, [0, -1, 0], 92, 12, "intake"),
        "box": box(14, W - PANEL_T - 4 - 12, 64.5, 92, 12, 92),
        "basis": "Draws air in from the CPU-side panel, like the CPU fan (confirmed by César); it leaves through the SFX rear grille, which faces up.",
    },
    {
        "id": "BOTTOM_FAN", "label": "Noctua 120 mm · bottom exhaust", "role": "fan", "certainty": "assumed",
        "fan": fan(68, 77, 9.5, [0, 0, -1], 114, 15, "exhaust", frame=120),
        "box": box(8, 17, 2, 120, 120, 15),
        "basis": "Official 120 × 120 × 15 mm Noctua on the official floor mount, at the front. Exact position to measure (±10 mm).",
    },
    {
        "id": "BOTTOM_GRILLE", "label": "COYUN wire grille over the bottom fan", "role": "porous",
        "certainty": "photo",
        "box": box(8, 17, 17, 120, 120, 2),
        "shape": {"type": "disc_grille", "axis": "z", "centre": [68, 77, 18], "diameter": 116, "rings": 4},
        "basis": "On the inner side, so the cables cannot touch the blades.", "porosity": 0.85,
    },
    {
        "id": "TOP_FAN", "label": "Noctua 120 mm · top exhaust", "role": "fan", "certainty": "photo",
        "fan": fan(78, 76.5, H - PANEL_T - 7.5, [0, 0, 1], 114, 15, "exhaust", frame=120),
        "box": box(18, 16.5, H - PANEL_T - 15, 120, 120, 15),
        "basis": "Zip-tied to the underside of the top panel at the front, right above the PSU exhaust. "
                 "Official 120 × 120 × 15 mm frame; centre (78 mm from the front, centred across) read from the top photo through the slots.",
    },
    {
        "id": "CABLES_GPU", "label": "Cable bundle, GPU side", "role": "porous", "certainty": "photo",
        "box": box(2, PANEL_T + 2, gpu_z0 + GPU_H + 1, 95, gpu_y0 + GPU_T - PANEL_T - 2, H - PANEL_T - 15 - gpu_z0 - GPU_H - 2),
        "basis": "GPU power cable (braided 12V-2x6) plugged into the top edge of the card and looped above it towards the front (top photo). Porous volume; cables drawn for illustration.", "porosity": 0.55,
    },
    {
        "id": "CABLES_MAIN", "label": "Cable bundle between PSU and board", "role": "porous", "certainty": "photo",
        "box": box(118, BOARD_Y0, 10, 66, W - PANEL_T - BOARD_Y0 - 2, 165),
        "basis": "24-pin, EPS and PCIe gathered between the PSU and the RAM (board-side photos). Porous volume.",
        "porosity": 0.5,
    },
    {
        "id": "CABLES_BOTTOM", "label": "Cables along the floor to the rear", "role": "porous", "certainty": "photo",
        "box": box(184, BOARD_Y0, 2, 150, W - PANEL_T - BOARD_Y0 - 2, 32),
        "basis": "Run along the floor on the board side. Porous volume.", "porosity": 0.6,
    },
]

panels = [
    {"id": "PANEL_GPU", "label": "GPU-side panel", "face": "y-", "certainty": "photo",
     "grille": {"rows_x": row_x, "slot_w": SLOT, "slot_z": [round(v, 2) for v in GPU_SLOT_Z],
                "gap_z": {k: [round(a, 2) for a in v] for k, v in GPU_GAP.items()}},
     "basis": "37 rows every 8.05 mm, 3.5 mm slots ~150 mm long with an alternating central break. Checked against the panel length (342.3 vs 343)."},
    {"id": "PANEL_CPU", "label": "CPU-side panel", "face": "y+", "certainty": "photo",
     "grille": {"rows_x": row_x, "slot_w": SLOT, "slot_z": [round(v, 2) for v in CPU_SLOT_Z],
                "gap_z": {k: list(v) for k, v in CPU_GAP.items()}},
     "basis": "The same panel turned 180°."},
    {"id": "PANEL_TOP", "label": "Top panel", "face": "z+", "certainty": "photo",
     "grille": {"rows_x": TOP_ROWS_X, "slot_w": SLOT, "slot_y": [20.8, 132.4], "gap_y": {"even": [68.0, 72.5], "odd": [77.5, 83.0]}},
     "basis": "36 rows across the case every 8.05 mm, from 28 mm behind the front to 33 mm before the rear; slots ~112 mm "
              "with an alternating break, like the sides (top photo, 14 Nov)."},
    {"id": "PANEL_FRONT", "label": "Front", "face": "x-", "certainty": "photo",
     "walnut": {"z": [-FEET, 16]},
     "basis": "Solid sheet; the walnut strip at the bottom carries the power button and a USB-C port (front photo)."},
    {"id": "PANEL_REAR", "label": "Rear (board and GPU I/O)", "face": "x+", "certainty": "photo",
     "openings": [
         {"id": "REAR_GAP", "y": [141, 147], "z": [14, 188], "porosity": 1.0, "note": "open strip beside the I/O plate, CPU side"},
         {"id": "BOARD_IO", "y": [88, 141], "z": [18, 182], "porosity": 0.12, "note": "board I/O plate with vent holes"},
         {"id": "GPU_BRACKET", "y": [gpu_y0, round(gpu_y0 + GPU_T, 2)], "z": [gpu_z0, round(gpu_z0 + GPU_H, 2)], "porosity": 0.3, "note": "GPU bracket vents"},
     ],
     "basis": "Recessed I/O area seen in the rear photos; open fractions estimated."},
    {"id": "PANEL_BOTTOM", "label": "Floor", "face": "z-", "certainty": "assumed",
     "basis": "Open at the 120 mm fan; the side panels are cut away between the feet, so the 20 mm gap under the case is open on both sides."},
]

geometry = {
    "schema_version": "2.1.0",
    "updated": "2026-11-14",
    "coordinate_system": {
        "origin": "esquina delantera-inferior del lado de la gráfica, sin patas",
        "x": "de delante (nogal, fuente) hacia atrás (I/O)", "y": "del panel de la gráfica al del procesador",
        "z": "del suelo de la caja hacia arriba", "units": "mm",
    },
    "case": {"outer_body_mm": [L, W, H], "feet_mm": FEET, "panel_t_mm": PANEL_T, "volume_L": 10.4,
             "finish": "jade, frontal de nogal", "support_surface": "mesa maciza", "certainty": "official"},
    "certainty_levels": {
        "measured": "Medida por César", "official": "Ficha del fabricante",
        "photo": "Deducida de las fotos", "assumed": "Supuesta: medir antes del CFD"},
    "components": components,
    "panels": panels,
    "flow_boundaries": [
        {"id": "GPU_SIDE_INTAKE", "panel": "PANEL_GPU", "driven_by": ["GPU_FAN_1", "GPU_FAN_2", "GPU_FAN_3"], "through": "GPU_DUCT"},
        {"id": "CPU_SIDE_INTAKE", "panel": "PANEL_CPU", "driven_by": ["CPU_FAN"], "through": "CPU_DUCT"},
        {"id": "PSU_SIDE_INTAKE", "panel": "PANEL_CPU", "driven_by": ["PSU_FAN"]},
        {"id": "BOTTOM_EXHAUST", "panel": "PANEL_BOTTOM", "driven_by": ["BOTTOM_FAN"], "note": "a 20 mm de la mesa"},
        {"id": "TOP_EXHAUST", "panel": "PANEL_TOP", "driven_by": ["TOP_FAN"]},
        {"id": "PASSIVE_SIDES", "panel": "PANEL_GPU, PANEL_CPU", "driven_by": [], "note": "las ranuras fuera de los canales dejan pasar aire en los dos sentidos"},
    ],
    "not_modelled": [
        "Bridas de los canales: unos gramos de nailon que no cambian el flujo.",
        "Aletas reales de los disipadores: se tratan como bloques porosos con pérdida de carga.",
        "Forma real de cada cable: se modelan como volúmenes porosos.",
    ],
    "open_questions": [
        "Modelo de cada ventilador: las fotos muestran un Noctua de 92 mm en el disipador y uno de 120 mm arriba; ¿cuál va abajo?",
        "Posición del ventilador de abajo (supuesta: delante, centrado).",
        "Dónde está la columna central: distancia del panel de la gráfica a la chapa (la ficha da 53 mm, medimos 56,75).",
        "Altura del centro del ventilador del procesador sobre el suelo de la caja (calculada: 122 mm).",
    ],
    "resolved": [
        "Panel de arriba: 36 filas de ranuras, medido en la foto desde arriba (14 nov).",
        "Ventilador de arriba: 120 mm, delante, justo encima de la salida de la fuente.",
        "Fuente: toma aire del panel del procesador y lo suelta hacia arriba (César y foto).",
        "Frontal cerrado; trasera con la placa de I/O, una ranura abierta al lado y las rejillas del soporte de la gráfica.",
        "Cable de la gráfica por encima de la tarjeta; riser doblado sobre la columna central.",
    ],
    "modelling_rule": "Lo medido, lo oficial, lo deducido de fotos y lo supuesto se guardan por separado. "
                      "Es geometría para preparar el CFD, no un CAD de fabricación.",
}


def overlaps():
    """Piezas macizas que se solapan (los porosos y los ventiladores dentro de su pieza no cuentan)."""
    solid = [c for c in components if c["role"] in ("heat", "structure", "duct") and c["id"] not in ("SPINE",)]
    bad = []
    for i, a in enumerate(solid):
        for b in solid[i + 1:]:
            if all(a["box"]["min"][k] < b["box"]["min"][k] + b["box"]["size"][k] - 0.01 and
                   b["box"]["min"][k] < a["box"]["min"][k] + a["box"]["size"][k] - 0.01 for k in range(3)):
                bad.append((a["id"], b["id"]))
    return bad


def inside_case():
    out = []
    for c in components:
        lo, sz = c["box"]["min"], c["box"]["size"]
        if any(lo[k] < -0.01 or lo[k] + sz[k] > (L, W, H)[k] + 0.01 for k in range(3)):
            out.append(c["id"])
    return out


if __name__ == "__main__":
    allowed = {("MOTHERBOARD", "RAM")}  # la memoria va pinchada en la placa
    bad = [p for p in overlaps() if p not in allowed and p[::-1] not in allowed]
    print("GPU x", gpu_x0, "→", round(gpu_x0 + GPU_LEN, 1), "· ventiladores", gpu_fan_x, "· y", gpu_y0)
    print("CPU centro x", cpu_x, "z", cpu_z, "· disipador y", cooler_y0, "→", cooler_top, "· placa y", BOARD_Y0)
    print("Solapes:", bad or "ninguno", "· fuera de la caja:", inside_case() or "nada")
    if "--check" in sys.argv:
        sys.exit(1 if bad or inside_case() else 0)
    data = json.loads(DATA.read_text(encoding="utf-8"))
    data["geometry"] = geometry
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Escrito", DATA.relative_to(ROOT))
