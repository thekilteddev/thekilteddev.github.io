---
layout: post.njk
title: Never installable
kicker: Field notes / debugging
standfirst: >-
  First the browser took the blame, then the host. It was two 68-byte icon files, and nothing
  anywhere had ever raised an error. A check that fails silently hides behind whatever changed most
  recently.
description: >-
  Field notes from a food-diary proof of concept built alongside one NHS dietetic team, not an NHS
  product. Why its barcode scanner never reports a calorie, and how two 68-byte icon files made it
  impossible to install without raising an error.
date: 2026-09-19
bylineTags: ["PWA", "real-device testing"]
permalink: /never-installable/
---

<section class="lead">

For three days of real-device testing, the app worked, or seemed to. Every test passed. Every review
came back clean. On a real phone, it had never once been installable, and nothing had ever said so.

This is a proof-of-concept, not an NHS product. It was built by one technical person working
alongside an NHS dietetic team. No patient data exists anywhere in it. Nothing leaves the
device unless a lookup runs, and even then it sends nothing but the barcode number itself. Clients
had been sending in photos and rough text descriptions of what they'd eaten, and a dietitian was
manually reading that, finding the matching product, and keying it into
<a href="https://www.nutritics.com/en/">Nutritics</a>, the accredited
nutrition-analysis software the team already used. Nutritics has its own patient-facing app, Libro,
that would let clients log the food themselves and skip all of that. Libro just isn't enabled for
this region, and turning it on is weeks away at best, if it happens at all. So the trial runs a
smaller experiment instead. It makes the manual keying-in as fast and unambiguous as it can be, and
doubles as evidence for whether Libro is worth switching on.

That's the frame. The build itself comes down to two decisions that held, and a run of confidently
wrong guesses before the real one.

</section>

<section>

## <span class="h2-num">4 of 4 lookups wrong</span>Why it never asserts a calorie figure

The first thing tried was the obvious move. Point a consumer nutrition app at a barcode and let it
fill in the numbers. Three were tried.

<div class="stat-rows">
  <div class="stat-row"><div class="stat-name">Cronometer</div><p class="stat-desc">The first four barcode and photo lookups all came back wrong. Correcting them by hand was painful enough that the question settled itself.</p></div>
  <div class="stat-row"><div class="stat-name">MyFitnessPal</div><p class="stat-desc">Barcode scanning has sat behind a Premium paywall since October 2022, so the one app most clients already had was already a dead end.</p></div>
  <div class="stat-row"><div class="stat-name">Open Food Facts</div><p class="stat-desc">A free, open, no-account database of product names, and the only one that gave anything back reliably. Even then it only names a product. It doesn't know its nutrition.</p></div>
</div>

Reading digits off a barcode is deterministic and checkable, and that was never where Cronometer
failed. It failed at mapping those digits to the right nutrition record through a crowdsourced
database, and that's the exact spot it got wrong four times running. So the tool draws a hard line
at that exact seam. It reads barcodes. It never writes a nutrition figure. Nutritics, with roughly
1.6 million EUROFIR-accredited foods, stays the only source of truth for what anything
contains.

<p class="pull">If the tool never claims a calorie number, it can never be the reason someone has to
unpick a wrong one later.</p>

The same discipline runs through barcode validation. A GS1 check digit rejected every single-digit
misread thrown at it in testing, 351 out of 351, which covers the failure mode that actually happens
when a camera misreads a smudged label. But roughly one in ten arbitrary thirteen-digit numbers will
satisfy that check by pure chance, tested against a hundred thousand random numbers, so "the check
digit agrees" only ever means the check digit agrees, not that the barcode is definitely the right
product. An earlier draft of the docs called barcodes "self-verifying." The project corrected that
before shipping, because it was a stronger claim than the tool could back.

</section>

<section>

## <span class="h2-num">120 occasions, 35 foods</span>Thirty-five foods, not a hundred and twenty

The one insight that shaped everything downstream came from watching how Nutritics itself behaves,
not from the client side at all. Its diet-log workspace works like a spreadsheet, and once a
dietitian has searched for a food and dropped it into one day's log, that same food can be added to
any other day or meal without searching again.

A week's diary might run to something like a hundred and twenty logged eating occasions. Searched
food by food, that's a hundred and twenty searches. But a person doesn't eat a hundred and twenty
different things in a week. The same handful of items repeat across breakfasts and snacks. Counted
by distinct food instead of by occasion, the same week might only need thirty-five searches. That's
the number the design optimises, and it's why the data model splits in two: a Food Library,
where every distinct food gets listed once against a short code, and a Daily Log, where each eating
occasion just references a code and a quantity. A dietitian keying a week's diary isn't doing a
hundred and twenty lookups anymore. They're doing thirty-five, and then a lot of quick copy-paste.

