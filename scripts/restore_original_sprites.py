import os
import shutil

# Original high-quality 6-frame spritesheets from backup artifacts
BACKUPS = {
    "enemy_guard.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_guard_spritesheet_1779596392589.png",
    "enemy_axe.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_axe_spritesheet_1779596417883.png",
    "enemy_ninja.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_ninja_spritesheet_1779596428338.png",
    "enemy_sniper.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_sniper_spritesheet_1779596442146.png",
    "boss_oni.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\boss_spritesheet_1779596466409.png"
}

dest_dir = r"public/assets/sprites"

def restore_sprite(name, backup_path):
    dest_path = os.path.join(dest_dir, name)
    if os.path.exists(backup_path):
        print(f"Restoring {name} from {backup_path}...")
        shutil.copy(backup_path, dest_path)
        print(f"Successfully restored {name}!")
    else:
        print(f"Backup not found for {name}: {backup_path}")

for name, backup in BACKUPS.items():
    restore_sprite(name, backup)

print("Original 6-frame spritesheets restored successfully!")
