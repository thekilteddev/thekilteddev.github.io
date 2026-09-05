---
layout: post.njk
title: The file nobody reread
kicker: Field notes / hosting decisions
standfirst: >-
  The same hosting idea was rejected twice, four days apart, and nobody reread the first rejection
  before writing the second. Meanwhile the laptop's own antivirus was reissuing every certificate it
  saw. Nothing running on that machine could have said, truthfully, whether the fix had landed.
description: >-
  Field notes from a food-diary proof of concept built alongside one NHS dietetic team, not an NHS
  product. A hosting migration where the same option was rejected twice by sessions that never read
  the first rejection, and where the certificate check itself could not tell the truth.
date: 2026-09-05
bylineTags: ["hosting migration", "decisions log"]
permalink: /nobody-reread/
---

<section class="lead">

This is a proof-of-concept, not an NHS product, built by one technical person working alongside an
NHS dietetic team. No patient data exists anywhere in it. The app stores everything on the
client device and nothing else.

The trigger for all of this was mundane: <span class="entity">Netlify</span>'s free tier caps a
project at 15 credits per production deploy, 300 a month, which works out to roughly twenty deploys
before the meter runs dry. The project was already rationing pushes against that ceiling, and shared
hosting on <span class="entity">Namecheap</span>, already being set up for another project the same
person runs, looked like a way out.

</section>

<section>

## <span class="h2-num">same answer twice</span>Two rejections, four days apart

<div class="stat-rows">
  <div class="stat-row"><div class="stat-name">12 Jul</div><p class="stat-desc"><span class="entity">GitHub Pages</span> proposed, then declined. The free plan serves public repositories only, and a paid plan still publishes to a public URL.</p></div>
  <div class="stat-row"><div class="stat-name">16 Jul</div><p class="stat-desc">Proposed again, by a session that had not reread the file holding the first decision. Declined on the same ground, plus a cross-account domain block nobody had known about.</p></div>
</div>

GitHub Pages came up early, and the project turned it down fast. On the free plan it only serves
public repositories. A private repo needs a paid GitHub plan, and even then the site still publishes
to a public URL with no login wall short of Enterprise. Netlify's free tier deploys from a private
repo to an unlisted one instead, which fit the stated preference to keep the code itself private. No
patient data was ever going to sit in that repo either way. The preference was about the source, not
about anything a patient had typed.

Four days later, GitHub Pages came up again. Not from a different person with a different view. A
coding session working on the project proposed the exact idea an earlier session had already
rejected, because nobody had reread the decisions file before speaking. The occasion was almost
incidental: a different, newer domain had surfaced, already live on GitHub Pages with a working
certificate, and for a moment it looked like an obvious destination. That session looked into it,
then declined it again, for the same reason as the first time. That reason had not moved. It had
simply never been reread. This round did turn up one genuinely new blocker: the food-diary repo and
the newer domain lived under two different GitHub accounts, and GitHub blocks a custom domain from
being claimed by a second account once it's verified on the first, specifically to stop that kind of
takeover. A real finding, arrived at by accident, in the course of re-litigating a question that had
already been settled.

<p class="pull">A decisions log nobody rereads is decoration. It was there, it had the right answer
sitting in it, and a session still asked the question again anyway.</p>

</section>

<section>

## <span class="h2-num">one real bug, one fake</span>A certificate checker that had been lying

