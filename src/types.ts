export type FileContentType =
  | 'image/png'
  | 'image/jpg'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/tiff'
  | 'image/gif'
  | 'application/pdf'
  | 'audio/mpeg'
  | 'audio/wav'
  | 'audio/ogg'
  | 'audio/flac'
  | 'audio/aac'
  | 'audio/mp4'
  | 'audio/mp3'
  | 'audio/m4a'
  | 'audio/m4b';

export interface File {
  // A public URL to the file
  url?: string;
  // The content type of the file
  content_type?: FileContentType | string;
  // The base64 encoded data of the file
  data?: string;
}

export type Image = File;

export interface DatetimeLocal {
  // The date of the local datetime
  date: string;
  // The time of the local datetime without timezone info
  local_time: string;
  // The timezone of the local time
  timezone: string;
}
