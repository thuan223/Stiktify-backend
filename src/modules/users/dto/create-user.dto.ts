import { IsEmail, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  userName: string;

  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsOptional()
  password: string;

  @IsOptional()
  image: string;
}

export class UserCreateByManager {
  @IsNotEmpty({ message: 'Name is required!' })
  fullname: string;

  @IsNotEmpty({ message: 'userName is required!' })
  userName: string;

  @IsNotEmpty({ message: 'Email is required!' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsNotEmpty({ message: 'Password  is required!' })
  password: string;
}

export class GetUserDetailDto{
  @IsNotEmpty({ message: 'Id is required!' })
  _id: string;

}