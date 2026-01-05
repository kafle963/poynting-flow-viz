import { useState } from "react";
import { CircuitVisualization } from "@/components/CircuitVisualization";
import { ControlPanel } from "@/components/ControlPanel";
import { InfoPanel } from "@/components/InfoPanel";

const Index = () => {
  const [showElectric, setShowElectric] = useState(true);
  const [showMagnetic, setShowMagnetic] = useState(true);
  const [showPoynting, setShowPoynting] = useState(true);
  const [isACMode, setIsACMode] = useState(false);
  const [frequency, setFrequency] = useState(1);
  const [voltage, setVoltage] = useState(10);
  const [resistance, setResistance] = useState(5);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Electromagnetic Energy Flow
          </h1>
          <p className="text-muted-foreground">
            Visualizing the Poynting vector in {isACMode ? "an AC" : "a DC"} circuit
          </p>
        </header>

        <ControlPanel
          showElectric={showElectric}
          showMagnetic={showMagnetic}
          showPoynting={showPoynting}
          isACMode={isACMode}
          frequency={frequency}
          voltage={voltage}
          resistance={resistance}
          onToggleElectric={setShowElectric}
          onToggleMagnetic={setShowMagnetic}
          onTogglePoynting={setShowPoynting}
          onToggleACMode={setIsACMode}
          onFrequencyChange={setFrequency}
          onVoltageChange={setVoltage}
          onResistanceChange={setResistance}
        />

        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ height: "500px" }}>
          <CircuitVisualization
            showElectric={showElectric}
            showMagnetic={showMagnetic}
            showPoynting={showPoynting}
            isACMode={isACMode}
            frequency={frequency}
            voltage={voltage}
            resistance={resistance}
          />
        </div>

        <InfoPanel isACMode={isACMode} />
      </div>
    </div>
  );
};

export default Index;
