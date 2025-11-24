import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      logger.error('Supabase admin client not configured', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
      return NextResponse.json(
        { error: 'Database not configured. Check SUPABASE_SERVICE_ROLE_KEY environment variable.' },
        { status: 500 }
      )
    }

    // Fetch all KYC documents
    const { data, error } = await (supabaseAdmin as any)
      .from('kyc_documents')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      logger.error('Error fetching KYC documents', error, {
        errorCode: error.code,
        errorMessage: error.message,
      })
      return NextResponse.json(
        { error: 'Failed to fetch KYC documents', details: error.message },
        { status: 500 }
      )
    }

    logger.info('KYC documents fetched successfully', {
      count: data?.length || 0,
      pending: data?.filter((d: any) => d.status === 'PENDING').length || 0,
    })

    return NextResponse.json({
      success: true,
      documents: data || []
    })
  } catch (error: any) {
    logger.error('KYC list error', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
