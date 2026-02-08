import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Only admin user - Scott and Kayleigh will register as genuine clients via the Dr Green API
const TEST_USERS = [
  {
    email: "admin@healingbuds.test",
    password: "Admin123!",
    fullName: "Admin User",
    createClient: true,
    isKycVerified: true,
    adminApproval: "VERIFIED",
    kycLink: null,
    role: "admin",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results: Array<{ email: string; status: string; userId?: string; error?: string }> = [];

    for (const testUser of TEST_USERS) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find((u) => u.email === testUser.email);

        let userId: string;

        if (existingUser) {
          // Update existing user password and verify email
          const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              password: testUser.password,
              email_confirm: true,
            }
          );
          if (updateError) throw updateError;
          userId = existingUser.id;
          console.log(`Updated existing user: ${testUser.email}`);
        } else {
          // Create new user with verified email
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: testUser.email,
            password: testUser.password,
            email_confirm: true,
            user_metadata: { full_name: testUser.fullName },
          });
          if (createError) throw createError;
          userId = newUser.user.id;
          console.log(`Created new user: ${testUser.email}`);
        }

        // Upsert profile
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .upsert(
            { id: userId, full_name: testUser.fullName },
            { onConflict: "id" }
          );
        if (profileError) {
          console.error(`Profile error for ${testUser.email}:`, profileError);
        }

        // Upsert drgreen_client (only if createClient is true)
        if (testUser.createClient) {
          const { error: clientError } = await supabaseAdmin
            .from("drgreen_clients")
            .upsert(
              {
                user_id: userId,
                drgreen_client_id: `test-${userId.slice(0, 8)}`,
                is_kyc_verified: testUser.isKycVerified,
                admin_approval: testUser.adminApproval,
                kyc_link: testUser.kycLink,
                country_code: "PT",
              },
              { onConflict: "user_id" }
            );
          if (clientError) {
            console.error(`Client error for ${testUser.email}:`, clientError);
          }
        }

        // Assign role if needed
        if (testUser.role) {
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .upsert(
              { user_id: userId, role: testUser.role },
              { onConflict: "user_id,role" }
            );
          if (roleError) {
            console.error(`Role error for ${testUser.email}:`, roleError);
          }
        }

        results.push({ email: testUser.email, status: "success", userId });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error(`Error processing ${testUser.email}:`, errorMessage);
        results.push({ email: testUser.email, status: "error", error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Seed error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
