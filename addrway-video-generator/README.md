# Addrway Video Generator (Open Source)

Create local TikTok/Reels/Shorts promo videos for Addrway using Python + FFmpeg + MoviePy + local TTS.

## Features
- 1080x1920 vertical output
- 20–35 second ad flow (scene-based)
- Voiceover generation (Piper preferred, `pyttsx3` fallback)
- Animated-style SaaS scene rendering (no GPU required)
- Optional background music
- Easy script customization in `config.json`

## Project structure

```
addrway-video-generator/
  README.md
  requirements.txt
  config.json
  scripts/
    generate_video.py
    generate_voiceover.py
    render_scenes.py
    build_final_video.py
  assets/
    music/
    screenshots/
    brand/
  output/
  prompts/
    scene_prompts.md
    tiktok_scripts.md
```

## 1) Install dependencies

```bash
cd addrway-video-generator
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Install FFmpeg

### Ubuntu/Debian
```bash
sudo apt-get update && sudo apt-get install -y ffmpeg
```

### macOS (Homebrew)
```bash
brew install ffmpeg
```

### Windows
Install FFmpeg from the official site and add it to PATH.

## 3) Install Piper TTS (optional but recommended)

If Piper is installed and model exists, scripts use it automatically.
Otherwise they fallback to `pyttsx3`.

Example (Linux):
```bash
# install piper binary by following official Piper repo instructions
# then place model at:
mkdir -p models
# models/en_US-lessac-medium.onnx
```

Then keep these config values:
- `audio.piper_executable`: `piper`
- `audio.piper_model`: `models/en_US-lessac-medium.onnx`

## 4) Add media assets (optional)
- Background music: `assets/music/background.mp3`
- Brand logos/screenshots: place files in `assets/brand/` and `assets/screenshots/`

## 5) Run video generation

```bash
python scripts/generate_video.py
```

Output file:

```text
output/addrway_tiktok_01.mp4
```

## How to swap in real Addrway screenshots
1. Add PNG/JPG screenshots to `assets/screenshots/`.
2. Update `scripts/render_scenes.py` to paste screenshot blocks into scene canvases.
3. Keep captions and voiceover in `config.json` for quick creative iteration.

## How to add more TikTok scripts
1. Copy/rename `output` target in `config.json`.
2. Add new scene entries under `scenes` (text, voiceover, duration, visual).
3. Re-run `python scripts/generate_video.py`.

## Notes on AI video models
If you have a GPU and open-source models installed (Wan 2.1, etc.), you can replace fallback static scenes with generated clips before final assembly. The current pipeline is intentionally CPU-safe and local-first.
