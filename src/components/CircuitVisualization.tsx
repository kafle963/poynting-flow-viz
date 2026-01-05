import { useEffect, useRef, useState } from "react";

interface Props {
  showElectric: boolean;
  showMagnetic: boolean;
  showPoynting: boolean;
  isACMode: boolean;
  frequency: number;
  voltage: number;
  resistance: number;
}

export const CircuitVisualization = ({
  showElectric,
  showMagnetic,
  showPoynting,
  isACMode,
  frequency,
  voltage,
  resistance
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [time, setTime] = useState(0);

  // Derived physics values
  const current = voltage / resistance; // I = V/R
  const power = voltage * current;      // P = VI

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      setTime((t) => t + 0.02);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Circuit dimensions
    const circuitWidth = width * 0.7;
    const circuitHeight = height * 0.5;
    const left = centerX - circuitWidth / 2;
    const right = centerX + circuitWidth / 2;
    const top = centerY - circuitHeight / 2;
    const bottom = centerY + circuitHeight / 2;

    // Calculate AC phase (oscillates between -1 and 1)
    const acPhase = isACMode ? Math.sin(time * frequency * Math.PI * 2) : 1;
    const instantaneousCurrent = current * acPhase;
    const instantaneousPower = isACMode ? power * acPhase * acPhase : power;

    // --- Draw Circuit Components ---

    // Draw wires with current flow effect
    drawWires(ctx, left, right, top, bottom);

    // Draw Electron Flow (Current)
    const driftSpeed = instantaneousCurrent * 0.5;
    drawElectrons(ctx, left, right, top, bottom, time, driftSpeed);

    // Draw source (battery or AC)
    if (isACMode) {
      drawACSource(ctx, left, centerY, 60, time, frequency, voltage);
    } else {
      drawBattery(ctx, left, centerY, 60, voltage);
    }

    // Draw Load (Light Bulb)
    drawLightBulb(ctx, right, centerY, 80, resistance, instantaneousPower);

    // Draw connecting corners
    drawCorners(ctx, left, right, top, bottom);

    // Draw phase indicator for AC mode
    if (isACMode) {
      drawPhaseIndicator(ctx, width, height, acPhase, time, frequency);
    }

    // --- Draw Fields ---

    // Draw Electric Field (E-field) - scales with Voltage
    if (showElectric) {
      drawElectricField(ctx, left, right, top, bottom, time, acPhase, voltage);
    }

    // Draw Magnetic Field (B-field) - scales with Current
    if (showMagnetic) {
      drawMagneticField(ctx, left, right, top, bottom, time, acPhase, instantaneousCurrent);
    }

    // Draw Poynting Vectors (S = E × H) - scales with Power
    if (showPoynting) {
      drawPoyntingFlow(ctx, left, right, top, bottom, time, instantaneousPower, isACMode);
    }

  }, [time, showElectric, showMagnetic, showPoynting, isACMode, frequency, voltage, resistance, current, power]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-slate-950"
      style={{ display: "block" }}
    />
  );
};

