import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateReactionTypeDto {
    @IsNotEmpty()
    reactionTypeName: string;

    @IsNotEmpty()
    reactionIcon: string;
}

export class UpdateReactionTypeDTO {
    @IsMongoId()
    @IsNotEmpty()
    _id: string

    @IsNotEmpty()
    reactionIcon: string;
}
