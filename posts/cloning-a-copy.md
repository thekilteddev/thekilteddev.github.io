---
layout: post.njk
title: We were cloning a copy
kicker: Field notes / tooling
standfirst: >-
  We wanted a narrator that was Scottish, natural, local, and obtainable. Nearly every candidate
  managed three of those and broke the fourth. What finally worked was training on the speaker's
  own studio recordings, which turned out to be the source of the voice we had been cloning all
  along.
description: >-
  A synthesised Scottish narrator that had to sound natural, run offline, and actually be
  obtainable. Five candidates, five different failures, and a licensed speech corpus that turned
  the problem from picking a voice into reproducing a speaker.
date: 2026-07-26
lastReviewed: 2026-07-18
bylineTags: ["local tts", "fine-tuning"]
permalink: /cloning-a-copy/
---

<section class="lead">
<p>A product walkthrough needed a narrator: not a person, a synthesised voice reading a script over the screen recording. Simple enough on paper. We wanted four things from that voice at once, and it turned out you cannot fully satisfy all four together. It had to sound Scottish, because the product carries a real name behind it and a bland mid-Atlantic voice reading it back would have been wrong from the first sentence. It had to sound natural, not like a robot reading a list. It had to run local, free, and offline, no per-render cloud bill, no dependency on someone else's server staying up. And it had to be obtainable: a thing we could actually get running on this machine, today.</p>

<p>Almost every option we tried hit three of those and quietly broke the fourth. The whole hunt is really about which corner each candidate painted us into, and how the problem eventually stopped having corners at all.</p>
</section>

<section>

<h2><span class="h2-num">222,000</span>Piper, and the number that came out wrong</h2>

<p>We started with <a href="https://github.com/rhasspy/piper">Piper</a>, a small, fast, fully local text-to-speech engine, using a voice called <code>en_GB-alba-medium</code>. Alba was the one that mattered: a genuine Scottish speaker. Local, free, offline, right accent. Three of four, immediately.</p>

<p>Two problems. The first was almost funny: Piper read grouped numbers wrong. A figure like 222,000 didn't come out as "two hundred and twenty-two thousand," it came out mangled. We fixed it by rewriting the script instead of the engine: every figure got spelled out as words before it ever reached the synthesiser. That fix turned out to be engine-independent. It survived every voice we swapped in after, which was the first small lesson of the whole hunt. Fix the input, not the tool, and the fix outlives the tool.</p>

<p>The second problem was the real wall. Individual words were fine; whole sentences were robotic. The rise and fall across a sentence, the prosody, was flat, and that isn't a knob you can turn on Piper. Sentence-level prosody is a hard ceiling of that engine. Getting past it meant leaving Piper, and that's where the corners started.</p>

</section>

<section>

<h2><span class="h2-num">never four at once</span>Five candidates, five different ways to lose</h2>

<p>We ran through the alternatives. Every one was rejected, and the interesting part is that no two were rejected for the same reason.</p>

<p><strong><a href="https://huggingface.co/hexgrad/Kokoro-82M">Kokoro-82M</a></strong>, a different local engine, voice <code>bf_emma</code>. Clearer than Piper, genuinely more natural, and judged "really bland and unnatural compared to the alba voice." It won on naturalness and lost on character. We kept it wired in behind a switch, since it worked and there was no reason to delete working code.</p>

<p><strong><a href="https://github.com/SWivid/F5-TTS">F5-TTS</a>, cloning alba.</strong> The clever idea: take an engine with far better prosody than Piper and clone the alba voice into it. Best of both, alba's accent riding F5's flow. The result was "brutal, loses the alba and sounds more English," heard instantly. Cloning a synthetic reference, a voice that was itself already generated, flattened the very character we were trying to keep. Getting even that far meant building an isolated Python environment on the CPU, because the machine's GPU stack was too new for the tool (more on that irony later). Won on flow, lost on accent, cost real setup time. Rejected.</p>

