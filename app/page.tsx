"use client";

import { useEffect, useMemo, useState } from "react";

const PHONE = "+964 770 796 0430";
const WHATSAPP = "9647707960430";
const MAPS_URL = "https://maps.app.goo.gl/fBqgMW5TnXktTKfp7?g_st=ac";

const services = [
  ["العلاج التحفظي", "حشوات وعلاج التسوس", "tooth"],
  ["علاج العصب", "معالجة جذور الأسنان", "spark"],
  ["تركيبات الأسنان", "تيجان وجسور ثابتة ومتحركة", "crown"],
  ["تجميل الأسنان", "ابتسامة أكثر جمالًا", "star"],
  ["تنظيف الأسنان", "عناية دورية لصحة أفضل", "shine"],
  ["خلع الأسنان", "بإجراءات آمنة ومريحة", "shield"],
] as const;

const slots = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "4:00", "4:30", "5:00", "5:30", "6:00", "6:30", "7:00", "7:30", "8:00", "8:30", "9:00", "9:30"];

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "phone") return <svg {...common}><path d="M6.5 3.5 9 3l2 5-2 1.5a14 14 0 0 0 5.5 5.5L16 13l5 2-.5 2.5A3 3 0 0 1 17.5 20 14.5 14.5 0 0 1 4 6.5 3 3 0 0 1 6.5 3.5Z" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" /></svg>;
  if (name === "location") return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === "check") return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
  if (name === "tooth") return <svg {...common}><path d="M7.5 4.5c1.4-.9 2.7-.2 4.5.4 1.8-.6 3.1-1.3 4.5-.4 2.6 1.7 1.5 4.3.7 6.2-.7 1.7-.5 5.8-2.3 6.5-1.6.6-2.1-2.7-2.9-4.3-.8-1.6-1.7-1.6-2.5 0-.8 1.6-1.3 4.9-2.9 4.3-1.8-.7-1.6-4.8-2.3-6.5-.8-1.9-1.9-4.5.7-6.2Z" /></svg>;
  if (name === "spark" || name === "star") return <svg {...common}><path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Z" /></svg>;
  if (name === "crown") return <svg {...common}><path d="m4 8 4 3 4-6 4 6 4-3-1.5 10h-13L4 8Z" /><path d="M5 21h14" /></svg>;
  if (name === "shine") return <svg {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="3.5" /></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="8" /></svg>;
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", date: "", time: "", patientType: "new", purpose: "" });
  const [availability, setAvailability] = useState<Record<string,string>>({});
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setBookingOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { if (!form.date) return; fetch(`/api/availability?date=${encodeURIComponent(form.date)}`).then(r => r.json()).then(data => { const next: Record<string,string> = {}; for (const slot of data.slots ?? []) next[String(slot.start_time).slice(0,5)] = slot.status; setAvailability(next); }).catch(() => setAvailability({})); }, [form.date]);

  const openWhatsApp = (message: string) => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  const submitBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/bookings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { window.alert(data.error || "تعذر حفظ الحجز"); return; }
    const code = data.booking?.request_code || "";
    const message = "السلام عليكم، تم تسجيل طلب حجز حقيقي.%0Aرقم الطلب: " + code + "%0Aالاسم: " + form.fullName + "%0Aالهاتف: " + form.phone + "%0Aالتاريخ: " + form.date + "%0Aالوقت: " + form.time;
    setSent(true);
    openWhatsApp(message);
  };

  return <main>
    <header className="site-header">
      <a href="#home" className="header-brand" aria-label="عيادة الدكتور حيدر رغد">
        <img src="/brand/logo-display.png" alt="عيادة الدكتور حيدر رغد" />
      </a>
      <nav className="desktop-nav" aria-label="التنقل الرئيسي">
        <a href="#home">الرئيسية</a><a href="#services">الخدمات</a><a href="#about">عن العيادة</a><a href="#contact">تواصل معنا</a>
      </nav>
      <a className="header-call" href={`tel:${PHONE.replaceAll(" ", "")}`}><Icon name="phone" size={18} /><span>اتصل الآن</span></a>
      <button className="menu-button" aria-label="فتح القائمة" onClick={() => setMenuOpen(true)}><Icon name="menu" /></button>
    </header>

    {menuOpen && <div className="menu-overlay" onMouseDown={(e) => { if (e.currentTarget === e.target) setMenuOpen(false); }}><aside className="mobile-menu"><button className="close-button" onClick={() => setMenuOpen(false)} aria-label="إغلاق"><Icon name="close" /></button><img src="/brand/logo-display.png" alt="" className="menu-logo" /><nav><a href="#home" onClick={() => setMenuOpen(false)}>الرئيسية</a><a href="#services" onClick={() => setMenuOpen(false)}>الخدمات</a><a href="#about" onClick={() => setMenuOpen(false)}>عن العيادة</a><a href="#contact" onClick={() => setMenuOpen(false)}>الموقع والتواصل</a></nav><button className="primary-button menu-cta" onClick={() => { setMenuOpen(false); setBookingOpen(true); }}>احجز موعدك الآن <Icon name="arrow" size={18} /></button></aside></div>}

    <section id="home" className="hero section-wrap">
      <div className="hero-copy"><span className="eyebrow"><i /> عناية هادئة. نتيجة واضحة.</span><h1>العناية بابتسامتك<br /><em>تبدأ من هنا</em></h1><p>رعاية متكاملة لصحة وجمال الأسنان، بخطة واضحة وتجربة مريحة من الحجز وحتى المتابعة.</p><div className="hero-actions"><button className="primary-button" onClick={() => setBookingOpen(true)}>احجز موعدك الآن <Icon name="arrow" size={19} /></button><a className="secondary-button" href={`tel:${PHONE.replaceAll(" ", "")}`}><Icon name="phone" size={18} /> اتصل بالعيادة</a></div><div className="hero-note"><span><Icon name="shield" size={17} /> خصوصيتك محفوظة</span><span><Icon name="clock" size={17} /> السبت — الخميس</span></div></div>
      <div className="hero-visual" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientY - r.top) / r.height - .5) * -8, y: ((e.clientX - r.left) / r.width - .5) * 8 }); }} onPointerLeave={() => setTilt({ x: 0, y: 0 })}><div className="hero-frame" style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}><img src="/hero/tooth-ribbon.webp" alt="سن أبيض يلتف حوله شريط أخضر" /><span className="visual-tag visual-tag--top">تصميم بصري<br /><b>مميز وهادئ</b></span><span className="visual-tag visual-tag--bottom"><b>HR</b><small>Dental Clinic</small></span></div><div className="visual-shadow" /></div>
      <div className="hero-index"><span>01</span><i /><span>عيادة الدكتور حيدر رغد</span></div>
    </section>

    <section id="about" className="intro section-wrap"><div><span className="eyebrow">رعاية تبدأ بالإنصات</span><h2>ابتسامة أكثر<br /><em>لحياة أجمل</em></h2></div><p>نؤمن أن زيارة طبيب الأسنان يجب أن تكون واضحة ومريحة. لذلك نبدأ بفهم احتياجك، نشرح الخيارات، ونضع خطة تناسبك.</p></section>

    <section id="services" className="services section-wrap"><div className="section-heading"><div><span className="eyebrow">ما نقدمه</span><h2>خدمات العيادة</h2></div><p>خدمات أساسية للعناية بصحة الأسنان وجمالها، بمتابعة مباشرة وواضحة.</p></div><div className="service-grid">{services.map(([title, detail, icon], index) => <article className="service-card" key={title}><span className="service-number">0{index + 1}</span><div className="service-icon"><Icon name={icon} size={25} /></div><h3>{title}</h3><p>{detail}</p><a href="#appointment" onClick={(e) => { e.preventDefault(); setBookingOpen(true); }}>احجز استشارة <Icon name="arrow" size={16} /></a></article>)}</div></section>

    <section id="contact" className="contact section-wrap"><div className="contact-card"><span className="eyebrow">أين تجدنا</span><h2>قريبون منك<br /><em>في بغداد — الحرية</em></h2><p>دور نواب الضباط، قرب صيدلية طواحين الهواء.</p><a href={MAPS_URL} target="_blank" rel="noreferrer" className="secondary-button"><Icon name="location" size={18} /> افتح الموقع في الخريطة</a></div><div className="contact-details"><div><Icon name="phone" size={24} /><span>اتصل بالعيادة<strong dir="ltr">{PHONE}</strong></span></div><div><Icon name="clock" size={24} /><span>أوقات الدوام<strong>10 ص — 1 م&nbsp; | &nbsp;4 م — 11 م</strong><small>طوال أيام الأسبوع عدا الجمعة</small></span></div><div><Icon name="calendar" size={24} /><span>احجز في الوقت الذي يناسبك<strong>نستقبل طلبك عبر واتساب</strong></span></div></div></section>

    <section id="appointment" className="appointment section-wrap"><div className="appointment-copy"><span className="eyebrow">خطوتك الأولى</span><h2>موعدك يبدأ<br /><em>برسالة بسيطة</em></h2><p>اختر اليوم والوقت المناسبين، وسنرسل طلب الموعد مباشرة إلى واتساب العيادة للتأكيد.</p></div><button className="primary-button appointment-button" onClick={() => setBookingOpen(true)}>ابدأ حجز الموعد <Icon name="arrow" size={19} /></button></section>

    <footer className="site-footer section-wrap"><img src="/brand/logo-display.png" alt="عيادة الدكتور حيدر رغد" /><div><p>ابتسامة أكثر لحياة أجمل</p><small>© {new Date().getFullYear()} Dr. Haider Raghad Dental Clinic</small></div><a href="#home">العودة للأعلى ↑</a></footer>

    <nav className="bottom-nav" aria-label="التنقل السريع"><a href="#home"><span>⌂</span>الرئيسية</a><a href="#services"><Icon name="tooth" size={20} />الخدمات</a><button onClick={() => setBookingOpen(true)}><Icon name="calendar" size={20} />حجز موعد</button><a href="#contact"><Icon name="phone" size={20} />تواصل</a></nav>

    {bookingOpen && <div className="booking-overlay" onMouseDown={(e) => { if (e.currentTarget === e.target) setBookingOpen(false); }}><section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="close-button" onClick={() => setBookingOpen(false)} aria-label="إغلاق"><Icon name="close" /></button>{sent ? <div className="booking-success"><div className="success-icon"><Icon name="check" size={32} /></div><span className="eyebrow">تم إرسال الطلب</span><h2>شكرًا، وصلنا طلبك</h2><p>سيتم فتح واتساب لإكمال التواصل مع العيادة وتأكيد الموعد.</p><button className="primary-button" onClick={() => { setSent(false); setBookingOpen(false); }}>العودة للموقع</button></div> : <><span className="eyebrow">حجز موعد</span><h2 id="booking-title">اختر ما يناسبك</h2><p className="modal-intro">املأ البيانات الأساسية، ثم أرسل طلبك عبر واتساب.</p><form onSubmit={submitBooking}><label>الاسم الكامل<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="اكتب اسمك الكامل" /></label><label>رقم الهاتف<input required inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0770 000 0000" /></label><div className="form-row"><label>اليوم<input required type="date" min={minDate} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>الوقت<select required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}><option value="">اختر الوقت</option>{slots.map((slot) => { const status = availability[slot]; return <option key={slot} value={slot} disabled={Boolean(status && status !== "available")}>{slot}{status && status !== "available" ? " — محجوز" : " — متاح"}</option>; })}</select></label></div><label>نوع المراجع<select value={form.patientType} onChange={(e) => setForm({ ...form, patientType: e.target.value })}><option value="new">مريض جديد</option><option value="returning">مراجع سابق</option></select></label><label>الغرض من الجلسة <span className="optional">اختياري</span><input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="مثال: فحص، تنظيف، ألم" /></label><button className="primary-button form-submit" type="submit">إرسال طلب الموعد <Icon name="arrow" size={18} /></button></form></>}</section></div>}
  </main>;
}
