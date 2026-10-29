// Gemeinsamer Renderer für Datenschutz, AGB und Widerrufsbelehrung: Die Texte
// liegen als `sections`-Array in messages/<locale>.json, damit DE und EN
// strukturgleich bleiben und Änderungen nur an einer Stelle passieren.

export type LegalProvider = { name: string; role: string; privacy: string }
export type LegalSection = {
  heading: string
  paragraphs?: string[]
  items?: string[]
  after?: string[]
  providers?: LegalProvider[]
  linkLabel?: string
}

export function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <>
      {sections.map((s) => (
        <section key={s.heading}>
          <h2 className="text-xl font-semibold text-ink mb-3">{s.heading}</h2>
          {s.paragraphs?.map((p, i) => <p key={i} className="text-sm mb-3">{p}</p>)}
          {s.items && (
            <ul className="space-y-1 text-sm list-disc list-inside text-ink-muted mb-3">
              {s.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          {s.providers && (
            <div className="space-y-3 text-sm mb-3">
              {s.providers.map((tp) => (
                <div key={tp.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-surface border border-line rounded-md px-4 py-3">
                  <span><span className="text-ink font-semibold">{tp.name}</span> – {tp.role}</span>
                  <a href={tp.privacy} target="_blank" rel="noopener noreferrer" className="text-indigo-text text-xs whitespace-nowrap">
                    {s.linkLabel}
                  </a>
                </div>
              ))}
            </div>
          )}
          {s.after?.map((p, i) => <p key={i} className="text-sm mb-3">{p}</p>)}
        </section>
      ))}
    </>
  )
}
