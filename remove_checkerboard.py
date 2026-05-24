import os
from PIL import Image
from collections import Counter

def remove_checkerboard(filepath):
    print(f"Processing {filepath}...")
    img = Image.open(filepath).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # 1. Identify the checkerboard colors from the top-left corner
    sample_pixels = []
    for y in range(40):
        for x in range(40):
            sample_pixels.append(pixels[x, y][:3]) # RGB only
    
    # Get the two most common colors in the top-left corner
    counter = Counter(sample_pixels)
    most_common = counter.most_common(2)
    bg_colors = [color for color, count in most_common]
    
    print(f"Detected background colors: {bg_colors}")
    
    def is_bg_color(r, g, b):
        for bg in bg_colors:
            if abs(r - bg[0]) < 15 and abs(g - bg[1]) < 15 and abs(b - bg[2]) < 15:
                return True
        return False
        
    # 2. BFS to flood fill the background
    visited = set()
    queue = [(0, 0)]
    visited.add((0, 0))
    
    # Also add other corners just in case
    corners = [(width-1, 0), (0, height-1), (width-1, height-1)]
    for cx, cy in corners:
        if is_bg_color(*pixels[cx, cy][:3]):
            queue.append((cx, cy))
            visited.add((cx, cy))
            
    while queue:
        x, y = queue.pop(0)
        
        # Make transparent
        pixels[x, y] = (255, 255, 255, 0)
        
        # 8-way connectivity to jump across checkerboard corners
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        r, g, b, a = pixels[nx, ny]
                        if a > 0 and is_bg_color(r, g, b):
                            visited.add((nx, ny))
                            queue.append((nx, ny))
                            
    img.save(filepath, "PNG")
    print(f"Saved {filepath} with transparency.")

sprite_dir = r"c:\Users\lixia\OneDrive\Projects\ninjaman\public\assets\sprites"
remove_checkerboard(os.path.join(sprite_dir, "enemy_guard.png"))
