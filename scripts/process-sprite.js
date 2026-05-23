import { Jimp } from 'jimp';

async function process() {
  try {
    const rawPath = 'C:\\Users\\lixia\\.gemini\\antigravity\\brain\\345659f6-904e-4498-8a3a-29ff8422aa8d\\ninja_single_raw_1779546540510.png';
    console.log('Loading image from', rawPath);
    
    // In jimp v1.x the default export might not be Jimp itself, but let's try read
    let image;
    if (Jimp && Jimp.read) {
        image = await Jimp.read(rawPath);
    } else {
        // fallback for older jimp
        const jimpDefault = (await import('jimp')).default;
        image = await jimpDefault.read(rawPath);
    }

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Scan the image and remove green screen
    image.scan(0, 0, width, height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Strict green screen removal
      if (g > 180 && r < 120 && b < 120) {
        this.bitmap.data[idx + 3] = 0; // set alpha to 0
      }
    });

    const outPath = 'public/assets/sprites/ninja_transparent.png';
    await image.write(outPath); // note: writeAsync in old versions, write in new versions returns a promise
    console.log('Successfully wrote transparent sprite to', outPath);
  } catch (e) {
    console.error('Error processing image:', e);
  }
}

process();
