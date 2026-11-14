---
layout: post.njk
title: No Reason to Be Kind
kicker: Field notes / tooling
standfirst: >-
  Out of a fifty-seven-item command catalogue, this setup kept exactly one. Before it went anywhere
  else, its first two real findings were sent, unprompted, to the actual owner of a document it had
  never seen. Both were accepted and implemented without being asked.
description: >-
  A single prompt file built to assemble ten named software-engineering experts against any
  document survived a fifty-seven-item tool catalogue. Why it earned that trust only after its
  first real findings changed a stranger project's document, unprompted.
date: 2026-11-14
bylineTags: ["tool evaluation", "external validation"]
permalink: /no-reason-to-be-kind/
---
<style>
  /* Expert roster — the command's own panel: ten records, four fields each. Kept as a real table
     in the house grammar (hairlines only, no fill, no radius) but folded from four columns to two.
     At 720px a four-way split leaves the sample-critique sentences about 180px each and they stop
     being sentences. Each cell stacks its two fields in the same order the header stacks its two
     labels, so nothing is inferred from position alone and no column label is dropped. Base sets
     table-layout: fixed per row, so the split has to be stated on every row's first cell, not just
     the header (same reason .topo does it in not-the-integrated-gpu). Scoped, not promoted — a
     ten-name roster is this piece's own shape, and nothing else on the site has one. */
  .panel { font-size: 15px; }
  .panel thead th:first-child { width: 38%; }
  /* Stays scoped: .panel is the only one of the four that ever set this, and promoting it flipped
     .topo, .focus and .receipts from baseline to top — caught by pixel-diffing the render, not by
     the width/height probe, which reported the change as geometrically identical. */
  .panel th, .panel td { vertical-align: top; }
  .panel thead th .sub { display: block; margin-top: 5px; }
  /* Display face against the serif body, not moss: these ten are the command's contents, not the
     entities the piece is evaluating (BRAND keeps moss tight, and .entity is spent on SuperClaude
     and spec-panel in the prose). A face change reads harder than serif bold at this size. */
  .panel th[scope="row"] {
    font-family: var(--font-display); font-weight: 700; font-size: 17px;
    letter-spacing: -0.015em; line-height: 1.25; color: var(--ink);
    padding-right: 20px; text-transform: none;
  }
  .panel .cred, .panel .meth {
    display: block; font-family: var(--font-mono); font-size: 11px; font-weight: 400;
    line-height: 1.5; letter-spacing: 0.04em; color: var(--ink-dim); text-transform: none;
  }
  .panel .cred { margin-top: 7px; }
  .panel .ask {
    display: block; font-style: italic; line-height: 1.5;
    color: var(--ink-dim); margin-top: 9px;
  }
  /* Focus panels — four short rows, three short cells each. Stays a plain table on purpose: the
     column is headed "lead first", so the order inside each panel carries real information a
     tick-grid against the roster above would erase. */
  .focus { margin: 0 0 24px; }
  .focus thead th:first-child { width: 20%; }
  .focus thead th:nth-child(2) { width: 38%; }
  .focus th[scope="row"] {
    font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em;
    font-weight: 400; color: var(--loch); text-transform: none;
  }
  /* Receipts — one review per row, and the found/fixed count is a ratio, not a state, so it takes
     no tick/cross/circle. .ledger's three marks would have to classify 4/7 and 3/5 as something,
     and that classification is not in the source. Mono and right-aligned so the column reads as a
     count; deliberately one colour for every row, because a colour here would be a verdict the
     running log does not carry. */
  .receipts thead th:first-child { width: 30%; }
  .receipts thead th:nth-child(2) { width: 55%; }
  .receipts th[scope="row"] { padding-right: 20px; }
  .receipts .fix {
    font-family: var(--font-mono); font-size: 16px; font-weight: 500;
    color: var(--ink); text-align: right; padding-right: 0;
  }
  .receipts thead th.fix { font-size: 11px; font-weight: 500; color: var(--ink-dim); }
  @media (max-width: 560px) {
    /* Both wide tables unstack: each record becomes one hairline-ruled block and the header row
       becomes a legend above them, so every column label survives the narrow viewport instead of
       being hidden. Same move .ledger already makes at 620px. .focus keeps its columns — its cells
       are short enough to survive the compression. */
    .panel, .panel thead, .panel tbody, .panel tr, .panel th, .panel td,
    .receipts, .receipts thead, .receipts tbody, .receipts tr, .receipts th, .receipts td {
      display: block; width: auto;
    }
    /* Undoing the desktop split used to need the SAME pseudo-class selector shape it was set with,
       or a plain reset lost on specificity and the cells stayed 38%/30% wide while displaying as
       blocks — a squeezed column that measures clean and reads wrong (caught on a 375px probe, not
       by eye). Since S67 the widths live on <thead>, which this block hides outright on .panel and
       .receipts, so there is nothing left to undo. Kept for .focus, which keeps its columns. */
    .panel thead th:first-child,
    .receipts thead th:first-child,
    .receipts thead th:nth-child(2) { width: auto; }
    .panel th, .panel td, .receipts th, .receipts td { border-bottom: 0; padding: 0 0 0 0; }
    .panel thead, .receipts thead {
      border-bottom: 1px solid var(--rule); padding-bottom: 12px;
    }
    .panel thead th, .receipts thead th { padding-bottom: 3px; }
    .panel tbody tr, .receipts tbody tr {
      border-bottom: 1px solid var(--rule); padding: 16px 0;
    }
    .panel td { padding-top: 9px; }
    .receipts td { padding-top: 9px; }
    .receipts .fix { text-align: left; }
    /* .focus keeps its three columns — the cells are short and the lookup is the point. But the
       longest focus name ("requirements") measures 92px in mono 13px and the first column was
       81px at 375 and 68px at 320, so the label ran out of its own cell. 34% clears it at both
       (92px of text in a 97px box at the narrowest); 32% did not, by one pixel. */
    .focus { font-size: 13px; }
    .focus thead th:first-child { width: 34%; }
    .focus thead th:nth-child(2) { width: 34%; }
  }
