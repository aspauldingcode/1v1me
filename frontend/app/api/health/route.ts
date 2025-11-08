export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Frontend API route is working on Vercel',
    timestamp: new Date().toISOString(),
  })
}


