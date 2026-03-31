import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CAR_PARTS = [
  {
    id: "front_wing",
    label: "Front Wing",
    description: "The front wing generates downforce to keep the car planted at the front axle.",
    importance: "It controls airflow under the car and to the sidepods. Even a 10mm change in angle can shift the car's balance completely.",
    position: new THREE.Vector3(2.6, -0.15, 0),
    color: 0xe63946,
  },
  {
    id: "rear_wing",
    label: "Rear Wing",
    description: "The rear wing creates massive downforce at the back of the car.",
    importance: "More wing = more grip in corners, less top speed on straights. Teams tune it differently for every circuit.",
    position: new THREE.Vector3(-2.6, 0.35, 0),
    color: 0xe63946,
  },
  {
    id: "engine",
    label: "Power Unit",
    description: "A 1.6L turbocharged V6 hybrid producing ~1000 horsepower.",
    importance: "The power unit is the heart of the car. It combines an internal combustion engine with two electric motors — MGU-K and MGU-H — for peak efficiency and performance.",
    position: new THREE.Vector3(-0.3, 0.05, 0),
    color: 0xffd700,
  },
  {
    id: "tires",
    label: "Tires",
    description: "Pirelli supplies five compounds — from hard to soft — each with different grip and wear characteristics.",
    importance: "Tires are the only contact point with the track. Tire management is often the single biggest factor in race strategy.",
    position: new THREE.Vector3(1.8, -0.45, 1.1),
    color: 0x888888,
  },
  {
    id: "cockpit",
    label: "Cockpit & Halo",
    description: "The driver sits in a custom carbon-fiber seat inside a survival cell. The Halo is a titanium safety structure above the cockpit.",
    importance: "The Halo has saved multiple lives since its introduction in 2018. The survival cell is designed to withstand 25G impacts.",
    position: new THREE.Vector3(0.4, 0.42, 0),
    color: 0x00b4d8,
  },
  {
    id: "floor",
    label: "Floor & Diffuser",
    description: "The floor creates ground effect — low pressure under the car sucks it to the track.",
    importance: "Since 2022 regulations, the floor generates more downforce than wings. A damaged floor can lose hundreds of kilograms of downforce instantly.",
    position: new THREE.Vector3(0, -0.5, 0),
    color: 0x2ec4b6,
  },
  {
    id: "sidepods",
    label: "Sidepods",
    description: "The sidepods house the radiators and direct airflow through and around the car.",
    importance: "Sidepod design is one of the biggest areas of differentiation between teams. Red Bull's 'zero sidepod' concept gave them a major aerodynamic advantage.",
    position: new THREE.Vector3(0, 0.05, 0.85),
    color: 0x9b5de5,
  },
];

const TEAMS = [
  {
    id: "redbull",
    name: "Red Bull Racing",
    color: "#3062B8",
    accentColor: "#CC1E2B",
    base: "Milton Keynes, UK",
    chassis: "RB21",
    engine: "Honda RBPTH002",
    championships: "6 Constructors' (incl. 2022–23)",
    bio: "The dominant force of the turbo-hybrid era. Known for aerodynamic innovation and Max Verstappen's historic run of championships.",
    drivers: [
      { name: "Max Verstappen", number: 1, nationality: "🇳🇱", championships: 4, wins: "63", podiums: "110+", bio: "Four-time world champion and the fastest qualifier in the modern era. Clinical, relentless, and the benchmark for every driver on the grid." },
      { name: "Sergio Pérez", number: 11, nationality: "🇲🇽", championships: 0, wins: "6", podiums: "40+", bio: "Veteran of 14 seasons, known for tire management and late-race heroics. Crucial for Red Bull's constructors' championship campaigns." },
    ],
  },
  {
    id: "ferrari",
    name: "Scuderia Ferrari",
    color: "#E8002D",
    accentColor: "#FFD700",
    base: "Maranello, Italy",
    chassis: "SF-25",
    engine: "Ferrari 066/14",
    championships: "16 Constructors' (most in F1 history)",
    bio: "The most iconic team in Formula 1. Tifosi worldwide follow every race. Hamilton's arrival in 2025 raised expectations massively.",
    drivers: [
      { name: "Lewis Hamilton", number: 44, nationality: "🇬🇧", championships: 7, wins: "104", podiums: "197", bio: "The most decorated driver in F1 history. Joined Ferrari in 2025 seeking an 8th title — the move that shocked the world." },
      { name: "Charles Leclerc", number: 16, nationality: "🇲🇨", championships: 0, wins: "8", podiums: "40+", bio: "Ferrari's homegrown star. Blistering one-lap pace and a fierce competitor, but hunting for his first championship." },
    ],
  },
  {
    id: "mclaren",
    name: "McLaren F1 Team",
    color: "#FF8000",
    accentColor: "#000000",
    base: "Woking, UK",
    chassis: "MCL39",
    engine: "Mercedes M16",
    championships: "8 Constructors' (last: 1998)",
    bio: "The great F1 comeback story. After years of struggle, McLaren rebuilt into a race-winning force — now a genuine title contender.",
    drivers: [
      { name: "Lando Norris", number: 4, nationality: "🇬🇧", championships: 0, wins: "6", podiums: "30+", bio: "The fan favourite turned genuine title contender. Quick, exciting to watch, and finally has the car to match his talent." },
      { name: "Oscar Piastri", number: 81, nationality: "🇦🇺", championships: 0, wins: "4", podiums: "20+", bio: "Rookie sensation turned race winner. Calm, precise and frighteningly fast — already one of the most complete drivers on the grid." },
    ],
  },
];

