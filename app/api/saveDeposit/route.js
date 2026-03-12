// app/api/saveDeposit/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectToDB } from "@/lib/connectDB";

import InternalDeposit from "@/models/InternalDeposit";
import ExternalDeposit from "@/models/ExternalDeposit";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    const type = body?.type?.trim()?.toLowerCase();

    await connectToDB();

    let savedDeposit;

    /* --------------------------------
       INTERNAL DEPOSIT
    -------------------------------- */
    if (type === "internal") {

      if (!body.token || !body.network || !body.amount || !body.walletId) {
        return NextResponse.json(
          { error: "Missing required internal deposit fields" },
          { status: 400 }
        );
      }

      savedDeposit = await InternalDeposit.create({
        userId,
        token: body.token,
        network: body.network,
        amount: Number(body.amount),
        walletId: body.walletId,
        transactionPin: body.transactionPin || null,
        status: "pending",
      });

    }

    /* --------------------------------
       EXTERNAL DEPOSIT
    -------------------------------- */
    else if (type === "external") {

      if (!body.token || !body.network || !body.amount || !body.walletAddress) {
        return NextResponse.json(
          { error: "Missing required external deposit fields" },
          { status: 400 }
        );
      }

      savedDeposit = await ExternalDeposit.create({
        userId,
        token: body.token,
        network: body.network,
        amount: Number(body.amount),
        walletAddress: body.walletAddress,
        status: "pending",
      });

    }

    /* --------------------------------
       INVALID TYPE
    -------------------------------- */
    else {
      return NextResponse.json(
        { error: "Invalid deposit type" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        deposit: savedDeposit,
      },
      { status: 201 }
    );

  } catch (err) {

    console.error("[saveDeposit] Error:", err);

    /* --------------------------------
       MONGOOSE VALIDATION ERROR
    -------------------------------- */
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");

      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Could not save deposit. Please try again." },
      { status: 500 }
    );
  }
}