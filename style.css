:root {
    --primary: #5ff6ff;
    --bg: #05070f;
}

/* 基础 */
body {
    margin: 0;
    background: var(--bg);
    color: white;
    font-family: system-ui;
    overflow-x: hidden;
}

/* 3D层 */
#three-container {
    position: fixed;
    inset: 0;
    z-index: 0;
}

/* NAV */
.nav {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 1200px;
    z-index: 10;

    background: rgba(10,15,35,0.4);
    backdrop-filter: blur(10px);
    border-radius: 16px;
}

.nav__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
}

/* LOGO */
.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.logo__img {
    height: 30px;
    opacity: 0;
    transition: opacity 0.4s ease, transform 0.3s;
}

.logo__img[src] {
    opacity: 1;
}

.logo:hover .logo__img {
    transform: scale(1.1);
}

/* NAV ITEM */
.nav__menu {
    display: flex;
    gap: 20px;
}

.nav__item {
    opacity: 0.7;
    cursor: pointer;
}

.nav__item:hover {
    opacity: 1;
}

/* TOGGLE */
.toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.toggle__switch {
    width: 40px;
    height: 20px;
    background: #aaa;
    border-radius: 20px;
    position: relative;
}

.toggle__dot {
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: transform 0.3s;
}

body.machine-mode .toggle__dot {
    transform: translateX(20px);
}

body.machine-mode {
    --primary: #ff00ff;
}

/* HERO */
.hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero__title {
    font-size: 4rem;
}

/* 渐变稳定 */
.gradient-text {
    background: linear-gradient(90deg, #fff, var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    will-change: transform;
}

/* 能量核心 */
.hero__core {
    position: absolute;
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(95,246,255,0.2), transparent);
    filter: blur(30px);
}

/* PANEL */
.panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.7);
    padding: 20px;
    border-radius: 10px;
    display: none;
}
