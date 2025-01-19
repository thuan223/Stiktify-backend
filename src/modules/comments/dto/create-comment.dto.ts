import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty({ message: 'User ID must not be empty!' })
    userId: string;

    @IsNotEmpty({ message: 'Video ID must not be empty!' })
    videoId: string;

    @IsOptional()
    parentId: string;

    @IsNotEmpty({ message: 'Comment description must not be empty!' })
    CommentDescription: string;
}

export class UpdateCommentDescriptionDto {
    @IsNotEmpty()
    @IsMongoId()
    _id: string;

    @IsNotEmpty({ message: 'Comment description must not be empty!' })
    CommentDescription: string;
}
