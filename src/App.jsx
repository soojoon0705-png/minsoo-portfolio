import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import { Menu, X, ChevronDown, ArrowUpRight, MoveHorizontal } from 'lucide-react';
// ✨ Three.js 부품들
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** * 1. 마그네틱(자석) 버튼 컴포넌트 */
function Magnetic({ children }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };
  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className="inline-block">
      {children}
    </motion.div>
  );
}

/** * 2. 3D 틸트(기울기) 프로젝트 카드 컴포넌트 */
function ProjectCard({ project, lang, projectEnter, projectLeave, index }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [7, -7]);
  const rotateY = useTransform(x, [-100, 100], [-7, 7]);

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0); y.set(0);
    projectLeave();
  }

  return (
    <motion.div 
      ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onMouseEnter={projectEnter}
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, margin: "-50px" }}
      style={{ perspective: 1000 }} className="group relative cursor-pointer"
    >
      <motion.div style={{ rotateX, rotateY }} className="aspect-[16/9] bg-neutral-900 mb-4 md:mb-5 overflow-hidden relative border border-white/5 grayscale group-hover:grayscale-0 transition-colors duration-700 ease-out">
        <img src={project.img} className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] origin-center" alt={project.title} />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
      </motion.div>
      <div className="flex flex-col pr-4 relative">
        <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter text-white group-hover:text-white/80 transition-colors">{project.title}</h4>
        <p className="text-white/40 text-[10px] md:text-[11px] font-medium tracking-widest uppercase mt-1">{project.type[lang]}</p>
        <ArrowUpRight size={18} className="absolute top-0 right-0 opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out hidden md:block" />
      </div>
    </motion.div>
  );
}

const GrainOverlay = () => (
  <div className="fixed inset-0 z-[99] pointer-events-none opacity-[0.03] contrast-150 brightness-100 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_filmgrain.gif')]"></div>
);

const customEase = [0.16, 1, 0.3, 1];

/** * ✨ NEW 3. 기하학적 와이어프레임 큐브 (단 하나) * (AI 느낌 방지용: 미세하고 부드러운 쫀득한 회전) */
function ColoristCube({ mouse }) {
  const cubeRef = useRef();
  // 💡 레퍼런스의 geometric한 형태를 위해 큐브 와이어프레임을 생성
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2)), []);

  useFrame((state) => {
    // 💡 마우스 위치 수집
    const mouseX = state.mouse.x; // normalized -1 to 1
    const mouseY = state.mouse.y; // normalized -1 to 1

    // 💡 미세하고 부드러운 회전 (Damping 적용)
    // THREE.MathUtils.lerp를 사용하여 쫀득한 느낌을 줌
    cubeRef.current.rotation.y = THREE.MathUtils.lerp(cubeRef.current.rotation.y, mouseX * 0.25, 0.05); // Y축 회전 (좌우)
    cubeRef.current.rotation.x = THREE.MathUtils.lerp(cubeRef.current.rotation.x, -mouseY * 0.25, 0.05); // X축 회전 (상하)
  });

  return (
    // scale을 살짝 키워서 텍스트를 감싸는 느낌을 줌
    <group ref={cubeRef} scale={1.2}>
      {/* 레퍼런스의 와이어프레임 형태를 구현 */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial 
          color="#242252" // 테마 컬러 사용
          linewidth={1.5} // 선 두께 조절 ( Three.js는 linewidth 1까지만 지원하는 경우가 많지만 시각적 효과를 위해)
          transparent
          opacity={0.8} // 은은한 존재감
        />
      </lineSegments>
      {/* 💡 고급스러움 추가: 미세한 앰비언트 글로우를 큐브 안에 추가 */}
      <mesh scale={1.05}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#242252" transparent opacity={0.03} blending={THREE.AdditiveBlending} depthWrite={false}/>
      </mesh>
    </group>
  );
}

function InteractiveCubeBackground({ mouse }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }}>
        {/* Minimalist lighting for lines */}
        <ambientLight intensity={0.2} />
        <ColoristCube mouse={mouse} />
      </Canvas>
    </div>
  );
}

