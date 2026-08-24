---
layout: post.njk
title: Protected nothing
kicker: Field notes / threat modelling
standfirst: >-
  One guardrail stood between a food-diary repository and going public. I traced it through the
  code a day later and found the field it named had never been in the repository. What did need
  guarding was in a file nobody was arguing about.
description: >-
  Field notes from a food-diary proof of concept built alongside one NHS dietetic team, not an NHS
  product. A privacy guardrail blocked its repository from going public. Traced through the code, it
  protected nothing that going public would have exposed.
date: 2026-08-22
bylineTags: ["repo visibility", "hosting"]
permalink: /protected-nothing/
---

<section class="lead">

A rule sounded exactly right, protected exactly nothing, and stood as the one thing blocking real
work, until someone traced it back to what the code actually does.

This is a proof-of-concept built by one technical person working alongside an NHS dietetic
team, not an official NHS product, and no patient data lives anywhere in it.

The rule was simple. Before the food diary's repository could go public, it needed a guardrail
against identifiable data leaking through the diary's own free-text fields, chiefly a description a
client might type next to a reference photo. Someone could type their own name into it without
thinking, to help remember whose entry it was. That risk was real, agreed on at the time in the
project's own words as "hard to guard... loose enough to say go public," and it sat there as the one
condition standing between the repository and a public GitHub Pages migration everything else was
ready for.

The condition held for a day. Then I traced it through the actual code rather than arguing about it
again, and it didn't survive the first look.

</section>

<section>

## <span class="h2-num">never in the repo</span>Where the description actually goes

The description a client types is captured in the app, stored as a note on a log entry in IndexedDB
on the device, and exported into a spreadsheet the dietitian handles. It is never committed, never
pushed, never served. The repository's visibility has no effect on it whatsoever, because it was
never in the repository to begin with. A guardrail on that field would have protected data that
going public never put at risk.

<figure class="fig">
  <svg class="path-fig" viewBox="0 0 660 210" role="img" aria-label="The path a typed description actually takes. On the device, it is typed in the app, stored as a note on a log entry in IndexedDB, and exported into a spreadsheet the dietitian handles. The repository sits off that path entirely, connected by nothing: the description is never committed, never pushed, never served. The guardrail was written against a field that the repository never held.">
    <text x="0" y="12" font-family="var(--font-mono)" font-size="11.5" letter-spacing="0.05em" fill="var(--ink-dim)">WHERE A TYPED DESCRIPTION ACTUALLY GOES</text>
    <line x1="0" y1="22" x2="648" y2="22" stroke="var(--rule)" stroke-width="1"></line>
    <rect x="0" y="38" width="360" height="150" fill="none" stroke="var(--loch)" stroke-width="1"></rect>
    <text x="14" y="58" font-family="var(--font-mono)" font-size="12" fill="var(--loch)">on the device</text>
    <text x="14" y="88" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">typed in the app</text>
    <line x1="22" y1="98" x2="22" y2="108" stroke="var(--loch)" stroke-width="1.5"></line>
    <text x="14" y="120" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">a note on a log entry in IndexedDB</text>
    <line x1="22" y1="130" x2="22" y2="140" stroke="var(--loch)" stroke-width="1.5"></line>
    <text x="14" y="152" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">exported to a spreadsheet</text>
    <text x="14" y="174" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">the dietitian handles it from there</text>
    <line x1="372" y1="84" x2="396" y2="84" stroke="var(--bad)" stroke-width="1.5"></line>
    <line x1="404" y1="76" x2="420" y2="92" stroke="var(--bad)" stroke-width="2"></line>
    <line x1="420" y1="76" x2="404" y2="92" stroke="var(--bad)" stroke-width="2"></line>
    <text x="432" y="89" font-family="var(--font-mono)" font-size="13" fill="var(--bad)">the repository</text>
    <text x="432" y="112" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">never committed,</text>
    <text x="432" y="128" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">never pushed,</text>
    <text x="432" y="144" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">never served</text>
  </svg>
  <figcaption class="fig-cap">The whole path runs on the device and ends in the dietitian's spreadsheet. The repository is not a stop on it, which is why its visibility could not have protected the field the guardrail named.</figcaption>
