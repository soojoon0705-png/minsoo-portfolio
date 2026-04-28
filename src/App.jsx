import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import { Menu, X, ChevronDown, ArrowUpRight } from 'lucide-react';

/** * 1. 필름 그레인 오버레이 */
const GrainOverlay = () => (
  <div className="fixed inset-0 z-[99] pointer-events-none opacity-[0.03] contrast-150 brightness-100 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_filmgrain.gif')]"></div>
);

/** * 2. 다국어 텍스트 데이터 사전 */
const translations = {
  ko: {
    role: "컬러리스트", navWork: "작업", navAbout: "소개", scroll: "스크롤하여 탐색",
    capture1: "본질을", capture2: "포착하다",
    captureDesc: "영상에 감정을 불어넣고 서사를 완성하는 시네마틱 룩을 추구합니다.\n전문적인 컬러 사이언스를 기반으로 시각적 완성도의 정점을 지향합니다.",
    worksTitle: "작업물.", process: "공정 요약", drag: "드래그",
    ediTitle: "본질에\n집중하는 시선",
    ediP1: "저는 화려함보다는 본질에 집중하는 법을 배웠습니다.\n\n남들보다 특별하지 않았던 그 환경은 역설적으로 제가 만들어내는 모든 프레임에 더욱 신중을 기하게 만드는 밑거름이 되었습니다.",
    ediP2: "이제 세상은 단순히 화려한 색감의 풍요로움이 아니라, 우리가 소비하는 영상 속에 담긴 의도적이고 건강한 가치를 필요로 합니다.",
    ediQuote: "의도를 담아\n세상을 구축하다", footer: "서울 — © 2026 개인 아카이브."
  },
  en: {
    role: "COLORIST", navWork: "WORK", navAbout: "ABOUT", scroll: "Scroll to explore",
    capture1: "CAPTURING", capture2: "PURE EMOTION",
    captureDesc: "Pursuing a cinematic look that breathes emotion into the narrative.\nAiming for the pinnacle of visual perfection based on professional color science.",
    worksTitle: "WORKS.", process: "Process Breakdown", drag: "Drag",
    ediTitle: "A Gaze Focused\nOn The Essence",
    ediP1: "I learned to focus on the essence rather than the flashiness.\n\nGrowing up in an ordinary environment paradoxically became the foundation that makes me more deliberate with every frame I create.",
    ediP2: "The world today needs intentional and healthy values embedded in the media we consume, not just an abundance of colorful visuals.",
    ediQuote: "Build the world\nwith intention", footer: "Based in Seoul, KR — © 2026 Personal Archive."
  }
};

