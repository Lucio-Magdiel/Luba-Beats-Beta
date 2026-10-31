import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export { cloudinary };

/**
 * Genera una firma segura de subida directa a Cloudinary (Client Direct Upload)
 */
export function signUploadParams(paramsToSign: Record<string, string | number>): string {
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) {
    throw new Error('CLOUDINARY_API_SECRET no está configurado');
  }
  return cloudinary.utils.api_sign_request(paramsToSign, secret);
}

/**
 * Subir un buffer directamente a Cloudinary usando upload_stream
 */
export function uploadToCloudinary(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      if (!result) return reject(new Error('Cloudinary upload returned empty response'));
      resolve(result);
    });
    stream.end(buffer);
  });
}

/**
 * Obtener URL optimizada para audio o video en streaming
 */
export function getAudioStreamUrl(publicId: string, format: string = 'mp3'): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format,
    secure: true
  });
}

/**
 * Obtener URL optimizada para portada o visual
 */
export function getImageThumbnailUrl(publicId: string, width: number = 600, height: number = 600): string {
  return cloudinary.url(publicId, {
    resource_type: 'image',
    transformation: [
      { width, height, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
    ],
    secure: true
  });
}
