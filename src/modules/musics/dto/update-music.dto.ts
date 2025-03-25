import { PartialType } from '@nestjs/mapped-types';
import { CreateMusicDto } from './create-music.dto';
import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateMusicDto {
    @IsMongoId({ message: "musicId invalid!" })
    @IsNotEmpty({ message: "musicId invalid!" })
    musicId: Types.ObjectId

    @IsNotEmpty({ message: 'musicTag must not be empty' })
    musicDescription: string;

    @IsNotEmpty({ message: 'musicTag must not be empty' })
    musicThumbnail: string;

    @IsNotEmpty({ message: 'musicTag must not be empty' })
    @IsArray({ message: 'musicTag must be array' })
    musicTag: { _id: string, fullname: string }[];
}
