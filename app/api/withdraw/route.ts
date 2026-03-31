import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function getMpesaToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const credentials = Buffer.from(`${key}:${secret}`).toString('base64');

  const env = process.env.MPESA_ENVIRONMENT === 'production' ? 'api' : 'sandbox';
  const res = await fetch(
    `https://${env}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, amountKes, method, phoneNumber } = await req.json();

    if (!userId || !amountKes || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate balance
    const { data: earnings } = await supabase
      .from('earnings')
      .select('available_balance_kes')
      .eq('user_id', userId)
      .single();

    if (!earnings || earnings.available_balance_kes < amountKes) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    if (amountKes < 50) {
      return NextResponse.json({ error: 'Minimum withdrawal is KES 50' }, { status: 400 });
    }

    // Create withdrawal record
    const { data: withdrawal, error: wError } = await supabase
      .from('withdrawals')
      .insert({ user_id: userId, amount_kes: amountKes, method, phone_number: phoneNumber, status: 'pending' })
      .select()
      .single();

    if (wError) throw wError;

    // Deduct balance immediately
    await supabase.rpc('deduct_balance', { p_user_id: userId, p_amount: amountKes });

    // Trigger M-Pesa B2C if method is mpesa
    if (method === 'mpesa' && process.env.MPESA_CONSUMER_KEY) {
      try {
        const token = await getMpesaToken();
        const env = process.env.MPESA_ENVIRONMENT === 'production' ? 'api' : 'sandbox';
        const phone = phoneNumber.startsWith('0') ? `254${phoneNumber.slice(1)}` : phoneNumber;

        const mpesaRes = await fetch(
          `https://${env}.safaricom.co.ke/mpesa/b2c/v1/paymentrequest`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              InitiatorName: process.env.MPESA_INITIATOR_NAME,
              SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
              CommandID: 'BusinessPayment',
              Amount: Math.floor(amountKes),
              PartyA: process.env.MPESA_SHORTCODE,
              PartyB: phone,
              Remarks: 'Vertex Creator Earnings',
              QueueTimeOutURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/timeout`,
              ResultURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/result`,
              Occasion: 'Creator Payout',
            }),
          }
        );

        const mpesaData = await mpesaRes.json();
        if (mpesaData.ResponseCode === '0') {
          await supabase
            .from('withdrawals')
            .update({ status: 'processing', mpesa_transaction_id: mpesaData.ConversationID })
            .eq('id', withdrawal.id);
        }
      } catch {
        // M-Pesa failed — mark as pending for manual processing
        await supabase.from('withdrawals').update({ status: 'pending' }).eq('id', withdrawal.id);
      }
    }

    return NextResponse.json({ success: true, withdrawalId: withdrawal.id });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
