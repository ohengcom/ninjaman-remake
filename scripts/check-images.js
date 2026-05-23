import { Jimp } from 'jimp';

async function checkImage() {
  const bg = await Jimp.read('public/assets/backgrounds/bg_forest.png');
  console.log(`bg_forest: ${bg.bitmap.width}x${bg.bitmap.height}`);
  
  const ninja = await Jimp.read('public/assets/sprites/ninja_transparent.png');
  console.log(`ninja: ${ninja.bitmap.width}x${ninja.bitmap.height}`);
}

checkImage().catch(console.error);