<figure class="fig">
  <div class="ratio">
    <div class="ratio-col s1"><div class="ratio-bar" style="height: 100%"></div></div>
    <div class="ratio-col"><div class="ratio-bar" style="height: 29.1667%"></div></div>
  </div>
  <div class="ratio-key">
    <div><b>120</b><span>searches &mdash; one per eating occasion</span></div>
    <div><b>35</b><span>searches &mdash; one per distinct food</span></div>
  </div>
  <figcaption class="fig-cap">One week of a client's diary, counted two ways. The same seven days hold about a hundred and twenty logged eating occasions and about thirty-five distinct foods. Only the distinct foods have to be searched for.</figcaption>
</figure>

It's a small reframe with a real effect on the person doing the keying, and it came from
reading how the existing software worked rather than guessing at what a food diary "should" look
like.

</section>

<section>

## <span class="h2-num">2 of 4 gave nothing</span>The bugs only a real phone could find

None of this survived contact with a phone unscathed. The front end shipped as a vanilla-JS
progressive web app, deliberately with no build toolchain (this was meant to be a short-lived trial
workaround, not a product, and a bundler is more to maintain than that deserves). Every change
afterward went through a fresh implementer and an independent reviewer before merging, and that
review step earned its keep almost every round. A camera-conflict race here, a wrong assumption
about a third-party API there.

The export path took the worst of it. The first version silently did nothing when someone tapped
"Download" on an Android phone in DuckDuckGo, because a CDN script, `xlsx.full.min.js`, that the
service worker hadn't cached could fail to load without throwing anything visible.

The fix that followed introduced its own bug: the downloaded file came back as `.bin` instead of
`.xlsx`, because the fallback download mechanism wasn't reliably setting the file's MIME type on
that browser. Fixed by building the download from an explicit Blob instead.

Then a third bug, sneakier than either. The app would report "Downloaded" with nothing appearing,
because the click handler waited on three IndexedDB round-trips before triggering the download, and
that wait was long enough for the phone to quietly expire the tap's permission to trigger one at
all. Nothing threw an error, no dialog appeared, and the app still reported "Downloaded" as if it
had. The fix was to pre-build the export the moment the screen opened, so the tap had almost nothing
left to wait on.

A fourth export bug turned out not to be this app's to fix. Sharing the file to WhatsApp on Chrome
Android threw a permission error even though the browser's own API had said sharing was possible. An
A/B test settled why. A plain text file shared fine. The identical share, swapped to the real xlsx
MIME type, failed every time. That's Android Chrome's own share implementation rejecting the file
type at the native layer, and the fix is a fallback, not a workaround: catch that specific
failure and drop back to the working download path.

<figure class="fig">
  <div class="trials">
    <div class="trial-h"></div>
    <div class="trial-h">announced itself</div>
    <div class="trial-h">this app's bug</div>
    <div class="trial-r">silent no-op</div>
    <div class="trial no">silent</div>
    <div class="trial yes">yes</div>
    <div class="trial-r">wrong file type</div>
    <div class="trial yes">visible</div>
    <div class="trial yes">yes</div>
    <div class="trial-r">nothing downloaded</div>
    <div class="trial no">silent</div>
    <div class="trial yes">yes</div>
    <div class="trial-r">share blocked</div>
    <div class="trial yes">visible</div>
    <div class="trial no">no</div>
  </div>
  <figcaption class="fig-cap">Four export bugs, all of them found on a real phone. The two that gave nothing to go on were both this app's. The only one that threw an actual error was Android Chrome refusing the file type at the native layer.</figcaption>
</figure>

</section>

<section>

## <span class="h2-num">two theories, both wrong</span>Two files, sixty-eight bytes each

The bug that cost the most time wasn't in any of that. It was that the app was never actually
installable, on any browser, on any host, the entire time.

The manifest declared full-size icons, but the two actual icon files behind it were 68-byte
placeholder stubs, one pixel by one pixel. Chrome checks that a PWA's declared icons actually exist
at the sizes it claims. When they don't, nothing in the console warns about it, no error ever fires,
and the "Install app" option just never appears. "Add to Home Screen" still worked, but it could only
ever produce a bookmark shortcut, not a real installed app, so offline never worked either. The
service worker, the manifest, and the caching logic underneath all of it had been correct from the
start.

