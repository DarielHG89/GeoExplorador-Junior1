
import * as THREE from 'three';

export const createLabelSprite = (text: string, fontSize: number = 48, textColor: string = 'white'): THREE.Sprite => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Sprite();

  const font = `bold ${fontSize}px Fredoka, sans-serif`;
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = metrics.width;

  canvas.width = textWidth + 20;
  canvas.height = fontSize + 20;

  context.font = font;
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true });
  const sprite = new THREE.Sprite(spriteMaterial);

  const aspect = canvas.width / canvas.height;
  sprite.scale.set(20 * aspect, 20, 1);

  return sprite;
};
