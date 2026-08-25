import os
import sys
from pathlib import Path

# Load environment variables from .env if python-dotenv is installed
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Retrieve API Key
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if not ELEVENLABS_API_KEY:
    print("❌ Error: ELEVENLABS_API_KEY is not set.")
    print("Please set it in your .env file or export it in your terminal:")
    print("  export ELEVENLABS_API_KEY='your_api_key_here'")
    sys.exit(1)

try:
    from elevenlabs.client import ElevenLabs
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
except ImportError:
    print("❌ Error: elevenlabs package is not installed.")
    print("Install it with: pip install elevenlabs python-dotenv")
    sys.exit(1)

# The 6 CPR audio phrases
PHRASES = {
    "en": {
        "begin_cpr": "Begin C P R.",
        "push_faster": "Push faster.",
        "slow_down": "Slow down.",
        "good_pace": "Good pace, keep it up.",
        "lock_elbows": "Lock your elbows.",
        "session_complete": "Stop CPR. Session complete.",
    },
    "ro": {
        "begin_cpr": "Începeți resuscitarea.",
        "push_faster": "Apăsați mai repede.",
        "slow_down": "Încetiniți ritmul.",
        "good_pace": "Ritm bun, continuați așa.",
        "lock_elbows": "Țineți brațele drepte.",
        "session_complete": "Opriți resuscitarea. Sesiune finalizată.",
    },
}

# Voice IDs: Use free premade voices that work with ElevenLabs free plan:
# - "EXAVITQu4vr4xnSDxMaL" (Sarah - Clear, Reassuring, Professional)
# - "Xb7hH8MSUJpSbSDYk0k2" (Alice - Clear, Engaging Educator)
# - "onwK4e9ZLuTAKqWW03F9" (Daniel - Steady Broadcaster)
# - "nPczCjzI2devNBz1zQrb" (Brian - Deep, Resonant)
DEFAULT_FREE_VOICE = "EXAVITQu4vr4xnSDxMaL"  # Sarah

VOICE_IDS = {
    "en": os.getenv("ELEVENLABS_VOICE_ID_EN", DEFAULT_FREE_VOICE),
    "ro": os.getenv("ELEVENLABS_VOICE_ID_RO", DEFAULT_FREE_VOICE),
}

# Output directory inside public folder for instant web access
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "public" / "audio"

def generate_voices():
    total_generated = 0

    for lang, entries in PHRASES.items():
        lang_dir = OUTPUT_DIR / lang
        lang_dir.mkdir(parents=True, exist_ok=True)
        voice_id = VOICE_IDS.get(lang, "21m00Tcm4TlvDq8ikWAM")

        print(f"\n🎙️ Generating {lang.upper()} voiceovers (Voice ID: {voice_id})...")

        for key, text in entries.items():
            file_path = lang_dir / f"{key}.mp3"
            print(f"  → Generating '{key}': \"{text}\"...")

            try:
                audio_stream = client.text_to_speech.convert(
                    voice_id=voice_id,
                    text=text,
                    model_id="eleven_multilingual_v2",
                    output_format="mp3_44100_128",
                )

                with open(file_path, "wb") as f:
                    for chunk in audio_stream:
                        if chunk:
                            f.write(chunk)

                print(f"    ✅ Saved to {file_path.relative_to(BASE_DIR)}")
                total_generated += 1
            except Exception as e:
                print(f"    ❌ Failed to generate '{key}': {e}")

    print(f"\n🎉 Done! Successfully generated {total_generated}/12 audio files in public/audio/")

if __name__ == "__main__":
    generate_voices()