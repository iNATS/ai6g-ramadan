import { TextConfig } from '../types';

export const generateCard = (
  image: HTMLImageElement,
  name: string,
  config: TextConfig
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    // Draw Background
    ctx.drawImage(image, 0, 0);

    // Draw Name
    ctx.font = `bold ${config.fontSize}px 'Cairo', sans-serif`;
    ctx.fillStyle = config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Scale coordinates from preview to actual image size
    // Note: The config passed here should already be relative or we handle scaling outside.
    // For this implementation, we will pass relative coordinates (0-1) to handle responsiveness easily.
    
    const textX = config.x * canvas.width;
    const textY = config.y * canvas.height;

    ctx.fillText(name, textX, textY);

    // Draw Footer Watermark (AI6G Requirement)
    const footerFontSize = Math.max(16, canvas.width * 0.02);
    ctx.font = `${footerFontSize}px 'Cairo', sans-serif`;
    ctx.fillStyle = '#4b5563'; // Gray-600
    ctx.textAlign = 'center';
    const footerText = "احصل على دعوتك مجانا AI6G تم الانشاء بواسطه";
    ctx.fillText(footerText, canvas.width / 2, canvas.height - (footerFontSize * 1.5));

    resolve(canvas.toDataURL('image/png'));
  });
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};