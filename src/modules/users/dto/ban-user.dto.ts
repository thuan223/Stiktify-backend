import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BanUserDto {
    @IsNotEmpty({ message: '_id must not be empty' })
    _id: string;
    @IsNotEmpty({ message: 'isBan must not be empty' })
    @IsBoolean({ message: 'isBan must be a boolean value' })
    isBan?: boolean;
}