</style>

<section class="lead">

<span class="entity">SuperClaude</span> is the same configuration layer for Claude Code covered here before: slash commands,
agents, behavioural modes, fifty-seven items in the catalogue in total. Two of them were already
out. `/sc:pm` turned out to be a session-management layer built entirely from calls to a server
this setup doesn't run. Deep Research mode wanted to run unbounded, multi-hop searches with no
cost gate in sight. Out of everything left, this setup kept exactly one command:

<p class="cmd"><span class="p">&rsaquo;</span> /sc:spec-panel</p>

<figure class="fig">
  <div class="ratio">
    <div class="ratio-col s1"><div class="ratio-bar" style="height: 100%"></div></div>
    <div class="ratio-col"><div class="ratio-bar" style="height: 1.75%"></div></div>
  </div>
  <div class="ratio-key">
    <div><b>fifty-seven</b><span>items in the catalogue</span></div>
    <div><b>one</b><span>command kept</span></div>
  </div>
</figure>

</section>

<section>

## <span class="h2-num">one prompt, ~440 lines</span>What it actually is

No install, no MCP (Model Context Protocol) server, no dependency on the rest of the framework. The command file is a
single prompt, about four hundred and forty lines long, that assembles a panel of real named
software engineers and has each one critique a document through their own actual documented
methodology.

<figure class="fig">
  <table class="reftable panel">
    <thead>
      <tr>
        <th scope="col">Expert<span class="sub">Real-world credential</span></th>
        <th scope="col">Methodology<span class="sub">Sample critique it's instructed to ask</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Karl Wiegers<span class="cred">Requirements engineering pioneer, author of <em>Software Requirements</em></span></th>
        <td><span class="meth">SMART criteria, testability analysis, stakeholder validation</span><span class="ask">"This requirement lacks measurable acceptance criteria. How would you validate compliance in production?"</span></td>
      </tr>
      <tr>
        <th scope="row">Gojko Adzic<span class="cred">Creator of Specification by Example</span></th>
        <td><span class="meth">Given/When/Then scenarios, example-driven requirements, collaborative specification</span><span class="ask">"Can you provide concrete examples demonstrating this requirement in real-world scenarios?"</span></td>
      </tr>
      <tr>
        <th scope="row">Alistair Cockburn<span class="cred">Use-case methodology pioneer, Agile Manifesto co-author</span></th>
        <td><span class="meth">Goal-oriented analysis, primary-actor identification, scenario modeling</span><span class="ask">"Who is the primary stakeholder here, and what business goal are they trying to achieve?"</span></td>
      </tr>
      <tr>
        <th scope="row">Martin Fowler<span class="cred">Software architecture and refactoring, Thoughtworks</span></th>
        <td><span class="meth">Interface segregation, bounded contexts, refactoring patterns</span><span class="ask">"This interface violates the single responsibility principle. Consider separating concerns."</span></td>
      </tr>
      <tr>
        <th scope="row">Michael Nygard<span class="cred">Author of <em>Release It!</em></span></th>
        <td><span class="meth">Failure-mode analysis, circuit-breaker patterns, operational excellence</span><span class="ask">"What happens when this component fails? Where are the monitoring and recovery mechanisms?"</span></td>
      </tr>
      <tr>
        <th scope="row">Sam Newman<span class="cred">Microservices and distributed systems author</span></th>
        <td><span class="meth">Service decomposition, API versioning, distributed system patterns</span><span class="ask">"How does this specification handle service evolution and backward compatibility?"</span></td>
      </tr>
      <tr>
        <th scope="row">Gregor Hohpe<span class="cred">Co-author, <em>Enterprise Integration Patterns</em></span></th>
        <td><span class="meth">Message-driven architecture, integration patterns, event-driven design</span><span class="ask">"What's the message exchange pattern here? How do you handle ordering and delivery guarantees?"</span></td>
      </tr>
      <tr>
        <th scope="row">Lisa Crispin<span class="cred">Agile testing author</span></th>
        <td><span class="meth">Whole-team, risk-based testing, quality attribute specification</span><span class="ask">"How would the testing team validate this requirement? What are the edge cases and failure scenarios?"</span></td>
      </tr>
      <tr>
        <th scope="row">Janet Gregory<span class="cred">Testing advocate, co-author with Crispin</span></th>
        <td><span class="meth">Specification workshops, "three amigos", quality conversation facilitation</span><span class="ask">"Did the whole team participate in creating this specification? Are quality expectations clearly defined?"</span></td>
      </tr>
      <tr>
        <th scope="row">Kelsey Hightower<span class="cred">Cloud-native and Kubernetes advocate</span></th>
        <td><span class="meth">Cloud-native patterns, infrastructure automation, operational observability</span><span class="ask">"How does this handle cloud-native deployment and operational concerns?"</span></td>
      </tr>
    </tbody>
  </table>
