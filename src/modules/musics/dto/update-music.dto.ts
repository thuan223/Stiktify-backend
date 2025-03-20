import { PartialType } from '@nestjs/mapped-types';
import { CreateMusicDto } from './create-music.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateMusicDto {
    @IsMongoId({ message: "musicId invalid!" })
    @IsNotEmpty({ message: "musicId invalid!" })
    musicId: Types.ObjectId

    @IsNotEmpty()
    musicUrl: string;

    @IsNotEmpty()
    musicDescription: string;

    @IsNotEmpty()
    musicThumbnail: string;

    @IsNotEmpty()
    musicTag: string[];
}
