import { NextResponse } from "next/server";
import { supabaseRpc } from "@/app/lib/supabase-rest";
const SERVICE_ID="136061f7-db0a-420d-8edb-434c2244e67b";
export async function GET(request:Request){
 const date=new URL(request.url).searchParams.get("date");
 if(!date||!/^\d{4}-\d{2}-\d{2}$/.test(date))return NextResponse.json({error:"تاريخ غير صالح"},{status:400});
 try{return NextResponse.json({date,slots:await supabaseRpc("availability_grid_for",{p_service_id:SERVICE_ID,p_date:date})})}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"تعذر تحميل الأوقات"},{status:500})}
}
