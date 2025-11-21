import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assignRole, removeRole } from "@/lib/admin/users";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Verify admin role
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
    const { role_name, expires_at } = body;

    if (!role_name) {
      return NextResponse.json(
        { error: "role_name is required" },
        { status: 400 }
      );
    }

    const result = await assignRole(
      params.id,
      role_name,
      user.id,
      expires_at
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error assigning role:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Verify admin role
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

    const searchParams = request.nextUrl.searchParams;
    const roleId = searchParams.get("role_id");

    if (!roleId) {
      return NextResponse.json(
        { error: "role_id query parameter is required" },
        { status: 400 }
      );
    }

    await removeRole(params.id, roleId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing role:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}