</figure>

The command does not throw all ten at every document. A focus flag picks a smaller panel suited
to the document's shape:

<table class="reftable focus">
  <thead>
    <tr><th scope="col">Focus</th><th scope="col">Panel (lead first)</th><th scope="col">For</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">requirements</th><td>Wiegers, Adzic, Cockburn</td><td>Constraints and requirement lists</td></tr>
    <tr><th scope="row">architecture</th><td>Fowler, Newman, Hohpe, Nygard</td><td>System-design and interface documents</td></tr>
    <tr><th scope="row">testing</th><td>Crispin, Gregory, Adzic</td><td>Test strategy, acceptance-criteria coverage</td></tr>
    <tr><th scope="row">compliance</th><td>Wiegers, Nygard, Hightower</td><td>Security, audit, operational-risk documents</td></tr>
  </tbody>
</table>

Native invocation, straight from the framework, takes a mode, an expert list, a focus area and a
format. On this setup it runs differently: as a promoted Claude Code skill, called directly rather
than through the framework:

```
Skill({ skill: "spec-panel", args: "@<path-to-file> --mode critique --focus requirements --format standard" })
```

The skill hands back the expert-panel prompt. The calling session then reads the actual target
file and performs the critique itself, with context on the file's intent an outside reviewer would
never have.

</section>

<section>

## <span class="h2-num">two findings, both accepted</span>Proving it before trusting it

A prompt file assembling ten famous names is easy to admire and easy to fool yourself about.
Before this one went anywhere beyond the project that pulled it out, its first two real findings
were sent, unprompted, to the actual owner of a document it had never seen — a cross-project
routing policy belonging to a different project on this same setup — an owner with no reason to
accept anything from a tool it had never asked for.

<blockquote><p>"immediately" unmeasurable; no story for a nudge whose target session never reopens</p></blockquote>

<blockquote><p>undefined trigger words ("long"/"multi-step"/"low-interaction"); no positive-compliance example;
prior fix not tied back to existing dispatch machinery</p></blockquote>

Both were accepted and implemented independently. That was the bar <span class="entity">spec-panel</span> had to clear before
it became a shared command available to every project on the setup. Not "this sounds like good
advice." The document's actual owner read it and changed the rule.

</section>

<section>

## <span class="h2-num">0/0 to 6/6</span>The receipts

