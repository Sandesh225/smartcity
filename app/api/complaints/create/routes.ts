// =====================================================================
// app/api/complaints/create/route.ts
// =====================================================================
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";

const createComplaintSchema = z.object({
  category_id: z.string().uuid("Invalid category ID"),
  ward_id: z.string().uuid("Invalid ward ID"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500),
  location_address: z.string().min(3, "Address required").max(200),
  location_landmark: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createComplaintSchema.parse(body);

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      }
    );

    // ✅ Use getUser() instead of getSession()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call RPC to create complaint
    const { data, error } = await supabase.rpc("create_citizen_complaint", {
      p_category_id: validated.category_id,
      p_ward_id: validated.ward_id,
      p_title: validated.title,
      p_description: validated.description,
      p_location_address: validated.location_address,
      p_location_landmark: validated.location_landmark,
      p_latitude: validated.latitude,
      p_longitude: validated.longitude,
    });

    if (error) {
      console.error("Complaint creation error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create complaint" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        complaint: {
          id: data.id,
          tracking_id: data.tracking_id,
          status: data.status,
          created_at: data.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.errors },
        { status: 400 }
      );
    }

    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
