"""Assemble rendered scenes + voiceover + optional music into final TikTok video."""
from __future__ import annotations

import json
from pathlib import Path

from moviepy.editor import (
    AudioFileClip,
    CompositeAudioClip,
    CompositeVideoClip,
    ImageClip,
    concatenate_videoclips,
)

ROOT = Path(__file__).resolve().parents[1]


def load_config():
    return json.loads((ROOT / "config.json").read_text())


def build_video():
    cfg = load_config()
    w, h = cfg["project"]["width"], cfg["project"]["height"]
    fps = cfg["project"]["fps"]

    clips = []
    voice_tracks = []
    timeline = 0.0

    for scene in cfg["scenes"]:
        scene_img = ROOT / "output" / "scenes" / f"scene_{scene['id']:02d}.png"
        voice = ROOT / "output" / "voice" / f"scene_{scene['id']:02d}.wav"

        audio_clip = AudioFileClip(str(voice))
        dur = max(scene["duration"], audio_clip.duration + 0.15)
        base = ImageClip(str(scene_img)).set_duration(dur)

        comp = CompositeVideoClip([base], size=(w, h)).crossfadein(0.25)
        clips.append(comp)
        voice_tracks.append(audio_clip.set_start(timeline))
        timeline += dur

    final_video = concatenate_videoclips(clips, method="compose")

    music_path = ROOT / cfg["audio"]["background_music"]
    tracks = voice_tracks
    if music_path.exists():
        music = AudioFileClip(str(music_path)).volumex(cfg["audio"]["music_volume"]).audio_loop(duration=final_video.duration)
        tracks = [music] + voice_tracks

    final_audio = CompositeAudioClip(tracks).volumex(cfg["audio"]["voice_volume"])
    final_video = final_video.set_audio(final_audio)

    out_path = ROOT / cfg["project"]["output_file"]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    final_video.write_videofile(str(out_path), fps=fps, codec="libx264", audio_codec="aac")


if __name__ == "__main__":
    build_video()
