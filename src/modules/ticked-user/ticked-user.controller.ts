import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TickedUserService } from './ticked-user.service';
import { CreateTickedUserDto } from './dto/create-ticked-user.dto';
import { UsersService } from '../users/users.service';

@Controller('ticked-users')
export class TickedUserController {
  constructor(private readonly tickedUserService: TickedUserService) {}
  @Get('list-ticked')
  async getUserTicked(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.tickedUserService.getUserTicked(query, +current, +pageSize);
  }

  @Get('filter-search')
  findUserRequestFilterAndSearch(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.tickedUserService.handleFilterAndSearchUserReTicked(query, +current, +pageSize);
  }

  @Post()
  async requestTick(@Body() dto: CreateTickedUserDto) {
    return this.tickedUserService.requestTick(dto);
  }

  @Patch(':id/approve')
  async approveTick(@Param('id') id: string) {
    return this.tickedUserService.approveTick(id);
  }

  @Patch(':id/reject')
  async rejectTick(
    @Param('id') id: string,
    @Body() reason: { reason: string },
  ) {
    return this.tickedUserService.rejectTick(id, reason?.reason);
  }

  @Get(':userId')
  async getTickStatus(@Param('userId') userId: string) {
    return this.tickedUserService.getTickStatus(userId);
  }
}
