import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, model, messages, options, stream, baseUrl } = body;
    
    // Allow overriding the Ollama host url via request, falling back to env or default
    const ollamaBaseUrl = baseUrl || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const targetUrl = `${ollamaBaseUrl}${endpoint || '/api/chat'}`;
    
    console.log(`Proxying request to Ollama at: ${targetUrl}`);
    
    const isGet = endpoint === '/api/tags';
    const response = await fetch(targetUrl, {
      method: isGet ? 'GET' : 'POST',
      headers: isGet ? {} : {
        'Content-Type': 'application/json',
      },
      body: isGet ? undefined : JSON.stringify({
        model: model || 'gemma2',
        messages,
        options,
        stream: stream !== undefined ? stream : false,
      }),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Ollama responded with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }
    
    // Support streaming response back to client
    if (stream) {
      const reader = response.body?.getReader();
      if (!reader) {
        return NextResponse.json({ error: 'Failed to get reader from Ollama stream' }, { status: 500 });
      }
      
      const customStream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } catch (e) {
            console.error('Stream read error:', e);
            controller.error(e);
          } finally {
            controller.close();
          }
        },
      });
      
      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Ollama Proxy Exception:', error);
    return NextResponse.json(
      { 
        error: `Could not connect to Ollama. Make sure Ollama is running and accessible. Details: ${error.message || error}` 
      },
      { status: 500 }
    );
  }
}
export async function GET() {
  // Can be used to check if the proxy is online
  return NextResponse.json({ status: 'Ollama Proxy is active' });
}
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Allow': 'POST, GET, OPTIONS',
    },
  });
}
