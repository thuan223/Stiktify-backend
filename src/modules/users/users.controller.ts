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

  @Post("ban-user")
  @ResponseMessage('Update status ban user successfully')
  banUser(
    @Body() req: { isBan: boolean, _id: string }

  ) {
    return this.usersService.handleBanOrUnbannedUser(req)
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

  @Get("filter-search")
  findAllUserByFilterAndSearch(
    @Query() query: string,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.usersService.handleFilterAndSearch(query, +current, +pageSize)
  }

  @Patch('update-profile')
  @ResponseMessage('Profile updated successfully')
  updateProfile(@Body() updateUserDto: UpdateUserDto) {
    const { _id, ...updateFields } = updateUserDto; 
    return this.usersService.handleUpdateInformation(_id, updateFields); 
  }

  @Get('search-name')
  @ResponseMessage('Search users successfully')
  searchUsers(
  @Query('search') search: string, // Từ khóa tìm kiếm
  @Query('current') current: string, // Trang hiện tại
  @Query('pageSize') pageSize: string, // Kích thước mỗi trang
  @Query('sort') sort: string, 
  ) {
  return this.usersService.handleSearchUser(
    search,
    +current || 1, 
    +pageSize || 10, 
    sort ? JSON.parse(sort) : {}, 
  );
}
}
