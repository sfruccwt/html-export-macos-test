"""Check synthetic output and emit it in logs for local visual inspection."""
import base64
import json
import platform
import sys
from pathlib import Path

from PIL import Image, __version__ as pillow_version

directory = Path(sys.argv[1])
results = []
for variant, formats in [("both", ["png", "jpg"]), ("png-only", ["png"]),
                         ("jpg-only", ["jpg"])]:
    folder = directory / variant
    receipt = json.loads((folder / "demo-export-receipt.json").read_text())
    assert receipt["status"] == "completed", receipt
    assert receipt["formats"] == formats, receipt["formats"]
    assert receipt["resourceFailures"] == [], receipt["resourceFailures"]
    assert receipt["selector"] == "#poster" and receipt["scale"] == 2
    expected_files = {f"demo.{fmt}" for fmt in formats} | {"demo-export-receipt.json"}
    assert {p.name for p in folder.iterdir()} == expected_files, list(folder.iterdir())
    for fmt in formats:
        filename = folder / f"demo.{fmt}"
        with Image.open(filename) as image:
            image.load()
            assert image.format == {"png": "PNG", "jpg": "JPEG"}[fmt], image.format
            assert image.size == (1280, 2400), image.size
            rgba = image.convert("RGBA")
            points = [(0, 0), (1279, 0), (0, 2399), (1279, 2399)]
            corners = [rgba.getpixel(point) for point in points]
            if fmt == "png":
                assert all(pixel[3] == 0 for pixel in corners), corners
            else:
                assert all(pixel == (255, 255, 255, 255) for pixel in corners), corners
            results.append({"variant": variant, "format": image.format,
                            "pixels": image.size, "bytes": filename.stat().st_size,
                            "cornersRGBA": corners})

report = {"status": "passed_image_file_checks", "os": platform.system(),
          "macOSVersion": platform.mac_ver()[0], "architecture": platform.machine(),
          "pillowVersion": pillow_version, "files": results,
          "visualInspection": "pending local inspection", "workbuddyMacTested": False}
report_path = directory / "verification.json"
report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(report_path.read_text())

# Job logs do not count towards artifact storage. These are synthetic test files.
for filename in [directory / "both/demo.png", directory / "both/demo.jpg",
                 directory / "both/demo-export-receipt.json", report_path]:
    print(f"HTML_EXPORT_FILE_BEGIN {filename.name}")
    encoded = base64.b64encode(filename.read_bytes()).decode("ascii")
    for start in range(0, len(encoded), 4096):
        print("HTML_EXPORT_DATA " + encoded[start:start + 4096])
    print(f"HTML_EXPORT_FILE_END {filename.name}")
