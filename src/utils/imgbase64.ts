export default function getBase64Image(url: string): Promise<string> {
    const img = new Image();
    img.crossOrigin = 'use-credentials';
    img.src = `https://ya-praktikum.tech/api/v2/resources${url}`;

    return new Promise((resolve, reject) => {
        img.addEventListener('load', () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL.replace(/^data:image\/(png|jpg);base64,/, ''));
        });
        img.addEventListener('error', (e) => {
            reject(e.message);
        });
    });
}
