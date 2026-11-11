"""Read HWiNFO's shared-memory sensor table (free version: enable "Shared Memory Support").

Layout follows the HWiNFO SDK (HWiNFO_SENS_SM2): a header, then sensor and reading
elements whose sizes and offsets come from the header itself.
"""
import ctypes
import struct
from ctypes import wintypes

NAME = 'Global\\HWiNFO_SENS_SM2'
HEADER = struct.Struct('<IIIqIIIIII')  # signature, version, revision, poll_time, sensor off/size/num, reading off/size/num
READING_TYPES = {0: 'none', 1: 'temp', 2: 'volt', 3: 'fan', 4: 'current', 5: 'power', 6: 'clock', 7: 'usage', 8: 'other'}


def _text(raw):
    return raw.split(b'\0', 1)[0].decode('latin-1').strip()


_k32 = ctypes.WinDLL('kernel32', use_last_error=True)
_k32.OpenFileMappingW.restype = wintypes.HANDLE
_k32.OpenFileMappingW.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.LPCWSTR]
_k32.MapViewOfFile.restype = ctypes.c_void_p
_k32.MapViewOfFile.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.DWORD, wintypes.DWORD, ctypes.c_size_t]
_k32.UnmapViewOfFile.argtypes = [ctypes.c_void_p]
_k32.CloseHandle.argtypes = [wintypes.HANDLE]
FILE_MAP_READ = 0x0004


def _snapshot(size):
    """Open the existing mapping (creating one in the Global namespace needs a privilege we lack)."""
    handle = _k32.OpenFileMappingW(FILE_MAP_READ, False, NAME)
    if not handle:
        raise OSError(ctypes.get_last_error(), 'HWiNFO shared memory not found; is HWiNFO running with Shared Memory Support on?')
    try:
        view = _k32.MapViewOfFile(handle, FILE_MAP_READ, 0, 0, 0)
        if not view:
            raise OSError(ctypes.get_last_error(), 'MapViewOfFile failed')
        try:
            return ctypes.string_at(view, size)
        finally:
            _k32.UnmapViewOfFile(view)
    finally:
        _k32.CloseHandle(handle)


def read_all():
    sig, ver, rev, poll, s_off, s_size, s_num, r_off, r_size, r_num = HEADER.unpack(_snapshot(HEADER.size))
    if sig not in (0x53695748, 0x44414544):  # 'HWiS' or 'DEAD'
        raise RuntimeError(f'unexpected HWiNFO signature {sig:#x}')
    if sig == 0x44414544:
        raise RuntimeError('HWiNFO shared memory is inactive (12-hour limit reached or disabled)')
    total = r_off + r_size * r_num
    buf = _snapshot(total)
    sensors = []
    for i in range(s_num):
        base = s_off + i * s_size
        sensors.append(_text(buf[base + 8 + 128:base + 8 + 256]) or _text(buf[base + 8:base + 8 + 128]))
    readings = []
    for i in range(r_num):
        base = r_off + i * r_size
        kind, s_index, reading_id = struct.unpack_from('<III', buf, base)
        label = _text(buf[base + 12 + 128:base + 12 + 256]) or _text(buf[base + 12:base + 12 + 128])
        unit = _text(buf[base + 268:base + 284])
        value = struct.unpack_from('<d', buf, base + 284)[0]
        readings.append({'sensor': sensors[s_index] if s_index < len(sensors) else '?', 'label': label,
                         'unit': unit, 'type': READING_TYPES.get(kind, str(kind)), 'value': value})
    return poll, readings


if __name__ == '__main__':
    poll, rows = read_all()
    for row in rows:
        if row['type'] in ('temp', 'fan', 'power') or 'Usage' in row['label']:
            print(f"{row['sensor'][:40]:40} | {row['label'][:34]:34} | {row['value']:9.2f} {row['unit']}")
