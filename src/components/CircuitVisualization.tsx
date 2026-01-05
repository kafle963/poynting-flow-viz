import { useEffect, useRef, useState } from "react";

interface Props {
  showElectric: boolean;
  showMagnetic: boolean;
  showPoynting: boolean;
  isACMode: boolean;
  frequency: number;
}

export const CircuitVisualization = ({ 
  showElectric, 
  showMagnetic, 
  showPoynting,
  isACMode,
  frequency 
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [time, setTime] = useState(0);

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
    const circuitWidth = width * 0.6;
    const circuitHeight = height * 0.4;
    const left = centerX - circuitWidth / 2;
    const right = centerX + circuitWidth / 2;
    const top = centerY - circuitHeight / 2;
    const bottom = centerY + circuitHeight / 2;

    // Calculate AC phase (oscillates between -1 and 1)
    const acPhase = isACMode ? Math.sin(time * frequency * Math.PI * 2) : 1;
    const absPhase = Math.abs(acPhase);

    // Draw circuit wires
    ctx.strokeStyle = "hsl(220, 10%, 70%)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Top wire
    ctx.beginPath();
    ctx.moveTo(left + 40, top);
    ctx.lineTo(right - 40, top);
    ctx.stroke();

    // Bottom wire
    ctx.beginPath();
    ctx.moveTo(left + 40, bottom);
    ctx.lineTo(right - 40, bottom);
    ctx.stroke();

    // Left wire (source side)
    ctx.beginPath();
    ctx.moveTo(left, top + 30);
    ctx.lineTo(left, bottom - 30);
    ctx.stroke();

    // Right wire (resistor side)
    ctx.beginPath();
    ctx.moveTo(right, top + 50);
    ctx.lineTo(right, bottom - 50);
    ctx.stroke();

    // Draw source (battery or AC)
    if (isACMode) {
      drawACSource(ctx, left, centerY, 60, time, frequency);
    } else {
      drawBattery(ctx, left, centerY, 60);
    }

    // Draw resistor
    drawResistor(ctx, right, centerY, 80);

    // Draw corner connections
    ctx.strokeStyle = "hsl(220, 10%, 70%)";
    ctx.lineWidth = 4;
    
    // Top-left corner
    ctx.beginPath();
    ctx.arc(left + 40, top + 30, 30, Math.PI, 1.5 * Math.PI);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.arc(right - 40, top + 50, 50, 1.5 * Math.PI, 0);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.arc(left + 40, bottom - 30, 30, 0.5 * Math.PI, Math.PI);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.arc(right - 40, bottom - 50, 50, 0, 0.5 * Math.PI);
    ctx.stroke();

    // Draw phase indicator for AC mode
    if (isACMode) {
      drawPhaseIndicator(ctx, width, height, acPhase, time, frequency);
    }

    // Draw Electric Field (E-field) - radial from wire surfaces
    if (showElectric) {
      drawElectricField(ctx, width, height, left, right, top, bottom, time, acPhase, absPhase);
    }

    // Draw Magnetic Field (B-field) - circular around wires
    if (showMagnetic) {
      drawMagneticField(ctx, width, height, left, right, top, bottom, time, acPhase, absPhase);
    }

    // Draw Poynting Vectors (S = E × H)
    if (showPoynting) {
      drawPoyntingVectors(ctx, width, height, left, right, top, bottom, time, acPhase, absPhase, isACMode);
    }

  }, [time, showElectric, showMagnetic, showPoynting, isACMode, frequency]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
};

function drawBattery(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.strokeStyle = "hsl(220, 10%, 70%)";
  ctx.lineWidth = 3;

  // Positive terminal (longer line)
  ctx.beginPath();
  ctx.moveTo(x - 15, y - size / 3);
  ctx.lineTo(x + 15, y - size / 3);
  ctx.stroke();

  // Negative terminal (shorter line)
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + size / 3);
  ctx.lineTo(x + 8, y + size / 3);
  ctx.stroke();

  // Labels
  ctx.fillStyle = "hsl(45, 100%, 60%)";
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("+", x, y - size / 3 - 10);
  ctx.fillText("−", x, y + size / 3 + 20);

  // Battery body outline
  ctx.strokeStyle = "hsl(220, 10%, 50%)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 20, y - size / 2 + 10, 40, size - 20);
}

function drawResistor(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.strokeStyle = "hsl(220, 10%, 70%)";
  ctx.lineWidth = 3;

  const zigzags = 5;
  const amplitude = 12;
  const stepY = size / zigzags;

  ctx.beginPath();
  ctx.moveTo(x, y - size / 2);

  for (let i = 0; i < zigzags; i++) {
    const yPos = y - size / 2 + stepY * (i + 0.5);
    const xOffset = i % 2 === 0 ? amplitude : -amplitude;
    ctx.lineTo(x + xOffset, yPos);
  }
  ctx.lineTo(x, y + size / 2);
  ctx.stroke();

  // Label
  ctx.fillStyle = "hsl(340, 85%, 60%)";
  ctx.font = "14px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("R (Load)", x + 25, y + 5);
}