The SSL side had its own real bug and its own fake one. The real bug: the domain's nameservers were
pointed at Namecheap's basic DNS, which only handles URL forwarding, not actual hosting. Switched to
the proper hosting DNS and that half resolved. An earlier assumption, picked up from a web search
during planning, claimed the hosting tier included self-service AutoSSL. It didn't. Triggering
AutoSSL turned out to require WHM-level (the hosting provider's own backend) server-administrator
access, which an ordinary shared-hosting account never gets. That was confirmed against Namecheap's own documentation once
the free "Run AutoSSL" button turned out not to exist anywhere in the dashboard. The free certificate that does ship with the
hosting plan has to be issued from Namecheap's own side, and nothing on the customer's end can force
it.

The fake bug was worse, because it looked like a real one for a while. This laptop's own antivirus
intercepts TLS connections and reissues every certificate itself, so anything running on the
machine, `curl` and `openssl` included, was reporting the antivirus's own certificate instead of
the real one.

<p class="pull">The tool being used to answer "has the SSL fix landed yet" could not tell the truth
about it even in principle.</p>

<figure class="fig">
  <svg class="intercept-fig" viewBox="0 0 660 232" role="img" aria-label="The same question, has the certificate issued, asked from three places. On this laptop, curl and openssl reach the antivirus, which reissues every certificate it sees, so the check never arrives at the real certificate and instead describes one the laptop made up on the way past. From off the laptop, a phone and a server-side request tool both reach the real certificate. Same question, three paths, and the only one anybody was using was the one that could not answer it.">
    <text x="0" y="12" font-family="var(--font-mono)" font-size="11.5" letter-spacing="0.05em" fill="var(--ink-dim)">THE QUESTION, ASKED THREE WAYS: HAS THE CERTIFICATE ISSUED?</text>
    <line x1="0" y1="22" x2="648" y2="22" stroke="var(--rule)" stroke-width="1"></line>
    <rect x="0" y="38" width="556" height="86" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
    <text x="14" y="58" font-family="var(--font-mono)" font-size="12" fill="var(--bad)">on this laptop</text>
    <text x="14" y="88" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">curl / openssl</text>
    <line x1="135" y1="83" x2="167" y2="83" stroke="var(--bad)" stroke-width="1.5"></line>
    <text x="177" y="88" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the antivirus reissues every certificate</text>
    <line x1="497" y1="75" x2="513" y2="91" stroke="var(--bad)" stroke-width="2"></line>
    <line x1="513" y1="75" x2="497" y2="91" stroke="var(--bad)" stroke-width="2"></line>
    <text x="14" y="112" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">so the answer describes a certificate the laptop made up on the way past</text>
    <text x="0" y="154" font-family="var(--font-mono)" font-size="12" letter-spacing="0.05em" fill="var(--ink-dim)">OFF THE LAPTOP</text>
    <text x="0" y="182" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">a phone</text>
    <line x1="215" y1="178" x2="330" y2="178" stroke="var(--loch)" stroke-width="1.5"></line>
    <text x="0" y="214" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">a server-side request tool</text>
    <line x1="215" y1="210" x2="330" y2="210" stroke="var(--loch)" stroke-width="1.5"></line>
    <line x1="330" y1="178" x2="330" y2="210" stroke="var(--loch)" stroke-width="1.5"></line>
    <line x1="330" y1="194" x2="386" y2="194" stroke="var(--loch)" stroke-width="1.5"></line>
    <text x="398" y="199" font-family="var(--font-mono)" font-size="13" fill="var(--loch)">the real certificate</text>
  </svg>
  <figcaption class="fig-cap">The check was working perfectly. It was reporting on a certificate the laptop had made up on the way past, and only a request that started somewhere else could say otherwise.</figcaption>
</figure>

Checking from a phone worked around it, and later a tool that runs the request server-side, outside
the interception entirely, confirmed it for good. Two support agents tried force-validating the
certificate from Namecheap's own side with no result, and a follow-up ticket, NC-FTC-2685, went in
to track it as a pure backend wait. Nothing on the customer side could shortcut that part. The
certificate issued not long after, and a server-side check confirmed clean HTTPS.

</section>

<section>

## <span class="h2-num">port 21098</span>Two things the plan hadn't accounted for

<div class="stat-rows">
  <div class="stat-row"><div class="stat-name">SSH</div><p class="stat-desc">Off by default. Fix is self-service, a control panel option called "Manage Shell," on port 21098.</p></div>
  <div class="stat-row"><div class="stat-name">Push</div><p class="stat-desc">Hung indefinitely, no error. A missing per-repo override on a global credential setting that has to stay exactly as it is.</p></div>
</div>

First: SSH turned out to be off by default on shared hosting, though the migration plan had been
written without confirming that. The fix was self-service, a control panel option called "Manage Shell," which
gives no hint it's SSH, listening on a non-standard port, 21098, rather than the usual one. Second:
pushing to the new remote from an automated shell hung indefinitely with no error, because a global
credential setting that keeps two separate GitHub accounts from colliding also blocks the plain
per-repo push path unless a repo-level override is set. That global setting has to stay exactly as
it is. The only new part is the missing per-repo override.

A smaller trap surfaced once both hosts were finally level with GitHub again: the control panel's
Git tool has an "Update" button that only saves configuration. It doesn't fetch, pull, or deploy
anything, and those actions live on a separate tab entirely. For a repository that was deliberately
cloned through the control panel's own "Clone a Repository" tool, with a specific option left
unchecked to preserve its automatic deploy hook, even the tab's own "Update from Remote" option
turns out to be a no-op. It's a push target, not a pull source. Reading the UI correctly took longer
than reading the DNS panel had.

</section>

<section>

## <span class="h2-num">5 other references</span>Deleting a task is not a local edit

One step in the migration plan retired Netlify outright once the new host was live. Once Namecheap
turned out to be an interim stop rather than the final destination, the task was dropped, which
seemed like a small, contained change. It wasn't. That same task had been referenced as a
precondition in five other places across the plan, and one of those was dangerous on its own: a
later step told a future session to delete the Netlify credit-cap constraint from the project's own
guide file, once hosting had moved. Hosting hadn't moved. A session following that instruction
literally would have silently removed a still-live limit from the record that exists to track it. All
five references were found and corrected before that could happen.

<figure class="fig">
  <div class="ratio">
    <div class="ratio-col s1"><div class="ratio-bar" style="height: 100%"></div></div>
    <div class="ratio-col"><div class="ratio-bar" style="height: 20%"></div></div>
  </div>
  <div class="ratio-key">
    <div><b>5</b><span>references to the retired task, found across the plan</span></div>
    <div><b>1</b><span>dangerous on its own</span></div>
  </div>
  <figcaption class="fig-cap">One dropped task, referenced as a precondition in five other places. One of those five instructed a future session to delete a still-live cost-cap constraint once hosting had moved. Hosting hadn't moved.</figcaption>
</figure>

</section>

<section>

## <span class="h2-num">not a technical argument</span>What actually changed the private-repo rule

The preference that had driven both GitHub Pages rejections wasn't overturned by a technical
argument. It was relaxed on purpose, once the user actually named a real gap instead of waving it
off: the diary's free-text fields, a description typed next to a photo, have no structural way to
stop someone entering something identifying. Going public meant accepting that gap rather than
pretending it away. In the user's own words, it was "hard to guard... loose enough to say go
public." The account-split blocker from the second rejection turned out not to matter here either,
since the plan kept the repo under its existing account rather than moving it to the newer brand's.

</section>

<section>

## <span class="h2-num">same quota either way</span>A bigger swap, investigated instead of just refused

A smaller question, whether a branded subdomain could dodge a shared hosting username, led somewhere
larger: making the newer, higher-traffic domain the account's designated "Main Domain," on the
assumption that the label itself would grant it more subdomain headroom. That assumption didn't
survive a check. The account's subdomain quota is shared regardless of which domain holds the
label, so an ordinary addon domain gets exactly the same headroom. What an actual swap
would require turned out to be much bigger than the label suggested: a different project's own blog
would have to leave its free, automatic hosting for manual shared-hosting deploys with none of that
automation and the same multi-day certificate process already documented here. That's not a call
this project gets to make about another one. It was declined without touching anything, and the idea
went out as two information-only notes to the two other projects' own owners, for them to decide on
their own terms.

</section>

<section>

## <span class="h2-num">both hosts retired</span>How it actually landed

The reversal, when it came, was decided outside any of these sessions, by the one person who owns
all three projects at once: Netlify was retired entirely, and the food diary moved to GitHub Pages
after all, kept under its existing account rather than a newer pseudonymous one. That keeps a tool
built under a real identity separate from a brand built under a pseudonym, and it sidesteps the
cross-account domain restriction outright rather than working around it.

<figure class="fig">
  <svg class="roundtrip-fig" viewBox="0 0 660 316" role="img" aria-label="The same option assessed three times. The trigger was Netlify's cap of 300 credits a month against 15 per production deploy, with pushes already being rationed. On 12 July and again on 16 July the private-repo preference was held and GitHub Pages was declined; later, decided outside these sessions, the preference was relaxed on purpose. The second assessment turned up a cross-account domain block by accident, which turned out not to apply. Running underneath all three, unchanged throughout: the free plan serves public repositories only. The destination is GitHub Pages, the option rejected twice at the start, with Netlify retired.">
    <text x="0" y="12" font-family="var(--font-mono)" font-size="11.5" letter-spacing="0.05em" fill="var(--ink-dim)">THE SAME OPTION, ASSESSED THREE TIMES</text>
    <line x1="0" y1="22" x2="648" y2="22" stroke="var(--rule)" stroke-width="1"></line>
    <text x="0" y="44" font-family="var(--font-mono)" font-size="11" letter-spacing="0.05em" fill="var(--ink-dim)">TRIGGER</text>
    <text x="76" y="44" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink)">300 credits a month against 15 per deploy, already rationing pushes</text>
    <line x1="0" y1="60" x2="648" y2="60" stroke="var(--rule)" stroke-width="1"></line>
    <text x="0" y="84" font-family="var(--font-mono)" font-size="11" letter-spacing="0.05em" fill="var(--ink-dim)">12 JUL</text>
    <text x="212" y="84" font-family="var(--font-mono)" font-size="11" letter-spacing="0.05em" fill="var(--ink-dim)">16 JUL</text>
    <text x="424" y="84" font-family="var(--font-mono)" font-size="11" letter-spacing="0.05em" fill="var(--ink-dim)">LATER, OUTSIDE THESE SESSIONS</text>
    <line x1="200" y1="70" x2="200" y2="258" stroke="var(--rule)" stroke-width="1" stroke-dasharray="4 4"></line>
    <line x1="412" y1="70" x2="412" y2="258" stroke="var(--rule)" stroke-width="1" stroke-dasharray="4 4"></line>
    <text x="212" y="118" font-family="var(--font-mono)" font-size="11" fill="var(--warn)">cross-account domain block</text>
    <text x="212" y="132" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">found by accident</text>
    <text x="212" y="146" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">did not apply</text>
    <text x="0" y="154" font-family="var(--font-mono)" font-size="12" fill="var(--loch)">what moved</text>
    <text x="0" y="168" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">private-repo preference</text>
    <line x1="0" y1="178" x2="400" y2="178" stroke="var(--loch)" stroke-width="2"></line>
    <line x1="400" y1="178" x2="424" y2="206" stroke="var(--loch)" stroke-width="2"></line>
    <line x1="424" y1="206" x2="648" y2="206" stroke="var(--loch)" stroke-width="2"></line>
    <text x="424" y="200" font-family="var(--font-mono)" font-size="11.5" fill="var(--loch)">relaxed on purpose</text>
    <text x="0" y="240" font-family="var(--font-mono)" font-size="12" fill="var(--ink-dim)">what did not</text>
    <line x1="0" y1="252" x2="648" y2="252" stroke="var(--ink-dim)" stroke-width="2"></line>
    <text x="0" y="270" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">free plan serves public repositories only, unchanged throughout</text>
    <line x1="0" y1="284" x2="648" y2="284" stroke="var(--rule)" stroke-width="1"></line>
    <text x="0" y="306" font-family="var(--font-display)" font-weight="700" font-size="15" fill="var(--loch)">GitHub Pages</text>
    <text x="116" y="306" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">the option rejected twice at the start, with Netlify retired</text>
  </svg>
  <figcaption class="fig-cap">The technical ground never moved. The preference did, and only once someone named the real gap rather than waving it off. Four days and two sessions were spent re-deriving an answer the file already held.</figcaption>
</figure>

The account question that had paused the move turned out simpler than the plan in flight at the
time suggested. Rather than standing up a new account, the existing one kept its history and its
repos exactly where they were and simply changed its own display name. Same account throughout, just
renamed partway through. The migration is complete now. Both old hosts are fully retired, and
nothing is left dual-hosted.

It ended without a clever fix. Two things went wrong here that weren't code. Both were caught the
same way, by someone who actually checked instead of assuming. A certificate check that had every
reason to look trustworthy was quietly answering a different question than the one being asked. And
a written decision only held once someone actually reopened the file before speaking a second time.

</section>
