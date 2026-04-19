// game/levels.jsx — Level 2 (Parallel Recall) + Level 3 (RRF Fusion)

// ── Level 2 ──
function Level2() {
  const { state } = useGame();
  const { triggerLevel2, goToStage } = useGameActions();
  const [textReady, setTextReady] = React.useState(false);
  const [semReady,  setSemReady]  = React.useState(false);

  const hasSelections = Boolean(state.city && state.checkIn && state.budget);
  const results = React.useMemo(
    () => hasSelections ? getStageResults(state.city, state.budget) : null,
    [hasSelections, state.city, state.budget]
  );

  // Staggered reveal
  React.useEffect(() => {
    if (!state.level2Triggered) { setTextReady(false); setSemReady(false); return; }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setTextReady(true); setSemReady(true); return; }
    const t1 = setTimeout(() => setTextReady(true), 320);
    const t2 = setTimeout(() => setSemReady(true),  760);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [state.level2Triggered]);

  function handleFuse() {
    goToStage('level3');
    setTimeout(() => scrollToStage('stage-level3'), 60);
  }

  return (
    <section id="stage-level2" className="relative mx-auto w-full max-w-xl px-5 py-10">
      <LevelHeader number="02" title="Retrieve in parallel" subtitle="Run two retrieval paths on the same candidate set." technique="Parallel Recall" color="accent" />

      {/* Hard-condition recap pills */}
      <div className="mt-5 flex flex-wrap gap-2">
        {state.city    && <Pill>{state.city}</Pill>}
        {state.checkIn && <Pill>{state.checkIn}</Pill>}
        {state.budget  && <Pill>{BUDGET_MAP[state.budget].label}</Pill>}
      </div>

      {/* Query bar */}
      <div
        role="button" tabIndex={0}
        onClick={() => !state.level2Triggered && triggerLevel2()}
        onKeyDown={e => e.key === 'Enter' && !state.level2Triggered && triggerLevel2()}
        className={`mt-5 flex w-full cursor-pointer items-center gap-3 rounded-full border-[3px] border-ink px-4 py-3 text-left shadow-[3px_3px_0_0_theme(colors.ink)] transition-all
          ${state.level2Triggered ? 'bg-accent' : 'bg-primary hover:-translate-y-0.5 animate-cta-attention'}`}>
        <Icon name="search" size={18} strokeWidth={2.8} />
        <span className="min-w-0 flex-1 break-words font-mono text-[11px] font-bold leading-snug sm:text-xs">
          quiet, family-friendly, close to the main attractions
        </span>
        <span className={`shrink-0 rounded-full border-[2px] border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-widest
          ${state.level2Triggered ? 'bg-highlight text-white' : 'bg-highlight text-white animate-cta-ring'}`}>
          {state.level2Triggered ? 'running' : 'run'}
        </span>
      </div>

      {/* Two channels */}
      {(() => {
        const textIds = new Set(results?.text_top3.map(r => r.hotel_id) || []);
        const semIds  = new Set(results?.semantic_top3.map(r => r.hotel_id) || []);
        const semanticOnly = results?.semantic_top3.filter(r => !textIds.has(r.hotel_id)).map(r => getHotel(r.hotel_id)) || [];
        const textOnly     = results?.text_top3.filter(r => !semIds.has(r.hotel_id)).map(r => getHotel(r.hotel_id)) || [];
        return (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Channel
              title="Text Retrieval" tech="Inverted Index + BM25" accent="primary" iconName="search"
              ready={textReady}
              results={results?.text_top3.map(r => ({ hotel: getHotel(r.hotel_id), reasonTags: r.reason_tags }))}
              missed={semanticOnly}
              missedLabel="Text-only would miss"
              missedHint='Keyword match skips hotels that mean "quiet & family" but phrase it as "calm vibe" or "good for kids".'
            />
            <Channel
              title="Semantic Retrieval" tech="ANN Vector Retrieve" accent="accent" iconName="brain"
              ready={semReady}
              results={results?.semantic_top3.map(r => ({ hotel: getHotel(r.hotel_id), reasonTags: r.reason_tags }))}
              missed={textOnly}
              missedLabel="Semantic-only would miss"
              missedHint='Vector match can overlook exact hits — hotels that literally say "quiet" or "family-friendly".'
            />
          </div>
        );
      })()}

      {/* CTA */}
      <div className="mt-6 flex flex-col items-stretch gap-2">
        <button type="button" disabled={!textReady || !semReady} onClick={handleFuse}
          className={`cartoon-btn cartoon-btn-highlight h-14 w-full justify-center text-lg ${textReady && semReady ? 'animate-cta-attention' : ''}`}>
          Fuse the Ranking <Icon name="arrowDown" size={20} strokeWidth={3} />
        </button>
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Two Top 3 lists · one shared, one different
        </p>
      </div>
    </section>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border-[2px] border-ink bg-card px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0_0_theme(colors.ink)]">
      {children}
    </span>
  );
}

