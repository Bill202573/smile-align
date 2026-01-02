import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const testPatients = [
  { email: "maria.silva@teste.com", password: "Maria123!", name: "Maria Silva Santos" },
  { email: "joao.oliveira@teste.com", password: "Joao123!", name: "João Pedro Oliveira" },
  { email: "ana.lima@teste.com", password: "Ana123!", name: "Ana Carolina Lima" },
  { email: "carlos.souza@teste.com", password: "Carlos123!", name: "Carlos Eduardo Souza" },
  { email: "fernanda.reis@teste.com", password: "Fernanda123!", name: "Fernanda Costa Reis" },
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const patient of testPatients) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === patient.email);

      if (existingUser) {
        results.push({ email: patient.email, status: "already exists", userId: existingUser.id });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: patient.email,
        password: patient.password,
        email_confirm: true,
        user_metadata: { full_name: patient.name }
      });

      if (authError) {
        results.push({ email: patient.email, status: "error", error: authError.message });
        continue;
      }

      // Add patient role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: authData.user.id, role: "patient" });

      if (roleError) {
        results.push({ email: patient.email, status: "user created but role failed", error: roleError.message });
        continue;
      }

      results.push({ email: patient.email, status: "created", userId: authData.user.id });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
