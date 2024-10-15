import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { email, password } = await req.json();
      if (email !== process.env.EMAIL || password !== process.env.PASSWORD) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 400 }
        );
      }
      const payload = {
        email: email,
        password: password,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      return NextResponse.json({ token: token }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
};
