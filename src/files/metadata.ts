
import { ExifTags, readImage } from '~/src/files/images';

export enum FileCategory {
  IMAGE = 'IMAGE',
  SOUND = 'SOUND',
  VIDEO = 'VIDEO',
}


export enum FileStorage {
  PREVIEW = 'PREVIEW',
  FULL_QUALITY = 'FULL_QUALITY',
  RAW = 'RAW',
}

/**
 * File metadata
 */
export interface FileMetadata {
  filename: string;
  mime: string;
  size: number;
  storage: FileStorage;
  public: boolean;
  date: string | null;
  tags: FileTags;
}

export type FileTags = ExifTags | null;

export interface FileInfo {
  date: string | null;
  preview: string;
  tags: FileTags;
}

export const IMAGE_OPTIONS = {
  reader: readImage,
  type: FileCategory.IMAGE,
};

export const SOUND_OPTIONS = {
  reader: () => readImage,
  type: FileCategory.SOUND,
};

export const VIDEO_OPTIONS = {
  reader: () => readImage,
  type: FileCategory.VIDEO,
};

export const MIME_OPTIONS = {
  'image/bmp': IMAGE_OPTIONS,
  'image/png': IMAGE_OPTIONS,
  'image/jpeg': IMAGE_OPTIONS,
  'image/gif': IMAGE_OPTIONS,
  'image/svg+xml': IMAGE_OPTIONS,
  'image/webp': IMAGE_OPTIONS,
};

export const isSupportedMime = (mime: string): mime is keyof typeof MIME_OPTIONS => {
  return mime in MIME_OPTIONS;
};

export const readUnsupportedFile = async (file: File): Promise<FileInfo> => {
  const lastModified = new Date(file.lastModified);

  return {
    date: lastModified.toISOString(),
    preview: '',
    tags: null,
  };
};

export const readFile = (file: File): Promise<FileInfo> => {
  const mime = file.type;

  if (isSupportedMime(mime)) {
    const options = MIME_OPTIONS[mime];

    return options.reader(file);
  }

  return Promise.resolve(readUnsupportedFile(file));
};
