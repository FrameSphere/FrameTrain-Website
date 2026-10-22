type Input = { label: string; title: string }

type Props = {
  aria: string
  inputs: Input[]
  outputLabel: string
  outputTitle: string
  outputFile: string
  exportLabel: string
}

/**
 * Das Logo in groß: drei Eingänge, ein oranger Ausgang.
 *
 * Kleine Punkte wandern die Leitungen entlang in den Output-Knoten – das
 * Bild "deine Daten fließen in dein Modell" in Bewegung. Reines SVG mit
 * SMIL, also ohne JavaScript und schon im Server-HTML vollständig.
 * Bei prefers-reduced-motion verschwinden Partikel und Puls (CSS unten).
 */
export function NeuronDiagram({ aria, inputs, outputLabel, outputTitle, outputFile, exportLabel }: Props) {
  const ys = [80, 190, 300]
  const wires = [
    'M300 80 C 450 80, 490 190, 586 190',
    'M300 190 L 586 190',
    'M300 300 C 450 300, 490 190, 586 190',
  ]
  const mobileYs = [52, 142, 232]
  const mobileWires = [
    'M40 52 C 150 52, 160 142, 232 142',
    'M40 142 L 232 142',
    'M40 232 C 150 232, 160 142, 232 142',
  ]

  return (
    <figure className="ft-neuron m-0">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ft-neuron .ft-particle, .ft-neuron .ft-pulse { display: none; }
        }
      `}</style>

      {/* Desktop */}
      <svg viewBox="0 0 1040 380" className="hidden md:block w-full h-auto" role="img" aria-label={aria}>
        <g fill="none" stroke="var(--ink)" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round">
          {wires.map((d, i) => (
            <path key={i} id={`ft-wire-${i}`} d={d} />
          ))}
        </g>

        {/* Partikel: je Leitung zwei, zeitversetzt */}
        {wires.map((d, i) =>
          [0, 1].map((k) => (
            <circle key={`${i}-${k}`} className="ft-particle" r="3.5" fill="var(--ink)">
              <animateMotion dur="2.6s" repeatCount="indefinite" begin={`${i * 0.45 + k * 1.3}s`} path={d} />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2.6s" repeatCount="indefinite" begin={`${i * 0.45 + k * 1.3}s`} />
            </circle>
          ))
        )}

        {ys.map((y, i) => (
          <g key={i}>
            <circle cx="300" cy={y} r="9" fill="var(--ink)" />
            <text x="272" y={y - 6} textAnchor="end" fill="var(--ink-faint)" style={{ font: '500 11px var(--font-mono)', letterSpacing: '0.14em' }}>
              {inputs[i]?.label.toUpperCase()}
            </text>
            <text x="272" y={y + 18} textAnchor="end" fill="var(--ink)" style={{ font: '600 20px var(--font-sans)', letterSpacing: '-0.02em' }}>
              {inputs[i]?.title}
            </text>
          </g>
        ))}

        {/* Output-Knoten mit leisem Puls */}
        <circle className="ft-pulse" cx="640" cy="190" r="54" fill="none" stroke="var(--output)" strokeWidth="1.5">
          <animate attributeName="r" values="54;86" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.55;0" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="640" cy="190" r="54" fill="var(--output)" />

        <text x="730" y="160" fill="var(--output-text)" style={{ font: '500 11px var(--font-mono)', letterSpacing: '0.14em' }}>
          {outputLabel.toUpperCase()}
        </text>
        <text x="730" y="192" fill="var(--ink)" style={{ font: '600 26px var(--font-sans)', letterSpacing: '-0.03em' }}>
          {outputTitle}
        </text>
        <text x="730" y="218" fill="var(--ink-faint)" style={{ font: '400 12px var(--font-mono)' }}>
          {outputFile}
        </text>

        {/* Gestrichelter Weg Richtung Export */}
        <path d="M684 226 C 760 300, 860 322, 1000 322" fill="none" stroke="var(--indigo-text)" strokeWidth="1.5" strokeDasharray="5 7" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" values="24;0" dur="1.6s" repeatCount="indefinite" />
        </path>
        <circle cx="1000" cy="322" r="4" fill="var(--indigo-text)" />
        <text x="1000" y="306" textAnchor="end" fill="var(--indigo-text)" style={{ font: '500 11px var(--font-mono)', letterSpacing: '0.14em' }}>
          {exportLabel.toUpperCase()}
        </text>
      </svg>

      {/* Mobil */}
      <svg viewBox="0 0 360 300" className="md:hidden w-full max-w-[400px] mx-auto h-auto" role="img" aria-label={aria}>
        <g fill="none" stroke="var(--ink)" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round">
          {mobileWires.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {mobileWires.map((d, i) => (
          <circle key={i} className="ft-particle" r="3" fill="var(--ink)">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${i * 0.5}s`} path={d} />
          </circle>
        ))}
        {mobileYs.map((y, i) => (
          <g key={i}>
            <circle cx="40" cy={y} r="8" fill="var(--ink)" />
            <text x="24" y={y - 18} fill="var(--ink-faint)" style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.12em' }}>
              {inputs[i]?.title.toUpperCase()}
            </text>
          </g>
        ))}
        <circle className="ft-pulse" cx="272" cy="142" r="40" fill="none" stroke="var(--output)" strokeWidth="1.5">
          <animate attributeName="r" values="40;62" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.55;0" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="272" cy="142" r="40" fill="var(--output)" />
        <text x="272" y="214" textAnchor="middle" fill="var(--output-text)" style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.12em' }}>
          {outputLabel.toUpperCase()}
        </text>
        <text x="272" y="238" textAnchor="middle" fill="var(--ink)" style={{ font: '600 18px var(--font-sans)', letterSpacing: '-0.02em' }}>
          {outputTitle}
        </text>
      </svg>
    </figure>
  )
}
