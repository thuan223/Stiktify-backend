import { IsString, IsNumber, IsMongoId, IsEnum, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string; 

  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(['COD', 'VNPAY'])
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  emailAddress: string;

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
  
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'completed', 'failed'])
  @IsNotEmpty()
  status: string;
}

export class UpdateShippingInfoDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  emailAddress: string;

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}
