export const deploymentSurfaces = ["all", "public", "admin", "api"] as const;

export type DeploymentSurface = (typeof deploymentSurfaces)[number];

export function getDeploymentSurface(value = process.env.GVF_DEPLOYMENT_SURFACE): DeploymentSurface {
  return deploymentSurfaces.includes(value as DeploymentSurface) ? (value as DeploymentSurface) : "all";
}

function isApiPath(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

export function isLocalAuthenticationPath(pathname: string) {
  return pathname === "/api/oauth/start" || pathname === "/api/oauth/callback" || pathname === "/api/auth/logout";
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

export function allowsDeploymentPath(surface: DeploymentSurface, pathname: string) {
  if (surface === "all") return true;
  if (surface === "api") return isApiPath(pathname);
  if (surface === "public") return !isAdminPath(pathname);

  return pathname === "/access-required"
    || pathname === "/login"
    || pathname === "/register"
    || pathname === "/auth/confirm"
    || pathname === "/api/auth/me"
    || pathname === "/api/auth/magic-link"
    || pathname === "/api/auth/logout"
    || pathname === "/api/oauth/start"
    || pathname === "/api/oauth/callback"
    || isAdminPath(pathname);
}

export function getPostLoginPath(surface = getDeploymentSurface()) {
  return surface === "admin" ? "/admin" : "/my-donations";
}

export function getBackendOrigin(value = process.env.GVF_API_ORIGIN) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
