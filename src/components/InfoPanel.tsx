export const InfoPanel = () => {
  return (
    <div className="p-4 bg-card rounded-lg border border-border space-y-3">
      <h2 className="text-lg font-semibold text-foreground">How Energy Flows in Circuits</h2>
      
      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          Contrary to common belief, electrical energy doesn't flow <em>through</em> wires—it flows 
          <strong className="text-foreground"> around</strong> them via electromagnetic fields.
        </p>
        
        <div className="grid gap-2 mt-3">
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 mt-1.5 rounded-full bg-electric flex-shrink-0" />
            <p>
              <strong className="text-electric">Electric Field (E):</strong> Radiates perpendicular to wire surfaces, 
              created by charge separation at the battery.
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 mt-1.5 rounded-full bg-magnetic flex-shrink-0" />
            <p>
              <strong className="text-magnetic">Magnetic Field (B):</strong> Forms circles around current-carrying 
              wires (right-hand rule).
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 mt-1.5 rounded-full bg-poynting flex-shrink-0" />
            <p>
              <strong className="text-poynting">Poynting Vector (S = E × B):</strong> Shows the direction of 
              energy flow—from battery to load through the surrounding space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
