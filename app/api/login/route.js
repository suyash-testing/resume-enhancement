import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const POST = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { email, password } = await req.json();
      console.log(
        email,
        email === process.env.EMAIL,
        password,
        password === process.env.PASSWORD
      );

      if (email !== process.env.EMAIL || password !== process.env.PASSWORD) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 400 }
        );
      }
      const token = jwt.sign({ username: email }, process.env.JWT_SECRET, {});
      console.log(token, "token");
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
