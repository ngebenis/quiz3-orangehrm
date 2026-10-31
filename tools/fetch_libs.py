#!/usr/bin/env python3
"""Unduh paket .deb + seluruh dependensinya lalu ekstrak ke prefix lokal.

Dipakai untuk memulihkan libgtk-3 dan kawan-kawan yang dibutuhkan Cypress
Electron setelah cache mesin dibersihkan. Tidak butuh root.
"""
import gzip
import os
import re
import subprocess
import sys
import urllib.request

SUITE = "trixie"
MIRROR = "https://deb.debian.org/debian"
PREFIX = "/opt/data/cache/scratch/xprefix"
DL = "/opt/data/cache/scratch/debcache"
WANTED = sys.argv[1:] or ["libgtk-3-0t64"]

os.makedirs(DL, exist_ok=True)
os.makedirs(PREFIX, exist_ok=True)


def fetch(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return path
    urllib.request.urlretrieve(url, path)
    return path


def load_packages():
    out = {}
    url = f"{MIRROR}/dists/{SUITE}/main/binary-amd64/Packages.gz"
    raw = gzip.decompress(urllib.request.urlopen(url, timeout=180).read())
    for block in raw.decode("utf-8", "replace").split("\n\n"):
        if not block.strip():
            continue
        info = {}
        for line in block.split("\n"):
            if line.startswith((" ", "\t")):
                continue
            if ": " in line:
                key, val = line.split(": ", 1)
                info[key] = val
        if "Package" in info:
            out.setdefault(info["Package"], info)
    return out


def deps(info):
    result = []
    for field in ("Depends", "Pre-Depends"):
        for part in info.get(field, "").split(","):
            name = re.split(r"[ (|:]", part.strip())[0].strip()
            if name:
                result.append(name)
    return result


def main():
    pkgs = load_packages()
    print(f"indeks paket: {len(pkgs)}", flush=True)

    need, seen = list(WANTED), set()
    while need:
        name = need.pop(0)
        if name in seen:
            continue
        seen.add(name)
        info = pkgs.get(name)
        if not info:
            continue
        need.extend(deps(info))

    print(f"total paket: {len(seen)}", flush=True)
    ok, skip = 0, 0
    for name in sorted(seen):
        info = pkgs.get(name)
        if not info:
            # Paket virtual (mis. default-dbus-session-bus) tidak punya .deb.
            skip += 1
            continue
        url = f"{MIRROR}/{info['Filename']}"
        path = os.path.join(DL, os.path.basename(info["Filename"]))
        try:
            fetch(url, path)
            subprocess.run(["dpkg-deb", "-x", path, PREFIX], check=True, capture_output=True)
            ok += 1
        except Exception as exc:
            print(f"  gagal {name}: {exc}", flush=True)
    print(f"terekstrak: {ok}/{len(seen)} -> {PREFIX}", flush=True)


main()
