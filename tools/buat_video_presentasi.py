#!/usr/bin/env python3
"""Rakit video presentasi Final Project QAE Sanbercode.

Struktur (sesuai ketentuan tugas):
  1. Pengenalan diri
  2. Judul proyek akhir
  3. Fitur-fitur yang dikerjakan
  4. Demo fitur (rekaman simulasi aplikasi)
  5. Kesimpulan

Output: /opt/data/output/final-project-qae-sanbercode.mp4 (1920x1080, public-ready)
"""
import asyncio
import json
import os
import subprocess

from PIL import Image, ImageDraw, ImageFont

OUT = "/opt/data/output"
BUILD = os.path.join(OUT, "build-video")
W, H = 1920, 1080
FPS = 30

# Palet OrangeHRM
ORANGE = (243, 111, 33)
DARK = (20, 27, 38)
DARKER = (12, 17, 25)
WHITE = (255, 255, 255)
GREY = (168, 178, 194)
GREEN = (34, 197, 94)

FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_M = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

os.makedirs(BUILD, exist_ok=True)


def f(path, size):
    return ImageFont.truetype(path, size)


def base_canvas():
    """Latar gelap dengan aksen oranye."""
    img = Image.new("RGB", (W, H), DARK)
    d = ImageDraw.Draw(img)
    # gradasi halus vertikal
    for y in range(H):
        t = y / H
        c = (int(DARK[0] + (DARKER[0] - DARK[0]) * t),
             int(DARK[1] + (DARKER[1] - DARK[1]) * t),
             int(DARK[2] + (DARKER[2] - DARK[2]) * t))
        d.line([(0, y), (W, y)], fill=c)
    # garis aksen oranye kiri
    d.rectangle([0, 0, 14, H], fill=ORANGE)
    # lingkaran dekoratif kanan atas
    d.ellipse([W - 380, -220, W + 160, 320], outline=(35, 45, 62), width=3)
    d.ellipse([W - 300, -150, W + 90, 260], outline=(30, 39, 54), width=2)
    return img, d


def center_text(d, y, text, font, fill=WHITE):
    w = d.textlength(text, font=font)
    d.text(((W - w) / 2, y), text, font=font, fill=fill)


