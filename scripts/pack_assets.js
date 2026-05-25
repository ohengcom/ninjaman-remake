import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Jimp } from 'jimp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const spritesDir = path.resolve(__dirname, '../public/assets/sprites');
const outputDir = path.resolve(__dirname, '../public/assets/atlases');

const ATLAS_SIZE = 2048;
const PADDING = 2;

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read all PNGs
const files = fs.readdirSync(spritesDir).filter(f => f.endsWith('.png'));
const images = [];

for (const file of files) {
    const p = path.join(spritesDir, file);
    const image = await Jimp.read(p);
    images.push({ file, image, width: image.bitmap.width, height: image.bitmap.height });
}

console.log(`Packing ${images.length} images...`);

const pages = [];
let page = createPage();

for (const entry of images) {
    if (entry.width + PADDING * 2 > ATLAS_SIZE || entry.height + PADDING * 2 > ATLAS_SIZE) {
        throw new Error(`Image too large for ${ATLAS_SIZE}px atlas: ${entry.file}`);
    }

    if (page.cursorX + entry.width + PADDING > ATLAS_SIZE) {
        page.cursorX = PADDING;
        page.cursorY += page.rowHeight + PADDING;
        page.rowHeight = 0;
    }

    if (page.cursorY + entry.height + PADDING > ATLAS_SIZE) {
        pages.push(page);
        page = createPage();
    }

    page.frames.push({
        filename: path.basename(entry.file, path.extname(entry.file)),
        image: entry.image,
        x: page.cursorX,
        y: page.cursorY,
        w: entry.width,
        h: entry.height,
    });
    page.cursorX += entry.width + PADDING;
    page.rowHeight = Math.max(page.rowHeight, entry.height);
}

if (page.frames.length > 0) {
    pages.push(page);
}

for (let i = 0; i < pages.length; i++) {
    const current = pages[i];
    const atlasName = `webp_atlas-${i}`;
    const imageName = `${atlasName}.png`;
    const jsonName = `${atlasName}.json`;
    const atlas = new Jimp({ width: ATLAS_SIZE, height: ATLAS_SIZE, color: 0x00000000 });

    for (const frame of current.frames) {
        atlas.composite(frame.image, frame.x, frame.y);
    }

    await atlas.write(path.join(outputDir, imageName));

    const json = {
        textures: [
            {
                image: imageName,
                format: 'RGBA8888',
                size: { w: ATLAS_SIZE, h: ATLAS_SIZE },
                scale: 1,
                frames: current.frames.map(frame => ({
                    filename: frame.filename,
                    rotated: false,
                    trimmed: false,
                    sourceSize: { w: frame.w, h: frame.h },
                    spriteSourceSize: { x: 0, y: 0, w: frame.w, h: frame.h },
                    frame: { x: frame.x, y: frame.y, w: frame.w, h: frame.h },
                })),
            },
        ],
        meta: {
            app: 'scripts/pack_assets.js',
            version: '1.0',
            image: imageName,
            format: 'RGBA8888',
            size: { w: ATLAS_SIZE, h: ATLAS_SIZE },
            scale: 1,
        },
    };

    fs.writeFileSync(path.join(outputDir, jsonName), JSON.stringify(json, null, 2));
    console.log(`Saved: ${path.join(outputDir, imageName)}`);
    console.log(`Saved: ${path.join(outputDir, jsonName)}`);
}

console.log('Texture packing complete! You can now update manifest.ts to use the generated atlas.');

function createPage() {
    return {
        cursorX: PADDING,
        cursorY: PADDING,
        rowHeight: 0,
        frames: [],
    };
}
