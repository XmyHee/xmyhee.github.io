const { useState, useEffect } = React;
const { motion } = FramerMotion;

const App = () => {
    // 鼠标跟随坐标状态
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMove);
        if (window.lucide) window.lucide.createIcons();
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    return (
        <div className="min-h-screen relative">
            {/* 动态光效跟随 */}
            <div 
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(0, 240, 255, 0.05), transparent 80%)`
                }}
            />

            {/* 导航栏 */}
            <nav className="fixed top-0 w-full z-50 glass-nav px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4 logo-container">
                    <img src="./ChatGPT _001.png" alt="QuestFrontiers Logo" className="logo-img" />
                    <div className="h-4 w-[1px] bg-white/20 mx-1"></div>
                    <span className="font-bold tracking-tight text-xl">求索映界</span>
                </div>
                <div className="hidden md:flex gap-10 text-sm tracking-widest text-zinc-400">
                    <a href="#" className="hover:text-cyan-400 transition-colors">前沿疆域</a>
                    <a href="#" className="hover:text-cyan-400 transition-colors">映照引擎</a>
                    <a href="#" className="hover:text-cyan-400 transition-colors">解决方案</a>
                </div>
            </nav>

            {/* 首屏内容 */}
            <section className="h-screen flex items-center px-10 md:px-24">
                <div className="max-w-3xl z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-none tracking-tighter">
                            智识映照 <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                                专业求索
                            </span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-light">
                            在 AI 技术的边疆，我们将复杂的现实逻辑映射为精准的数字化决策。
                        </p>
                        <button className="px-10 py-4 bg-white text-black font-bold hover:bg-cyan-400 transition-all flex items-center gap-2 group">
                            联系专家 <i data-lucide="arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </motion.div>
                </div>

                {/* 背景装饰：多面体线条 */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <svg width="600" height="600" viewBox="0 0 200 200">
                        <defs>
                            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00F0FF" />
                                <stop offset="100%" stopColor="#5E5CE6" />
                            </linearGradient>
                        </defs>
                        <motion.path 
                            d="M100 20 L180 150 L20 150 Z" 
                            fill="none" 
                            stroke="url(#lineGrad)" 
                            strokeWidth="0.5"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.circle 
                            cx="100" cy="100" r="80" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.05)" 
                            strokeWidth="0.2" 
                        />
                    </svg>
                </div>
            </section>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
