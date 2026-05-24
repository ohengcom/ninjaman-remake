import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Please run: pip install Pillow")
    sys.exit(1)

def process_image(filepath):
    try:
        img = Image.open(filepath).convert("RGBA")
        datas = img.getdata()
        
        # Determine background color from top-left pixel
        bg_color = img.getpixel((0, 0))
        
        # Only process if background is white-ish
        if bg_color[0] < 240 or bg_color[1] < 240 or bg_color[2] < 240:
            print(f"Skipped (not white bg): {os.path.basename(filepath)}")
            return

        new_data = []
        # tolerance for near-white pixels from compression artifacts
        for item in datas:
            if item[0] >= 240 and item[1] >= 240 and item[2] >= 240:
                new_data.append((255, 255, 255, 0)) # transparent
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(filepath, "PNG")
        print(f"Processed: {os.path.basename(filepath)}")
    except Exception as e:
        print(f"Error processing {os.path.basename(filepath)}: {e}")

sprite_dir = r"c:\Users\lixia\OneDrive\Projects\ninjaman\public\assets\sprites"
for filename in os.listdir(sprite_dir):
    if filename.endswith(".png"):
        process_image(os.path.join(sprite_dir, filename))
