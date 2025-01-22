import { IsNotEmpty } from "class-validator";

export class CreateReactionTypeDto {
    @IsNotEmpty()
    reactionTypeName: string;

    @IsNotEmpty()
    reactionIcon: string;
}

export class UpdateReactionTypeDTO {
    @IsNotEmpty()
    reactionIcon: string;
}