</figure>

A second, independent reason cut just as deep. The app ships with no build step at all, just
straight unminified JavaScript, so its entire source has been downloaded verbatim by every single
visitor to the live site since the day it launched. Repo visibility was never protecting the
application code either, because the browser was already handing that code to anyone who asked. For the
part of the project a visitor could actually reach, the "code stays private" preference behind two
earlier hosting rejections had never once been true.

</section>

<section>

## <span class="h2-num">~40 files, 1 sensitive string</span>The place nobody checked

If the free-text field was never the risk, going public should have been safe from day one. It
wasn't, quite, and the reason was somewhere else entirely: roughly forty tracked files sitting
outside the application folder, never served to a visitor and shielded from view by nothing but the
repository itself being private. A Namecheap migration plan and the spec beside it,
<code>DEPLOY.md</code>, <code>NOTES.md</code>, <code>DECISIONS.md</code>, and a stray
<code>.cpanel.yml</code>. I grepped through all of it for anything infrastructure-shaped and turned up
exactly one genuinely sensitive string: a hosting-account username, and not even this project's own
account. It belonged to someone else's.

<figure class="fig">
  <div class="trials">
    <div class="trial-h"></div>
    <div class="trial-h">in the repo</div>
    <div class="trial-h">repo privacy hides it</div>
    <div class="trial-r">free-text descriptions</div>
    <div class="trial no">no</div>
    <div class="trial no">no</div>
    <div class="trial-r">application source</div>
    <div class="trial yes">yes</div>
    <div class="trial no">no</div>
    <div class="trial-r">~40 files outside the app folder</div>
    <div class="trial yes">yes</div>
    <div class="trial yes">yes</div>
  </div>
  <figcaption class="fig-cap">Three things the repository question could have been about. Only the last is both tracked in the repository and hidden by nothing else, so it is the only one that going public actually exposes.</figcaption>
</figure>

<p class="pull">The thing everyone had been scared of couldn't actually happen. The thing worth being
scared of had been sitting in a folder nobody had opened, the whole time the guardrail argument was
running.</p>

</section>

<section>

## <span class="h2-num">two repos, not one</span>A fix that doesn't depend on remembering

The fix that shipped doesn't ask anyone to remember anything. Rather than scrub the sensitive files
out of a single shared repository and trust every future session to keep scrubbing, the project
split in two: one private repository holding everything, full history intact, and one public
repository synced from it that holds only the application directory's own contents. Nothing outside
<code>app/</code> can leak, because nothing outside <code>app/</code> is ever in the public repo to
begin with.

Purging the sensitive files from one shared repository's history was considered and turned down on
purpose. <code>NOTES.md</code> gets written every session, which means every future session is a
fresh chance to type an identifier back into a file that's now public, and a miss like that is
silent and unrecoverable the moment the repository is cloned. The split doesn't have that failure
mode. There's nothing to miss, because the sensitive files are never in the repo that goes public in
the first place.

One faster fix was on the table too, and turned down for a completely different kind of reason.
GitHub offers private-repo Pages hosting on its paid tier, for around four dollars a month, which
would have made the whole question go away without touching a single file. Food diary's own author
turned it down outright, on the spot, with two words: "not pro." No technical argument followed it, because none
was needed. It was a spending decision, not an engineering one, and the project didn't pretend
otherwise.

</section>

<section>

## <span class="h2-num">not a hosting decision</span>What the guardrail actually protects now

The free-text field is still a real concern. It existed before this repository was ever considered
for public release, and it will keep existing after, because it's a property of what the app lets
someone type, not of who can see the code. It just isn't a hosting decision, and treating it as one
is the mistake this piece is about. It has its own design question to answer, on its own
schedule, and the fix for it won't be a line in a hosting migration plan.

The pattern generalises past one repository. The project specified a control against a threat that
sounded exactly right and had never been traced to the actual place the data flows through. It still
held up real work, however briefly. And the thing worth guarding against the whole time was sitting
in plain sight, in a directory nobody had thought to check, because the argument had already used up
everyone's attention on the door that was never open.

</section>
