export interface MapObject {
  id: string;
  size: { w: number; h: number };
  texture: string;
  type: string;
  x: number;
  y: number;
}

export class LevelLoader {
  static parseXML(xmlString: string): MapObject[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const objects: MapObject[] = [];

    const oElements = xmlDoc.getElementsByTagName('o');
    for (let i = 0; i < oElements.length; i++) {
      const el = oElements[i];
      const id = el.getAttribute('id') || '';
      const s = el.getAttribute('s')?.split(',') || ['0', '0'];
      const ti = el.getAttribute('ti')?.split(',') || ['', '0', '0'];
      const ty = el.getAttribute('ty') || '';

      // ti format seems to be "textureName,x,y" or "textureName1,x1,y1,textureName2,x2,y2..."
      // For now, let's just take the first texture
      const texture = ti[0];
      const x = parseFloat(ti[1]) || 0;
      const y = parseFloat(ti[2]) || 0;
      const w = parseFloat(s[0]) || 0;
      const h = parseFloat(s[1]) || 0;

      objects.push({
        id,
        size: { w, h },
        texture,
        type: ty,
        x,
        y,
      });
    }

    return objects;
  }
}
