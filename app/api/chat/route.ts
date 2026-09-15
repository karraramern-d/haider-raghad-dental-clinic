import { NextResponse } from "next/server";

const replies = (text: string) => {
  const q = text.toLowerCase();
  if (/طوارئ|طارئ|ألم شديد|نزف|تورم/.test(q)) return "إذا عندك ألم شديد أو نزف أو تورم سريع، اتصل بالعيادة مباشرة على 0770 796 0430 ولا تؤجل طلب المساعدة.";
  if (/دوام|مفتوح|وقت/.test(q)) return "أوقات الدوام من السبت إلى الخميس: 10 صباحاً–1 ظهراً، و4 مساءً–10 مساءً. الجمعة عطلة.";
  if (/موقع|عنوان|وين/.test(q)) return "العيادة في بغداد – الحرية – دور نواب الضباط، قرب صيدلية طواحين الهواء.";
  if (/سعر|أسعار|كلفة/.test(q)) return "السعر يعتمد على الفحص والحالة ويحدده الدكتور بعد المعاينة. للاستفسار: 0770 796 0430.";
  if (/حجز|موعد/.test(q)) return "اضغط «احجز موعدك الآن»، اختر اليوم والوقت المتاح، ثم أرسل الطلب عبر واتساب. التأكيد النهائي من العيادة.";
  if (/واتساب|اتصال|رقم/.test(q)) return "للتواصل مع العيادة عبر الهاتف أو واتساب: 0770 796 0430.";
  return "أهلاً بك في عيادة الدكتور حيدر رغد 🌿 أگدر أساعدك بمعلومات الدوام، الموقع، الحجز، الخدمات أو التواصل.";
};

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const latest = String(Array.isArray(messages) ? messages.at(-1)?.content || "" : "").trim();
    if (!latest) return NextResponse.json({ error: "اكتب رسالتك أولاً" }, { status: 400 });
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ message: replies(latest), mode: "clinic" });
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system_instruction: { parts: [{ text: "أنت مساعد عيادة الدكتور حيدر رغد في بغداد - الحرية. أجب بالعربية العراقية باختصار. الدوام السبت إلى الخميس 10ص-1م و4م-10م، الجمعة عطلة. الحجز من الموقع والتأكيد من العيادة. لا تخترع أسعاراً أو مواعيد، ولا تشخص أو تصف دواء، ووجّه الطوارئ للاتصال 07707960430." }] }, contents: (messages || []).slice(-8).map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })), generationConfig: { temperature: 0.35, maxOutputTokens: 220 } }),
    });
    if (!response.ok) return NextResponse.json({ message: replies(latest), mode: "clinic" });
    const data = await response.json();
    return NextResponse.json({ message: data?.candidates?.[0]?.content?.parts?.[0]?.text || replies(latest), mode: "ai" });
  } catch { return NextResponse.json({ message: "تعذر الاتصال حالياً. تواصل معنا مباشرة عبر واتساب." }, { status: 200 }); }
}
