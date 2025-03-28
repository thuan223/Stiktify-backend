import { 
  IsString, 
  IsNumber, 
  IsMongoId, 
  IsEnum, 
  IsNotEmpty, 
  IsBoolean, 
  IsOptional,
  ValidateNested,
  ArrayNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';

// Updated DTO for OrderProduct to match the schema
export class OrderProductDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;
  
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  description: string;
  
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string; 

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

  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  @ArrayNotEmpty()
  products: OrderProductDto[];
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'completed', 'failed'])
  @IsNotEmpty()
  status: string;
}

export class UpdateShippingInfoDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  emailAddress?: string;

  @IsString()
  @IsOptional()
  shippingAddress?: string;
}