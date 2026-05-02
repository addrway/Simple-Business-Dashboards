"""Entrypoint script for generating the Addrway TikTok video."""
from render_scenes import render_scene_images
from generate_voiceover import generate_voiceovers
from build_final_video import build_video


if __name__ == "__main__":
    render_scene_images()
    generate_voiceovers()
    build_video()
    print("Done. Video created in output/addrway_tiktok_01.mp4")
