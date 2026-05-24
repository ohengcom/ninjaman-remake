import urllib.request
import os

# URLs of verified audio assets from phaserjs/examples CDN
ASSETS = {
    # BGM files (placed in public/assets/audio/)
    "bgm_level1.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3",
    "bgm_level2.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/jungle.mp3",
    "bgm_level3.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/tommy_in_goa.mp3",
    
    # Sound Effects (placed in public/assets/audio/SoundEffects/)
    "SoundEffects/jump.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/steps1.mp3",
    "SoundEffects/dash.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/lazer_wall_off.mp3",
    "SoundEffects/swing.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/sword.mp3",
    "SoundEffects/hit.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/squit.mp3",
    "SoundEffects/parry.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/p-ping.mp3",
    "SoundEffects/damage.wav": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/boss_hit.wav",
    "SoundEffects/hadouken.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/blaster.mp3",
    "SoundEffects/shoot.wav": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/lazer.wav",
    "SoundEffects/menu_blip.mp3": "https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/audio/SoundEffects/menu_select.mp3"
}

dest_dir = "public/assets/audio"

def download_file(filename, url):
    full_path = os.path.join(dest_dir, filename)
    dir_name = os.path.dirname(full_path)
    if not os.path.exists(dir_name):
        os.makedirs(dir_name)
        
    print(f"Downloading {filename} from {url}...")
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response:
            with open(full_path, 'wb') as f:
                f.write(response.read())
        print(f"Successfully saved {filename}!")
    except Exception as e:
        print(f"Error downloading {filename}: {str(e)}")

for filename, url in ASSETS.items():
    download_file(filename, url)

print("Audio assets download complete!")
