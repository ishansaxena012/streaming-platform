export class PlaybackResponseDto {
  id: string;

  title: string;

  description: string | null;

  thumbnailUrl: string | null;

  hlsManifestUrl: string;

  duration: number | null;
}
