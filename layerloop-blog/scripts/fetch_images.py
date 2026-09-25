"""Scarica le immagini generate su Higgsfield nei file indicati dal calendario.
Uso: python fetch_images.py N=URL [N=URL ...]"""
import io, json, pathlib, re, subprocess, sys
from PIL import Image
base = pathlib.Path(__file__).resolve().parent.parent
cal = json.loads((base/"calendario-editoriale.json").read_text())
for arg in sys.argv[1:]:
    n, url = arg.split("=", 1); a = cal[int(n)-1]
    data = subprocess.run(["curl", "-sS", "-m", "60", url], capture_output=True, check=True).stdout
    im = Image.open(io.BytesIO(data)).convert("RGB"); im.thumbnail((1600, 1600))
    im.save(base/a["immagine"]["file"], quality=82, optimize=True)
    a["immagine"]["job_id"] = re.search(r"_([0-9a-f-]{36})\.", url).group(1)
    a["immagine"]["url_higgsfield"] = url
    print("ok", n)
(base/"calendario-editoriale.json").write_text(json.dumps(cal, ensure_ascii=False, indent=2)+"\n")
