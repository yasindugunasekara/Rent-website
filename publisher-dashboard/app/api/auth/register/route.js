import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    const response = await fetch("http://localhost:5079/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    if (response.ok) {
      return NextResponse.json(
        { message: "User registered successfully" },
        { status: 201 }
      );
    } else {
      const errorData = await response.text();
      return NextResponse.json(
        { message: errorData || "Registration failed" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