<figure class="fig">
  <table class="reftable receipts">
    <thead>
      <tr>
        <th scope="col">Document type</th>
        <th scope="col">What was found</th>
        <th scope="col" class="fix">Fixed?</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">A cross-project dispatch and routing policy document</th>
        <td>"queued send_message result never stated as success vs. pending"</td>
        <td class="fix">1/1</td>
      </tr>
      <tr>
        <th scope="row">The same policy document, self-reviewed later by its own owning project</th>
        <td>"misroute schema self-contradiction; concurrent-append atomicity assumed, never stated; no catastrophic-corruption recovery stance; decided_by audit loop was write-only; Codex graduation bar undefined; deep-research compliance check had no numeric floor"</td>
        <td class="fix">6/6</td>
      </tr>
      <tr>
        <th scope="row">A trading-analytics project's own constraints file</th>
        <td>"stale duplicate-SELL-gap claim (fixed in code, doc never updated); Current-Release section stale (178 vs actual 180 tests, 3 commits unreflected); ambiguous no-subject constraint clause"</td>
        <td class="fix">3/3</td>
      </tr>
      <tr>
        <th scope="row">A personal finance tracker's project handoff document</th>
        <td>Seven issues found, four fixed: a stale test count (claimed 121, actual 143), a false "no test file" gap claim for a module that actually had 22 real passing tests undocumented, the same stale count duplicated across two other files, and a stale next-step note for work already done. The other three (a wrong section cross-reference, a minor line-anchor drift, missing staleness signalling on regenerated counts) were flagged and deferred, not fixed</td>
        <td class="fix">4/7</td>
      </tr>
      <tr>
        <th scope="row">One module of a personal dashboard suite's own constraints file</th>
        <td>"self-contradicting/stale pin claim (line 15 said Current Release v1.17, the module-status section 29 lines later still said pinned 1.9, live 1.16); consistencyUrl's failure-mode degradation undocumented despite existing in code, asymmetric with the documented liveUrl behavior"</td>
        <td class="fix">2/2</td>
      </tr>
      <tr>
        <th scope="row">The parent hub of that same dashboard suite, reviewed independently the same day</th>
        <td>"Current Release's per-module version prose had already gone stale the same day it was written (said Studio v0.3.0, live manifest already 0.4.0); resolved session narrative duplicating another file; an undefined-trigger clause with no actor or condition named"</td>
        <td class="fix">3/3</td>
      </tr>
      <tr>
        <th scope="row">This setup's own global rulebook, the file every project reads on session start</th>
        <td>"duplicated INBOX-delivery procedure had drifted from its source (stale 'immediately,' missing the queued-success clause, missing the sender-slug filename shape); the Homes convention violated by full duplication instead of a pointer"</td>
        <td class="fix">3/5</td>
      </tr>
      <tr>
        <th scope="row">A design-token reference document</th>
        <td>Checked nine canonical tokens plus heading size, badge and button geometry, and a documented override against the live CSS. Every value matched. No findings</td>
        <td class="fix">0/0</td>
      </tr>
    </tbody>
  </table>
  <figcaption class="fig-cap">That is a snapshot of a running log, taken for this piece, not a constant.</figcaption>
</figure>

Two of the rows are worth sitting with regardless of what the count reads on any given day.

The dashboard suite pair, a parent hub and one of its own modules, were reviewed independently by
two different sessions on the same calendar day, neither aware of the other's result. Both turned
up the same defect: a live version number, typed into prose, already stale next to the one place
that actually tracked it.

The global-rulebook row is stranger still. The bug was in the global rulebook's own copy of the
cross-project delivery procedure, the mechanism that lets one project hand a proposal to another.
It had been duplicated from the routing project's own document instead of pointing at it, and had
drifted from that source twice because nothing forced the copy to stay in sync. The fix wasn't a
third rewrite. It was deleting the copy and leaving a pointer, so it couldn't drift again.

</section>

<section>

## <span class="h2-num">two findings rejected</span>What it actually taught, past "the tool works"

Not every vague-sounding phrase is a defect. A document meant to work identically across many
unrelated contexts sometimes needs things left underspecified on purpose; pin them down and every
context except the one you were thinking about breaks. A second look rejected two of the findings
that had flagged "unmeasurable" language, for exactly this reason.

A document thorough about failure modes is usually silent about the case where everything goes
right. Every document reviewed so far described what breaks in detail and showed no worked
example of the correct path end to end.

A proposed fix has to be checked against what actually reads the document, not its own wording. One fix assumed a downstream tool enforced a line-count limit. Reading the real parser
that consumed the document found the limit was never enforced at all. Only exact section headings
and bullet markers were. This setup rewrote the fix around the real mechanism instead of the
plausible-sounding assumption.

</section>

<section>

## <span class="h2-num">no gate, no limit</span>What's still open

There is no cost gate and no volume limit on spec-panel itself. Coverage depends entirely on
someone remembering to point it at something. Nobody tracks that automatically, and nothing forces
a project to run it twice on the same document to catch drift. The numbers above are already out
of date by the time anyone reads them. That is how a running log works, not a flaw in it.

</section>
