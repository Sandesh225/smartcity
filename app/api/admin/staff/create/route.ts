// app/api/admin/staff/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStaffUser } from "@/lib/admin/users";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: role, error: roleError } = await supabase.rpc(
      "get_effective_role"
    );

    if (roleError || (role !== "admin" && role !== "super_admin")) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, fullName, phoneNumber, role: roleName } = body;

    if (!email || !fullName || !roleName) {
      return NextResponse.json(
        { error: "Missing required fields: email, fullName, role" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (roleName === "citizen") {
      return NextResponse.json(
        {
          error: "Cannot create citizen accounts through staff registration",
        },
        { status: 400 }
      );
    }

    const result = await createStaffUser({
      email,
      fullName,
      phoneNumber,
      roleName,
    });

    return NextResponse.json({
      success: true,
      userId: result.userId,
      tempPassword: result.tempPassword,
    });
  } catch (error: any) {
    console.error("Error creating staff user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