function drawACSource(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number, frequency: number) {
  // Draw circle
  ctx.strokeStyle = "hsl(220, 10%, 70%)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.stroke();

  // Draw sine wave inside
  ctx.strokeStyle = "hsl(45, 100%, 60%)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  const waveWidth = size * 0.7;
  const waveHeight = size * 0.3;
  const phase = time * frequency * Math.PI * 2;
  
  for (let i = 0; i <= 20; i++) {
    const px = x - waveWidth / 2 + (i / 20) * waveWidth;
    const py = y + Math.sin((i / 20) * Math.PI * 2 + phase) * waveHeight / 2;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Label
  ctx.fillStyle = "hsl(45, 100%, 60%)";
  ctx.font = "bold 14px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AC", x, y + size / 2 + 20);
}

function drawPhaseIndicator(ctx: CanvasRenderingContext2D, width: number, height: number, phase: number, time: number, frequency: number) {
  const indicatorX = width - 120;
  const indicatorY = 60;
  const indicatorWidth = 100;
  const indicatorHeight = 50;

  // Background
  ctx.fillStyle = "hsla(220, 20%, 15%, 0.9)";
  ctx.fillRect(indicatorX - 10, indicatorY - 30, indicatorWidth + 20, indicatorHeight + 40);
  ctx.strokeStyle = "hsl(220, 15%, 30%)";
  ctx.lineWidth = 1;
  ctx.strokeRect(indicatorX - 10, indicatorY - 30, indicatorWidth + 20, indicatorHeight + 40);

  // Label
  ctx.fillStyle = "hsl(210, 20%, 70%)";
  ctx.font = "12px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Current Phase", indicatorX + indicatorWidth / 2, indicatorY - 15);

  // Draw sine wave
  ctx.strokeStyle = "hsl(45, 100%, 60%)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let i = 0; i <= indicatorWidth; i++) {
    const px = indicatorX + i;
    const py = indicatorY + indicatorHeight / 2 + Math.sin((i / indicatorWidth) * Math.PI * 4 - time * frequency * Math.PI * 2) * (indicatorHeight / 2 - 5);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Draw current position marker
  const markerX = indicatorX + (indicatorWidth / 2);
  const markerY = indicatorY + indicatorHeight / 2 - phase * (indicatorHeight / 2 - 5);
  
  ctx.fillStyle = "hsl(45, 100%, 60%)";
  ctx.beginPath();
  ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Phase value
  ctx.fillStyle = phase >= 0 ? "hsl(120, 70%, 50%)" : "hsl(0, 70%, 50%)";
  ctx.font = "bold 14px Inter, sans-serif";
  ctx.fillText(`${(phase * 100).toFixed(0)}%`, indicatorX + indicatorWidth / 2, indicatorY + indicatorHeight + 15);
}

function drawElectricField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  time: number,
  acPhase: number,
  absPhase: number
) {
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.3 + absPhase * 0.5;

  // Electric field direction depends on phase
  const direction1 = acPhase >= 0 ? "up" : "down";
  const direction2 = acPhase >= 0 ? "down" : "up";

  // Set color based on phase direction
  const electricColor = acPhase >= 0 ? "hsl(200, 100%, 60%)" : "hsl(200, 100%, 40%)";
  ctx.strokeStyle = electricColor;
  ctx.fillStyle = electricColor;

  // Top wire - field lines
  for (let x = left + 60; x < right - 60; x += 40) {
    const offset = Math.sin(time * 2 + x * 0.05) * 3;
    const lineLength = 15 + absPhase * 15;
    drawFieldLine(ctx, x, top - 15 + offset, x, top - 15 - lineLength + offset, direction1);
    drawFieldLine(ctx, x, top + 15 - offset, x, top + 15 + lineLength - offset, direction2);
  }

  // Bottom wire - field lines
  for (let x = left + 60; x < right - 60; x += 40) {
    const offset = Math.sin(time * 2 + x * 0.05) * 3;
    const lineLength = 15 + absPhase * 15;
    drawFieldLine(ctx, x, bottom - 15 + offset, x, bottom - 15 - lineLength + offset, direction1);
    drawFieldLine(ctx, x, bottom + 15 - offset, x, bottom + 15 + lineLength - offset, direction2);
  }

  ctx.globalAlpha = 1;
}