<figure class="fig">
  <svg class="icon-check-fig" viewBox="0 0 660 200" role="img" aria-label="What Chrome's install check compared. On one side, the manifest declared full-size icons, which is what Chrome went looking for. On the other, what was actually on disk: two placeholder stubs of sixty-eight bytes each, one pixel square. The two do not match, and the mismatch produces no console warning, no error, and no Install app option. Nothing anywhere reports the failure.">
    <text x="0" y="12" font-family="var(--font-mono)" font-size="11.5" letter-spacing="0.05em" fill="var(--ink-dim)">WHAT THE INSTALL CHECK COMPARED</text>
    <line x1="0" y1="22" x2="648" y2="22" stroke="var(--rule)" stroke-width="1"></line>
    <rect x="0" y="38" width="300" height="110" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
    <text x="14" y="58" font-family="var(--font-mono)" font-size="12" fill="var(--ink-dim)">declared in the manifest</text>
    <text x="14" y="88" font-family="var(--font-mono)" font-size="14" fill="var(--ink)">full-size icons</text>
    <text x="14" y="118" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">what Chrome went looking for</text>
    <line x1="312" y1="85" x2="328" y2="101" stroke="var(--bad)" stroke-width="2"></line>
    <line x1="328" y1="85" x2="312" y2="101" stroke="var(--bad)" stroke-width="2"></line>
    <rect x="344" y="38" width="304" height="110" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
    <text x="358" y="58" font-family="var(--font-mono)" font-size="12" fill="var(--bad)">actually on disk</text>
    <text x="358" y="88" font-family="var(--font-mono)" font-size="14" fill="var(--ink)">68 bytes, one pixel square</text>
    <text x="358" y="118" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">two placeholder stubs</text>
    <text x="0" y="178" font-family="var(--font-mono)" font-size="12" fill="var(--ink-dim)">no console warning, no error thrown, no Install app option</text>
  </svg>
  <figcaption class="fig-cap">The check ran correctly and failed correctly. What it never did was say so &mdash; which is why the browser and then the host each took the blame first.</figcaption>
</figure>

Before anyone found the icons, two other theories took the blame instead. First the browser: maybe
DuckDuckGo's PWA support was incomplete. Then the host: maybe something about how Namecheap served
the files was the difference from the version that had worked fine on Netlify. Both theories were
plausible. Both were wrong. An earlier comparison between the two hosts had already been written up
as "decisive, host-specific." The actual difference was that Netlify's service-worker cache had
been warm for months and Namecheap's was cold, and that warm cache had quietly been hiding two
unrelated bugs the whole time. What surfaced all three bugs at once was a fresh cache forcing every code path
to run for real, on a real phone, for the first time.

| Theory | Evidence against | Verdict |
|---|---|---|
| DuckDuckGo's PWA support was incomplete | The app never became installable on other browsers either | <span class="tag bad">Ruled out</span> |
| Namecheap served the files differently than Netlify | The real difference was cache warmth — Netlify's service-worker cache had been warm for months, Namecheap's was cold | <span class="tag bad">Ruled out</span> |
| Two 68-byte placeholder icon files failing Chrome's install-icon check | Replacing them made the "Install app" option appear immediately | <span class="tag good">Real cause</span> |

<p class="pull">A wee sixty-eight-byte file doesn't announce itself as the reason anything is broken.
It just sits there, technically present, while every larger theory takes its turn and falls apart
first.</p>

</section>

<section>

## <span class="h2-num">one direct test</span>Light, not orientation

One more misdiagnosis is worth keeping, mostly for how the test caught it. A habit had formed of
always photographing barcodes horizontally, and it looked like it mattered: a vertically held
barcode seemed to fail more often. The obvious explanation was that the scanner's decoder reads
horizontal scan lines and could miss a rotated barcode outright.

A direct test said otherwise. A barcode held deliberately vertical, in good light, scanned exactly as
well as a horizontal one. Orientation wasn't the variable. Light was, and the horizontal-photo habit
had just happened to correlate with better lighting, not cause anything on its own. The same test
also cleared the gallery-scan refactor, a different piece of code that had carried an "unverified on
real hardware" flag since it was written. Whatever flakiness it had been suspected of causing turned out to have nothing to do
with it.

</section>

<section>

## <span class="h2-num">built to be retired</span>What's still open

None of this is a finished product, and it isn't meant to be one. The whole tool is a workaround for
not having Libro, and the plan from day one was to retire it without regret the moment Libro gets
switched on for this region, rather than let it grow into something that has to be maintained. If the
manual keying turns out to be genuinely painful even with a well-built sheet in front of the
dietitian, that's the evidence the trial was built to produce.

Either way, what's left isn't a product. It's a barcode reader that only ever claims what it's sure
of, and a debugging log full of things that looked complicated right up until someone found the
actual cause.

</section>
