interface Props {
  isACMode?: boolean;
}

export const InfoPanel = ({ isACMode = false }: Props) => {
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
              created by charge separation at the {isACMode ? "AC source" : "battery"}.
              {isACMode && " In AC, it oscillates direction with the current."}
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-2 h-2 mt-1.5 rounded-full bg-magnetic flex-shrink-0" />
            <p>
              <strong className="text-magnetic">Magnetic Field (B):</strong> Forms circles around current-carrying
              wires (right-hand rule).
              {isACMode && " The × and • symbols swap as current reverses."}
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-2 h-2 mt-1.5 rounded-full bg-poynting flex-shrink-0" />
            <p>
              <strong className="text-poynting">Poynting Vector (S = E × B):</strong>
              {isACMode
                ? " In AC, since both E and B reverse together, S always points toward the load! Energy pulses at twice the frequency."
                : " Shows the direction of energy flow—from source to load through the surrounding space."}
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-2 h-2 mt-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
            <p>
              <strong className="text-cyan-400">Electrons:</strong> Blue dots moving in the wires. Note they move
              <em> opposite</em> to conventional current flow.
            </p>
          </div>
        </div>

        {isACMode && (
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border">
            <p className="text-xs">
              <strong className="text-primary">Key AC insight:</strong> The Poynting vector doesn't reverse!
              When current reverses, both E and B flip, but S = E × B stays pointed toward the resistor.
              The power magnitude oscillates as |sin(ωt)|², pulsing at twice the AC frequency.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