const projects = [
  { title: "Urban Drift", type: { ko: "커머셜", en: "Commercial" }, img: "https://images.unsplash.com/photo-1492691523567-6170c24e5fb9?q=80&w=2070&auto=format&fit=crop" },
  { title: "After Dawn", type: { ko: "뮤직비디오", en: "Music Video" }, img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop" },
  { title: "Inner Space", type: { ko: "단편 영화", en: "Narrative Short" }, img: "https://images.unsplash.com/photo-1598910408581-9b19e248b991?q=80&w=2070&auto=format&fit=crop" },
  { title: "Metropolis", type: { ko: "다큐멘터리", en: "Documentary" }, img: "https://images.unsplash.com/photo-1514565446604-1672323a505f?q=80&w=2070&auto=format&fit=crop" },
];

/** * 3. 비포/애프터 슬라이더 컴포넌트 */
function BeforeAfterSlider({ dragText }) {
  const [position, setPosition] = useState(50);
  const logImage = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop&blur=10&grayscale=1"; 
  const gradedImage = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-video overflow-hidden group border border-white/10">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${gradedImage})` }} />
      <div className="absolute inset-0 bg-cover bg-center border-r border-white/50" style={{ backgroundImage: `url(${logImage})`, width: `${position}%` }} />
      <input type="range" min="0" max="100" value={position} onChange={(e) => setPosition(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
      <div className="absolute top-1/2 -translate-y-1/2 w-px h-full bg-white/50 pointer-events-none z-10" style={{ left: `${position}%` }}>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">{dragText}</span>
      </div>
    </div>
  );
}

/** * 4. 메인 앱 컴포넌트 */
export default function App() {
  const { scrollYProgress } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  const [lang, setLang] = useState('en'); 
  const t = translations[lang]; 
  const videoList = ["/지하철.mp4", "/노을.mp4", "/집안.mp4"]; 

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [cursorVariant, setCursorVariant] = useState("default");
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const smoothX = useSpring(mouseX, { stiffness: 500, damping: 28 });
  const smoothY = useSpring(mouseY, { stiffness: 500, damping: 28 });

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 12) + 2;
      if (current >= 100) {
        current = 100;
        setLoadingProgress(current);
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 800); 
      } else {
        setLoadingProgress(current);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isMenuOpen || isLoading) ? 'hidden' : 'unset';

    const mouseMoveHandler = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    window.addEventListener("mousemove", mouseMoveHandler);
    return () => window.removeEventListener("mousemove", mouseMoveHandler);
  }, [isMenuOpen, isLoading, mouseX, mouseY]);

  const projectEnter = () => setCursorVariant("project");
  const projectLeave = () => setCursorVariant("default");

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.15]);
  const titleY = useTransform(scrollYProgress, [0.1, 0.4], [100, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  const cursorVariants = {
    default: { opacity: 1, height: 10, width: 10, backgroundColor: "#ffffff" },
    project: { opacity: 1, height: 90, width: 90, backgroundColor: "#ffffff", color: "#000000" },
    hidden: { opacity: 0 }
  };

  return (
    <div className="w-full relative bg-[#0a0a0a] text-white font-sans overflow-x-hidden whitespace-pre-wrap cursor-none">
      <GrainOverlay />

      {/* --- 1. 시네마틱 프리로더 --- */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col items-center justify-center text-white"
          >
            <div className="text-[15vw] font-black tracking-tighter leading-none italic">
              {loadingProgress}%
            </div>
            <div className="text-[10px] font-bold tracking-[0.4em] uppercase mt-4 opacity-50">
              Loading Portfolio
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💡 2. 우측 스크롤 진행 바 (여백 추가 및 플로팅 디자인 적용) */}
      <div className="fixed top-1/2 -translate-y-1/2 right-4 w-[3px] h-[90vh] z-[150] pointer-events-none mix-blend-difference bg-white/20 rounded-full overflow-hidden">
        <motion.div 
          className="w-full bg-white rounded-full"
          style={{ height: "100%", scaleY: scrollYProgress, originY: 0 }}
        />
      </div>

      {/* 커스텀 마우스 커서 */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[999] flex items-center justify-center mix-blend-difference"
        style={{ left: smoothX, top: smoothY, x: "-50%", y: "-50%" }}
        variants={cursorVariants}
        animate={cursorVariant}
      >
        <AnimatePresence>
          {cursorVariant === "project" && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-black"
            >
              VIEW
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- 메뉴 오버레이 --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center cursor-default">
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white flex items-center gap-2 tracking-[0.3em] font-bold text-xs cursor-pointer">CLOSE <X size={20} /></button>
            <div className="w-full max-w-6xl px-10 flex flex-col gap-10">
              <h3 className="text-5xl md:text-8xl font-black tracking-tighter text-white/30 hover:text-white transition-all cursor-pointer">{t.navWork}</h3>
              <h3 className="text-5xl md:text-8xl font-black tracking-tighter text-white/30 hover:text-white transition-all cursor-pointer">{t.navAbout}</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 1. HERO SECTION --- */}
      <section className="relative w-full h-screen bg-black overflow-hidden" onMouseEnter={() => setCursorVariant("default")}>
        <motion.video 
          key={videoList[currentVideoIndex]} style={{ scale: heroScale }}
          autoPlay muted playsInline onEnded={() => setCurrentVideoIndex((p) => (p + 1) % videoList.length)}
          className="absolute inset-0 w-full h-full object-cover z-0 grayscale-[0.3] opacity-60"
        >
          <source src={videoList[currentVideoIndex]} type="video/mp4" />
        </motion.video>

        <header className="absolute top-0 left-0 w-full px-8 py-10 flex justify-between items-center z-20">
          <div className="text-xl font-black tracking-tighter uppercase leading-none italic cursor-pointer">
            KIM MINSOO <br /><span className="text-[10px] not-italic opacity-40 tracking-[0.3em]">{t.role}</span>
          </div>
          <div className="flex items-center gap-10 text-[10px] font-bold tracking-[0.3em] pr-4">
            <span className="cursor-pointer hover:text-[#242252]">{t.navWork}</span>
            <span className="cursor-pointer hover:text-[#242252]">{t.navAbout}</span>
            
            <div className="flex gap-2">
              <span className={`cursor-pointer transition-colors ${lang === 'ko' ? 'text-[#242252]' : 'hover:text-[#242252]'}`} onClick={() => setLang('ko')}>KO</span>
              <span>|</span>
              <span className={`cursor-pointer transition-colors ${lang === 'en' ? 'text-[#242252]' : 'hover:text-[#242252]'}`} onClick={() => setLang('en')}>EN</span>
            </div>
            
            <button onClick={() => setIsMenuOpen(true)} className="cursor-pointer"><Menu size={28} strokeWidth={1} className="hover:text-[#242252] transition-colors" /></button>
          </div>
        </header>

        <motion.div style={{ opacity: heroOpacity }} className="absolute bottom-10 left-8 flex flex-col gap-2 text-xs md:text-sm font-bold tracking-[0.2em] text-white/40 z-20">
          <a href="mailto:soojoon0705@naver.com" className="hover:text-white transition-colors cursor-pointer uppercase">SOOJOON0705@NAVER.COM</a>
          <a href="tel:+821074007782" className="hover:text-white transition-colors cursor-pointer">+82 10 7400 7782</a>
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="absolute bottom-10 left-0 w-full flex flex-col items-center z-20 text-white/50 pointer-events-none text-center">
          <ChevronDown size={24} className="animate-bounce" />
          <span className="text-[9px] tracking-[0.3em] uppercase mt-2">{t.scroll}</span>
        </motion.div>
      </section>

      {/* --- 2. CAPTURING PURE EMOTION --- */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] py-40 overflow-hidden" onMouseEnter={() => setCursorVariant("default")}>
        <motion.div style={{ y: titleY, opacity: titleOpacity }} className="text-center px-10 z-10 max-w-5xl relative">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-tight">
            <span className="text-white">{t.capture1}</span> <br />
            <span className="text-[#242252]">{t.capture2}</span>
          </h2>
          <div className="w-20 h-px bg-[#242252] mx-auto my-12 opacity-50"></div>
          <p className="text-[#D8CFBC] text-sm md:text-lg font-medium leading-loose max-w-xl mx-auto opacity-60">
            {t.captureDesc}
          </p>
        </motion.div>
      </section>

      {/* --- 3. WORKS SECTION --- */}
      <section className="py-40 px-10 bg-[#0a0a0a]" onMouseEnter={() => setCursorVariant("default")}>
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-20">
          <h2 className="text-7xl md:text-[10vw] font-black uppercase tracking-tighter text-white mb-32 leading-none">{t.worksTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {projects.map((project, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }} 
                className="group relative cursor-pointer"
                onMouseEnter={projectEnter}
                onMouseLeave={projectLeave}
              >
                <div className="aspect-[16/9] bg-neutral-900 mb-5 overflow-hidden relative border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img src={project.img} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={project.title} />
                  <div className="absolute inset-0 bg-accentPurple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col gap-1 pr-4 relative">
                  <h4 className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-accentPurple">{project.title}</h4>
                  <p className="text-bone/50 text-[11px] font-medium tracking-widest uppercase opacity-70">{project.type[lang]}</p>
                  <ArrowUpRight size={18} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#242252]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. BREAKDOWN --- */}
      <section className="py-40 bg-[#0a0a0a]" onMouseEnter={() => setCursorVariant("default")}>
        <div className="max-w-7xl mx-auto px-10 text-center relative pr-4">
          <h3 className="text-xs font-black tracking-[0.5em] uppercase opacity-20 mb-20">{t.process}</h3>
          <BeforeAfterSlider dragText={t.drag} />
        </div>
      </section>

      {/* --- 5. END SECTION --- */}
      <section className="py-32 px-10 bg-[#FFFBF4] text-[#0a0a0a]" onMouseEnter={() => setCursorVariant("default")}>
        <div className="max-w-7xl mx-auto pt-20 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-20 mb-32">
            <div className="text-2xl md:text-3xl font-black tracking-tight leading-tight">{t.ediTitle}</div>
            <div className="text-xs md:text-sm leading-loose opacity-80 font-medium">{t.ediP1}</div>
            <div className="text-xs md:text-sm leading-loose opacity-80 font-medium relative">
              {t.ediP2}
              <div className="mt-8 opacity-40 pointer-events-none">
                <svg width="200" height="40" viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10,30 Q40,5 90,20 T180,10" fill="transparent" stroke="#0a0a0a" strokeWidth="1"/>
                  <path d="M20,25 Q70,10 160,35" fill="transparent" stroke="#0a0a0a" strokeWidth="0.5"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-[#0a0a0a]/30 mb-20"></div>

          <h2 className="text-[9vw] md:text-[6vw] font-black tracking-tighter mb-20 leading-tight">
            {t.ediQuote}
          </h2>

          <div className="flex gap-10 text-xs font-bold tracking-[0.2em] uppercase">
            <a href="#" className="hover:opacity-50 transition-opacity p-2 border border-[#0a0a0a]/10 rounded-full cursor-pointer">Instagram</a>
            <a href="#" className="hover:opacity-50 transition-opacity p-2 border border-[#0a0a0a]/10 rounded-full cursor-pointer">Vimeo</a>
            <a href="mailto:soojoon0705@naver.com" className="hover:opacity-50 transition-opacity p-2 border border-[#0a0a0a]/10 rounded-full cursor-pointer">Email</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-20 bg-[#0a0a0a] text-center text-[10px] font-bold tracking-[0.4em] uppercase opacity-20" onMouseEnter={() => setCursorVariant("default")}>{t.footer}</footer>
    </div>
  );
}