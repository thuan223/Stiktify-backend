import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateShippingInfoDto } from './dto/create-order.dto';
import { createHash } from 'crypto';
import { format } from 'date-fns';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  // VNPAY Configuration
  private readonly vnpTmnCode = 'K5MJJP0Y';
  private readonly vnpHashSecret = 'CWEANXMYO6N2I8MTDKOSKVJ3HVIAB7RH';
  private readonly vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private readonly vnpReturnUrl = 'http://yourwebsite.com/order/vnpay-return'; // Update with your return URL

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = new this.orderModel({
      ...createOrderDto,
      userId: new Types.ObjectId(createOrderDto.userId),
      productId: new Types.ObjectId(createOrderDto.productId),
      status: 'pending',
      isPaid: false
    });

    return await newOrder.save();
  }

  async createVNPayPaymentUrl(order: Order): Promise<string> {
    const date = new Date();
    const createDate = format(date, 'yyyyMMddHHmmss');
    const orderId = order?._id.toString();
    const amount = order.amount * 100; // Convert to VND cents

    const ipAddr = '127.0.0.1'; // Replace with actual client IP

    const tmnCode = this.vnpTmnCode;
    const secretKey = this.vnpHashSecret;

    let vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan cho ma don hang ${orderId}`,
      vnp_Amount: amount,
      vnp_ReturnUrl: this.vnpReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sort parameters
    const sortedParams = Object.keys(vnpParams)
      .sort()
      .reduce((result, key) => {
        result[key] = vnpParams[key];
        return result;
      }, {});

    // Create signature
    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
    const hmac = createHash('sha512');
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnpParams['vnp_SecureHash'] = signed;

    // Build query string
    const queryParams = new URLSearchParams(vnpParams).toString();
    return `${this.vnpUrl}?${queryParams}`;
  }

  async handleVNPayReturn(queryParams: any): Promise<Order> {
    const { vnp_ResponseCode, vnp_TxnRef, vnp_Amount, vnp_SecureHash } = queryParams;

    // Verify signature
    const secureHash = queryParams.vnp_SecureHash;
    delete queryParams.vnp_SecureHash;

    const sortedParams = Object.keys(queryParams)
      .sort()
      .reduce((result, key) => {
        result[key] = queryParams[key];
        return result;
      }, {});

    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
    const hmac = createHash('sha512');
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      throw new BadRequestException('Invalid payment signature');
    }

    const order = await this.orderModel.findById(vnp_TxnRef);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (vnp_ResponseCode === '00') {
      order.status = 'completed';
      order.isPaid = true;
      await order.save();
    } else {
      order.status = 'failed';
      await order.save();
    }

    return order;
  }

  async updateOrderStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    return await this.orderModel.findByIdAndUpdate(
      orderId, 
      { status: updateOrderStatusDto.status }, 
      { new: true }
    );
  }

  async updateShippingInfo(orderId: string, updateShippingInfoDto: UpdateShippingInfoDto): Promise<Order> {
    return await this.orderModel.findByIdAndUpdate(
      orderId, 
      updateShippingInfoDto, 
      { new: true }
    );
  }

  async processCODOrder(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // For COD, mark as pending initially
    order.status = 'pending';
    order.isPaid = false;
    await order.save();

    return order;
  }
}