<p><strong>Cloud, <a href="https://elevenlabs.io">ElevenLabs</a>.</strong> The one path to genuinely Scottish and natural at once. The two free Scottish female voices weren't right, and paying for the better tier wasn't on the table. Parked, not killed. Worth noting the trade would have been softer than it sounds: it's cloud at build time only, you synthesise the script once and the video that ships is a local file. But parked is parked.</p>

<p><strong><a href="https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI">RVC</a> voice conversion.</strong> The technically correct local route: convert an expressive voice's output into alba's timbre. Research-grade effort, the same environment friction as everything else, and a real risk of coming out muddy. Declined at this stage.</p>

<p><strong>CereProc's "Heather / The Scottish Voice."</strong> This one stung, because it was the ideal: a real, high-quality Scottish voice that installs as a normal local system voice. Everything we wanted, except we couldn't get it. The shop that sells it was closed, and the free route needs a Scottish public-sector, education, or NHS email address we don't have. Won on every axis except the one that reads "can you actually obtain it." No.</p>

<p>Five candidates, and between them they covered all four requirements. Just never four at once, never in the same voice.</p>

<figure class="fig">
<table class="ledger">
<thead>
<tr>
<th scope="col"><span class="sr">Voice</span></th>
<th scope="col" class="axis">Scottish</th>
<th scope="col" class="axis">Natural</th>
<th scope="col" class="axis">Local</th>
<th scope="col" class="axis">Obtainable</th>
</tr>
</thead>
<tbody>
<tr class="voice">
<th scope="row" class="name">Piper<span class="eng">en_GB-alba-medium</span></th>
<td class="cell" data-axis="Scottish"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Natural"><span class="m broke"></span><span class="sr">broke</span></td>
<td class="cell" data-axis="Local"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Obtainable"><span class="m met"></span><span class="sr">met</span></td>
</tr>
<tr class="why"><td colspan="5">Right accent, running offline. Sentence-level prosody flat, and not a knob you can turn.</td></tr>

<tr class="voice">
<th scope="row" class="name">Kokoro-82M<span class="eng">bf_emma</span></th>
<td class="cell" data-axis="Scottish"><span class="m broke"></span><span class="sr">broke</span></td>
<td class="cell" data-axis="Natural"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Local"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Obtainable"><span class="m met"></span><span class="sr">met</span></td>
</tr>
<tr class="why"><td colspan="5">Won on naturalness, lost on character: <em>&ldquo;really bland and unnatural compared to the alba voice.&rdquo;</em></td></tr>

<tr class="voice">
<th scope="row" class="name">F5-TTS<span class="eng">cloning alba</span></th>
<td class="cell" data-axis="Scottish"><span class="m broke"></span><span class="sr">broke</span></td>
<td class="cell" data-axis="Natural"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Local"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Obtainable"><span class="m met"></span><span class="sr">met</span></td>
</tr>
<tr class="why"><td colspan="5">Won on flow, lost on accent: <em>&ldquo;brutal, loses the alba and sounds more English.&rdquo;</em> Obtained, but only via an isolated CPU environment.</td></tr>

<tr class="voice">
<th scope="row" class="name">ElevenLabs<span class="eng">cloud</span></th>
<td class="cell" data-axis="Scottish"><span class="m unrun"></span><span class="sr">never established</span></td>
<td class="cell" data-axis="Natural"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Local"><span class="m broke"></span><span class="sr">broke</span></td>
<td class="cell" data-axis="Obtainable"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="why"><td colspan="5">The one path to Scottish and natural at once. But the two free Scottish voices weren&rsquo;t right, and the better tier wasn&rsquo;t on the table. Cloud regardless, though only at build time. Parked, not killed.</td></tr>

