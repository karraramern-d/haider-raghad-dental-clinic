"use client";

import { FormEvent, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
  lang: string; interimResults: boolean; maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null; start: () => void; stop: () => void;
};
type VoiceWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

const MicIcon = ({ off = false }: { off?: boolean }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={off ? "M4 4l16 16M10 5.5a3 3 0 0 1 5 2.1v3M6.8 10v1.3a5.2 5.2 0 0 0 9 3.6M12 19v-2M8.5 19h7" : "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Zm6 8a6 6 0 0 1-12 0m6 6v4m-3 0h6"} /></svg>;
const SendIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 16 8-16 8 3-8-3-8Zm3 8h13" /></svg>;
const VolumeIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l5 4V6l-5 4H4Zm12-1a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12" /></svg>;

export default function ClinicChatbot() {
  const [open, setOpen] = useState(false), [input, setInput] = useState(""), [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false), [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "هلا بيك 🌿\nأني مساعد عيادة د. حيدر رغد. أگدر أساعدك بالدوام، الموقع والحجز." }]);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return window.alert("قراءة الصوت غير مدعومة. جرّب Google Chrome.");
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ar-IQ"; u.rate = .9;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("ar"));
    if (voice) u.voice = voice;
    u.onstart = () => setSpeaking(true); u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const send = async (event?: FormEvent, preset?: string) => {
    event?.preventDefault();
    const content = (preset ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await response.json(), answer = data.message || "تعذر الرد حالياً.";
      setMessages([...next, { role: "assistant", content: answer }]); speak(answer);
    } catch {
      const answer = "تعذر الاتصال حالياً. تواصل ويّانا عبر واتساب.";
      setMessages([...next, { role: "assistant", content: answer }]); speak(answer);
    } finally { setLoading(false); }
  };

  const toggleListening = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const w = window as VoiceWindow, RecognitionAPI = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!RecognitionAPI) return window.alert("التحدث الصوتي غير مدعوم. افتح الموقع بآخر إصدار من Google Chrome.");
    const recognition = new RecognitionAPI();
    recognition.lang = "ar-IQ"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onresult = (event) => { const text = event.results[0]?.[0]?.transcript?.trim(); if (text) { setInput(text); void send(undefined, text); } };
    recognition.onerror = (event) => {
      setListening(false); recognitionRef.current = null;
      window.alert(event.error === "not-allowed" ? "اسمح للموقع باستخدام المايك من إعدادات المتصفح." : event.error === "no-speech" ? "ما سمعت صوتك، حاول مرة ثانية." : "تعذر تشغيل المايك.");
    };
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognitionRef.current = recognition; setListening(true);
    try { recognition.start(); } catch { setListening(false); recognitionRef.current = null; }
  };

  const close = () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); setListening(false); setSpeaking(false); setOpen(false); };

  return <>
    <button className="chat-trigger" onClick={() => setOpen(true)} aria-label="فتح مساعد العيادة">
      <span className="chat-trigger-orb"><span /></span><span className="chat-trigger-copy"><b>مساعد العيادة</b><small>اسألني عن العيادة</small></span><span className="chat-trigger-arrow">↗</span>
    </button>
    {open && <div className="chat-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <section className="chat-panel" role="dialog" aria-modal="true" aria-labelledby="chat-title">
        <header className="chat-header">
          <div className="chat-profile"><span className="chat-avatar"><span /></span><span><strong id="chat-title">مساعد العيادة</strong><small><em /> متصل الآن · يتكلم عراقي</small></span></div>
          <button className="chat-close" onClick={close} aria-label="إغلاق">×</button>
        </header>
        <div className="chat-hero"><div className="chat-hero-icon">✦</div><div><strong>شلون أساعدك اليوم؟</strong><small>احچي براحتك أو اكتب سؤالك</small></div></div>
        <div className="chat-messages">
          {messages.map((m, i) => <div className={`chat-message-wrap ${m.role}`} key={`${m.role}-${i}`}><div className={`chat-message ${m.role}`}>{m.content}{m.role === "assistant" && <button className="chat-speak" onClick={() => speak(m.content)} aria-label="قراءة الرد"><VolumeIcon /></button>}</div>{m.role === "assistant" && <small className="chat-time">{i === 0 ? "الآن" : "مساعد العيادة"}</small>}</div>)}
          {loading && <div className="chat-message assistant chat-loading"><span className="typing-dots"><i /><i /><i /></span> دا أرتبلك الجواب…</div>}
        </div>
        <div className="chat-shortcuts"><button onClick={() => void send(undefined, "ما هي أوقات الدوام؟")}>أوقات الدوام</button><button onClick={() => void send(undefined, "أين موقع العيادة؟")}>موقع العيادة</button><button onClick={() => void send(undefined, "أريد حجز موعد")}>حجز موعد</button></div>
        <form className="chat-form" onSubmit={send}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={listening ? "احچي هسه… دا أسمعك" : "اكتب رسالتك هنا"} aria-label="رسالتك" />
          <button type="button" className={`chat-mic ${listening ? "listening" : ""}`} onClick={toggleListening} disabled={loading} aria-label={listening ? "إيقاف التسجيل" : "تحدث صوتياً"}><MicIcon off={!listening} /></button>
          <button type="submit" className="chat-send" disabled={loading || !input.trim()} aria-label="إرسال"><SendIcon /></button>
        </form>
        <div className={`chat-voice-state ${listening || speaking ? "active" : ""}`}>{listening ? <><span className="voice-bars"><i /><i /><i /><i /><i /></span> دا أسمعك…</> : speaking ? "🔊 دا أقرأ الرد" : "اضغط المايك واحچي باللهجة العراقية"}</div>
        <a className="chat-whatsapp" href="https://wa.me/9647707960430" target="_blank" rel="noreferrer">تواصل مباشرة عبر واتساب <span>↗</span></a>
      </section>
    </div>}
  </>;
}
