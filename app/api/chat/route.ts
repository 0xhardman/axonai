export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      stream: true,
    }),
  })

  // 确保响应成功
  if (!response.ok) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch from Deepseek API'
    }), { status: 500 })
  }

  // 创建一个 TransformStream 来处理数据
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let buffer = ''

  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      const text = decoder.decode(chunk)
      buffer += text
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

        const data = trimmedLine.slice(6) // 移除 'data: ' 前缀
        if (data === '[DONE]') continue

        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        } catch (e) {
          console.error('Error parsing JSON:', e)
          continue
        }
      }
    }
  })

  const stream = response.body!.pipeThrough(transformStream)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