<tr class="voice">
<th scope="row" class="name">RVC<span class="eng">voice conversion</span></th>
<td class="cell" data-axis="Scottish"><span class="m unrun"></span><span class="sr">never established</span></td>
<td class="cell" data-axis="Natural"><span class="m unrun"></span><span class="sr">never established</span></td>
<td class="cell" data-axis="Local"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Obtainable"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="why"><td colspan="5">The technically correct local route. Research-grade effort and a real risk of coming out muddy, so it was declined before anyone heard it.</td></tr>

<tr class="voice">
<th scope="row" class="name">CereProc<span class="eng">&ldquo;Heather&rdquo;</span></th>
<td class="cell" data-axis="Scottish"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Natural"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Local"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Obtainable"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="why"><td colspan="5">The ideal, and unreachable. Shop closed; the free route needs an email address we don&rsquo;t have.</td></tr>
</tbody>
</table>

<div class="key">
<span><span class="m met"></span> met</span>
<span><span class="m broke"></span> broke</span>
<span><span class="m unrun"></span> never established</span>
</div>

<figcaption class="fig-cap">Six voices, four requirements. <b>Local</b> means local, free and offline. Open cells were never run far enough to find out.</figcaption>
</figure>

</section>

<section>

<h2><span class="h2-num">a step up from robot</span>The ceiling we accepted</h2>

<p>So we stopped chasing and accepted a ceiling. The voice we shipped first was alba again, but with a phrasing pass over the whole script: long strings broken into short breath-group sentences, figures landing at the ends of sentences where the voice naturally slows, the brand name written the way it should sound. A couple of prosody settings pushed to slow it down and loosen it up. The honest verdict was "a step up from robot." Tolerable. It shipped.</p>

<p>If the story ended there, it would be a fine wee story about accepting good-enough. It didn't end there, because of one fact we didn't have yet.</p>

</section>

<section>

<h2><span class="h2-num">4,613 pairs</span>The corpus that was already ours</h2>

<p>We found the <a href="https://doi.org/10.7488/ds/2506">Alba speech corpus</a> on Edinburgh DataShare. Licensed CC BY 4.0: free to use, fine-tune, even use commercially, as long as you attribute it. And here's what made it matter. It is the actual source corpus behind Piper's alba voice. The speaker we'd been trying to preserve through clone after clone was sitting right there as raw studio recordings: roughly four hours, 4,613 matched audio-and-text pairs, 48kHz, recorded in a hemi-anechoic room, clean.</p>

<p>That reframes the whole problem. Up to this point the question had been "which voice do we pick." Now it was "can we reproduce this specific speaker inside a better engine." Not clone a synthetic echo of her. Train on her actual voice. A different question, with a different and better answer.</p>

</section>

<section>

<h2><span class="h2-num">stage 1 of 3</span>Cheapest first, and a failure that explained everything</h2>

<p>We staged it cheapest-first: try the free thing before the expensive thing. Stage 1 was zero-shot, handing the expressive engine (XTTS-v2) a real human clip of alba and asking it to imitate. Stage 2, if that failed, was to actually fine-tune the engine on the corpus. Stage 3, if that failed too, was cloud.</p>

<p>Stage 1 failed, as predicted, and the failure was the useful part. Even with a genuine human reference, the voice "wildly drifts off Scottish." Here's why, and it's the structural lesson of the whole hunt: zero-shot cloning copies the timbre but regenerates the prosody from the engine's own base model, and that base model is English-dominant. The accent gets ironed out no matter how good or how long the reference clip is. That single fact retroactively explained the F5 disaster too.</p>

<p class="pull">Cloning was never going to hold a Scottish accent. Only training could.</p>

<p>On to Stage 2.</p>

</section>

<section>

<h2><span class="h2-num">loss = nan</span>The environment, wall by wall</h2>

<p>Fine-tuning a neural voice model on a Windows machine with a consumer GPU is a series of small walls, each of which stops you dead until you find the one specific thing wrong. In order:</p>

