import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = body?.Result;

    if (!result) return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const conversationId = result.ConversationID;
    const resultCode = result.ResultCode;

    if (resultCode === 0) {
      // Success
      await supabase
        .from('withdrawals')
        .update({ status: 'completed', processed_at: new Date().toISOString() })
        .eq('mpesa_transaction_id', conversationId);
    } else {
      // Failed — restore balance
      const { data: withdrawal } = await supabase
        .from('withdrawals')
        .select('user_id, amount_kes')
        .eq('mpesa_transaction_id', conversationId)
        .single();

      if (withdrawal) {
        await supabase.rpc('restore_balance', {
          p_user_id: withdrawal.user_id,
          p_amount: withdrawal.amount_kes,
        });
        await supabase
          .from('withdrawals')
          .update({ status: 'failed' })
          .eq('mpesa_transaction_id', conversationId);
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
