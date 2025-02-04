import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserCreateByManager } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage } from '@/decorator/customize';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get("ban-user/:id")
  @ResponseMessage('Banned user successfully')
  banUser(@Param("id") id: string) {
    return this.usersService.handleBanUser(id)
  }

  @Get("unbanned-user/:id")
  @ResponseMessage('Unbanned user successfully')
  unBanUser(@Param("id") id: string) {
    return this.usersService.handleUnBanUser(id)
  }

  @Post("create-user")
  @ResponseMessage('Create Successfully')
  create(@Body() createDto: UserCreateByManager) {
    return this.usersService.handleCreateUser(createDto)
  }

  @Patch('update-user')
  @ResponseMessage('Update Successfully')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.handleUpdate(updateUserDto);
  }

  @Get("list-user")
  findAllUser(
    @Query() query: string,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.usersService.handleGetListUser(query, +current, +pageSize)
  }

}
