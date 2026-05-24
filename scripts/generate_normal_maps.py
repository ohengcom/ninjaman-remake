import os
import glob
from PIL import Image, ImageFilter
import numpy as np

# Path configurations
sprites_dir = "public/assets/sprites"
os.makedirs(sprites_dir, exist_ok=True)

# Find all sprite sheet textures to generate normal maps for
SPRITES = [
    "player_hero.png",
    "enemy_guard.png",
    "enemy_axe.png",
    "enemy_ninja.png",
    "enemy_sniper.png",
    "boss_oni.png",
    "knight.png"
]

def generate_normal_map(name, strength=3.0, blur_radius=2):
    filepath = os.path.join(sprites_dir, name)
    if not os.path.exists(filepath):
        print(f"Skipping {name}: file not found at {filepath}")
        return

    print(f"Generating normal map for {name}...")
    img = Image.open(filepath).convert("RGBA")
    w, h = img.size
    
    # 1. Create a heightmap using alpha and grayscale
    gray = img.convert("L")
    
    # Smooth the grayscale slightly to reduce noise in normal maps
    if blur_radius > 0:
        gray = gray.filter(ImageFilter.GaussianBlur(blur_radius))
        
    pixels_gray = np.array(gray, dtype=np.float32) / 255.0
    pixels_alpha = np.array(img.getchannel("A"), dtype=np.float32) / 255.0
    
    # Heightmap: combining alpha (silhouette) and grayscale (detail contours)
    heightmap = pixels_alpha * (0.3 + 0.7 * pixels_gray)
    
    # 2. Compute gradients dx and dy using Sobel or central differences
    dy, dx = np.gradient(heightmap)
    
    # Apply strength multiplier
    dx *= strength
    dy *= -strength # Invert Y for correct normal map orientation (OpenGL style)
    
    # 3. Compute Nz component and normalize the normal vector
    # N = (dx, dy, 1.0)
    nz = np.ones_like(dx)
    norm = np.sqrt(dx**2 + dy**2 + nz**2)
    
    nx = dx / norm
    ny = dy / norm
    nz = nz / norm
    
    # 4. Map normals (-1 to +1) to RGB colors (0 to 255)
    r = ((nx + 1.0) * 127.5).astype(np.uint8)
    g = ((ny + 1.0) * 127.5).astype(np.uint8)
    b = ((nz + 1.0) * 127.5).astype(np.uint8)
    
    # 5. Reconstruct the normal map image with the same alpha channel
    a = (pixels_alpha * 255.0).astype(np.uint8)
    
    # Neutral normals for fully transparent areas to avoid light artifacts
    transparent_mask = (a == 0)
    r[transparent_mask] = 128
    g[transparent_mask] = 128
    b[transparent_mask] = 255
    
    normal_data = np.stack([r, g, b, a], axis=-1)
    normal_img = Image.fromarray(normal_data, "RGBA")
    
    # Save the normal map using the standard _n suffix
    base, ext = os.path.splitext(name)
    normal_name = f"{base}_n{ext}"
    normal_filepath = os.path.join(sprites_dir, normal_name)
    normal_img.save(normal_filepath)
    print(f"Successfully saved normal map to {normal_filepath}")

if __name__ == "__main__":
    for s in SPRITES:
        generate_normal_map(s, strength=4.0, blur_radius=1.5)
