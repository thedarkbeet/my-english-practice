"""Read-only XLSX import using Python's standard library. Run: python3 scripts/import_course.py."""
import hashlib
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

def clean(value):
    return re.sub(r"\n{3,}", "\n\n", "\n".join(re.sub(r"[^\S\n]+", " ", line).strip() for line in str(value or "").splitlines())).strip()

def read_book(path):
    with zipfile.ZipFile(path) as z:
        strings = ["".join(si.itertext()) for si in ET.fromstring(z.read("xl/sharedStrings.xml"))] if "xl/sharedStrings.xml" in z.namelist() else []
        rels = {r.attrib["Id"]: r.attrib["Target"] for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))}
        result = {}
        for sheet in ET.fromstring(z.read("xl/workbook.xml")).findall("s:sheets/s:sheet", NS):
            target = rels[sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]]
            target = target.lstrip("/") if target.startswith("/") else "xl/" + target
            cells = {}
            for c in ET.fromstring(z.read(target)).findall(".//s:sheetData/s:row/s:c", NS):
                if c.find("s:f", NS) is not None:
                    continue
                v = c.find("s:v", NS)
                value = v.text if v is not None else "" 
                if c.attrib.get("t") == "s":
                    value = strings[int(value)]
                elif c.attrib.get("t") == "inlineStr":
                    value = "".join(c.find("s:is", NS).itertext())
                if clean(value):
                    cells[c.attrib["r"]] = clean(value)
            result[sheet.attrib["name"]] = cells
        return result

def column(n):
    text = ""
    while n:
        n, r = divmod(n - 1, 26)
        text = chr(65 + r) + text
    return text

def main():
    book = read_book(ROOT / "HomeWork_spreadsheet.xlsx")
    source = book["Ответы"]
    lessons, archive, issues = [], {}, []
    missing = {"C72", "X85"}
    for n in range(1, 32):
        # Bind to the actual identifier, not the inconsistent first row.
        col = next(c for c in range(3, 94, 3) if source.get(f"{column(c)}3", "").lower() == f"homework_{n}")
        sheet = book[f"h_{n}"]
        blocks, notes = [], []
        for cell, text in sheet.items():
            if cell[0] in "BCF" and int(cell[1:]) in (4, 34, 65, 96):
                notes.append({"text": text, "source": f"h_{n}!{cell}", "beforeRow": max(4, int(cell[1:]) - 1)})
        # Header notes on the source can differ from notes on the worksheet.
        header = source.get(f"{column(col+1)}3", "")
        if header and all(header != note["text"] for note in notes):
            notes.insert(0, {"text": header, "source": f"Ответы!{column(col+1)}3", "beforeRow": 4})
        for r in range(4, 133):
            cell = f"{column(col)}{r}"
            prompt = source.get(cell)
            if not prompt:
                continue
            answer = source.get(f"{column(col+1)}{r}")
            kind = "exercise" if answer or cell in missing else "heading"
            fingerprint = hashlib.sha256(f"{n}|{cell}|{prompt}".encode()).hexdigest()[:12]
            blocks.append({"id": f"hw{n}-{fingerprint}", "kind": kind, "prompt": prompt, "answer": answer, "source": f"Ответы!{cell}", "row": r})
            if cell in missing:
                issues.append({"source": f"Ответы!{cell}", "issue": "missing-answer"})
        status = "empty" if not blocks else "placeholder" if n >= 23 else "available"
        archive[str(n)] = {"prefilled": {c: v for c, v in sheet.items() if c.startswith("C") and int(c[1:]) >= 5 and not any(note["source"] == f"h_{n}!{c}" for note in notes)}, "placeholderBlocks": blocks if status == "placeholder" else []}
        lessons.append({"id": n, "status": status, "notes": notes, "blocks": blocks if status == "available" else [], "sourceRows": len(blocks)})
    theory = []
    for r in range(2, 40):
        s = book["ТЕОРИЯ"]
        if s.get(f"B{r}"):
            theory.append({"term": s[f"B{r}"], "entries": []})
        if theory and (s.get(f"C{r}") or s.get(f"D{r}")):
            theory[-1]["entries"].append({"meaning": s.get(f"C{r}", ""), "example": s.get(f"D{r}", "")})
    data = {"version": 1, "rules": [book["ПРАВИЛА КУРСА"][f"C{r}"] for r in range(2, 6) if f"C{r}" in book["ПРАВИЛА КУРСА"]], "theory": theory, "lessons": lessons, "issues": issues}
    (ROOT / "data/course.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    (ROOT / "data/import-archive.json").write_text(json.dumps(archive, ensure_ascii=False, indent=2) + "\n")
    print(f"Imported {len(lessons)} lessons, {sum(b['kind'] == 'exercise' for l in lessons for b in l['blocks'])} exercises; {len(issues)} missing answers.")

if __name__ == "__main__":
    main()
