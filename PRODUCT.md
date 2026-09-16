# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences arrive today, and **which one is primary is an open decision** — the
owner has not narrowed it, so future work must serve all three rather than assume one:

- **Hiring managers and recruiters** evaluating a senior AI / full-stack engineer.
  The site says "Open to work · 2026" and "senior engineering roles" outright.
- **Prospective consulting clients** — founders and engineering leaders weighing an
  end-to-end build. "AI product builds" and "consulting where the whole stack is the
  job" address them.
- **Fellow engineers** arriving from GitHub or the blog, who read `ai_builder.html`
  and `aws_architecture.html` for the technical substance rather than the résumé.

All three are reading in a short, skeptical session, deciding whether this person can
actually carry a system from diagram to production alone.

## Product Purpose

A personal portfolio site for Yen (yennj12.js.org) that establishes one claim: one
person carries all six layers — system design, cloud infrastructure, data pipelines,
backend services, AI/LLM systems, and the application layer — rather than handing work
across five specialists.

**Success is a deep read followed by outreach.** The reader gets far enough into the
AI Builder, AWS Architecture or Portfolios pages to be convinced, then makes contact by
whatever channel suits them. Depth of read counts as much as the click; no single CTA
is the sole conversion, and the contact form is one path among several, not the goal.

## Positioning

Eight years assembled a layer at a time rather than trained into: data engineering in
the UK (2016–2018), backend services across Japan, Ireland and AWS (2018–2024), and
architecture plus LLM-systems consulting since 2024. The claim a neighbouring portfolio
could not truthfully copy is the **span held by one pair of hands** — and specifically
the AI half being production work ("the hard part was never the first prompt working —
it is the hundredth"), not demo work.

Secondary, factual and distinctive: physics background before software; works from 31 of
195 countries as a digital nomad.

## Operating Context

- Read in a browser, desktop and phone, usually in a few skeptical minutes, often
  arriving from a GitHub profile link, a LinkedIn profile, or a job application.
- Six pages sit on the shared nav: `index`, `about_me`, `portfolios`, `ai_builder`,
  `aws_architecture`, `contact`. Four more exist off the nav: `codejob`, `tutor`,
  `main_project`, `nobody`.
- A Jekyll blog lives in `yen_blog_Jeklly/` and is also linked out to
  `yennj12_blog_V4`; blog source lives in a separate repository.
- The reader may open the site in dark mode; the choice persists across pages via a
  shared `theme` localStorage key.

## Capabilities and Constraints

- **Static site, no build step.** Hand-written HTML/CSS/JS served straight from the
  repo root. Bootstrap 4.5.2, Font Awesome, AOS, jQuery. Served locally with
  `python -m http.server 8000`.
- **Hosted on GitHub Pages**, `CNAME` → `yennj12.js.org`. A commit to `master` is the
  deploy. There is no CI, no bundler, and no server — anything requiring a backend is
  out of reach.
- **The contact form posts to a Google Form** (`docs.google.com/forms/.../formResponse`,
  `target="_blank"`). It works, but it navigates away and gives no in-page confirmation.
- **Progressive enhancement is a hard rule, not a preference.** Per `CLAUDE.md`: markup
  ships complete and script only subtracts; nothing starts hidden or at zero opacity;
  every motion-driven behaviour is skipped under `prefers-reduced-motion`. A page must
  work with its JavaScript removed.
- `manifest.json` still describes the owner as "specialized in backend solutions",
  which contradicts the current AI-full-stack positioning. **Known stale copy**, not a
  product change.
- The design system is already documented in detail in `CLAUDE.md` (the FinLab token
  system, two font weights, a 2.5rem type cap with one deliberate exception on the
  landing page, hairlines over shadows, one blue for action). That document is binding
  visual authority; `DESIGN_COMPARISON.md` describes three abandoned 2024-era
  alternatives and is **not** authority.

## Brand Commitments

- Name and mark: **YEN.DEV**, set as `YEN` + `.DEV` with the dot carrying the accent.
- Domain `yennj12.js.org`; © line reads "© 2026 Yen · All rights reserved."
- Tagline in the footer: "Physics first, full stack after. AI products built end to end
  — from 31 of 195 countries."
- Voice: plain, concrete, slightly dry, engineer-to-engineer. Claims land as observed
  facts, not adjectives — "APIs built to be boring", "something you can actually debug
  at three in the morning". No marketing enthusiasm, no exclamation marks.
- Light is the default theme; dark is opt-in and never follows the OS preference.

## Evidence on Hand

Real, but **stated as honest round numbers rather than audited metrics**. Future work
preserves their substance and may rephrase them; it must never sharpen them into
precision they do not have, and must never invent new figures alongside them:

- 2016–2018, software engineer (data), UK: 50+ pipelines, ~10TB processed daily,
  3 countries. Python, SQL, Hadoop, Spark, ETL.
- 2018–2024, backend engineer, Japan → Ireland → AWS: 100+ APIs, 99.9% uptime,
  5 global teams. Java, Spring Boot, microservices, REST, DevOps.
- 2024–now, tech consultant, remote: 20+ client projects, 3x performance improvements.
- 31 of 195 countries visited. Eight years of experience.

Real and verifiable — public repositories, linked from the site:
`cdk-playground` (TypeScript, AWS CDK), `agent_ticket_system` (Python, multi-agent
LLM triage), `SpringPlayground` (Java, Spring Boot + Kafka), `InvestSkill` (Python,
market analysis and backtesting).

Real contact points: `f339339@gmail.com`, `linkedin.com/in/yennanliu`,
`github.com/yennanliu`, plus HuggingFace and GitLab.

**No testimonials, named clients, case studies, press, pricing or customer logos exist.**
Future work must not fabricate any of these.

## Product Principles

1. **One pair of hands is the whole argument.** Every page should make the span across
   six layers more credible, never merely broader.
2. **Concrete beats adjectival.** A number, a stack name, or a failure mode said plainly
   outperforms any claim of excellence.
3. **Earn the read before asking for the click.** Success is depth then contact, so
   substance pages carry the persuasion and no CTA should interrupt a reader mid-proof.
4. **Never invent proof.** With no testimonials or named clients, credibility comes only
   from work that can be opened and read.
5. **The page works before the script does.** Progressive enhancement and reduced-motion
   support are product requirements, not polish.

## Accessibility & Inclusion

No formal standard has been set by the owner. Two requirements are already established
in the codebase and must be preserved: `prefers-reduced-motion` is honoured everywhere,
and content is never gated behind JavaScript or an animation that may not run.
