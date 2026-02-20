import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payment/create-order
 * Create Razorpay order for payment
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { planId, amount, credits } = body;

    // Validate
    if (!planId || !amount || !credits) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise (₹199 = 19900 paise)
      currency: 'INR',
      receipt: `receipt_${uuidv4()}`,
      notes: {
        userId: user.id,
        planId,
        credits,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order to database
    const { error: orderError } = await supabase
      .from('payment_orders')
      .insert({
        id: order.id,
        user_id: user.id,
        plan_id: planId,
        amount,
        credits,
        status: 'created',
        razorpay_order_id: order.id,
      });

    if (orderError) {
      console.error('Order save error:', orderError);
      // Continue anyway - order is created in Razorpay
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}