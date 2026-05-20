import os
from PIL import Image

def process_ninja():
    print("Processing Ninja Sprite...")
    path = 'public/assets/sprites/ninja.png'
    if not os.path.exists(path):
        print("Ninja sprite not found!")
        return
        
    img = Image.open(path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Change all white (also shades of whites)
        # to transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(path, "PNG")
    print("Ninja background removed!")

def process_backgrounds():
    backgrounds = ['bg_forest.png', 'bg_beach.png', 'bg_castle.png']
    for bg in backgrounds:
        path = f'public/assets/backgrounds/{bg}'
        if not os.path.exists(path):
            print(f"{bg} not found!")
            continue
            
        print(f"Cropping {bg}...")
        img = Image.open(path)
        w, h = img.size
        # Crop top half
        cropped = img.crop((0, 0, w, h // 2))
        cropped.save(path, "PNG")
        print(f"Cropped {bg} successfully!")

process_ninja()
process_backgrounds()
