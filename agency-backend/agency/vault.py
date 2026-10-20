"""Secretos cifrados con DPAPI del usuario de Windows: solo este usuario en este PC puede leerlos."""
import ctypes
import ctypes.wintypes as wt
import json

from .config import SECRETS_DIR


class _Blob(ctypes.Structure):
    _fields_ = [("cbData", wt.DWORD), ("pbData", ctypes.POINTER(ctypes.c_char))]


_crypt32 = ctypes.windll.crypt32
_kernel32 = ctypes.windll.kernel32
_kernel32.LocalFree.argtypes = [ctypes.c_void_p]
_UI_FORBIDDEN = 0x1


def _call(fn, data: bytes) -> bytes:
    buf = ctypes.create_string_buffer(data, len(data))
    inp, out = _Blob(len(data), ctypes.cast(buf, ctypes.POINTER(ctypes.c_char))), _Blob()
    if fn is _crypt32.CryptProtectData:
        ok = fn(ctypes.byref(inp), ctypes.c_wchar_p("ScarlettAgency"), None, None, None, _UI_FORBIDDEN, ctypes.byref(out))
    else:
        ok = fn(ctypes.byref(inp), None, None, None, None, _UI_FORBIDDEN, ctypes.byref(out))
    if not ok:
        raise ctypes.WinError()
    try:
        return ctypes.string_at(out.pbData, out.cbData)
    finally:
        _kernel32.LocalFree(out.pbData)


def save(name: str, value) -> None:
    SECRETS_DIR.mkdir(parents=True, exist_ok=True)
    (SECRETS_DIR / f"{name}.bin").write_bytes(_call(_crypt32.CryptProtectData, json.dumps(value).encode("utf-8")))


def load(name: str):
    path = SECRETS_DIR / f"{name}.bin"
    if not path.exists():
        return None
    return json.loads(_call(_crypt32.CryptUnprotectData, path.read_bytes()).decode("utf-8"))


def delete(name: str) -> None:
    (SECRETS_DIR / f"{name}.bin").unlink(missing_ok=True)
