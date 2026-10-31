#!/usr/bin/env python3
"""Rakit video presentasi Final Project QAE Sanbercode (lengkap dengan narasi).

Struktur wajib:
  1. Pengenalan diri
  2. Judul proyek akhir
  3. Fitur-fitur yang dikerjakan
  4. Demo fitur (rekaman simulasi aplikasi)
  5. Kesimpulan

Narasi dibuat with edge-tts (id-ID-ArdiNeural). Video 1920x1080 H.264 + AAC.
Output: /opt/data/output/final-project-qae-sanbercode.mp4
"""
import asyncio
import json
import os
import subprocess
import sys

OUT = "/opt/data/output"
BUILD = os.path.join(OUT, "build-video")
SEG = os.path.join(BUILD, "seg")
DEMO_SRC = os.path.join(OUT, "video-simulasi-3fitur.mp4")
FINAL = os.path.join(OUT, "final-project-qae-sanbercode.mp4")

VOICE = "id-ID-ArdiNeural"
RATE = "-4%"          # sedikit lebih lambat agar jelas
FPS = 30
W, H = 1920, 1080

# Crop area aplikasi di dalam rekaman Cypress (tanpa panel kiri & toolbar atas)
CROP = "crop=830:575:493:168"
DEMO_SPEED = 1.5
DEMO_OFFSET = 19      # detik awal rekaman yang dipakai

os.makedirs(SEG, exist_ok=True)

# ---------------------------------------------------------------- narasi
NARASI = {
    "n1_intro": (
        "Halo, perkenalkan nama saya Beni Santoso. Saya peserta Bootcamp Digital Skill "
        "Sanbercode pada kelas Quality Assurance Engineer. Pada video ini saya akan "
        "mempresentasikan proyek akhir saya."
    ),
    "n2_judul": (
        "Judul proyek akhir saya adalah Otomasi Pengujian Website OrangeHRM Menggunakan "
        "Cypress dengan Pendekatan Page Object Model dan Intercept. Proyek ini menguji "
        "tiga fitur utama, yaitu Login, Directory, dan Recruitment."
    ),
    "n3a_fitur": (
        "Ada lima bagian pekerjaan yang saya kerjakan. Pertama, UI automation pada fitur "
        "Login sebanyak dua belas test case. Kedua, dua belas test case Login menggunakan "
        "intercept, di mana setiap test memakai endpoint yang berbeda. Ketiga, penulisan "
        "ulang Login dengan Page Object Model sebanyak empat belas test case."
    ),
    "n3b_fitur": (
        "Keempat, API automation pada Platzi Categories dengan empat belas request, "
        "lengkap dengan assertion status code dan response body. Dan kelima, tugas tiga "
        "fitur yaitu Login, Directory, dan Recruitment, masing-masing delapan test case, "
        "seluruhnya memakai Page Object Model dan intercept."
    ),
    "n4_arsitektur": (
        "Script saya susun dalam empat lapisan. Page Object menyimpan seluruh action dan "
        "locator. Test Data menyimpan data pengujian. Intercept menyimpan pemetaan "
        "endpoint. Dan test case hanya berisi alur pengujian beserta assertion. Dengan "
        "pemisahan ini, script menjadi rapi dan mudah dirawat."
    ),
    "n5_demo_intro": "Berikut demo aplikasi OrangeHRM yang sudah saya otomasi.",
    "n5a_demo": "Pertama, saya masuk menggunakan kredensial demo.",
    "n5b_demo": "Setelah login, saya diarahkan ke halaman Dashboard.",
    "n5c_demo": (
        "Selanjutnya saya membuka menu Directory, yang menampilkan seratus sembilan puluh "
        "data karyawan dalam bentuk kartu."
    ),
    "n5d_demo": (
        "Terakhir saya membuka menu Recruitment, lalu melihat daftar kandidat yang ada."
    ),
    "n5e_demo": "Dan di sini saya membuka form Add Candidate.",
    "n6_kesimpulan": (
        "Sebagai kesimpulan, seluruh tujuh puluh dua test case berhasil lulus. Satu "
        "framework Cypress dipakai untuk tiga jenis pengujian, yaitu UI automation, "
        "network interception, dan API testing. Assertion disusun berdasarkan perilaku "
        "nyata aplikasi. Sekian presentasi dari saya, terima kasih."
    ),
}


