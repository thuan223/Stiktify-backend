import { IsString, IsNumber, IsMongoId, IsEnum, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string; // ⚠️ Đổi từ Types.ObjectId -> string để tránh lỗi

  @IsMongoId()
  @IsNotEmpty()
  productId: string; // ⚠️ Đổi từ Types.ObjectId -> string để tránh lỗi

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
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;
  
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
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}
