import { IsBoolean, IsNotEmpty } from 'class-validator';

export class flagMusicDto {
    @IsNotEmpty({ message: '_id must not be empty' })
    _id: string;
    @IsNotEmpty({ message: 'flag must not be empty' })
    @IsBoolean({ message: 'flag must be a boolean value' })
    flag?: boolean;
}
