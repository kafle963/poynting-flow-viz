import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  showElectric: boolean;
  showMagnetic: boolean;
  showPoynting: boolean;
  onToggleElectric: (value: boolean) => void;
  onToggleMagnetic: (value: boolean) => void;
  onTogglePoynting: (value: boolean) => void;
}

export const ControlPanel = ({
  showElectric,
  showMagnetic,
  showPoynting,
  onToggleElectric,
  onToggleMagnetic,
  onTogglePoynting,
}: Props) => {
  return (
    <div className="flex flex-wrap gap-6 p-4 bg-card rounded-lg border border-border">
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
  );
};
