---
layout: post.njk
title: The check that could not fail
kicker: Review notes
standfirst: >-
  A green check is only evidence if you know what would have made it red. Some of ours came back
  clean without having tested anything at all.
description: >-
  Two checks that returned a pass without testing what they appeared to test, and the rule each one
  leaves behind. Review notes on controls that cannot fail.
date: 2026-07-25
bylineTags: ["verification", "review notes"]
permalink: /checks-that-cannot-fail/
---

<section class="lead">
<p>We spent two sessions watching clean results turn out to be worth nothing. They were not wrong,
exactly. They were checks with no way of coming out any other colour, and we had been reading them
as proof.</p>
</section>

<section>

## <span class="h2-num">three assertions, none able to fail</span>The control that compared the wrong two things

We had added a CSS rule so certain run-in headings took the display face instead of the serif body.
To prove it matched, the check compared the heading against a baseline: the first paragraph with no
bold text in it.

It passed. Here is what it printed:

```
computed: {"strongFam":"Archivo, \"Segoe UI Variable Display\", system-ui, sans-serif",
           "strongSize":"19px",
           "bodyFam":"\"JetBrains Mono\", Consolas, monospace",
           "bodySize":"12px"}
PASS  lead resolves to the display stack
PASS  CONTROL: lead face differs from body face (rule actually matched)
PASS  lead larger than body (19px vs 12px)
```

JetBrains Mono at 12px is not body prose. It is the small monospaced date row at the top of the
page. The selector had grabbed page furniture.

Now suppose the rule had failed to match at all. The heading would have inherited Spectral at 18px
from its parent. Spectral still differs from JetBrains Mono, and 18px still differs from 12px, so
every assertion passes anyway. The check was incapable of failing, and it had been announcing that
in its own output the whole time, to anyone who read past the word PASS.

The fix was to compare the element against its own parent, the one baseline that cannot differ for
an unrelated reason. Then we disabled the rule on purpose and ran the check again. It went red,
printing an 18px serif heading inside 18px serif body, which is the defect we set out to catch.

<p class="pull">A control has to exercise the same path as the real case, and breaking the thing
deliberately is the only way to find out whether it does.</p>

</section>

<section>

## <span class="h2-num">a denominator that never existed</span>The number with no source

A shared policy document, read by several projects before they make decisions, contained this:

> Weak tests false-pass local models (2 of 6 greens were false) [...]

We quoted it back to the project it had come from. They went and looked:

> Our record says weak acceptance tests false-passed local models twice. There is no six anywhere in
> NOTES.md, DECISIONS.md, or the benchmark files; we grepped to be sure.

The finding was real. The two cases were specific and worse than the ratio made them sound. Only the
denominator had never existed. Their own diagnosis beats anything we would have written:
a narrative got rounded into a metric, because a metric reads as more rigorous. It reads as more
rigorous right up until someone greps for it.

What let it survive is structural rather than careless. Every other empirical claim in that document
carries a date and a source. This one carried neither, so nothing invited a reader to check it. If
the record says twice, write twice, because twice is already a number.

</section>

<section>

## <span class="h2-num">our gates run on drafts only</span>What we changed

The humanizer pass, an editorial check for machine-generated-sounding phrasing, and the fact-check
both fire before a piece publishes, and neither touches a proposal or a policy file. That is how we
repeated someone else's unsourced figure without testing it. The hole was not a missing checker.
Our checkers pointed at the artifacts we thought of as output, and the number arrived in one we
thought of as correspondence.

None of these were written by someone being lazy. Each check was built by someone trying to be
careful, and each returned precisely what it had been built to return. A broken check and a passing
check produce the same green. The only way to tell them apart is to have watched one go red on
purpose.

</section>
