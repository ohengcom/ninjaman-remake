import os
import glob
from PIL import Image
import numpy as np

# Source raw sheets from the brain artifacts folder
SOURCES = {
    "enemy_guard.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_guard_spritesheet_1779596392589.png",
    "enemy_axe.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_axe_spritesheet_1779596417883.png",
    "enemy_ninja.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_ninja_spritesheet_1779596428338.png",
    "enemy_sniper.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\enemy_sniper_spritesheet_1779596442146.png",
    "boss_oni.png": r"C:\Users\lixia\.gemini\antigravity\brain\f3c8da4a-3e77-4bb9-a780-9bb315f6f062\boss_spritesheet_1779596466409.png"
}

dest_dir = r"public/assets/sprites"
os.makedirs(dest_dir, exist_ok=True)

def process_perfectly(name, src_path):
    dest_path = os.path.join(dest_dir, name)
    print(f"\nProcessing {name} perfectly from {src_path}...")
    
    # 1. Open original 1024x1024 image
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    
    # Target size for each frame is exactly 340x512
    # So the combined sheet will be (340*3) x (512*2) = 1020 x 1024
    out_sheet = Image.new("RGBA", (1020, 1024), (0, 0, 0, 0))
    
    # Background thresholds
    def is_bg(r, g, b):
        if name == "enemy_guard.png":
            # Checkerboard gray background
            if r > 110 and g > 110 and b > 110 and max(r,g,b)-min(r,g,b) < 25:
                return True
        else:
            # White/off-white background
            if r > 210 and g > 210 and b > 210:
                return True
            # Also light gray
            if r > 180 and g > 180 and b > 180 and max(r,g,b)-min(r,g,b) < 15:
                return True
        return False

    cols = 3
    rows = 2
    
    for r in range(rows):
        for c in range(cols):
            # Crop source cell with high precision
            # Source image is 1024x1024
            x0 = int(c * (1024 / 3))
            x1 = int((c + 1) * (1024 / 3))
            y0 = int(r * (1024 / 2))
            y1 = int((r + 1) * (1024 / 2))
            
            cell = img.crop((x0, y0, x1, y1))
            # Resize cell to exactly 340x512
            cell = cell.resize((340, 512), Image.Resampling.LANCZOS)
            cell_pixels = cell.load()
            cw, ch = cell.size
            
            # --- Phase 1: Flood Fill Background or Direct Mask ---
            if name == "enemy_guard.png":
                visited = np.zeros((cw, ch), dtype=bool)
                queue = []
                # Seeds on cell borders
                for x in range(cw):
                    for y in [0, ch-1]:
                        if is_bg(*cell_pixels[x, y][:3]):
                            queue.append((x, y))
                            visited[x, y] = True
                for y in range(ch):
                    for x in [0, cw-1]:
                        if is_bg(*cell_pixels[x, y][:3]):
                            queue.append((x, y))
                            visited[x, y] = True
                
                # Standard BFS for flood fill
                head = 0
                while head < len(queue):
                    cx, cy = queue[head]
                    head += 1
                    cell_pixels[cx, cy] = (0, 0, 0, 0)
                    for dx in [-1, 0, 1]:
                        for dy in [-1, 0, 1]:
                            if dx == 0 and dy == 0:
                                continue
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < cw and 0 <= ny < ch:
                                if not visited[nx, ny]:
                                    r_val, g_val, b_val, a_val = cell_pixels[nx, ny]
                                    if a_val > 0 and is_bg(r_val, g_val, b_val):
                                        visited[nx, ny] = True
                                        queue.append((nx, ny))
            else:
                # Direct color mask for white background & interior loops (e.g. bow string space)
                for x in range(cw):
                    for y in range(ch):
                        r_val, g_val, b_val, a_val = cell_pixels[x, y]
                        if is_bg(r_val, g_val, b_val):
                            cell_pixels[x, y] = (0, 0, 0, 0)
            
            # --- Phase 2: Clear Black Borders and labels by keeping only the largest component ---
            # Create a binary grid of opaque pixels
            opaque_mask = np.zeros((cw, ch), dtype=int)
            for x in range(cw):
                for y in range(ch):
                    if cell_pixels[x, y][3] > 0:
                        # Skip thin dark border lines that might still touch edges
                        if x < 4 or x > cw - 5 or y < 4 or y > ch - 5:
                            cell_pixels[x, y] = (0, 0, 0, 0)
                        else:
                            opaque_mask[x, y] = 1
            
            # Connected component analysis using standard BFS
            labeled = np.zeros((cw, ch), dtype=int)
            label_counter = 1
            components = {} # label -> list of pixels
            
            for x in range(cw):
                for y in range(ch):
                    if opaque_mask[x, y] == 1 and labeled[x, y] == 0:
                        # New component
                        comp_pixels = []
                        q = [(x, y)]
                        labeled[x, y] = label_counter
                        
                        comp_head = 0
                        while comp_head < len(q):
                            px, py = q[comp_head]
                            comp_head += 1
                            comp_pixels.append((px, py))
                            
                            for dx in [-1, 0, 1]:
                                for dy in [-1, 0, 1]:
                                    if dx == 0 and dy == 0:
                                        continue
                                    nx, ny = px + dx, py + dy
                                    if 0 <= nx < cw and 0 <= ny < ch:
                                        if opaque_mask[nx, ny] == 1 and labeled[nx, ny] == 0:
                                            labeled[nx, ny] = label_counter
                                            q.append((nx, ny))
                        
                        components[label_counter] = comp_pixels
                        label_counter += 1
            
            # Find the largest connected component (the character body)
            if components:
                largest_label = max(components.keys(), key=lambda k: len(components[k]))
                largest_size = len(components[largest_label])
                print(f"  Cell [{r}][{c}]: found {len(components)} components. Largest component size: {largest_size} pixels.")
                
                # Make all other components transparent (these are labels, grid lines, noise)
                for lbl, px_list in components.items():
                    if lbl != largest_label:
                        for px, py in px_list:
                            cell_pixels[px, py] = (0, 0, 0, 0)
            else:
                print(f"  Cell [{r}][{c}]: no components found!")
            
            # Paste the perfectly cleaned frame into our output sheet
            out_sheet.paste(cell, (c * 340, r * 512))
            
    out_sheet.save(dest_path, "PNG")
    print(f"Saved perfectly cleaned sheet to: {dest_path}")

for name, src in SOURCES.items():
    if os.path.exists(src):
        process_perfectly(name, src)
    else:
        print(f"Source file not found: {src}")
        
print("\nAll 5 sprite sheets have been processed perfectly!")
