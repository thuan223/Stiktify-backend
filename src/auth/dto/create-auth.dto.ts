import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  userName: string;
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;
  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;
  @IsNotEmpty({ message: 'Fullname must not be empty' })
  fullname: string;
}
export class CodeAuthDto {
  @IsNotEmpty({ message: '_id must not be empty' })
  _id: string;
  @IsNotEmpty({ message: 'Code must not be empty' })
  activeCode: string;
}

export class ChangePasswordAuthDto {
  @IsNotEmpty({ message: 'Code must not be empty' })
  activeCode: string;
  @IsNotEmpty({ message: 'Username or Email must not be empty' })
  userName: string;
  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;
  @IsNotEmpty({ message: 'Confirm Password must not be empty' })
  confirmPassword: string;
}