const translations = {
  ko: { role: "컬러리스트", navWork: "작업", navAbout: "소개", scroll: "스크롤하여 탐색", capture1: "본질을", capture2: "포착하다", captureDesc: "영상에 감정을 불어넣고 서사를 완성하는 시네마틱 룩을 추구합니다.\n전문적인 컬러 사이언스를 기반으로 시각적 완성도의 정점을 지향합니다.", worksTitle: "작업물.", process: "공정 요약", drag: "드래그", ediTitle: "본질에\n집중하는 시선", ediP1: "저는 화려함보다는 본질에 집중하는 법을 배웠습니다.\n\n남들보다 특별하지 않았던 그 환경은 역설적으로 제가 만들어내는 모든 프레임에 더욱 신중을 기하게 만드는 밑거름이 되었습니다.", ediP2: "이제 세상은 단순히 화려한 색감의 풍요로움이 아니라, 우리가 소비하는 영상 속에 담긴 의도적이고 건강한 가치를 필요로 합니다.", ediQuote: "의도를 담아\n세상을 구축하다", footer: "서울 — © 2026 KIM MINSOO." },
  en: { role: "COLORIST", navWork: "WORK", navAbout: "ABOUT", scroll: "Scroll to explore", capture1: "CAPTURING", capture2: "PURE EMOTION", captureDesc: "Pursuing a cinematic look that breathes emotion into the narrative.\nAiming for the pinnacle of visual perfection based on professional color science.", worksTitle: "WORKS.", process: "Process Breakdown", drag: "Drag", ediTitle: "A Gaze Focused\nOn The Essence", ediP1: "I learned to focus on the essence rather than the flashiness.\n\nGrowing up in an ordinary environment paradoxically became the foundation that makes me more deliberate with every frame I create.", ediP2: "The world today needs intentional and healthy values embedded in the media we consume, not just an abundance of colorful visuals.", ediQuote: "Build the world\nwith intention", footer: "Based in Seoul, KR — © 2026 KIM MINSOO." }
};

