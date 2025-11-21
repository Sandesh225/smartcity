import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllUsers } from "@/lib/admin/users";

export async function GET(request: NextRequest) {
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

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || undefined;
    const roleFilter = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const ward_id = searchParams.get("ward_id") || undefined;

    const result = await getAllUsers({
      page,
      limit,
      search,
      role: roleFilter,
      status,
      ward_id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}