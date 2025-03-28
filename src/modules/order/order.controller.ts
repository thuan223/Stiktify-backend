import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Get, 
  Query, 
  Res,
  HttpStatus 
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateShippingInfoDto } from './dto/create-order.dto';
import { Response } from 'express';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.createOrder(createOrderDto);
    
    if (createOrderDto.paymentMethod === 'VNPAY') {
      const paymentUrl = await this.orderService.createVNPayPaymentUrl(order);
      return { order, paymentUrl };
    } else if (createOrderDto.paymentMethod === 'COD') {
      await this.orderService.processCODOrder(order._id.toString());
      return { order, message: 'COD Order created successfully' };
    }
  }

  @Get('vnpay-return')
  async vnpayReturn(@Query() queryParams: any, @Res() res: Response) {
    try {
      const order = await this.orderService.handleVNPayReturn(queryParams);
      
      // Redirect based on payment status
      if (order.status === 'completed') {
        return res.redirect('http://yourwebsite.com/payment-success');
      } else {
        return res.redirect('http://yourwebsite.com/payment-failed');
      }
    } catch (error) {
      return res.redirect('http://yourwebsite.com/payment-error');
    }
  }

  @Patch('/:id/status')
  async updateOrderStatus(
    @Param('id') orderId: string, 
    @Body() updateOrderStatusDto: UpdateOrderStatusDto
  ) {
    return await this.orderService.updateOrderStatus(orderId, updateOrderStatusDto);
  }

  @Patch('/:id/shipping')
  async updateShippingInfo(
    @Param('id') orderId: string, 
    @Body() updateShippingInfoDto: UpdateShippingInfoDto
  ) {
    return await this.orderService.updateShippingInfo(orderId, updateShippingInfoDto);
  }

  @Get()
  async getAllOrders() {
    return await this.orderService.getAllOrders();
  }
  
  @Get('/:id')
  async getOrderById(@Param('id') orderId: string) {
    return await this.orderService.getOrderById(orderId);
  }
// Get Order Products
  @Get('/:id/products')
async getOrderProducts(@Param('id') orderId: string) {
  return await this.orderService.getOrderProducts(orderId);
}

}