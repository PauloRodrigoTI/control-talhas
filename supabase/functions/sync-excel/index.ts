import { corsHeaders } from '@supabase/supabase-js/cors'

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/microsoft_excel';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const MICROSOFT_EXCEL_API_KEY = Deno.env.get('MICROSOFT_EXCEL_API_KEY');
  if (!MICROSOFT_EXCEL_API_KEY) {
    return new Response(JSON.stringify({ error: 'MICROSOFT_EXCEL_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const headers = {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'X-Connection-Api-Key': MICROSOFT_EXCEL_API_KEY,
    'Content-Type': 'application/json',
  };

  try {
    const body = await req.json();
    const { action, itemId, worksheetName } = body;

    if (action === 'list-files') {
      const res = await fetch(
        `${GATEWAY_URL}/me/drive/root/search(q='.xlsx')`,
        { headers }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(`List files failed [${res.status}]: ${JSON.stringify(data)}`);
      const files = (data.value || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        lastModified: f.lastModifiedDateTime,
      }));
      return new Response(JSON.stringify({ files }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list-worksheets') {
      if (!itemId) throw new Error('itemId is required');
      const res = await fetch(
        `${GATEWAY_URL}/me/drive/items/${itemId}/workbook/worksheets`,
        { headers }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(`List worksheets failed [${res.status}]: ${JSON.stringify(data)}`);
      const sheets = (data.value || []).map((s: any) => ({
        id: s.id,
        name: s.name,
      }));
      return new Response(JSON.stringify({ sheets }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'read-data') {
      if (!itemId) throw new Error('itemId is required');
      const sheetParam = worksheetName || 'Sheet1';
      const res = await fetch(
        `${GATEWAY_URL}/me/drive/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetParam)}/usedRange`,
        { headers }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(`Read data failed [${res.status}]: ${JSON.stringify(data)}`);
      return new Response(JSON.stringify({ values: data.values || [], address: data.address }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('sync-excel error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
