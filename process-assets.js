import * as Jimp from 'jimp';

async function processImages() {
  console.log('Processing Ninja Sprite...');
  const ninjaPath = 'public/assets/sprites/ninja.png';
  const ninja = await Jimp.read(ninjaPath);
  
  // Make white background transparent
  ninja.scan(0, 0, ninja.bitmap.width, ninja.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // If it's pure white or very close to white (background of DALL-E)
    if (r > 240 && g > 240 && b > 240) {
      this.bitmap.data[idx + 3] = 0; // Alpha to 0
    }
  });
  await ninja.writeAsync(ninjaPath);
  console.log('Ninja background removed!');

  const backgrounds = ['bg_forest.png', 'bg_beach.png', 'bg_castle.png'];
  for (const bg of backgrounds) {
    console.log(`Cropping ${bg}...`);
    const imgPath = `public/assets/backgrounds/${bg}`;
    try {
      const image = await Jimp.read(imgPath);
      // Crop top half
      image.crop(0, 0, image.bitmap.width, Math.floor(image.bitmap.height / 2));
      await image.writeAsync(imgPath);
      console.log(`Cropped ${bg} successfully!`);
    } catch(e) {
      console.log(`Could not process ${bg}:`, e.message);
    }
  }
}

processImages().catch(console.error);