function drawMagneticField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  time: number,
  acPhase: number,
  absPhase: number
) {
  ctx.globalAlpha = 0.3 + absPhase * 0.5;
  ctx.lineWidth = 1.5;

  const magneticColor = acPhase >= 0 ? "hsl(340, 85%, 60%)" : "hsl(340, 85%, 40%)";
  ctx.strokeStyle = magneticColor;

  // Magnetic field symbols swap based on current direction
  const topSymbol = acPhase >= 0 ? "×" : "•";
  const bottomSymbol = acPhase >= 0 ? "•" : "×";

  // Top wire
  for (let x = left + 80; x < right - 80; x += 60) {
    const radius = 20 + absPhase * 10 + Math.sin(time * 3 + x * 0.1) * 3;
    
    ctx.beginPath();
    ctx.arc(x, top, radius, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = magneticColor;
    ctx.font = `${14 + absPhase * 4}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(topSymbol, x, top - radius - 5);
    ctx.fillText(bottomSymbol, x, top + radius + 12);
  }

  // Bottom wire
  for (let x = left + 80; x < right - 80; x += 60) {
    const radius = 20 + absPhase * 10 + Math.sin(time * 3 + x * 0.1) * 3;
    
    ctx.beginPath();
    ctx.arc(x, bottom, radius, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = magneticColor;
    ctx.font = `${14 + absPhase * 4}px sans-serif`;
    ctx.fillText(bottomSymbol, x, bottom - radius - 5);
    ctx.fillText(topSymbol, x, bottom + radius + 12);
  }

  ctx.globalAlpha = 1;
}

function drawPoyntingVectors(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  time: number,
  acPhase: number,
  absPhase: number,
  isACMode: boolean
) {
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.5 + absPhase * 0.4;

  // In AC mode, Poynting vector ALWAYS points toward load (energy dissipation)
  // because S = E × H, and when both E and H flip, S stays the same direction!
  // However, the magnitude oscillates with |sin(ωt)|²
  
  const poyntingColor = "hsl(45, 100%, 55%)";
  ctx.strokeStyle = poyntingColor;
  ctx.fillStyle = poyntingColor;

  // Arrow size scales with instantaneous power (|phase|² for AC)
  const powerFactor = isACMode ? absPhase * absPhase : 1;
  const arrowScale = 0.5 + powerFactor * 0.5;
  
  // Top wire - energy flowing rightward (from source to resistor)
  const numArrows = 6;
  for (let i = 0; i < numArrows; i++) {
    const progress = ((time * 0.5 * arrowScale + i / numArrows) % 1);
    const x = left + 60 + progress * (right - left - 120);
    const y = top - 35;
    const arrowLen = 12 * arrowScale;
    
    drawArrow(ctx, x - arrowLen, y, x + arrowLen, y, 6 + powerFactor * 3);
  }

  // Bottom wire - energy also flowing toward resistor
  for (let i = 0; i < numArrows; i++) {
    const progress = ((time * 0.5 * arrowScale + i / numArrows) % 1);
    const x = left + 60 + progress * (right - left - 120);
    const y = bottom + 35;
    const arrowLen = 12 * arrowScale;
    
    drawArrow(ctx, x - arrowLen, y, x + arrowLen, y, 6 + powerFactor * 3);
  }

  // Energy converging at resistor - scales with power
  const centerY = (top + bottom) / 2;
  if (powerFactor > 0.1) {
    for (let i = 0; i < 4; i++) {
      const angle = (time + i * 0.5) * 2;
      const radius = 50 + Math.sin(angle) * 10 * powerFactor;
      const targetX = right;
      const targetY = centerY;
      
      const startX = targetX + Math.cos(Math.PI + i * 0.4 - 0.6) * radius;
      const startY = targetY + Math.sin(Math.PI + i * 0.4 - 0.6) * radius * 0.8;
      
      ctx.globalAlpha = powerFactor * 0.8;
      drawArrow(ctx, startX, startY, targetX + 25, targetY + (i - 1.5) * 15, 5 + powerFactor * 3);
    }
  }

  // Energy emanating from source - scales with power
  if (powerFactor > 0.1) {
    for (let i = 0; i < 4; i++) {
      const angle = (time + i * 0.5) * 2;
      const radius = 40 + Math.sin(angle) * 8 * powerFactor;
      const sourceX = left;
      const sourceY = centerY;
      
      const endX = sourceX - Math.cos(i * 0.4 - 0.6) * radius;
      const endY = sourceY + Math.sin(i * 0.4 - 0.6) * radius * 0.6;
      
      ctx.globalAlpha = powerFactor * 0.8;
      drawArrow(ctx, sourceX - 25, sourceY + (i - 1.5) * 12, endX, endY, 5 + powerFactor * 3);
    }
  }

  ctx.globalAlpha = 1;
}

function drawFieldLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  direction: "up" | "down"
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Draw arrow head
  const arrowSize = 5;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  if (direction === "up") {
    ctx.beginPath();
    ctx.moveTo(midX, midY - 5);
    ctx.lineTo(midX - arrowSize, midY + 3);
    ctx.lineTo(midX + arrowSize, midY + 3);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(midX, midY + 5);
    ctx.lineTo(midX - arrowSize, midY - 3);
    ctx.lineTo(midX + arrowSize, midY - 3);
    ctx.closePath();
    ctx.fill();
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  headSize: number
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headSize * Math.cos(angle - Math.PI / 6),
    y2 - headSize * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headSize * Math.cos(angle + Math.PI / 6),
    y2 - headSize * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}
