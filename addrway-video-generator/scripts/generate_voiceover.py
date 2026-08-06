"""Generate scene voiceovers using Piper (preferred) or pyttsx3 fallback."""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pyttsx3

ROOT = Path(__file__).resolve().parents[1]


def load_config():
    return json.loads((ROOT / "config.json").read_text())


def _generate_with_piper(text: str, output: Path, exe: str, model: str) -> bool:
    if not shutil.which(exe) or not Path(model).exists():
        return False
    cmd = [exe, "--model", model, "--output_file", str(output)]
    subprocess.run(cmd, input=text.encode("utf-8"), check=True)
    return True


def _generate_with_pyttsx3(text: str, output: Path):
    engine = pyttsx3.init()
    engine.setProperty("rate", 165)
    engine.save_to_file(text, str(output))
    engine.runAndWait()


def generate_voiceovers():
    config = load_config()
    audio_dir = ROOT / "output" / "voice"
    audio_dir.mkdir(parents=True, exist_ok=True)

    exe = config["audio"]["piper_executable"]
    model = str(ROOT / config["audio"]["piper_model"])

    for scene in config["scenes"]:
        out = audio_dir / f"scene_{scene['id']:02d}.wav"
        text = scene["voiceover"]
        ok = False
        try:
            ok = _generate_with_piper(text, out, exe, model)
        except Exception:
            ok = False
        if not ok:
            _generate_with_pyttsx3(text, out)
        print(f"Generated {out.name}")


if __name__ == "__main__":
    generate_voiceovers()
