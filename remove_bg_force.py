import os
import sys
from PIL import Image

def force_process_image(filepath):
    try:
        img = Image.open(filepath).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            # More forgiving tolerance for off-white
            if item[0] > 220 and item[1] > 220 and item[2] > 220:
                new_data.append((255, 255, 255, 0)) # transparent
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(filepath, "PNG")
        print(f"Force processed: {os.path.basename(filepath)}")
    except Exception as e:
        print(f"Error processing {os.path.basename(filepath)}: {e}")

sprite_dir = r"c:\Users\lixia\OneDrive\Projects\ninjaman\public\assets\sprites"
force_process_image(os.path.join(sprite_dir, "enemy_guard.png"))
force_process_image(os.path.join(sprite_dir, "player_hero.png"))
