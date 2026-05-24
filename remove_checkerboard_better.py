import os
from PIL import Image

def remove_checkerboard_better(filepath):
    print(f"Processing {filepath}...")
    img = Image.open(filepath).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Define what constitutes a "background" pixel:
    # 1. It is relatively light (R, G, B > 120)
    # 2. It is mostly grayscale (max - min < 40)
    def is_bg(r, g, b):
        if r < 120 or g < 120 or b < 120:
            return False
        if max(r, g, b) - min(r, g, b) > 40:
            return False
        return True
        
    # BFS to flood fill the background starting from all edges
    visited = set()
    queue = []
    
    # Add all border pixels that look like background
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
        
        # Make transparent
        pixels[x, y] = (255, 255, 255, 0)
        
        # 8-way connectivity
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        r, g, b, a = pixels[nx, ny]
                        # If it's not already transparent and looks like bg
                        if a > 0 and is_bg(r, g, b):
                            visited.add((nx, ny))
                            queue.append((nx, ny))
                            
    img.save(filepath, "PNG")
    print(f"Saved {filepath} with advanced transparency.")

sprite_dir = r"c:\Users\lixia\OneDrive\Projects\ninjaman\public\assets\sprites"
remove_checkerboard_better(os.path.join(sprite_dir, "enemy_guard.png"))
