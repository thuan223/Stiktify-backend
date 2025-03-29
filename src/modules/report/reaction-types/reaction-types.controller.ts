import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReactionTypesService } from './reaction-types.service';
import { CreateReactionTypeDto } from './dto/create-reaction-type.dto';
import { UpdateReactionTypeDto } from './dto/update-reaction-type.dto';

@Controller('reaction-types')
export class ReactionTypesController {
  constructor(private readonly reactionTypesService: ReactionTypesService) {}

  @Post()
  create(@Body() createReactionTypeDto: CreateReactionTypeDto) {
    return this.reactionTypesService.create(createReactionTypeDto);
  }

  @Get()
  findAll() {
    return this.reactionTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reactionTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReactionTypeDto: UpdateReactionTypeDto) {
    return this.reactionTypesService.update(+id, updateReactionTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reactionTypesService.remove(+id);
  }
}