def sh(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print("GAGAL:", " ".join(cmd)[:300], "\n", r.stderr[-1500:], flush=True)
        raise SystemExit(1)
    return r


def dur(path):
    r = sh(["ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "csv=p=0", path])
    return float(r.stdout.strip())


async def tts_all():
    import edge_tts
    for name, text in NARASI.items():
        path = os.path.join(BUILD, name + ".mp3")
        if os.path.exists(path) and dur(path) > 0.5:
            print("tts ada :", name, round(dur(path), 1), flush=True)
            continue
        await edge_tts.Communicate(text, VOICE, rate=RATE).save(path)
        print("tts baru:", name, round(dur(path), 1), flush=True)


def seg_slide(nama, slide_png, audio_mp3, pad=0.7):
    """Slide statis + narasi. Durasi = narasi + pad."""
    total = dur(audio_mp3) + pad
    out = os.path.join(SEG, nama + ".mp4")
    sh(["ffmpeg", "-y", "-v", "error",
        "-loop", "1", "-i", slide_png,
        "-i", audio_mp3,
        "-filter_complex",
        f"[0:v]scale={W}:{H},fps={FPS},"
        f"fade=t=in:st=0:d=0.4,fade=t=out:st={total - 0.45:.2f}:d=0.45[v];"
        f"[1:a]adelay=250|250,apad,atrim=0:{total},"
        f"afade=t=in:st=0:d=0.2,afade=t=out:st={total - 0.4:.2f}:d=0.4,"
        f"aresample=48000,aformat=channel_layouts=stereo[a]",
        "-map", "[v]", "-map", "[a]",
        "-t", f"{total:.2f}",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p", "-r", str(FPS),
        "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2",
        out])
    print("seg slide:", nama, round(total, 1), "detik", flush=True)
    return out, total


def seg_demo(nama, captions=None):
    """Demo: 5 klip terpilih (login, dashboard, directory, recruitment, add candidate).

    Bagian kosong/loading pada rekaman asli dibuang, tiap klip dipercepat
    DEMO_SPEED, dipotong ke area aplikasi saja, diberi caption + narasi.
    """
    out = os.path.join(SEG, nama + ".mp4")

    # (start, end, file narasi, caption)
    klip = [
        (43, 60, "n5a_demo", "Login  -  kredensial demo"),
        (62, 77, "n5b_demo", "Dashboard  -  halaman utama"),
        (78, 100, "n5c_demo", "Directory  -  data karyawan"),
        (116, 133, "n5d_demo", "Recruitment  -  daftar kandidat"),
        (142, 166, "n5e_demo", "Recruitment  -  form Add Candidate"),
    ]

    inputs, filt = [], []
    for i, (a, b, aud, _c) in enumerate(klip):
        inputs += ["-ss", str(a), "-to", str(b), "-i", DEMO_SRC]
    nsrc = len(klip)
    for i, (a, b, aud, _c) in enumerate(klip):
        inputs += ["-i", os.path.join(BUILD, aud + ".mp3")]

    # video tiap klip: crop + speed + scale/pad
    for i in range(nsrc):
        filt.append(
            f"[{i}:v]{CROP},setpts=PTS/{DEMO_SPEED},fps={FPS},"
            f"scale=-2:{H},pad={W}:{H}:(ow-iw)/2:0:color=0x141B26,"
            f"setsar=1[v{i}]"
        )

    # durasi efektif tiap klip
    durs_v = [(b - a) / DEMO_SPEED for a, b, _c, _d in
              [(a, b, c, d) for a, b, c, d in klip]]
    nar_dur = [dur(os.path.join(BUILD, k[2] + ".mp3")) for k in klip]
    # pastikan klip cukup panjang untuk narasinya
    durs_v = [max(dv, nd + 1.0) for dv, nd in zip(durs_v, nar_dur)]
    total = sum(durs_v)

    # tiap klip dipotong sesuai durasi efektif (jika narasi lebih panjang,
    # klip terakhirnya di-freeze pakai tpad)
    for i in range(nsrc):
        filt.append(f"[v{i}]tpad=stop_mode=clone:stop_duration=8,"
                    f"trim=0:{durs_v[i]:.3f},setpts=PTS-STARTPTS[vf{i}]")

    # caption + label
    cap_style = ("fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
                 "fontcolor=white:fontsize=36:box=1:boxcolor=0x0B111C@0.88:boxborderw=18"
                 ":x=70:y=h-120")
    for i, (_a, _b, _aud, cap) in enumerate(klip):
        filt.append(f"[vf{i}]drawtext={cap_style}:text='{cap}'[vc{i}]")
        filt.append(f"[vc{i}]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:"
                    f"fontcolor=0x8FA3BF:fontsize=26:x=w-tw-70:y=h-115:"
                    f"text='Demo otomatis dengan Cypress — {i + 1}/{nsrc}'[vs{i}]")

    filt.append("".join(f"[vs{i}]" for i in range(nsrc)) +
                f"concat=n={nsrc}:v=1:a=0[vout]")

    # audio: narasi ditaruh di awal tiap klip
    off = 0.0
    amix_in = ""
    for i in range(nsrc):
        d = int(off * 1000)
        filt.append(f"[{nsrc + i}:a]adelay={d}|{d},aresample=48000,"
                    f"aformat=channel_layouts=stereo[a{i}]")
        amix_in += f"[a{i}]"
        off += durs_v[i]
    filt.append(f"{amix_in}amix=inputs={nsrc}:duration=longest:normalize=0,"
                f"apad,atrim=0:{total:.3f}[aout]")

    sh(["ffmpeg", "-y", "-v", "error", *inputs,
        "-filter_complex", ";".join(filt),
        "-map", "[vout]", "-map", "[aout]",
        "-t", f"{total:.2f}",
        "-c:v", "libx264", "-preset", "medium", "-crf", "21",
        "-pix_fmt", "yuv420p", "-r", str(FPS),
        "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2",
        out])
    print("seg demo:", nama, round(total, 1), "detik", flush=True)
    return out, total


def seg_demo_judul(nama, audio_mp3):
    """Kartu judul bagian demo (slide 05 yang sama)."""
    return seg_slide(nama, os.path.join(BUILD, "05_demo.png"),
                     os.path.join(BUILD, audio_mp3), pad=0.3)


def concat(segs):
    lst = os.path.join(BUILD, "list.txt")
    with open(lst, "w") as fh:
        for p in segs:
            fh.write(f"file '{p}'\n")
    sh(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
        "-c", "copy", "-movflags", "+faststart", FINAL])
    print("SELESAI:", FINAL, round(dur(FINAL), 1), "detik",
          round(os.path.getsize(FINAL) / 1e6, 2), "MB", flush=True)


if __name__ == "__main__":
    asyncio.run(tts_all())

    segs = []
    for nama, slide, aud, pad in [
        ("s1_intro", "01_intro.png", "n1_intro.mp3", 1.2),
        ("s2_judul", "02_judul.png", "n2_judul.mp3", 1.0),
        ("s3a_fitur", "03a_fitur.png", "n3a_fitur.mp3", 0.8),
        ("s3b_fitur", "03b_fitur.png", "n3b_fitur.mp3", 0.8),
        ("s4_arsitektur", "04_arsitektur.png", "n4_arsitektur.mp3", 1.0),
        ("s5_judul_demo", "05_demo.png", "n5_demo_intro.mp3", 0.4),
    ]:
        p, _ = seg_slide(nama, os.path.join(BUILD, slide),
                         os.path.join(BUILD, aud), pad)
        segs.append(p)

    p, _ = seg_demo("s6_demo", None)
    segs.append(p)

    p, _ = seg_slide("s7_kesimpulan", os.path.join(BUILD, "06_kesimpulan.png"),
                     os.path.join(BUILD, "n6_kesimpulan.mp3"), 1.4)
    segs.append(p)

    concat(segs)
