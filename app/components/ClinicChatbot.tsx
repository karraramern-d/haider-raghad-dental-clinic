"use client";

import { FormEvent, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type RecognitionError = { error?: string };
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionError) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type VoiceWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

export default function ClinicChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "أهلاً وسهلاً 🌿\nأگدر أساعدك بمعلومات الدوام، الموقع، الحجز أو التواصل ويّا العيادة.",
    },
  ]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      window.alert("قراءة الصوت غير مدعومة بهذا المتصفح. جرّب Google Chrome.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-IQ";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    const arabicVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const send = async (event?: FormEvent, preset?: string) => {
    event?.preventDefault();
    const content = (preset ?? input).trim();
    if (!content || loading) return;

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      const answer = data.message || "تعذر الرد حالياً.";
      setMessages([...next, { role: "assistant", content: answer }]);
      speak(answer);
    } catch {
      const answer = "تعذر الاتصال حالياً. تواصل ويّانا عبر واتساب.";
      setMessages([...next, { role: "assistant", content: answer }]);
      speak(answer);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const voiceWindow = window as VoiceWindow;
    const Recognition =
      voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;

    if (!Recognition) {
      window.alert("التحدث الصوتي غير مدعوم بهذا المتصفح. افتح الموقع بآخر إصدار من Google Chrome.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "ar-IQ";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript?.trim();
      if (text) {
        setInput(text);
        void send(undefined, text);
      }
    };
    recognition.onerror = (event) => {
      setListening(false);
      recognitionRef.current = null;
      const message =
        event.error === "not-allowed"
          ? "اسمح للمتصفح باستخدام المايك من إعدادات الموقع."
          : event.error === "no-speech"
            ? "ما سمعت صوتك. جرّب تحچي مرة ثانية."
            : "تعذر تشغيل المايك. تأكد من اتصالك وصلاحية المايك.";
      window.alert(message);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      recognitionRef.current = null;
      window.alert("الميكروفون قيد الاستخدام حالياً. جرّب مرة ثانية.");
    }
  };

  const close = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setListening(false);
    setSpeaking(false);
    setOpen(false);
  };

  return (
    <>
      <button className="chat-trigger" onClick={() => setOpen(true)} aria-label="فتح مساعد العيادة">
        <span className="chat-trigger-icon">✦</span>
        <span><b>مساعد العيادة</b><small>اسألني بأي وقت</small></span>
        <i>↗</i>
      </button>

      {open && (
        <div className="chat-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}>
          <section className="chat-panel" role="dialog" aria-modal="true" aria-labelledby="chat-title">
            <header className="chat-header">
              <div className="chat-profile">
                <span className="chat-avatar">✦</span>
                <span><strong id="chat-title">مساعد العيادة</strong><small><em /> متصل الآن · عراقي</small></span>
              </div>
              <button className="chat-close" onClick={close} aria-label="إغلاق">×</button>
            </header>

            <div className="chat-welcome">
              <span>🤍</span>
              <div><strong>شلون أساعدك؟</strong><small>اكتب سؤالك أو احچي، وأنا أجاوبك</small></div>
            </div>

            <div className="chat-messages">
              {messages.map((message, index) => (
                <div className={`chat-message-wrap ${message.role}`} key={`${message.role}-${index}`}>
                  <div className={`chat-message ${message.role}`}>
                    {message.content}
                    {message.role === "assistant" && (
                      <button className="chat-speak" onClick={() => speak(message.content)} aria-label="تشغيل الرد صوتياً">
                        {speaking ? "🔊" : "🔈"}
                      </button>
                    )}
                  </div>
                  {message.role === "assistant" && index === 0 && <small className="chat-time">الآن</small>}
                </div>
              ))}
              {loading && <div className="chat-message assistant chat-loading"><span className="typing-dots"><i /><i /><i /></span> دا أرتبلك الجواب…</div>}
            </div>

            <div className="chat-shortcuts">
              <button onClick={() => void send(undefined, "ما هي أوقات الدوام؟")}>⏰ أوقات الدوام</button>
              <button onClick={() => void send(undefined, "أين موقع العيادة؟")}>📍 الموقع</button>
              <button onClick={() => void send(undefined, "أريد حجز موعد")}>📅 الحجز</button>
            </div>

            <form className="chat-form" onSubmit={send}>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={listening ? "دا أسمعك… احچي هسه" : "اكتب رسالتك هنا..."} aria-label="رسالتك" />
              <button type="button" className={`chat-mic ${listening ? "listening" : ""}`} onClick={startListening} disabled={loading} aria-label={listening ? "إيقاف المايك" : "التحدث صوتياً"}>
                <span>{listening ? "■" : "⌕"}</span>
              </button>
              <button type="submit" className="chat-send" disabled={loading || !input.trim()} aria-label="إرسال">➤</button>
            </form>
            <div className="chat-footer-note">{speaking ? "🔊 دا أقرأ الرد…" : "المساعد يفهم اللهجة العراقية"}</div>
            <a className="chat-whatsapp" href="https://wa.me/9647707960430" target="_blank" rel="noreferrer">تواصل مباشرة عبر واتساب <span>↗</span></a>
          </section>
        </div>
      )}
    </>
  );
}