const projects = [
  { title: "Urban Drift", type: { ko: "커머셜", en: "Commercial" }, img: "https://images.unsplash.com/photo-1492691523567-6170c24e5fb9?q=80&w=2070&auto=format&fit=crop" },
  { title: "After Dawn", type: { ko: "뮤직비디오", en: "Music Video" }, img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop" },
  { title: "Inner Space", type: { ko: "단편 영화", en: "Narrative Short" }, img: "https://images.unsplash.com/photo-1598910408581-9b19e248b991?q=80&w=2070&auto=format&fit=crop" },
  { title: "Metropolis", type: { ko: "다큐멘터리", en: "Documentary" }, img: "https://images.unsplash.com/photo-1514565446604-1672323a505f?q=80&w=2070&auto=format&fit=crop" },
];

function BeforeAfterSlider({ dragText }) {
  const [position, setPosition] = useState(50);
  const logImage = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop&blur=10&grayscale=1"; 
  const gradedImage = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[4/3] md:aspect-video overflow-hidden group border border-white/10 rounded-sm">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${gradedImage})` }} />
      <div className="absolute inset-0 bg-cover bg-center border-r border-white/50" style={{ backgroundImage: `url(${logImage})`, width: `${position}%` }} />
      <input type="range" min="0" max="100" value={position} onChange={(e) => setPosition(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
      <div className="absolute inset-y-0 w-px bg-white mix-blend-difference pointer-events-none z-10 transition-all duration-75 ease-out" style={{ left: `${position}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-black transition-transform duration-300 group-hover:scale-110">
          <MoveHorizontal size={20} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState('en'); 
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const t = translations[lang]; 
  const videoList = ["/지하철.mp4", "/노을.mp4", "/집안.mp4"]; 

  const [cursorVariant, setCursorVariant] = useState("default");
  const mouseX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);
  const fastX = useSpring(mouseX, { stiffness: 500, damping: 28 });
  const fastY = useSpring(mouseY, { stiffness: 500, damping: 28 });

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 12) + 2;
      if (current >= 100) {
        setLoadingProgress(100);
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 800);
      } else { setLoadingProgress(current); }
    }, 40);

    const mouseMoveHandler = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    document.body.style.overflow = (isMenuOpen || isLoading) ? 'hidden' : 'unset';
    window.addEventListener("mousemove", mouseMoveHandler);
    return () => { clearInterval(interval); window.removeEventListener("mousemove", mouseMoveHandler); };
  }, [isMenuOpen, isLoading]);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.15]);
  const titleY = useTransform(scrollYProgress, [0.1, 0.4], [50, -50]); 

  const cursorVariants = {
    default: { opacity: 1, height: 10, width: 10, backgroundColor: "#ffffff", transition: { duration: 0.2, ease: customEase } },
    project: { opacity: 1, height: 90, width: 90, backgroundColor: "#ffffff", color: "#000000", transition: { duration: 0.3, ease: customEase } },
  };

  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const revealUp = { hidden: { y: "100%" }, show: { y: "0%", transition: { duration: 1, ease: customEase } } };

  return (
    <div className="w-full relative bg-[#0a0a0a] text-white font-sans overflow-x-hidden whitespace-pre-wrap md:cursor-none selection:bg-white/30">
      <GrainOverlay />

      {/* 프리로더 */}
      <AnimatePresence>
        {isLoading && (
          <motion.div exit={{ opacity: 0, y: "-100%" }} transition={{ duration: 0.8, ease: customEase }} className="fixed inset-0 z-[300] bg-[#0a0a0a] flex flex-col items-center justify-center">
            <div className="text-[25vw] md:text-[15vw] font-black italic tracking-tighter leading-none">{loadingProgress}%</div>
            <div className="text-[10px] font-bold tracking-[0.4em] uppercase mt-4 opacity-40 text-white">Loading KIM MINSOO</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:block fixed top-1/2 -translate-y-1/2 right-4 w-[3px] h-[80vh] z-[150] pointer-events-none mix-blend-difference bg-white/20 rounded-full overflow-hidden">
        <motion.div className="w-full bg-white rounded-full" style={{ height: "100%", scaleY: scrollYProgress, originY: 0 }} />
      </div>

      <motion.div
        className="hidden md:flex fixed top-0 left-0 rounded-full pointer-events-none z-[999] items-center justify-center mix-blend-difference"
        style={{ left: fastX, top: fastY, x: "-50%", y: "-50%" }}
        variants={cursorVariants} animate={cursorVariant}
      >
        <AnimatePresence>{cursorVariant === "project" && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black tracking-widest text-black">VIEW</motion.span>
        )}</AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: customEase }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center cursor-default p-6">
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 flex items-center gap-2 font-bold text-xs tracking-widest hover:opacity-50 transition-opacity">CLOSE <X size={24} /></button>
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-8 md:gap-10 text-center md:text-left">
              <div className="overflow-hidden"><motion.h3 variants={revealUp} onClick={() => setIsMenuOpen(false)} className="text-5xl md:text-8xl font-black tracking-tighter opacity-30 hover:opacity-100 transition-all cursor-pointer">{t.navWork}</motion.h3></div>
              <div className="overflow-hidden"><motion.h3 variants={revealUp} onClick={() => setIsMenuOpen(false)} className="text-5xl md:text-8xl font-black tracking-tighter opacity-30 hover:opacity-100 transition-all cursor-pointer">{t.navAbout}</motion.h3></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative w-full h-[100svh] bg-black overflow-hidden" onMouseEnter={() => setCursorVariant("default")}>
        <motion.video 
          key={videoList[0]} style={{ scale: heroScale }} autoPlay muted playsInline loop
          className="absolute inset-0 w-full h-full object-cover z-0 grayscale-[0.3] opacity-60 transition-opacity duration-1000"
        >
          <source src={videoList[0]} type="video/mp4" />
        </motion.video>

        <header className="absolute top-0 left-0 w-full px-6 md:px-8 py-8 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center z-20 gap-6 md:gap-0">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8, ease: customEase }} className="text-xl font-black tracking-tighter uppercase leading-none italic cursor-pointer mix-blend-difference">
            KIM MINSOO <br /><span className="text-[10px] not-italic opacity-40 tracking-[0.3em]">{t.role}</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1, ease: customEase }} className="flex items-center gap-6 md:gap-10 text-[10px] font-bold tracking-[0.3em] self-end md:self-auto absolute top-8 right-6 md:static mix-blend-difference">
            <Magnetic><span className="hidden md:inline cursor-pointer hover:opacity-50 transition-opacity px-2 py-1">{t.navWork}</span></Magnetic>
            <Magnetic><span className="hidden md:inline cursor-pointer hover:opacity-50 transition-opacity px-2 py-1">{t.navAbout}</span></Magnetic>
            <div className="flex gap-2 px-2">
              <span className={`cursor-pointer transition-opacity ${lang === 'ko' ? 'text-white' : 'opacity-40 hover:opacity-80'}`} onClick={() => setLang('ko')}>KO</span>
              <span className={`cursor-pointer transition-opacity ${lang === 'en' ? 'text-white' : 'opacity-40 hover:opacity-80'}`} onClick={() => setLang('en')}>EN</span>
            </div>
            <Magnetic><button onClick={() => setIsMenuOpen(true)} className="cursor-pointer transition-transform p-2"><Menu size={28} strokeWidth={1} /></button></Magnetic>
          </motion.div>
        </header>

        <motion.div style={{ opacity: heroOpacity }} className="absolute bottom-10 right-6 md:left-0 md:right-auto md:w-full flex flex-col items-end md:items-center z-20 text-white/50 pointer-events-none mix-blend-difference">
          <ChevronDown size={24} className="animate-bounce" />
          <span className="text-[9px] tracking-[0.3em] uppercase mt-2 hidden md:block">{t.scroll}</span>
        </motion.div>
      </section>

      {/* --- ✨ CAP트처링 퓨어 이모션 WITH NEW STYLIZED CUBE --- */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] py-32 md:py-40 px-6 overflow-hidden relative selection:bg-[#242252]/40" onMouseEnter={() => setCursorVariant("default")}>
        
        {/* 🔥 NEW: 기하학적 와이어프레임 큐브 Canvas */}
        <InteractiveCubeBackground mouse={mouseX} />

        {/* 텍스트는 큐브보다 위에 나오도록 z-10 적용 */}
        <motion.div style={{ y: titleY }} className="text-center max-w-5xl relative z-10">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}>
            <h2 className="text-4xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-tight flex flex-col items-center mix-blend-difference">
              <div className="overflow-hidden"><motion.span variants={revealUp} className="block text-white drop-shadow-2xl">{t.capture1}</motion.span></div>
              <div className="overflow-hidden"><motion.span variants={revealUp} className="block text-[#242252] drop-shadow-2xl">{t.capture2}</motion.span></div>
            </h2>
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 1.5, ease: customEase }} viewport={{ once: true }} className="w-16 md:w-20 h-px bg-[#242252] mx-auto my-10 md:my-12 opacity-50 origin-center"></motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 0.6, y: 0 }} transition={{ duration: 1, delay: 0.4, ease: customEase }} viewport={{ once: true }} className="text-[#D8CFBC] text-xs md:text-lg font-medium leading-loose md:max-w-xl mx-auto mix-blend-difference">
            {t.captureDesc}
          </motion.p>
        </motion.div>
      </section>

      <section className="py-20 md:py-40 px-6 md:px-10 bg-[#0a0a0a] relative z-10" onMouseEnter={() => setCursorVariant("default")}>
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-16 md:pt-20">
          <h2 className="text-5xl md:text-[10vw] font-black uppercase tracking-tighter text-white mb-16 md:mb-32 leading-none">{t.worksTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {projects.map((project, i) => (
              <ProjectCard key={i} project={project} lang={lang} index={i} projectEnter={() => setCursorVariant("project")} projectLeave={() => setCursorVariant("default")} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-40 bg-[#0a0a0a] relative z-10" onMouseEnter={() => setCursorVariant("default")}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }} className="max-w-7xl mx-auto px-6 md:px-10 text-center relative">
          <h3 className="text-[10px] md:text-xs font-black tracking-[0.5em] uppercase opacity-20 mb-12 md:mb-20">{t.process}</h3>
          <BeforeAfterSlider dragText={t.drag} />
        </motion.div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-10 bg-[#FFFBF4] text-[#0a0a0a] relative z-10" onMouseEnter={() => setCursorVariant("default")}>
        <div className="max-w-7xl mx-auto pt-10 md:pt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-20 mb-20 md:mb-32">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: customEase }} viewport={{ once: true }} className="text-xl md:text-3xl font-black tracking-tight leading-tight">{t.ediTitle}</motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 0.8, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: customEase }} viewport={{ once: true }} className="text-xs md:text-sm leading-loose font-medium">{t.ediP1}</motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 0.8, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: customEase }} viewport={{ once: true }} className="text-xs md:text-sm leading-loose font-medium relative">{t.ediP2}</motion.div>
          </div>
          <div className="border-t border-dashed border-[#0a0a0a]/30 mb-16 md:mb-20"></div>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: customEase }} viewport={{ once: true }} className="text-4xl md:text-[6vw] font-black tracking-tighter mb-16 md:mb-20 leading-tight">{t.ediQuote}</motion.h2>
          <div className="flex flex-wrap gap-4 md:gap-10 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
            {['Instagram', 'Vimeo', 'Email'].map((item) => (
              <Magnetic key={item}>
                <a href="#" className="block relative overflow-hidden group px-8 py-4 border border-black/20 rounded-full cursor-pointer hover:border-black transition-colors duration-300">
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">{item}</span>
                  <div className="absolute inset-0 bg-black translate-y-[100%] rounded-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"></div>
                </a>
              </Magnetic>
            ))}
          </div>
        </div>
      </section>

      <footer className="p-10 md:p-20 bg-[#0a0a0a] text-center text-[8px] md:text-[10px] font-bold tracking-[0.4em] uppercase opacity-20 relative z-10" onMouseEnter={() => setCursorVariant("default")}>{t.footer}</footer>
    </div>
  );
}