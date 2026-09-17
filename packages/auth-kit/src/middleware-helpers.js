/**
 * Shared middleware helper for protecting admin/student routes by role.
 * NOTE (known learning from IELTS7+): verify with a direct console.log
 * that middleware is actually executing for your matcher pattern —
 * a bare "/dashboard" matcher behaves differently than "/dashboard/:path*".
 * Confirm protection isn't silently resting on page/layout-level checks instead.
 */
export function createRoleGuard({ protectedPrefix, requiredRole }) {
  return function guard(req, token) {
    if (!req.nextUrl.pathname.startsWith(protectedPrefix)) return true;
    return token?.role === requiredRole;
  };
}
