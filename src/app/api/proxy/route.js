import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

async function handler(req, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("service_provider_token")?.value;

    // Get path from dynamic route params or query
    const { searchParams } = new URL(req.url);
    let path = params?.path ? `/${params.path.join('/')}` : searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Missing target API path" },
        { status: 400 }
      );
    }

    // Clean and build target URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    searchParams.delete("path"); // Remove path param if it exists
    const queryString = searchParams.toString();
    const targetUrl = `${API_BASE_URL}${cleanPath}${queryString ? `?${queryString}` : ""}`;

    console.log(`Proxying ${req.method} request to: ${targetUrl}`);

    // Prepare headers
    const headers = {
      "Content-Type": req.headers.get("content-type") || "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["Cookie"] = `service_provider_token=${token}`;
    } else {
      console.warn("No authentication token found in cookies");
    }

    // Forward other relevant headers
    const relevantHeaders = [
      "user-agent", "accept", "accept-language",
      "x-forwarded-for", "x-real-ip"
    ];

    relevantHeaders.forEach(headerName => {
      const headerValue = req.headers.get(headerName);
      if (headerValue) {
        headers[headerName] = headerValue;
      }
    });

    let body;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = JSON.stringify(await req.json());
      } else if (contentType.includes("multipart/form-data")) {
        body = await req.formData();
      } else {
        body = await req.text();
      }
    }

    // Make the request to backend
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    // Handle different content types
    const contentType = backendRes.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      try {
        data = await backendRes.json();
      } catch (error) {
        console.log(error);
        data = await backendRes.text();
      }
    } else {
      data = await backendRes.text();
    }

    // Forward response headers if needed
    const responseHeaders = new Headers();

    // Copy relevant headers from backend response
    const headersToForward = [
      "content-type", "cache-control", "etag",
      "last-modified", "set-cookie"
    ];

    headersToForward.forEach(headerName => {
      const headerValue = backendRes.headers.get(headerName);
      if (headerValue) {
        responseHeaders.set(headerName, headerValue);
      }
    });

    return new NextResponse(
      contentType?.includes("application/json") ? JSON.stringify(data) : data,
      {
        status: backendRes.status,
        statusText: backendRes.statusText,
        headers: responseHeaders,
      }
    );

  } catch (error) {
    console.error("Proxy handler error:", error);

    // Handle timeout errors
    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: "Request timeout" },
        { status: 504 }
      );
    }

    // Handle network errors
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: "Backend service unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Proxy request failed",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;