function Channel({ title, tech, accent, iconName, ready, results, missed, missedLabel, missedHint }) {
  const isPrimary = accent === 'primary';
  const headerBg  = isPrimary ? 'bg-primary' : 'bg-accent';
  return (
    <div className="cartoon-card overflow-hidden p-0">
      <div className={`flex items-center justify-between border-b-[3px] border-ink px-3 py-2 ${headerBg}`}>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border-[2px] border-ink bg-card">
            <Icon name={iconName} size={15} strokeWidth={2.8} />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold leading-none">{title}</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider opacity-70">{tech}</span>
          </div>
        </div>
        <span className="rounded-full border-[2px] border-ink bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">Top 3</span>
      </div>
      <div className="space-y-2 p-3">
        {!ready && [0,1,2].map(i => (
          <div key={i} className={`h-14 animate-pulse rounded-lg border-[2px] border-ink/40 ${isPrimary ? 'bg-primary/30' : 'bg-accent/30'}`} />
        ))}
        {ready && results?.map((r, idx) => (
          <div key={r.hotel.hotel_id} className="flex items-stretch gap-2 opacity-0"
            style={{ animation:'fadeSlideIn 500ms ease-out forwards', animationDelay:`${idx * 90}ms` }}>
            <span className={`flex w-7 shrink-0 items-center justify-center rounded-md border-[2px] border-ink font-display text-sm font-bold ${isPrimary ? 'bg-primary' : 'bg-accent'}`}>
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <HotelRow hotel={r.hotel} reasonTags={r.reasonTags} reasonAccent={accent} />
            </div>
          </div>
        ))}
      </div>
      {ready && missed && missed.length > 0 && (
        <div className="border-t-2 border-ink/30 bg-muted/60 px-3 py-2 opacity-0"
          style={{ animation:'fadeSlideIn 500ms ease-out 320ms forwards' }}>
          <div className="flex items-center gap-1.5">
            <Icon name="alertTriangle" size={12} strokeWidth={3} className="text-highlight" />
            <span className="font-display text-[10.5px] font-bold uppercase tracking-wider text-ink">{missedLabel}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {missed.map(h => (
              <span key={h.hotel_id} className="rounded-full border-[1.5px] border-ink/70 bg-card px-2 py-0.5 text-[10px] font-bold text-ink/90">
                {h.hotel_name}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[10.5px] font-semibold leading-snug text-muted-foreground">{missedHint}</p>
        </div>
      )}
    </div>
  );
}

// ── Level 3 ──
function Level3() {
  const { state } = useGame();
  const { fuseLevel3, win, openDeepDive, replay } = useGameActions();
  const [showFinal, setShowFinal] = React.useState(false);
  const [burst,     setBurst]     = React.useState(false);

  const results = React.useMemo(
    () => state.city && state.budget ? getStageResults(state.city, state.budget) : null,
    [state.city, state.budget]
  );

  React.useEffect(() => {
    if (state.stage !== 'level3' || !results) return;
    if (state.level3Fused) { setShowFinal(true); setBurst(true); return; }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = setTimeout(() => fuseLevel3(),      reduced ? 80  : 350);
    const t1 = setTimeout(() => setShowFinal(true), reduced ? 200 : 1400);
    const t2 = setTimeout(() => setBurst(true),     reduced ? 300 : 1700);
    return () => [t0, t1, t2].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage]);

  if (!results) return null;
  const finalHotels = results.final_top3.map(getHotel);

  return (
    <section id="stage-level3" className="relative mx-auto w-full max-w-xl px-5 py-10">
      <LevelHeader number="03" title="Final Ranking" subtitle="Text and semantic results are fused into one final Top 3." technique="RRF Fusion" color="highlight" />

      <div className="cartoon-card relative mt-6 overflow-hidden p-3 sm:p-4">
        {/* RRF center node (mobile: above columns, desktop: center column) */}
        <div className="mb-3 flex items-center justify-center gap-2 sm:hidden">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink bg-highlight shadow-[3px_3px_0_0_theme(colors.ink)] transition-transform ${!showFinal ? 'animate-pulse' : 'scale-110'}`}>
            <Icon name="gitMerge" size={18} strokeWidth={2.8} />
          </div>
          <span className="cartoon-chip cartoon-chip-highlight !text-[10px]">RRF · fusing</span>
        </div>

        <div className="relative grid grid-cols-2 items-start gap-2 sm:grid-cols-[1fr_auto_1fr]">
          <SideStack accent="primary" items={results.text_top3.map(r => ({ hotel: getHotel(r.hotel_id), reasons: r.reason_tags }))} converged={showFinal} direction="left" />

          {/* Desktop center */}
          <div className="hidden flex-col items-center gap-2 pt-8 sm:flex">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-ink bg-highlight shadow-[3px_3px_0_0_theme(colors.ink)] transition-transform ${!showFinal ? 'animate-pulse' : 'scale-110'}`}>
              <Icon name="gitMerge" size={22} strokeWidth={2.8} />
            </div>
            <span className="cartoon-chip cartoon-chip-highlight !text-[10px]">RRF</span>
          </div>

          <SideStack accent="accent" items={results.semantic_top3.map(r => ({ hotel: getHotel(r.hotel_id), reasons: r.reason_tags }))} converged={showFinal} direction="right" />
        </div>

        {/* Final Top 3 */}
        <div className={`mt-6 space-y-2 transition-all duration-500 ${showFinal ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div className="flex items-center justify-between">
            <span className="cartoon-chip cartoon-chip-highlight">
              <Icon name="sparkles" size={12} strokeWidth={3} /> Final Top 3
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">fused ranking</span>
          </div>
          {finalHotels.map((h, idx) => (
            <div key={h.hotel_id} className="flex items-stretch gap-2 opacity-0"
              style={{ animation:'fadeSlideIn 500ms ease-out forwards', animationDelay:`${idx * 120}ms` }}>
              <span className={`flex w-9 shrink-0 items-center justify-center rounded-md border-[2.5px] border-ink font-display text-lg font-bold
                ${idx === 0 ? 'bg-highlight text-white shadow-[2px_2px_0_0_theme(colors.ink)]' : 'bg-card'}`}>
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <HotelRow hotel={h} highlight={idx === 0} />
              </div>
            </div>
          ))}

          {(() => {
            const textIds = new Set(results.text_top3.map(r => r.hotel_id));
            const semIds  = new Set(results.semantic_top3.map(r => r.hotel_id));
            const shared    = results.text_top3.find(r => semIds.has(r.hotel_id));
            const textOnly  = results.text_top3.find(r => !semIds.has(r.hotel_id));
            const semOnly   = results.semantic_top3.find(r => !textIds.has(r.hotel_id));
            const sharedHotel = shared    && getHotel(shared.hotel_id);
            const textHotel   = textOnly  && getHotel(textOnly.hotel_id);
            const semHotel    = semOnly   && getHotel(semOnly.hotel_id);
            return (
              <div className="mt-4 rounded-xl border-[2px] border-ink bg-muted/70 p-3 opacity-0"
                style={{ animation:'fadeSlideIn 500ms ease-out 500ms forwards' }}>
                <div className="flex items-center gap-1.5">
                  <Icon name="sparkles" size={12} strokeWidth={3} className="text-highlight" />
                  <span className="font-display text-[11px] font-bold uppercase tracking-wider text-ink">Why fusion wins</span>
                </div>
                <p className="mt-1.5 text-[11px] font-semibold leading-snug text-ink/85">
                  RRF rewards hotels ranked well by <em className="font-display not-italic text-highlight">both</em> channels —
                  {sharedHotel && <> so the shared pick <span className="rounded border border-ink/60 bg-card px-1 py-0.5 text-[10.5px] font-bold">{sharedHotel.hotel_name}</span> rises to&nbsp;#1.</>}
                  {' '}It then pulls in each channel&rsquo;s best unique find:
                  {textHotel && <> <span className="rounded border border-ink/60 bg-primary px-1 py-0.5 text-[10.5px] font-bold">{textHotel.hotel_name}</span> from keyword hits,</>}
                  {semHotel && <> <span className="rounded border border-ink/60 bg-accent px-1 py-0.5 text-[10.5px] font-bold">{semHotel.hotel_name}</span> from meaning match.</>}
                  {' '}Neither alone would give you all three.
                </p>
              </div>
            );
          })()}
        </div>

        {/* Burst sticker */}
        {burst && (
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-start justify-center pt-12">
            <div style={{ animation:'pop 380ms ease-out both' }}>
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-ink bg-highlight shadow-[4px_4px_0_0_theme(colors.ink)]">
                <Icon name="crown" size={36} strokeWidth={2.8} className="text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post-fusion CTAs */}
      {showFinal && (
        <div className="mt-6 flex flex-col items-stretch gap-2" style={{ animation:'fadeSlideIn 500ms ease-out 200ms both' }}>
          <div className="flex gap-2">
            <button type="button"
              onClick={() => { win(); openDeepDive(); setTimeout(() => scrollToStage('stage-deepdive'), 60); }}
              className="cartoon-btn cartoon-btn-highlight animate-cta-attention h-14 flex-1 justify-center text-base sm:text-lg">
              See how Doris did it <Icon name="arrowRight" size={18} strokeWidth={3} />
            </button>
            <button type="button" onClick={() => { replay(); setTimeout(() => scrollToStage('stage-intro'), 60); }}
              aria-label="Replay"
              className="cartoon-btn cartoon-btn-ghost h-14 shrink-0 justify-center px-4">
              <Icon name="rotateCcw" size={18} strokeWidth={3} />
            </button>
          </div>
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Checkpoint · Best Match Found
          </p>
        </div>
      )}
    </section>
  );
}

function SideStack({ accent, items, converged, direction }) {
  const isPrimary = accent === 'primary';
  const bg = isPrimary ? 'bg-primary' : 'bg-accent';
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`cartoon-chip !text-[10px] ${isPrimary ? 'cartoon-chip-primary' : 'cartoon-chip-accent'}`}>
        {isPrimary ? 'Text' : 'Semantic'}
      </span>
      {items.map((r, idx) => (
        <div key={r.hotel.hotel_id}
          className={`rounded-xl border-[2px] border-ink px-2 py-1.5 text-[11px] font-bold shadow-[2px_2px_0_0_theme(colors.ink)] transition-all duration-700 ${bg}
            ${converged ? (direction === 'left' ? 'translate-x-2 opacity-40 blur-[0.5px]' : '-translate-x-2 opacity-40 blur-[0.5px]') : ''}`}>
          <div className="flex items-center justify-between gap-1">
            <span className="truncate">{r.hotel.hotel_name}</span>
            <span className="shrink-0 font-mono text-[10px] opacity-70">#{idx+1}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Level2, Level3 });
