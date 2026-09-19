export function hasSession(request: Request) {
  return request.headers.get('cookie')?.includes('session=valid') ?? false;
}

export function hasAdminSession(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';
  return cookie.includes('session=valid') && decodeURIComponent(cookie).includes('session-role=Admin');
}