def wrap(d, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for wd in words:
        test = (cur + " " + wd).strip()
        if d.textlength(test, font=font) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines


def slide_intro(nama):
    """1. Pengenalan diri (dengan foto)."""
    from PIL import ImageDraw as _ID
    img, d = base_canvas()
    d.text((110, 90), "PENGENALAN DIRI", font=f(FONT_B, 34), fill=ORANGE)
    foto = Image.open("/opt/data/cache/images/img_5e6665e61404.jpg").convert("RGB")
    fw, fh = foto.size
    foto = foto.crop((0, int(fh * 0.02), fw, int(fh * 0.02) + fw)).resize((500, 500))
    mask = Image.new("L", (500, 500), 0)
    _ID.Draw(mask).ellipse([0, 0, 499, 499], fill=255)
    d.ellipse([138, 258, 662, 782], outline=ORANGE, width=6)
    img.paste(foto, (150, 270), mask)
    d.text((760, 270), nama, font=f(FONT_B, 70), fill=WHITE)
    d.line([(760, 365), (960, 365)], fill=ORANGE, width=4)
    baris = [
        ("Jabatan", "Head of Platform & Infrastructure Operation"),
        ("Perusahaan", "CP Group"),
        ("Kelas", "Bootcamp Quality Assurance: Kuasai Cara"),
        ("", "Pengujian Software (Batch 81) - Sanbercode"),
    ]
    y = 410
    for k, v in baris:
        d.text((760, y), k, font=f(FONT_B, 28), fill=ORANGE)
        d.text((990, y), v, font=f(FONT_R, 28), fill=WHITE)
        y += 56
    return img


def slide_judul():
    """2. Judul proyek akhir."""
    img, d = base_canvas()
    center_text(d, 130, "JUDUL PROYEK AKHIR", f(FONT_B, 30), ORANGE)
    center_text(d, 215, "Final Project", f(FONT_B, 54), (255, 190, 140))
    lines = wrap(d, "Automasi pada fitur Login, menu Directory, dan menu Recruitment "
                    "pada website OrangeHRM demo menggunakan POM",
                 f(FONT_B, 58), W - 360)
    y = 310
    for ln in lines:
        center_text(d, y, ln, f(FONT_B, 58))
        y += 78
    d.line([(W / 2 - 120, y + 30), (W / 2 + 120, y + 30)], fill=ORANGE, width=4)
    kotak = ["Login", "Directory", "Recruitment"]
    bw, gap = 380, 50
    x = (W - (len(kotak) * bw + (len(kotak) - 1) * gap)) / 2
    for nama in kotak:
        d.rounded_rectangle([x, 700, x + bw, 820], radius=16,
                            fill=(28, 37, 51), outline=ORANGE, width=2)
        tw = d.textlength(nama, font=f(FONT_B, 40))
        d.text((x + (bw - tw) / 2, 742), nama, font=f(FONT_B, 40), fill=WHITE)
        x += bw + gap
    center_text(d, 880, "3 fitur x 8 test case = 24 test case", f(FONT_R, 28), GREY)
    return img


def slide_fitur(bagian=1):
    """3. Fitur yang dikerjakan: Login, Directory, Recruitment x 8 test case."""
    img, d = base_canvas()
    d.text((110, 80), "FITUR YANG DIKERJAKAN", font=f(FONT_B, 34), fill=ORANGE)
    d.text((110, 135), "Automasi fitur Login, menu Directory, dan menu Recruitment",
           font=f(FONT_B, 32), fill=WHITE)
    d.text((110, 185), "OrangeHRM demo  ·  format POM (action, assertion, data, dan intercept)",
           font=f(FONT_R, 26), fill=GREY)
    items = [
        ("01", "Login", "TC-LGN-001 s/d 008 — login valid/invalid, field kosong, stub gagal, i18n"),
        ("02", "Directory", "TC-DIR-001 s/d 008 — kartu karyawan, filter, autocomplete, reset, stub"),
        ("03", "Recruitment", "TC-REC-001 s/d 008 — kandidat, vacancy, pencarian, Add Candidate"),
    ]
    y = 260
    for no, judul, ket in items:
        d.rounded_rectangle([110, y, W - 110, y + 150], radius=14,
                            fill=(26, 34, 47), outline=(44, 56, 74), width=2)
        d.text((150, y + 36), no, font=f(FONT_B, 46), fill=ORANGE)
        d.text((250, y + 24), judul, font=f(FONT_B, 40), fill=WHITE)
        d.text((250, y + 86), ket, font=f(FONT_R, 24), fill=GREY)
        d.rounded_rectangle([W - 480, y + 44, W - 150, y + 106], radius=30,
                            fill=(22, 48, 34), outline=GREEN, width=2)
        d.text((W - 460, y + 56), "8 test case · 8/8", font=f(FONT_B, 28), fill=GREEN)
        y += 175
    d.rounded_rectangle([110, 800, W - 110, 900], radius=14,
                        fill=(24, 32, 45), outline=ORANGE, width=2)
    d.text((160, 827), "TOTAL  3 fitur × 8 test case = 24 test case, seluruhnya passed",
           font=f(FONT_B, 34), fill=WHITE)
    return img

def slide_arsitektur():
    """3b. Arsitektur POM (kerapihan script)."""
    img, d = base_canvas()
    d.text((110, 90), "STRUKTUR PROJECT — 3 LAPISAN POM", font=f(FONT_B, 34), fill=ORANGE)
    d.text((110, 150), "Penilaian: kelengkapan dan kerapihan script (action, assertion, intercept, data)",
           font=f(FONT_R, 24), fill=GREY)

    kolom = [
        ("PAGE OBJECT", "cypress/pages/", ["LoginPage.js", "DashboardPage.js",
                                           "DirectoryPage.js", "RecruitmentPage.js"], "action"),
        ("TEST DATA", "cypress/support/data/", ["loginData.js", "directoryData.js",
                                                "recruitmentData.js", "categoryData.js"], "data"),
        ("INTERCEPT", "cypress/support/intercepts/", ["LoginIntercepts.js",
                                                      "DirectoryIntercepts.js",
                                                      "RecruitmentIntercepts.js"], "intercept"),
        ("TEST CASE", "cypress/e2e/pom3/", ["login.cy.js", "directory.cy.js",
                                            "recruitment.cy.js"], "assertion"),
    ]
    bw, gap = 400, 34
    total = len(kolom) * bw + (len(kolom) - 1) * gap
    x = (W - total) / 2
    for judul, folder, files, peran in kolom:
        d.rounded_rectangle([x, 230, x + bw, 800], radius=16,
                            fill=(26, 34, 47), outline=(48, 62, 82), width=2)
        # header
        d.rounded_rectangle([x, 230, x + bw, 310], radius=16, fill=(34, 45, 61))
        tw = d.textlength(judul, font=f(FONT_B, 28))
        d.text((x + (bw - tw) / 2, 258), judul, font=f(FONT_B, 28), fill=ORANGE)
        fw = d.textlength(folder, font=f(FONT_M, 19))
        d.text((x + (bw - fw) / 2, 330), folder, font=f(FONT_M, 19), fill=GREY)
        yy = 380
        for fl in files:
            d.text((x + 34, yy), "•  " + fl, font=f(FONT_R, 22), fill=WHITE)
            yy += 46
        # label peran
        pw = d.textlength(peran, font=f(FONT_B, 22))
        d.rounded_rectangle([x + (bw - pw) / 2 - 20, 720, x + (bw + pw) / 2 + 20, 772],
                            radius=24, fill=(40, 30, 20), outline=ORANGE, width=2)
        d.text((x + (bw - pw) / 2, 732), peran, font=f(FONT_B, 22), fill=(255, 190, 140))
        x += bw + gap

    center_text(d, 850, "Test case bersih: satu test = satu it block, pola Intercept -> Action -> Assertion",
                f(FONT_R, 26), GREY)
    return img


def slide_demo_judul():
    """4. Judul bagian demo."""
    img, d = base_canvas()
    center_text(d, 330, "DEMO FITUR", f(FONT_B, 44), ORANGE)
    center_text(d, 400, "Simulasi Aplikasi OrangeHRM", f(FONT_B, 68))
    d.line([(W / 2 - 110, 520), (W / 2 + 110, 520)], fill=ORANGE, width=4)

    langkah = ["Login", "Dashboard", "Directory", "Recruitment", "Add Candidate"]
    bw = 300
    total = len(langkah) * bw
    x = (W - total) / 2
    for i, s in enumerate(langkah):
        tw = d.textlength(s, font=f(FONT_R, 24))
        d.text((x + (bw - tw) / 2, 600), s, font=f(FONT_R, 24), fill=GREY)
        if i < len(langkah) - 1:
            d.text((x + bw - 18, 600), "→", font=f(FONT_R, 24), fill=ORANGE)
        x += bw
    center_text(d, 740, "Dijalankan otomatis dengan Cypress (mode headed)",
                f(FONT_R, 26), GREY)
    return img


def slide_kesimpulan():
    """5. Kesimpulan."""
    img, d = base_canvas()
    d.text((110, 90), "KESIMPULAN", font=f(FONT_B, 38), fill=ORANGE)

    poin = [
        ("Seluruh test case lulus", "24 test case (Login, Directory, Recruitment) lulus semua"),
        ("Satu framework untuk tiga jenis pengujian", "UI automation, network interception, dan API testing"),
        ("Script rapi dan mudah dirawat", "Pemisahan action, data, assertion, dan intercept"),
        ("Assertion berbasis perilaku nyata", "Divalidasi langsung dari respons API aplikasi, bukan asumsi"),
    ]
    y = 190
    for judul, ket in poin:
        d.rounded_rectangle([110, y, W - 110, y + 118], radius=14,
                            fill=(26, 34, 47), outline=(44, 56, 74), width=2)
        d.ellipse([150, y + 42, 186, y + 78], fill=GREEN)
        d.text((158, y + 46), "✓", font=f(FONT_B, 22), fill=(10, 30, 18))
        d.text((215, y + 22), judul, font=f(FONT_B, 32), fill=WHITE)
        d.text((215, y + 68), ket, font=f(FONT_R, 23), fill=GREY)
        y += 138

    # angka besar
    d.rounded_rectangle([110, 760, W - 110, 920], radius=16,
                        fill=(24, 32, 45), outline=ORANGE, width=2)
    stats = [("24", "Total test case"), ("3", "Fitur"), ("100%", "Passed")]
    x = 260
    for angka, label in stats:
        aw = d.textlength(angka, font=f(FONT_B, 64))
        d.text((x, 795), angka, font=f(FONT_B, 64), fill=ORANGE)
        lw = d.textlength(label, font=f(FONT_R, 24))
        d.text((x + (aw - lw) / 2, 872), label, font=f(FONT_R, 24), fill=GREY)
        x += 560

    center_text(d, 950, "Terima kasih", f(FONT_B, 42), WHITE)
    center_text(d, 1010, "Beni Santoso — Bootcamp Digital Skill Sanbercode",
                f(FONT_R, 24), GREY)
    return img


SLIDES = {
    "01_intro": ("slide_intro", True),
    "02_judul": ("slide_judul", False),
    "03a_fitur": ("slide_fitur1", False),
    "04_arsitektur": ("slide_arsitektur", False),
    "05_demo": ("slide_demo_judul", False),
    "06_kesimpulan": ("slide_kesimpulan", False),
}

if __name__ == "__main__":
    builders = {
        "slide_intro": lambda: slide_intro("Beni Santoso"),
        "slide_judul": slide_judul,
        "slide_fitur1": lambda: slide_fitur(1),
        "slide_arsitektur": slide_arsitektur,
        "slide_demo_judul": slide_demo_judul,
        "slide_kesimpulan": slide_kesimpulan,
    }
    for name, (fn, _) in SLIDES.items():
        p = os.path.join(BUILD, name + ".png")
        builders[fn]().save(p, "PNG")
        print("slide:", p, os.path.getsize(p))
