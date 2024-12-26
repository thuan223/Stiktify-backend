import { Module } from '@nestjs/common';
import { ReactionTypesService } from './reaction-types.service';
import { ReactionTypesController } from './reaction-types.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReactionType,
  ReactionTypeSchema,
} from './schemas/reaction-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReactionType.name, schema: ReactionTypeSchema },
    ]),
  ],
  controllers: [ReactionTypesController],
  providers: [ReactionTypesService],
  exports: [ReactionTypesService],
})
export class ReactionTypesModule {}