<p>The machine's antivirus intercepts SSL, which breaks the package installer for any fresh environment. We had to point it at the antivirus's own certificate to install anything at all. The training library demanded a recent version of a dependency, but the newest version of that dependency had deleted a function the library still called, so we pinned it below the break. The obvious PyTorch build wanted an extra media component that's painful to install on Windows; we pinned an earlier, matched build instead, and even that took force because the installer kept deciding the wrong build was already satisfied and skipping it. On Windows, the training loop has to be guarded with the standard <code>if __name__ == "__main__"</code> incantation, or the parallel data-loading workers each re-run the whole training script and collide on a locked file.</p>

<p>The GPU is an RTX 5060 with 8GB, but it's also driving the monitor, so only about 5GB was actually free, which forced the smallest possible batch size. And the natural move to save memory, half-precision training, produced <code>loss = nan</code> from the very first step: half-precision overflowed inside the model's forward pass, and only full precision at batch-size-one trained cleanly. The reference recipe we were adapting had quietly omitted half-precision for exactly this reason. It always tells you afterwards.</p>

<p>Every one of those was a full stop until it was solved. None of them was the interesting problem. All of them stood between us and the interesting problem.</p>

</section>

<section>

<h2><span class="h2-num">8.7 s / step</span>The last mile was in the settings, not the training</h2>

<p>Then the real limit: training ran at about 8.7 seconds per step, and a complete run would have taken fifteen to eighteen hours. Not happening. It didn't need to finish, though. The adaptation levels off, and around checkpoint 1,000 the voice had clearly turned: "much better, much clearer." The accent held. That was the whole question, whether training could recover the accent that cloning couldn't, and the answer was yes.</p>

<p>Two blemishes were left: a wee stutter, and the first word of each line pitched a bit high. Neither needed more training. They were inference settings: synthesise the text sentence-by-sentence instead of all at once, nudge one sampling temperature. Stutter gone. Along the way we had to correct a belief we'd been carrying: that using the desktop while it generated was corrupting the output. It wasn't. The model's output is deterministic; what the GPU is doing during playback has nothing to do with the saved file. We'd been blaming the environment for a settings problem, which, after a whole hunt of genuine environment walls, is an easy mistake to make and a telling one.</p>

</section>

<section>

<h2><span class="h2-num">&minus;26.6 LUFS</span>Two loose ends, closed</h2>

<p>The voice shipped: a locally fine-tuned Scottish narrator, trained on the real speaker, running offline. But "it works" and "it's finished" are different claims, and two small things after the fact prove it.</p>

<p>First, acronyms came out garbled, the model tried to pronounce them as words. The fix was to spell them phonetically in the script: an initialism became "aitch em ar see," a web address became "guhv dot you kay." That last one has a detail worth keeping: we spelled it "guhv," not "gov," because "gov" gave the voice a long o and we wanted the short flat vowel a person actually uses. The on-screen text was never touched, only what the voice reads.</p>

<p>Second, the finished video sounded quiet. Instead of guessing, we measured it: the audio sat at &minus;26.6 LUFS, where spoken content usually lives around &minus;16. Not subjective. The synthesiser's raw output was just quiet, and nothing in the pipeline had ever corrected for it. One normalisation pass, re-rendered, remeasured: &minus;16.2. On target.</p>

</section>

<section>

<h2><span class="h2-num">default still piper</span>What's still open</h2>

<p>The regen script's default engine still points at Piper, not the fine-tuned voice, on purpose: a missing training environment can't hard-fail a regen if the fallback is the simple engine. The good voice ships by setting an explicit flag. Whether to flip that default is a live, unresolved call, not an oversight, and it's still open.</p>

<p>Strip the specifics and it comes down to this. A want with four constraints that don't all fit at once. A row of honest dead ends, each failing for its own real reason. One piece of information, a corpus with the right licence, that turned "pick a voice" into "reproduce a speaker." A gauntlet of environment walls that are exhausting, boring, and mandatory. And at the end, the last defects weren't in the hard thing, the training. They were in the easy thing, the settings, that we'd stopped questioning.</p>

</section>
