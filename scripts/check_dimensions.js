import { Jimp } from 'jimp';

async function check() {
  let image;
  if (Jimp && Jimp.read) {
      image = await Jimp.read('public/assets/sprites/ninja_transparent.png');
  } else {
      const jimpDefault = (await import('jimp')).default;
      image = await jimpDefault.read('public/assets/sprites/ninja_transparent.png');
  }
  console.log('WIDTH:', image.bitmap.width, 'HEIGHT:', image.bitmap.height);
}
check();