function drawWires(ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number) {
  ctx.strokeStyle = "hsl(220, 10%, 40%)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Outer frame
  ctx.beginPath();
  ctx.moveTo(left + 30, top);
  ctx.lineTo(right - 30, top);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(left + 30, bottom);
  ctx.lineTo(right - 30, bottom);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(left, top + 30);
  ctx.lineTo(left, bottom - 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(right, top + 30);
  ctx.lineTo(right, bottom - 30);
  ctx.stroke();
}

function drawCorners(ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number) {
  ctx.strokeStyle = "hsl(220, 10%, 40%)";
  ctx.lineWidth = 8;

  ctx.beginPath();
  ctx.arc(left + 30, top + 30, 30, Math.PI, 1.5 * Math.PI);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(right - 30, top + 30, 30, 1.5 * Math.PI, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(left + 30, bottom - 30, 30, 0.5 * Math.PI, Math.PI);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(right - 30, bottom - 30, 30, 0, 0.5 * Math.PI);
  ctx.stroke();
}

function drawElectrons(
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  top: number,
  bottom: number,
  time: number,
  speed: number
) {
  const electronSpeed = -speed;
  const numElectrons = 40;

  ctx.fillStyle = "hsl(190, 100%, 70%)";
  ctx.shadowColor = "hsl(190, 100%, 50%)";
  ctx.shadowBlur = 4;

  for (let i = 0; i < numElectrons; i++) {
    let pos = (i / numElectrons + time * electronSpeed * 0.1) % 1;
    if (pos < 0) pos += 1;

    const perimeter = 2 * (right - left) + 2 * (bottom - top);
    const distanceInfo = pos * perimeter;

    let x, y;

    if (distanceInfo < (right - left)) {
      // Top edge
      x = left + distanceInfo;
      y = top;
    } else if (distanceInfo < (right - left) + (bottom - top)) {
      // Right edge
      x = right;
      y = top + (distanceInfo - (right - left));
    } else if (distanceInfo < 2 * (right - left) + (bottom - top)) {
      // Bottom edge
      x = right - (distanceInfo - ((right - left) + (bottom - top)));
      y = bottom;
    } else {
      // Left edge
      x = left;
      y = bottom - (distanceInfo - (2 * (right - left) + (bottom - top)));
    }

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawBattery(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, voltage: number) {
  ctx.strokeStyle = "hsl(220, 10%, 80%)";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x, y - size / 2);
  ctx.lineTo(x, y - size / 3);
  ctx.moveTo(x, y + size / 2);
  ctx.lineTo(x, y + size / 3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 20, y - size / 3);
  ctx.lineTo(x + 20, y - size / 3);
  ctx.stroke();

  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + size / 3);
  ctx.lineTo(x + 10, y + size / 3);
  ctx.stroke();

  ctx.fillStyle = "hsl(45, 100%, 60%)";
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`${voltage}V`, x - 25, y + 5);
}

function drawACSource(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number, frequency: number, voltage: number) {
  ctx.strokeStyle = "hsl(220, 10%, 80%)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x, y - size / 2 - 10);
  ctx.lineTo(x, y + size / 2 + 10);
  ctx.stroke();

  ctx.fillStyle = "hsl(220, 20%, 10%)";
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "hsl(45, 100%, 60%)";
  ctx.lineWidth = 3;
  ctx.beginPath();

  const waveWidth = size * 0.6;
  const waveHeight = size * 0.25;
  const phase = time * frequency * Math.PI * 2;

  for (let i = 0; i <= 20; i++) {
    const px = x - waveWidth / 2 + (i / 20) * waveWidth;
    const py = y + Math.sin((i / 20) * Math.PI * 2 + phase) * waveHeight;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.fillStyle = "hsl(45, 100%, 60%)";
  ctx.font = "bold 14px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${voltage}V`, x, y + size / 2 + 20);
}

function drawLightBulb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  resistance: number,
  power: number
) {
  const glowIntensity = Math.min(Math.abs(power) / 50, 1);
  const brightness = 20 + glowIntensity * 80;

  // Bulb Glass (Background Glow)
  ctx.shadowBlur = glowIntensity * 60;
  ctx.shadowColor = `hsla(50, 100%, 60%, ${glowIntensity})`;
  ctx.fillStyle = `hsla(50, 100%, ${brightness}%, 0.1)`;
  ctx.strokeStyle = `hsla(50, 100%, ${brightness}%, 0.5)`;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.arc(x, y - 5, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Bulb Base
  ctx.fillStyle = "#555";
  ctx.fillRect(x - 12, y + 20, 24, 25);
  // Threads
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 25); ctx.lineTo(x + 12, y + 25);
  ctx.moveTo(x - 12, y + 32); ctx.lineTo(x + 12, y + 32);
  ctx.moveTo(x - 12, y + 39); ctx.lineTo(x + 12, y + 39);
  ctx.stroke();

  // Filament Support
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 20); ctx.lineTo(x - 5, y);
  ctx.moveTo(x + 8, y + 20); ctx.lineTo(x + 5, y);
  ctx.stroke();

  // Glowing Filament
  ctx.strokeStyle = `hsl(40, 100%, ${50 + glowIntensity * 50}%)`;
  ctx.lineWidth = 2 + glowIntensity * 2;
  ctx.shadowBlur = glowIntensity * 20;
  ctx.shadowColor = "hsl(40, 100%, 50%)";

  ctx.beginPath();
  ctx.moveTo(x - 5, y);
  ctx.lineTo(x - 8, y - 10);
  ctx.lineTo(x - 4, y - 5);
  ctx.lineTo(x, y - 12);
  ctx.lineTo(x + 4, y - 5);
  ctx.lineTo(x + 8, y - 10);
  ctx.lineTo(x + 5, y);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Connections w/ circuit
  ctx.strokeStyle = "hsl(220, 10%, 80%)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y - size / 2);
  ctx.lineTo(x, y - 35); // Top wire
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y + 45); // Bottom wire
  ctx.lineTo(x, y + size / 2);
  ctx.stroke();

  // Label
  ctx.fillStyle = "hsl(340, 85%, 60%)";
  ctx.font = "bold 14px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${resistance}Ω`, x, y + 65);
}

