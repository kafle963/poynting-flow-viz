import { useEffect, useRef, useState } from "react";

interface Props {
  showElectric: boolean;
  showMagnetic: boolean;
  showPoynting: boolean;
}

export const CircuitVisualization = ({ showElectric, showMagnetic, showPoynting }: Props) => {
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

    // Left wire (battery side)
    ctx.beginPath();
    ctx.moveTo(left, top + 30);
    ctx.lineTo(left, bottom - 30);
    ctx.stroke();

    // Right wire (resistor side)
    ctx.beginPath();
    ctx.moveTo(right, top + 50);
    ctx.lineTo(right, bottom - 50);
    ctx.stroke();

    // Draw battery
    drawBattery(ctx, left, centerY, 60);

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

    // Draw Electric Field (E-field) - radial from wire surfaces
    if (showElectric) {
      drawElectricField(ctx, width, height, left, right, top, bottom, time);
    }

    // Draw Magnetic Field (B-field) - circular around wires
    if (showMagnetic) {
      drawMagneticField(ctx, width, height, left, right, top, bottom, time);
    }

    // Draw Poynting Vectors (S = E × H)
    if (showPoynting) {
      drawPoyntingVectors(ctx, width, height, left, right, top, bottom, time);
    }

  }, [time, showElectric, showMagnetic, showPoynting]);

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

function drawElectricField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  time: number
) {
  ctx.strokeStyle = "hsl(200, 100%, 60%)";
  ctx.fillStyle = "hsl(200, 100%, 60%)";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.7;

  // Electric field lines going from + to - (outside the wire)
  // Top wire - field pointing upward (toward positive plate conceptually)
  for (let x = left + 60; x < right - 60; x += 40) {
    const offset = Math.sin(time * 2 + x * 0.05) * 3;
    drawFieldLine(ctx, x, top - 15 + offset, x, top - 45 + offset, "up");
    drawFieldLine(ctx, x, top + 15 - offset, x, top + 45 - offset, "down");
  }

  // Bottom wire - field pointing downward
  for (let x = left + 60; x < right - 60; x += 40) {
    const offset = Math.sin(time * 2 + x * 0.05) * 3;
    drawFieldLine(ctx, x, bottom - 15 + offset, x, bottom - 45 + offset, "up");
    drawFieldLine(ctx, x, bottom + 15 - offset, x, bottom + 45 - offset, "down");
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
  time: number
) {
  ctx.strokeStyle = "hsl(340, 85%, 60%)";
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1.5;

  // Magnetic field circles around wires (into/out of page symbols)
  // Top wire - current flowing right, B-field circles clockwise when viewed from right
  for (let x = left + 80; x < right - 80; x += 60) {
    const radius = 25 + Math.sin(time * 3 + x * 0.1) * 3;
    
    // Draw partial circles to show B-field direction
    ctx.beginPath();
    ctx.arc(x, top, radius, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // Arrow indicating direction (into page on top, out on bottom for rightward current)
    ctx.fillStyle = "hsl(340, 85%, 60%)";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("×", x, top - radius - 5); // Into page
    ctx.fillText("•", x, top + radius + 12); // Out of page
  }

  // Bottom wire - current flowing left
  for (let x = left + 80; x < right - 80; x += 60) {
    const radius = 25 + Math.sin(time * 3 + x * 0.1) * 3;
    
    ctx.beginPath();
    ctx.arc(x, bottom, radius, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = "hsl(340, 85%, 60%)";
    ctx.font = "16px sans-serif";
    ctx.fillText("•", x, bottom - radius - 5); // Out of page
    ctx.fillText("×", x, bottom + radius + 12); // Into page
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
  time: number
) {
  ctx.strokeStyle = "hsl(45, 100%, 55%)";
  ctx.fillStyle = "hsl(45, 100%, 55%)";
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.9;

  // Poynting vector shows energy flow direction: S = E × H
  // Energy flows FROM battery TO resistor, traveling through the space AROUND wires
  
  // Top wire - energy flowing rightward (from battery to resistor)
  const numArrows = 6;
  for (let i = 0; i < numArrows; i++) {
    const progress = ((time * 0.5 + i / numArrows) % 1);
    const x = left + 60 + progress * (right - left - 120);
    const y = top - 35;
    
    drawArrow(ctx, x - 15, y, x + 15, y, 8);
  }

  // Bottom wire - energy flowing leftward (return path, but still toward load via field)
  for (let i = 0; i < numArrows; i++) {
    const progress = ((time * 0.5 + i / numArrows) % 1);
    const x = right - 60 - progress * (right - left - 120);
    const y = bottom + 35;
    
    drawArrow(ctx, x + 15, y, x - 15, y, 8);
  }

  // Energy converging at resistor
  const centerY = (top + bottom) / 2;
  for (let i = 0; i < 4; i++) {
    const angle = (time + i * 0.5) * 2;
    const radius = 60 + Math.sin(angle) * 10;
    const targetX = right;
    const targetY = centerY;
    
    const startX = targetX + Math.cos(Math.PI + i * 0.4 - 0.6) * radius;
    const startY = targetY + Math.sin(Math.PI + i * 0.4 - 0.6) * radius * 0.8;
    
    drawArrow(ctx, startX, startY, targetX + 30, targetY + (i - 1.5) * 15, 6);
  }

  // Energy emanating from battery
  for (let i = 0; i < 4; i++) {
    const angle = (time + i * 0.5) * 2;
    const radius = 50 + Math.sin(angle) * 8;
    const sourceX = left;
    const sourceY = centerY;
    
    const endX = sourceX - Math.cos(i * 0.4 - 0.6) * radius;
    const endY = sourceY + Math.sin(i * 0.4 - 0.6) * radius * 0.6;
    
    drawArrow(ctx, sourceX - 30, sourceY + (i - 1.5) * 12, endX, endY, 6);
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
