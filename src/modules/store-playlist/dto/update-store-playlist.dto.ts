import { PartialType } from '@nestjs/mapped-types';
import { CreateStorePlaylistDto } from './create-store-playlist.dto';

export class UpdateStorePlaylistDto extends PartialType(CreateStorePlaylistDto) {}
