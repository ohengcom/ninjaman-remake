import os
from PIL import Image

# Source files from brain artifact directory
SOURCES = {
    "enemy_guard.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_guard_spritesheet_1779606334169.png",
    "enemy_axe.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_axe_spritesheet_1779606349983.png",
    "enemy_ninja.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_ninja_spritesheet_1779606365530.png",
    "enemy_sniper.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_sniper_spritesheet_1779606381342.png",
    "boss_oni.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\boss_spritesheet_1779606397164.png"
}

dest_dir = r"public/assets/sprites"

def process_image(name, src_path):
    dest_path = os.path.join(dest_dir, name)
    print(f"\nProcessing {name}...")
    
    # 1. Open original 1024x1024 image
    img = Image.open(src_path).convert("RGBA")
    
    # 2. CROP the top half (0, 0, 1024, 512) to get the first 2 rows of 256x256 frames
    # This prevents squishing and vertical duplication!
    img = img.crop((0, 0, 1024, 512))
    print("Cropped top half (1024x512 pixels) to keep original aspect ratio.")
    
    # 3. BFS transparency filter starting from borders
    width, height = img.size
    pixels = img.load()
    
    def is_bg(r, g, b):
        # Match whites, off-whites, and grey colors (DALL-E backgrounds/checkerboards)
        if r > 180 and g > 180 and b > 180:
            return True
        if max(r, g, b) - min(r, g, b) < 15 and r > 100: # light grey
            return True
        return False
        
    visited = set()
    queue = []
    
    # Border seeds
    for x in range(width):
        for y in [0, height - 1]:
            if is_bg(*pixels[x, y][:3]):
                queue.append((x, y))
                visited.add((x, y))
    for y in range(height):
        for x in [0, width - 1]:
            if is_bg(*pixels[x, y][:3]):
                queue.append((x, y))
                visited.add((x, y))
                
    while queue:
        x, y = queue.pop(0)
        
        # Turn transparent
        pixels[x, y] = (255, 255, 255, 0)
        
        # 8-way traversal
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        r, g, b, a = pixels[nx, ny]
                        if a > 0 and is_bg(r, g, b):
                            visited.add((nx, ny))
                            queue.append((nx, ny))
                            
    img.save(dest_path, "PNG")
    print(f"Transparency filter complete and saved: {dest_path}")

for name, src in SOURCES.items():
    if os.path.exists(src):
        process_image(name, src)
    else:
        print(f"Source not found: {src}")

print("\nAll enemy and boss spritesheets processed successfully!")
