import { NextResponse } from "next/server"
// proxy.js - Middleware for route protection based on authentication and roles
import { getToken } from "next-auth/jwt"
// import { NextRequest } from "next/server"

export async function proxy(req) {
    const token = await getToken({ req })
    const { pathname } = req.nextUrl

    // Public routes
    //   const publicRoutes = ["/login", "/register"]
    const isPublicRoute =
        pathname === "/login" ||
        pathname === "/register"

    // If user is NOT authenticated
    if (!token) {
        if (!isPublicRoute) {
            return NextResponse.redirect(new URL("/login", req.url))
        }
        return NextResponse.next()
    }

    const userRole = token.role

    // Admin route protection
    if (pathname.startsWith("/admin") && userRole !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // User route protection
    if (pathname.startsWith("/dashboard") && userRole !== "user") {
        return NextResponse.redirect(new URL("/admin", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register"],
}