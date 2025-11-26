import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import * as THREE from "three";
// ❌ Don't import VoiceController here anymore

const Earth = () => {
  const globeRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const globe = Globe()(globeRef.current)
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")
      .showAtmosphere(true)
      .atmosphereColor("#2c84ff")
      .atmosphereAltitude(0.2);

    globe.controls().autoRotate = false;
    globe.camera().position.set(0, 550, 600);
    globe.camera().lookAt(0,0,0);

    const bounceEase = (x) => {
      const n1 = 7.5625, d1 = 2.75;
      if (x < 1 / d1) return n1 * x * x;
      else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
      else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
      else return n1 * (x -= 2.625 / d1) * x + 0.984375;
    };

    const dropStart = performance.now();
    const dropDuration = 2000;
    const animateDrop = (time) => {
      const elapsed = time - dropStart;
      const t = Math.min(elapsed / dropDuration, 1);
      const eased = bounceEase(t);
      globe.camera().position.z = 600 - eased * 500;
      globe.camera().lookAt(0, 0, 0);
      if (t < 1) requestAnimationFrame(animateDrop);
      else {
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.6;
      }
    };
    requestAnimationFrame(animateDrop);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    globe.scene().add(directionalLight);
    globe.scene().add(new THREE.AmbientLight(0x222222));

    const updateSunlight = () => {
      const now = new Date();
      const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
      const angle = (hours / 24) * 2 * Math.PI;
      directionalLight.position.set(Math.cos(angle) * 100, 0, Math.sin(angle) * 100).normalize();
    };
    updateSunlight();
    const intervalId = setInterval(updateSunlight, 60000);

    const scene = globe.scene();
    const starData = Array.from({ length: 1000 }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 4000,
        (Math.random() - 0.5) * 4000,
        -2500 - Math.random() * 2000
      )
    }));
    const starGeometry = new THREE.BufferGeometry().setFromPoints(starData.map(s => s.position));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 1
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    let time = 0;
    const animateStars = () => {
      time += 0.03;
      starMaterial.opacity = 0.6 + 0.4 * Math.sin(time);
      requestAnimationFrame(animateStars);
    };
    animateStars();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onMouseMove = (e) => {
      const bounds = globeRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(mouse, globe.camera());
      const intersects = raycaster.intersectObject(starPoints);
      if (intersects.length > 0) {
        const idx = intersects[0].index;
        setTooltip({ name: `Star ${idx}`, x: e.clientX + 10, y: e.clientY - 20 });
      } else {
        setTooltip(null);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden", fontFamily: "'Orbitron', sans-serif" }}>
      <div ref={globeRef} style={{ height: "100%", width: "100%", transform: "translateY(-40px)" }} />

      {/* ❌ Removed VoiceController from here */}

      {tooltip && (
        <div style={{
          position: "absolute",
          top: tooltip.y,
          left: tooltip.x,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "12px",
          pointerEvents: "none",
          zIndex: 10
        }}>⭐ {tooltip.name}</div>
      )}
    </div>
  );
};

export default Earth;

