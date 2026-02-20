import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature and credit user account
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    // Validate
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
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

    // Get order details from database
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Order already processed' },
        { status: 400 }
      );
    }

    // Update order status
    const { error: updateOrderError } = await supabase
      .from('payment_orders')
      .update({
        status: 'completed',
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        completed_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateOrderError) {
      console.error('Order update error:', updateOrderError);
    }

    // Credit user account
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('credits_remaining')
      .eq('id', user.id)
      .single();

    const currentCredits = profile?.credits_remaining || 0;
    const newCredits = currentCredits + order.credits;

    const { error: creditError } = await supabase
      .from('users')
      .update({
        credits_remaining: newCredits,
        plan: order.plan_id,
      })
      .eq('id', user.id);

    if (creditError) {
      console.error('Credit update error:', creditError);
      return NextResponse.json(
        { error: 'Failed to credit account' },
        { status: 500 }
      );
    }

    // Create payment history record
    const { error: historyError } = await supabase
      .from('payment_history')
      .insert({
        user_id: user.id,
        order_id: order.id,
        amount: order.amount,
        credits: order.credits,
        plan_id: order.plan_id,
        payment_id: paymentId,
      });

    if (historyError) {
      console.error('History creation error:', historyError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and credits added',
      creditsAdded: order.credits,
      newBalance: newCredits,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}