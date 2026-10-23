"""Genera il whitepaper PDF (2 pagine A4) dalla landing
"Protesi medicali su misura: il potenziale della stampa FFF inclinata a 30°".
Uso: python3 build.py  ->  whitepaper-protesi-medicali-fff-30.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader, simpleSplit

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "whitepaper-protesi-medicali-fff-30.pdf")
W, H = A4
M = 42  # margine laterale

for name, w in (("P", 400), ("PM", 500), ("PS", 600), ("PB", 700)):
    pdfmetrics.registerFont(TTFont(name, os.path.join(HERE, "fonts", f"Poppins-{w}.ttf")))

INK = HexColor("#0F1214")
BODY = HexColor("#2F3336")
TEAL = HexColor("#0E9F7E")
MINT_BG = HexColor("#D9EFE8")
MINT_SOFT = HexColor("#EEF6F3")
PAPER = HexColor("#F7F7F4")
LINE = HexColor("#D9DCDF")

socket = ImageReader(os.path.join(HERE, "socket.png"))
logo = ImageReader(os.path.join(HERE, "logo-layerloop.png"))

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("Protesi medicali su misura: il potenziale della stampa FFF inclinata a 30°")
c.setAuthor("Layerloop 3D")
c.setSubject("Whitepaper - Socket transtibiale, un esempio di produzione customizzata")


def header(page_bg):
    c.setFillColor(page_bg)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("PB", 6.5)
    c.drawString(M, H - 38, "LAYERLOOP 3D")
    c.setFont("P", 6.5)
    c.drawRightString(W - M, H - 38, "WHITEPAPER")
    c.setStrokeColor(INK)
    c.setLineWidth(1.6)
    c.line(M, H - 54, W - M, H - 54)


def footer(num=None):
    lw = 62
    lh = lw * 100 / 401
    c.drawImage(logo, (W - lw) / 2, 26, lw, lh, mask="auto")
    if num:
        c.setFillColor(HexColor("#B8BEC2"))
        c.setFont("PB", 6.5)
        c.drawString(M, 30, num)


def para(text, x, y, width, font="P", size=9.5, lead=15, color=BODY):
    c.setFillColor(color)
    c.setFont(font, size)
    for line in simpleSplit(text, font, size, width):
        c.drawString(x, y, line)
        y -= lead
    return y


def label(text, x, y, size=7.5):
    c.setFillColor(TEAL)
    c.setFont("PB", size)
    c.drawString(x, y, text)


def draw_socket(cx, cy, box_w, box_h):
    iw, ih = socket.getSize()
    s = min(box_w / iw, box_h / ih)
    w, h = iw * s, ih * s
    c.drawImage(socket, cx - w / 2, cy - h / 2, w, h, mask="auto")


# ---------------------------------------------------------------- COPERTINA
header(PAPER)
c.setFillColor(INK)
c.setFont("PB", 30)
y = H - 130
for line in ["Protesi medicali su misura:", "il potenziale della stampa", "FFF inclinata a 30°"]:
    c.drawString(M, y, line)
    y -= 38
c.setFillColor(BODY)
c.setFont("P", 11)
c.drawString(M, y - 8, "Socket transtibiale – un esempio di produzione customizzata")
draw_socket(W / 2, 330, 400, 360)
footer()
c.showPage()

# ---------------------------------------------------------------- PAGINA 2
header(HexColor("#FFFFFF"))
left_w = 262
x2 = M + left_w + 40  # colonna destra
right_w = W - M - x2

y = H - 100
label("IL PROBLEMA", M, y)
y = para("L'azienda identifica come criticità l'elevato ricorso ai supporti con le stampanti 3D "
         "cartesiane. Rispetto alla tecnologia tradizionale, l'asse inclinato consente di ridurre "
         "la necessità di supporti nelle geometrie del socket, con benefici concreti in termini di "
         "materiale utilizzato, tempi di stampa e costi di produzione.",
         M, y - 18, left_w, size=9.2, lead=14.4)

y -= 14
label("IL LIMITE DELLE TECNOLOGIE TRADIZIONALI", M, y)
y = para("La realizzazione tradizionale mediante calco in gesso comporta molteplici passaggi manuali. "
         "Anche nella stampa 3D cartesiana convenzionale, le geometrie complesse richiedono numerosi "
         "supporti che consumano materiale e aumentano i tempi.",
         M, y - 18, left_w, size=9.2, lead=14.4)

# riquadro soluzione
box_top = y - 22
box_bot = 215
c.setFillColor(MINT_BG)
c.rect(M, box_bot, left_w, box_top - box_bot, stroke=0, fill=1)
bx = M + 20
bw = left_w - 40
by = box_top - 28
label("LA SOLUZIONE LAYERLOOP", bx, by)
by = para("Layerloop offre una tecnologia che prevede:", bx, by - 20, bw, size=9.2, lead=14.4)
by -= 4
items = ["Stampa diretta da file STL personalizzato",
         "Utilizzo di LAYPETG come materiale",
         "L'asse di stampa inclinato a 30° riduce la necessità di supporti",
         "Nastro trasportatore per sequenza di produzione continua h24"]
for it in items:
    c.setFillColor(TEAL)
    c.circle(bx + 3, by + 3, 1.8, stroke=0, fill=1)
    by = para(it, bx + 14, by, bw - 14, size=9.2, lead=14.4) - 3.5
by -= 8
by = para("Con l'asse inclinato il pezzo non richiede supporti massicci: meno materiale, meno tempo "
          "macchina, meno lavorazioni manuali, anche in orario notturno.",
          bx, by, bw, size=9.2, lead=14.4)
# CTA
bt_h = 30
bt_y = box_bot + 22
c.setFillColor(TEAL)
c.roundRect(bx, bt_y, 150, bt_h, bt_h / 2, stroke=0, fill=1)
c.setFillColor(HexColor("#FFFFFF"))
c.setFont("PS", 9)
c.drawCentredString(bx + 75, bt_y + 11, "Richiedi una consulenza")
c.linkURL("https://www.layerloop3d.com/", (bx, bt_y, bx + 150, bt_y + bt_h), relative=0)

# colonna destra: immagine
draw_socket(x2 + right_w / 2, H - 205, right_w - 20, 190)

# specifiche
ry = 505
c.setStrokeColor(LINE)
c.setLineWidth(0.8)
c.line(x2, ry + 14, x2 + right_w, ry + 14)
specs = [("TEMPO DI STAMPA", "~ 9 h"), ("PESO PEZZO", "~ 300 gr"), ("COSTO AL PEZZO", "~ € 14,00")]
for lab, val in specs:
    c.setFillColor(TEAL)
    c.setFont("P", 7.2)
    c.drawString(x2, ry - 4, lab)
    c.setFillColor(INK)
    c.setFont("PM", 12)
    c.drawString(x2, ry - 20, val)
    ry -= 44

# materiale
ry -= 14
card_h = 86
c.setFillColor(MINT_SOFT)
c.roundRect(x2, ry - card_h + 18, right_w, card_h, 4, stroke=0, fill=1)
label("MATERIALE", x2 + 14, ry)
c.setFillColor(INK)
c.setFont("PB", 14)
c.drawString(x2 + 14, ry - 20, "LAYPETG")
para("Rigidità e resistenza agli urti per socket protesici.", x2 + 14, ry - 36,
     right_w - 28, size=7.8, lead=11.5)

# vantaggi
ry -= card_h + 24
c.setStrokeColor(LINE)
c.line(x2, ry + 12, x2 + right_w, ry + 12)
c.setFillColor(TEAL)
c.setFont("P", 7.8)
c.drawString(x2, ry - 4, "VANTAGGI COMPETITIVI")
ry -= 24
for it in ["Zero stampi necessari",
           "Scansione con tecnologia LASER",
           "Produzione personalizzata in sequenza",
           "Riduzione delle lavorazioni manuali",
           "Continuità produttiva anche in orario notturno"]:
    c.setFillColor(TEAL)
    c.circle(x2 + 3, ry + 3, 1.8, stroke=0, fill=1)
    ry = para(it, x2 + 14, ry, right_w - 14, size=9, lead=13) - 5

footer("02")
c.showPage()
c.save()
print("scritto", OUT)