const CAR_STATS = [
  { label: "Power Output", value: "~1000 hp", icon: "⚡" },
  { label: "Top Speed", value: "375 km/h", icon: "🏎️" },
  { label: "0–100 km/h", value: "2.6 sec", icon: "⏱️" },
  { label: "Weight", value: "798 kg", icon: "⚖️" },
  { label: "Downforce", value: "3500+ kg", icon: "↓" },
  { label: "G-Force (corner)", value: "up to 6G", icon: "🌀" },
  { label: "Fuel Capacity", value: "110 kg", icon: "⛽" },
  { label: "Braking Distance", value: "17m @ 300km/h", icon: "🛑" },
];

function buildF1Car(scene, partsRef) {
  const mat = (color, opacity = 1) =>
    new THREE.MeshPhongMaterial({ color, opacity, transparent: opacity < 1, shininess: 120 });

  const bodyGeo = new THREE.BoxGeometry(4.2, 0.38, 0.7);
  const body = new THREE.Mesh(bodyGeo, mat(0x1a1a2e));
  body.position.set(-0.1, 0, 0);
  scene.add(body);

  const noseGeo = new THREE.CylinderGeometry(0.08, 0.28, 1.1, 8);
  const nose = new THREE.Mesh(noseGeo, mat(0x1a1a2e));
  nose.rotation.z = Math.PI / 2;
  nose.position.set(2.25, 0.02, 0);
  scene.add(nose);

  const cockpitGeo = new THREE.BoxGeometry(0.9, 0.32, 0.55);
  const cockpit = new THREE.Mesh(cockpitGeo, mat(0x16213e));
  cockpit.position.set(0.4, 0.33, 0);
  scene.add(cockpit);

  const haloShape = new THREE.TorusGeometry(0.28, 0.04, 8, 20, Math.PI);
  const halo = new THREE.Mesh(haloShape, mat(0xc0c0c0));
  halo.rotation.x = Math.PI / 2;
  halo.rotation.z = -Math.PI / 2;
  halo.position.set(0.4, 0.52, 0);
  scene.add(halo);

  const rearGeo = new THREE.BoxGeometry(1.6, 0.55, 0.62);
  const rear = new THREE.Mesh(rearGeo, mat(0x0f3460));
  rear.position.set(-1.2, 0.13, 0);
  scene.add(rear);

  const fwGeo = new THREE.BoxGeometry(0.12, 0.07, 1.8);
  const fw = new THREE.Mesh(fwGeo, mat(0xe63946));
  fw.position.set(2.62, -0.14, 0);
  scene.add(fw);

  [-0.9, 0.9].forEach((z) => {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.05), mat(0xe63946));
    ep.position.set(2.42, -0.1, z);
    scene.add(ep);
  });

  const rwGeo = new THREE.BoxGeometry(0.1, 0.08, 1.6);
  const rw = new THREE.Mesh(rwGeo, mat(0xe63946));
  rw.position.set(-2.6, 0.35, 0);
  scene.add(rw);

  [-0.8, 0.8].forEach((z) => {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.06), mat(0xe63946));
    ep.position.set(-2.6, 0.12, z);
    scene.add(ep);
  });

  const diffGeo = new THREE.BoxGeometry(0.9, 0.18, 0.72);
  const diff = new THREE.Mesh(diffGeo, mat(0x2ec4b6));
  diff.position.set(-2.05, -0.27, 0);
  scene.add(diff);

  [-1, 1].forEach((side) => {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.38, 0.32), mat(0x0d1b2a));
    sp.position.set(-0.15, 0.04, side * 0.65);
    scene.add(sp);
  });

  const floorGeo = new THREE.BoxGeometry(3.8, 0.05, 1.2);
  const floor = new THREE.Mesh(floorGeo, mat(0x111111));
  floor.position.set(-0.1, -0.2, 0);
  scene.add(floor);

  const wheelPositions = [
    [1.75, -0.44, 1.05], [1.75, -0.44, -1.05],
    [-1.65, -0.44, 1.0], [-1.65, -0.44, -1.0],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 20);
    const tire = new THREE.Mesh(tireGeo, mat(0x222222));
    tire.rotation.x = Math.PI / 2;
    tire.position.set(x, y, z);
    scene.add(tire);
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.33, 12);
    const rim = new THREE.Mesh(rimGeo, mat(0xcccccc));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, y, z);
    scene.add(rim);
  });

  [[1.75, -0.18, 0.55], [-1.65, -0.18, 0.55]].forEach(([x, y, z]) => {
    const sus = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), mat(0x888888));
    sus.rotation.z = Math.PI / 2;
    sus.position.set(x, y, z);
    scene.add(sus);
  });

  partsRef.current = [];
  CAR_PARTS.forEach((part) => {
    const hsGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const hsMat = new THREE.MeshPhongMaterial({
      color: part.color, transparent: true, opacity: 0.55,
      emissive: part.color, emissiveIntensity: 0.4,
    });
    const hs = new THREE.Mesh(hsGeo, hsMat);
    hs.position.copy(part.position);
    hs.userData = { partId: part.id };
    scene.add(hs);
    partsRef.current.push(hs);
  });
}

