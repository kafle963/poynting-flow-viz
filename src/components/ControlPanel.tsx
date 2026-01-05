import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Zap, Activity } from "lucide-react";

interface Props {
  showElectric: boolean;
  showMagnetic: boolean;
  showPoynting: boolean;
  isACMode: boolean;
  frequency: number;
  voltage: number;
  resistance: number;
  onToggleElectric: (value: boolean) => void;
  onToggleMagnetic: (value: boolean) => void;
  onTogglePoynting: (value: boolean) => void;
  onToggleACMode: (value: boolean) => void;
  onFrequencyChange: (value: number) => void;
  onVoltageChange: (value: number) => void;
  onResistanceChange: (value: number) => void;
}

export const ControlPanel = ({
  showElectric,
  showMagnetic,
  showPoynting,
  isACMode,
  frequency,
  voltage,
  resistance,
  onToggleElectric,
  onToggleMagnetic,
  onTogglePoynting,
  onToggleACMode,
  onFrequencyChange,
  onVoltageChange,
  onResistanceChange,
}: Props) => {
  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      {/* Circuit Parameters */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-3 border-b border-border">
        {/* AC/DC Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleACMode(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${!isACMode
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
          >
            <Zap className="w-4 h-4" />
            <span className="font-medium">DC</span>
          </button>
          <button
            onClick={() => onToggleACMode(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isACMode
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
          >
            <Activity className="w-4 h-4" />
            <span className="font-medium">AC</span>
          </button>
        </div>

        {/* Sliders Group */}
        <div className="flex flex-wrap items-center gap-6 flex-1 justify-end">
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Voltage (V):</Label>
            <Slider
              value={[voltage]}
              onValueChange={(v) => onVoltageChange(v[0])}
              min={1}
              max={20}
              step={1}
              className="w-32"
            />
            <span className="text-sm font-mono text-foreground w-8 text-right">{voltage}</span>
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Resistance (Ω):</Label>
            <Slider
              value={[resistance]}
              onValueChange={(v) => onResistanceChange(v[0])}
              min={1}
              max={20}
              step={1}
              className="w-32"
            />
            <span className="text-sm font-mono text-foreground w-8 text-right">{resistance}</span>
          </div>

          {isACMode && (
            <div className="flex items-center gap-3">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">Freq (Hz):</Label>
              <Slider
                value={[frequency]}
                onValueChange={(v) => onFrequencyChange(v[0])}
                min={0.1}
                max={3}
                step={0.1}
                className="w-32"
              />
              <span className="text-sm font-mono text-foreground w-12 text-right">{frequency.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Field Toggles */}
      <div className="flex flex-wrap gap-6 pt-1">
        <div className="flex items-center gap-3">
          <Switch
            id="electric"
            checked={showElectric}
            onCheckedChange={onToggleElectric}
            className="data-[state=checked]:bg-electric"
          />
          <Label htmlFor="electric" className="flex items-center gap-2 cursor-pointer">
            <span className="w-3 h-3 rounded-full bg-electric glow-electric" />
            <span className="text-sm font-medium">Electric Field (E)</span>
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="magnetic"
            checked={showMagnetic}
            onCheckedChange={onToggleMagnetic}
            className="data-[state=checked]:bg-magnetic"
          />
          <Label htmlFor="magnetic" className="flex items-center gap-2 cursor-pointer">
            <span className="w-3 h-3 rounded-full bg-magnetic glow-magnetic" />
            <span className="text-sm font-medium">Magnetic Field (B)</span>
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="poynting"
            checked={showPoynting}
            onCheckedChange={onTogglePoynting}
            className="data-[state=checked]:bg-poynting"
          />
          <Label htmlFor="poynting" className="flex items-center gap-2 cursor-pointer">
            <span className="w-3 h-3 rounded-full bg-poynting glow-poynting" />
            <span className="text-sm font-medium">Poynting Vector (S = E × B)</span>
          </Label>
        </div>
      </div>
    </div>
  );
};
