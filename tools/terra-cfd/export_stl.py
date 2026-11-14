"""Exporta la geometría del Terra a STL para preparar el CFD (p. ej. OpenFOAM con snappyHexMesh).

Lee `geometry` de control/data/terra-thermal-summary.json (ver build_geometry.py) y escribe:
  - un STL por pieza maciza (paredes que calientan o estorban),
  - un STL por zona porosa (mazos de cables, rejilla del ventilador de abajo),
  - un disco por ventilador (para un modelo de ventilador tipo fan/actuator disk),
  - un STL con las ranuras de cada panel (las entradas y salidas pasivas),
  - manifest.json con qué es cada fichero y con qué condición entra en la malla.

Unidades: metros (lo que espera OpenFOAM). Ejes como en el dato.

Uso:  python tools/terra-cfd/export_stl.py [carpeta]
      (por defecto Escritorio/Claude/Datos/Terra/cfd-geometria)
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "control" / "data" / "terra-thermal-summary.json"
DEFAULT_OUT = Path.home() / "Desktop" / "Claude" / "Datos" / "Terra" / "cfd-geometria"
M = 0.001  # mm → m


class Mesh:
    def __init__(self):
        self.tris = []

    def tri(self, a, b, c):
        self.tris.append((a, b, c))

    def quad(self, a, b, c, d):
        self.tri(a, b, c)
        self.tri(a, c, d)

    def write(self, path, name):
        with open(path, "w", encoding="ascii") as f:
            f.write(f"solid {name}\n")
            for a, b, c in self.tris:
                n = normal(a, b, c)
                f.write(f"  facet normal {n[0]:.6e} {n[1]:.6e} {n[2]:.6e}\n    outer loop\n")
                for v in (a, b, c):
                    f.write(f"      vertex {v[0] * M:.6e} {v[1] * M:.6e} {v[2] * M:.6e}\n")
                f.write("    endloop\n  endfacet\n")
            f.write(f"endsolid {name}\n")


def normal(a, b, c):
    u = [b[i] - a[i] for i in range(3)]
    v = [c[i] - a[i] for i in range(3)]
    n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
    length = math.sqrt(sum(x * x for x in n)) or 1.0
    return [x / length for x in n]


def add_box(mesh, lo, size):
    x0, y0, z0 = lo
    x1, y1, z1 = (lo[i] + size[i] for i in range(3))
    p = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    for a, b, c, d in [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (2, 3, 7, 6), (1, 2, 6, 5), (3, 0, 4, 7)]:
        mesh.quad(p[a], p[b], p[c], p[d])


def frame(axis):
    """Dos vectores perpendiculares al eje (solo ejes de coordenadas)."""
    k = [abs(v) for v in axis].index(1)
    u = [0, 0, 0]
    w = [0, 0, 0]
    u[(k + 1) % 3] = 1
    w[(k + 2) % 3] = 1
    return k, u, w


def add_annulus_tube(mesh, centre, axis, r_out, r_in, length, n=64):
    """Tubo de pared r_in–r_out a lo largo de `axis` desde `centre` (cerrado en los dos extremos)."""
    k, u, w = frame(axis)
    s = 1 if sum(axis) > 0 else -1

    def pt(r, ang, h):
        p = list(centre)
        for i in range(3):
            p[i] += r * (math.cos(ang) * u[i] + math.sin(ang) * w[i])
        p[k] += s * h
        return tuple(p)

    for j in range(n):
        a0, a1 = 2 * math.pi * j / n, 2 * math.pi * (j + 1) / n
        mesh.quad(pt(r_out, a0, 0), pt(r_out, a1, 0), pt(r_out, a1, length), pt(r_out, a0, length))
        mesh.quad(pt(r_in, a1, 0), pt(r_in, a0, 0), pt(r_in, a0, length), pt(r_in, a1, length))
        mesh.quad(pt(r_in, a0, 0), pt(r_in, a1, 0), pt(r_out, a1, 0), pt(r_out, a0, 0))
        mesh.quad(pt(r_out, a0, length), pt(r_out, a1, length), pt(r_in, a1, length), pt(r_in, a0, length))


def add_disc(mesh, centre, axis, r, r_hub=0.0, n=64):
    k, u, w = frame(axis)

    def pt(rr, ang):
        p = list(centre)
        for i in range(3):
            p[i] += rr * (math.cos(ang) * u[i] + math.sin(ang) * w[i])
        return tuple(p)

    for j in range(n):
        a0, a1 = 2 * math.pi * j / n, 2 * math.pi * (j + 1) / n
        if r_hub > 0:
            mesh.quad(pt(r_hub, a0), pt(r, a0), pt(r, a1), pt(r_hub, a1))
        else:
            mesh.tri(tuple(centre), pt(r, a0), pt(r, a1))


def add_slot(mesh, plane, coord, a_axis, a, b0, b1, b_axis, w, n=8):
    """Ranura plana de extremos redondos en el plano `plane`=coord, eje largo b_axis de b0 a b1, centrada en a."""
    r = w / 2
    outline = []
    for j in range(n + 1):
        ang = math.pi + math.pi * j / n
        outline.append((a + r * math.cos(ang), b0 + r + r * math.sin(ang)))
    for j in range(n + 1):
        ang = math.pi * j / n
        outline.append((a + r * math.cos(ang), b1 - r + r * math.sin(ang)))
    cx, cb = a, (b0 + b1) / 2

    def p3(pa, pb):
        p = [0.0, 0.0, 0.0]
        p[plane] = coord
        p[a_axis] = pa
        p[b_axis] = pb
        return tuple(p)

    for j in range(len(outline)):
        p0, p1 = outline[j], outline[(j + 1) % len(outline)]
        mesh.tri(p3(cx, cb), p3(*p0), p3(*p1))


def export(out):
    data = json.loads(DATA.read_text(encoding="utf-8"))
    g = data["geometry"]
    L, W, H = g["case"]["outer_body_mm"]
    t = g["case"]["panel_t_mm"]
    out.mkdir(parents=True, exist_ok=True)
    manifest = {"units": "m", "source": "control/data/terra-thermal-summary.json · geometry " + g["schema_version"],
                "domain": {"case_interior_m": [[t * M, t * M, t * M], [(L - t) * M, (W - t) * M, (H - t) * M]],
                           "note": "Dominio interior de la caja. Para el exterior añadir una caja de aire alrededor y la mesa 20 mm por debajo."},
                "files": []}

    def save(mesh, name, kind, part, extra=None):
        path = out / f"{name}.stl"
        mesh.write(path, name)
        entry = {"file": path.name, "kind": kind, "id": part.get("id", name), "label": part.get("label", ""),
                 "certainty": part.get("certainty"), "triangles": len(mesh.tris)}
        entry.update(extra or {})
        manifest["files"].append(entry)

    for part in g["components"]:
        mesh = Mesh()
        b = part["box"]
        if part.get("fan"):
            f = part["fan"]
            add_disc(mesh, f["centre"], f["axis"], f["diameter"] / 2, f["diameter"] / 2 * f["hub_ratio"])
            save(mesh, part["id"].lower(), "fan_disc", part,
                 {"flow": f["flow"], "axis": f["axis"], "diameter_mm": f["diameter"],
                  "bc": "fan / actuator disk; curva de ventilador por definir"})
            continue
        shape = part.get("shape") or {}
        if shape.get("type") == "rings":
            for x in shape["centres_x"]:
                add_annulus_tube(mesh, (x, b["min"][1], shape["centre_z"]), (0, 1, 0), shape["r_out"], shape["r_in"], shape["height"])
            save(mesh, part["id"].lower(), "wall", part, {"bc": "wall (PLA)"})
            continue
        if shape.get("type") == "tube":
            add_annulus_tube(mesh, (shape["centre_x"], b["min"][1], shape["centre_z"]), (0, 1, 0), shape["r_out"], shape["r_in"], shape["height"])
            save(mesh, part["id"].lower(), "wall", part, {"bc": "wall (PLA)"})
            continue
        add_box(mesh, b["min"], b["size"])
        if part["role"] == "porous":
            save(mesh, part["id"].lower(), "porous_zone", part,
                 {"porosity": part.get("porosity"), "bc": "cellZone con Darcy-Forchheimer; coeficientes por ajustar"})
        else:
            extra = {"bc": "wall" + (f" con fuente de calor ~{part['heat_W']} W" if part.get("heat_W") else "")}
            if part["id"] == "CPU_COOLER":
                extra["bc"] = "porous_zone (aletas) + fuente de calor ~%s W" % part.get("heat_W")
            if part["id"] == "GPU":
                extra["bc"] = "wall + zona porosa del disipador bajo los ventiladores; fuente ~%s W" % part.get("heat_W")
            if part["id"] == "SPINE":
                extra["bc"] = "baffle poroso (chapa con huecos)"
            save(mesh, part["id"].lower(), "solid", part, extra)

    for panel in g["panels"]:
        for o in panel.get("openings", []):
            mesh = Mesh()
            x = L - t
            a, b = (o["y"][0], o["z"][0]), (o["y"][1], o["z"][1])
            mesh.quad((x, a[0], a[1]), (x, b[0], a[1]), (x, b[0], b[1]), (x, a[0], b[1]))
            save(mesh, o["id"].lower(), "opening", {"id": o["id"], "label": o["note"], "certainty": panel["certainty"]},
                 {"bc": "patch abierto" if o["porosity"] >= 1 else f"porous baffle, fracción abierta ~{o['porosity']}",
                  "face": panel["face"], "open_fraction": o["porosity"]})
        gr = panel.get("grille")
        if not gr:
            continue
        mesh = Mesh()
        if panel["face"] in ("y-", "y+"):
            y = t if panel["face"] == "y-" else W - t
            for k, x in enumerate(gr["rows_x"]):
                gap = gr["gap_z"]["even" if k % 2 == 0 else "odd"]
                for z0, z1 in ((gr["slot_z"][0], gap[0]), (gap[1], gr["slot_z"][1])):
                    add_slot(mesh, 1, y, 0, x, z0, z1, 2, gr["slot_w"])
        elif panel["face"] == "z+":
            for k, x in enumerate(gr["rows_x"]):
                gap = gr["gap_y"]["even" if k % 2 == 0 else "odd"]
                for y0, y1 in ((gr["slot_y"][0], gap[0]), (gap[1], gr["slot_y"][1])):
                    add_slot(mesh, 2, H - t, 0, x, y0, y1, 1, gr["slot_w"])
        save(mesh, panel["id"].lower() + "_slots", "opening", panel,
             {"bc": "patch de presión total / entrada-salida libre", "face": panel["face"]})

    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUT
    m = export(target)
    print(f"{len(m['files'])} ficheros en {target}")
    for f in m["files"]:
        print(f"  {f['file']:<26} {f['kind']:<12} {f['triangles']:>6} triángulos")
