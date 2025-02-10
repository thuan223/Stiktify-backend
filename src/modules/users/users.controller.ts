import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserCreateByManager } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage } from '@/decorator/customize';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { BanUserDto } from './dto/ban-user.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('get-user')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get user information successfully')
  getUser(@Request() req) {
  return this.usersService.getUserById(req.user._id);
  }

  @Post("ban-user")
  @ResponseMessage('Update status ban user successfully')
  banUser(
    @Body() req: BanUserDto
  ) {
    return this.usersService.handleBanOrUnbannedUser(req._id, req.isBan)
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
  @UseGuards(JwtAuthGuard)  // Đảm bảo chỉ cho phép người dùng đã đăng nhập
  @ResponseMessage('Profile updated successfully')
  updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    const userId = req.user._id;  // Lấy userId từ token, không cần gửi _id từ client
    return this.usersService.handleUpdateInformation(userId, updateUserDto); // Truyền userId vào service
  }
  

  @Get('search-name')
  @ResponseMessage('Search users successfully')
  searchUsers(
    @Query('search') search: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('sort') sort: string,
  ) {
    return this.usersService.handleSearchUser(
      search,
      +current || 1,
      +pageSize || 10,
      sort ? JSON.parse(sort) : {},
    );
  }

  // Detail user - ThangLH
  @Get('get-user/:id')
  @ResponseMessage('Fetched user details successfully')
  async getUserDetail(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  
}


}
 