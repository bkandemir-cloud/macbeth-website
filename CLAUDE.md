# Macbeth — Extended English study site

Student- and teacher-facing guide to Shakespeare's Macbeth for the Edexcel
International GCSE English Literature (4ET1) Component 3 coursework: the Literary
Heritage essay. Part of Beth's Extended English family. Sister sites: klara,
kindertransport, poetry, nonfiction, transactional, poetryprose, imaginative
(.extendedenglish.com).

## Stack and deployment
- Astro 5 static, GitHub to Cloudflare Pages, push to deploy.
- Intended live at https://macbeth.extendedenglish.com (project macbeth-website).
- `functions/_middleware.js`: SITE_PASSWORD gate (dormant until set).
- There is deliberately NO AI feedback tool (coursework integrity: candidate and
  teacher sign authentication declarations; AI must not draft or mark the work).
  Do not add one, and do not create a /feedback/ page.

## Design (parchment/crimson)
- Tokens in src/styles/global.css: paper #F7F1E5, ink #1F1A17, accent (sienna)
  #8E2430, accent-deep #6B1620, night #221417. Teacher mode swaps accent to slate.
- Brand mark: a crown outline over a crimson underline (also favicon.svg).

## Structure
- Student: / /guide/ (+ /guide/act-1/ ... /guide/act-5/) /themes/ /characters/
  /context/ /quotations/ /coursework/
- Teacher (mode="teacher"): /teachers/ /teachers/scheme-of-work/
  /teachers/lessons/ /teachers/assessment/

## Hard rules
- Coursework marked out of 30: AO1 10, AO2 10, AO4 10. Context is a third of the
  mark; weave it into topic sentences, never bolt it on.
- Three set questions (Beth's booklet): kingship; the presentation of women;
  "To what extent is Macbeth presented as a masculine character?" Each carries
  "consider language, form and structure and refer to context".
- Quotation wording verified against Beth's teaching corpus (lesson pack, seven
  soliloquies, scene decks; rebuilt to /tmp/mac/corpus.txt during the build) with
  /tmp/mac/v.py. Cite ACT AND SCENE ONLY: line and page numbers were not confirmed
  (class edition unknown). Re-verify wording against the class text before adding
  quotations; the decks occasionally gloss or paraphrase.
- No Pearson mark scheme reproduced; quality ladder paraphrased with a "mark against
  the current published grid" note.
- No student work, names or grades (the Feedback on Drafts folders are never a source).
- British English; no em dashes; never "genuine"/"genuinely".
- Footer copyright: Extended English.

## Build and verify (every push)
- Build in /tmp (rsync from the OneDrive folder; do not install node_modules on the
  mount). `npm install` then `npm run build` must pass (17 pages).
- Confirm every .astro ends `</BaseLayout>`; strip NUL bytes; built HTML ends
  `</html>`; internal links resolve; zero em dashes; no "genuine"/"genuinely".
- Watch the map-row markup in teachers/lessons.astro: `<td set:html={x} />` must be
  followed by `</tr>`, not a stray `</td>` (that broke the first build).
