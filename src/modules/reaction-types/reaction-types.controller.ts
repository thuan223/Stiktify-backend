import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReactionTypesService } from './reaction-types.service';
import { CreateReactionTypeDto, UpdateReactionTypeDTO } from './dto/create-reaction-type.dto';
import { UpdateReactionTypeDto } from './dto/update-reaction-type.dto';

@Controller('reaction-types')
export class ReactionTypesController {
  constructor(private readonly reactionTypesService: ReactionTypesService) { }

  @Post()
  create(@Body() createReactionTypeDto: CreateReactionTypeDto) {
    return this.reactionTypesService.create(createReactionTypeDto);
  }

  @Get()
  async findAll(
    @Query() query: string,
  ) {
    return await this.reactionTypesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reactionTypesService.findOne(+id);
  }

  @Patch()
  update(@Body() updateReactionTypeDto: UpdateReactionTypeDTO) {
    return this.reactionTypesService.update(updateReactionTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reactionTypesService.remove(+id);
  }
}