function drawPhaseIndicator(ctx: CanvasRenderingContext2D, width: number, height: number, phase: number, time: number, frequency: number) {
  const indicatorX = width - 80;
  const indicatorY = 60;
  // Kept minimal
  ctx.fillStyle = "hsl(210, 20%, 70%)";
  ctx.font = "12px Inter, sans-serif";
  ctx.fillText("Phase", indicatorX, indicatorY - 20);

  // Rotating phaser or simple bar? Let's do a simple bar
  ctx.strokeStyle = "hsl(220, 20%, 30%)";
  ctx.strokeRect(indicatorX - 30, indicatorY - 10, 60, 20);

  ctx.fillStyle = "hsl(45, 100%, 60%)";
  const w = phase * 30;
  ctx.fillRect(indicatorX, indicatorY - 10, w, 20);
}

function drawElectricField(
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  top: number,
  bottom: number,
  time: number,
  acPhase: number,
  voltage: number
) {
  const intensity = Math.abs(voltage) / 10;
  const direction = acPhase >= 0 ? 1 : -1;
  const eColor = direction > 0 ? "hsl(200, 100%, 60%)" : "hsl(200, 100%, 40%)";

  ctx.strokeStyle = eColor;
  ctx.lineWidth = 1 + intensity;
  ctx.globalAlpha = 0.3 + Math.min(intensity * 0.1, 0.4);

  const spacing = 40;
  for (let x = left + 40; x < right - 40; x += spacing) {
    drawFieldLine(ctx, x, top, x, top - 40 * Math.abs(acPhase) * (voltage / 5), direction === 1 ? 'up' : 'down');
    drawFieldLine(ctx, x, bottom, x, bottom + 40 * Math.abs(acPhase) * (voltage / 5), direction === 1 ? 'down' : 'up');
  }
  ctx.globalAlpha = 1.0;
}

function drawFieldLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, dir: 'up' | 'down') {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const headSize = 6;
  if (dir === 'up') {
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headSize / 2, y2 + headSize);
    ctx.lineTo(x2 + headSize / 2, y2 + headSize);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headSize / 2, y2 - headSize);
    ctx.lineTo(x2 + headSize / 2, y2 - headSize);
    ctx.fill();
  }
}

function drawMagneticField(
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  top: number,
  bottom: number,
  time: number,
  acPhase: number,
  instantaneousCurrent: number
) {
  const intensity = Math.abs(instantaneousCurrent);
  const color = "hsl(340, 85%, 60%)";

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.font = "bold 16px sans-serif";

  const isClockwise = instantaneousCurrent > 0;
  const topSymbol = isClockwise ? "•" : "×";
  const bottomSymbol = isClockwise ? "×" : "•";

  const radius = 15 + Math.min(intensity * 2, 20);

  for (let x = left + 60; x < right - 60; x += 60) {
    ctx.fillText(topSymbol, x, top - 25);
    ctx.beginPath(); ctx.arc(x, top, radius, Math.PI, 0); ctx.stroke();
  }
  const bottomWireTopSym = isClockwise ? "×" : "•";
  for (let x = left + 60; x < right - 60; x += 60) {
    ctx.fillText(bottomWireTopSym, x, bottom - 25);
    ctx.beginPath(); ctx.arc(x, bottom, radius, Math.PI, 0); ctx.stroke();
  }
}

function drawPoyntingFlow(
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  top: number,
  bottom: number,
  time: number,
  instantaneousPower: number,
  isACMode: boolean
) {
  const power = Math.abs(instantaneousPower);
  const color = "hsl(45, 100%, 60%)";
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  const particleCount = Math.min(Math.floor(power * 3), 100);
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const width = right - left;
  const height = bottom - top;

  for (let i = 0; i < particleCount; i++) {
    const seed = i * 13.0;
    const speed = 1.0 + (i % 3) * 0.5;
    const progress = (time * speed + seed / 100) % 1.5;

    if (progress > 1) continue;

    const yOffset = Math.sin(seed) * (height * 0.3);
    const x = left + progress * width;
    const y = centerY + yOffset;

    const size = 2 + (power / 50);
    ctx.globalAlpha = 1.0 - Math.abs(yOffset) / (height * 0.4);

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Explicit Direction Arrows centered in the flow
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.fillStyle = color;

  // Draw 3 distinct arrows along the center path to clearly show direction
  const arrowPositions = [0.25, 0.5, 0.75];
  arrowPositions.forEach(pos => {
    const ax = left + pos * width;
    const ay = centerY;
    // Draw Arrow
    drawArrow(ctx, ax - 15, ay, ax + 15, ay, 10);

    // Label "S" above the middle one
    if (pos === 0.5) {
      ctx.font = "bold italic 20px Times New Roman";
      ctx.textAlign = "center";
      ctx.fillText("S", ax, ay - 25);
    }
  });

  ctx.globalAlpha = 1.0;
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, headSize: number) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headSize * Math.cos(angle - Math.PI / 6), y2 - headSize * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headSize * Math.cos(angle + Math.PI / 6), y2 - headSize * Math.sin(angle + Math.PI / 6));
  ctx.fill();
}