export default function App() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const partsRef = useRef([]);
  const frameRef = useRef(null);
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.18, y: 0 });
  const [hoveredPart, setHoveredPart] = useState(null);
  const [activeSection, setActiveSection] = useState("car");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTeam, setActiveTeam] = useState("redbull");

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0xe63946, 0.4);
    rimLight.position.set(-5, 2, -3);
    scene.add(rimLight);
    const fillLight = new THREE.DirectionalLight(0x00b4d8, 0.25);
    fillLight.position.set(0, -3, 5);
    scene.add(fillLight);

    const grid = new THREE.GridHelper(20, 30, 0x222244, 0x1a1a2e);
    grid.position.y = -0.85;
    scene.add(grid);

    buildF1Car(scene, partsRef);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (!isDragging.current) rotationRef.current.y += 0.003;
      scene.rotation.y = rotationRef.current.y;
      scene.rotation.x = rotationRef.current.x;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mountRef.current?.clientWidth;
      const h = mountRef.current?.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDragging.current) {
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      rotationRef.current.y += dx * 0.008;
      rotationRef.current.x += dy * 0.005;
      rotationRef.current.x = Math.max(-0.6, Math.min(0.6, rotationRef.current.x));
      prevMouse.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const intersects = raycaster.intersectObjects(partsRef.current);

    if (intersects.length > 0) {
      const partId = intersects[0].object.userData.partId;
      const part = CAR_PARTS.find((p) => p.id === partId);
      setHoveredPart(part);
      mountRef.current.style.cursor = "pointer";
    } else {
      setHoveredPart(null);
      mountRef.current.style.cursor = "grab";
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    prevMouse.current = { x: e.clientX, y: e.clientY };
    mountRef.current.style.cursor = "grabbing";
  };
  const handleMouseUp = () => {
    isDragging.current = false;
    mountRef.current.style.cursor = "grab";
  };

  const selectedTeam = TEAMS.find((t) => t.id === activeTeam);

  const TEAM_COLORS = {
    redbull: { primary: "#3062B8", accent: "#CC1E2B" },
    ferrari: { primary: "#E8002D", accent: "#FFD700" },
    mclaren: { primary: "#FF8000", accent: "#000000" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#08090f", color: "#f0f0f0", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(90deg, #0d0d1a 0%, #1a0000 50%, #0d0d1a 100%)",
        borderBottom: "1px solid #e6394633",
        padding: "0 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🏎️</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, color: "#e63946" }}>F1 EXPLORER</div>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 3 }}>INTERACTIVE GUIDE</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 8 }}>
          {[
            { id: "car", label: "🚗 Car" },
            { id: "drivers", label: "👨‍🏎️ Teams" },
            { id: "stats", label: "📊 Stats" },
          ].map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              background: activeSection === s.id ? "#e63946" : "transparent",
              color: activeSection === s.id ? "#fff" : "#aaa",
              border: activeSection === s.id ? "none" : "1px solid #333",
              borderRadius: 6, padding: "8px 18px", cursor: "pointer",
              fontWeight: 700, letterSpacing: 1, fontSize: 13, textTransform: "uppercase", transition: "all 0.2s",
            }}>{s.label}</button>
          ))}
        </nav>
      </header>

      {/* CAR SECTION */}
      {activeSection === "car" && (
        <div>
          <div style={{ textAlign: "center", padding: "2rem 1rem 0.5rem" }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, background: "linear-gradient(90deg, #e63946, #ffd700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              F1 CAR ANATOMY
            </h1>
            <p style={{ color: "#888", margin: "8px 0 0", fontSize: 14 }}>Drag to rotate · Hover the glowing dots to explore car parts</p>
          </div>

          <div style={{ position: "relative", width: "100%", maxWidth: 900, margin: "0 auto", height: 480 }}>
            <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }}
              onMouseMove={handleMouseMove} onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />

            {hoveredPart && (
              <div style={{
                position: "fixed",
                left: Math.min(mousePos.x + 18, window.innerWidth - 320),
                top: Math.max(mousePos.y - 10, 70),
                background: "rgba(8,9,15,0.97)",
                border: `1px solid #${hoveredPart.color.toString(16).padStart(6, "0")}`,
                borderRadius: 12, padding: "16px 20px", width: 290, zIndex: 200,
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)", pointerEvents: "none",
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{hoveredPart.label}</div>
                <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5, marginBottom: 8 }}>{hoveredPart.description}</div>
                <div style={{ fontSize: 12, color: "#ffd700", lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700 }}>Why it matters: </span>{hoveredPart.importance}
                </div>
              </div>
            )}
          </div>

          <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 2rem 3rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {CAR_PARTS.map((part) => (
              <div key={part.id}
                onMouseEnter={() => setHoveredPart(part)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{
                  background: hoveredPart?.id === part.id ? "rgba(230,57,70,0.12)" : "#0d0d1a",
                  border: `1px solid ${hoveredPart?.id === part.id ? "#e63946" : "#1e1e2e"}`,
                  borderRadius: 10, padding: "12px 16px", cursor: "pointer", transition: "all 0.2s",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: `#${part.color.toString(16).padStart(6, "0")}`, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{part.label}</span>
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4, lineHeight: 1.4 }}>{part.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEAMS & DRIVERS SECTION */}
      {activeSection === "drivers" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, textAlign: "center", background: "linear-gradient(90deg, #e63946, #ffd700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.3rem" }}>
            TEAMS & DRIVERS
          </h1>
          <p style={{ color: "#888", textAlign: "center", marginBottom: "1.5rem", fontSize: 14 }}>2025 season · Red Bull, Ferrari & McLaren</p>

          {/* Team Tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32 }}>
            {TEAMS.map((team) => (
              <button key={team.id} onClick={() => setActiveTeam(team.id)} style={{
                background: activeTeam === team.id ? team.color : "#111",
                color: activeTeam === team.id ? (team.id === "mclaren" ? "#000" : "#fff") : "#aaa",
                border: `2px solid ${activeTeam === team.id ? team.color : "#333"}`,
                borderRadius: 8, padding: "10px 22px", cursor: "pointer",
                fontWeight: 800, fontSize: 13, letterSpacing: 1, transition: "all 0.2s",
              }}>{team.name}</button>
            ))}
          </div>

          {/* Team Card */}
          {selectedTeam && (
            <div>
              {/* Team Info Banner */}
              <div style={{
                background: `linear-gradient(135deg, ${selectedTeam.color}22, #0d0d1a)`,
                border: `1px solid ${selectedTeam.color}55`,
                borderRadius: 16, padding: "24px 28px", marginBottom: 24,
                display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start",
              }}>
                <div style={{ flex: "1 1 300px" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: selectedTeam.color, marginBottom: 4 }}>{selectedTeam.name}</div>
                  <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>{selectedTeam.bio}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: "1 1 260px" }}>
                  {[
                    { label: "Base", value: selectedTeam.base },
                    { label: "Chassis", value: selectedTeam.chassis },
                    { label: "Engine", value: selectedTeam.engine },
                    { label: "Titles", value: selectedTeam.championships },
                  ].map((item) => (
                    <div key={item.label} style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 16px", minWidth: 120 }}>
                      <div style={{ fontSize: 10, color: "#666", letterSpacing: 1, marginBottom: 2 }}>{item.label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {selectedTeam.drivers.map((d) => (
                  <div key={d.number} style={{
                    background: "#0d0d1a",
                    border: `1px solid ${selectedTeam.color}44`,
                    borderRadius: 16, padding: "24px",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${selectedTeam.color}33`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 42, fontWeight: 900, color: selectedTeam.color, lineHeight: 1 }}>#{d.number}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{d.name}</div>
                        <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>{d.nationality}</div>
                      </div>
                      <div style={{
                        background: `${selectedTeam.color}22`, border: `1px solid ${selectedTeam.color}44`,
                        borderRadius: 8, padding: "6px 12px", fontSize: 11, color: selectedTeam.color, fontWeight: 700,
                      }}>
                        {selectedTeam.name}
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6, marginBottom: 16 }}>{d.bio}</div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {[
                        { label: "Titles", value: d.championships },
                        { label: "Wins", value: d.wins },
                        { label: "Podiums", value: d.podiums },
                      ].map((stat) => (
                        <div key={stat.label} style={{ background: "#1a1a2e", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: selectedTeam.color }}>{stat.value}</div>
                          <div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>{stat.label.toUpperCase()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATS SECTION */}
      {activeSection === "stats" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, textAlign: "center", background: "linear-gradient(90deg, #e63946, #ffd700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.3rem" }}>
            F1 CAR SPECIFICATIONS
          </h1>
          <p style={{ color: "#888", textAlign: "center", marginBottom: "2rem", fontSize: 14 }}>2025 regulation — key technical figures</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: "3rem" }}>
            {CAR_STATS.map((s) => (
              <div key={s.label} style={{
                background: "linear-gradient(135deg, #0d0d1a, #12122a)",
                border: "1px solid #1e1e3e", borderRadius: 14, padding: "20px", textAlign: "center",
              }}>
                <div style={{ fontSize: 32 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#e63946", margin: "8px 0 4px" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#888", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Team comparison table */}
          <div style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 14, padding: "24px", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#ffd700", marginTop: 0, marginBottom: 16 }}>🏆 Team Comparison (2025)</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #222" }}>
                    {["Team", "Chassis", "Engine", "2024 WCC Pos.", "Strengths"].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#666", fontWeight: 700, letterSpacing: 1, fontSize: 11 }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { team: "Red Bull", color: "#3062B8", chassis: "RB21", engine: "Honda RBPTH002", pos: "2nd", strengths: "Aerodynamic efficiency, race pace" },
                    { team: "Ferrari", color: "#E8002D", chassis: "SF-25", engine: "Ferrari 066/14", pos: "3rd", strengths: "Straight-line speed, qualifying" },
                    { team: "McLaren", color: "#FF8000", chassis: "MCL39", engine: "Mercedes M16", pos: "1st ✓", strengths: "Tyre management, overall pace" },
                  ].map((row) => (
                    <tr key={row.team} style={{ borderBottom: "1px solid #111" }}>
                      <td style={{ padding: "12px", fontWeight: 800, color: row.color }}>{row.team}</td>
                      <td style={{ padding: "12px", color: "#ccc" }}>{row.chassis}</td>
                      <td style={{ padding: "12px", color: "#ccc" }}>{row.engine}</td>
                      <td style={{ padding: "12px", color: row.pos.includes("✓") ? "#ffd700" : "#ccc", fontWeight: row.pos.includes("✓") ? 800 : 400 }}>{row.pos}</td>
                      <td style={{ padding: "12px", color: "#888" }}>{row.strengths}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 14, padding: "24px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#ffd700", marginTop: 0 }}>⚙️ Regulation Highlights (2025)</h2>
            <ul style={{ color: "#aaa", lineHeight: 2, paddingLeft: 20 }}>
              <li>Ground effect aerodynamics — venturi tunnels under the floor create most downforce</li>
              <li>1.6L V6 hybrid power unit — max 15,000 RPM</li>
              <li>MGU-K limited to 120kW (160hp) electrical deployment</li>
              <li>18-inch low-profile Pirelli tires introduced in 2022</li>
              <li>Minimum weight: 798 kg (car + driver)</li>
              <li>Cost cap: $135M for constructors (2025)</li>
            </ul>
          </div>
        </div>
      )}

      <footer style={{ textAlign: "center", padding: "2rem", color: "#333", fontSize: 12, borderTop: "1px solid #111" }}>
        F1 Explorer · Built with Three.js · Educational project
      </footer>
    </div>
  );
}
