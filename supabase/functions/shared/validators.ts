export function buildErrorResponse(
  code: string,
  message: string,
  status = 400,
) {
  return new Response(JSON.stringify({ success: false, code, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function buildSuccessResponse(data: any, status = 200) {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
