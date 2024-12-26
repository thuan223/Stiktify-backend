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
