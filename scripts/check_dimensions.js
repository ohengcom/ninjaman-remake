import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkAndCrop() {
  const backgrounds = ['bg_forest.png', 'bg_beach.png', 'bg_castle.png'];
  for (const bg of backgrounds) {
    const imgPath = path.join(__dirname, '../public/assets/backgrounds', bg);
    console.log(`Reading ${bg} from ${imgPath}...`);
    try {
      const image = await Jimp.read(imgPath);
      console.log(`${bg} dimensions: ${image.bitmap.width}x${image.bitmap.height}`);
      
      // Crop the top 90 pixels (which is the duplicate strip)
      if (image.bitmap.height > 150) {
        console.log(`Cropping top 90 pixels of duplicate header banner from ${bg}...`);
        image.crop({ x: 0, y: 90, w: image.bitmap.width, h: image.bitmap.height - 90 });
        await image.write(imgPath);
        console.log(`${bg} updated dimensions: ${image.bitmap.width}x${image.bitmap.height}`);
      }
    } catch(e) {
      console.error(`Error processing ${bg}:`, e.message || e);
    }
  }
}

checkAndCrop().catch(console.error);
