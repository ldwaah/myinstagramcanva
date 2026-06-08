# Copy tone guidelines per niche

Voice rules for LLM copy token generation. British English throughout.

## General rules

- **Specific over generic** — reference the creator's actual work, location, or specialty.
- **Short headlines** — 3–8 words for H1; 1–2 sentences for subtitles.
- **No filler** — ban "Welcome to my website", "Your journey starts here", "Passionate about…", "Unlock", "Elevate", "Dive in", "Game-changer", "Crafted with care".
- **No em dashes or en dashes** — use commas or full stops.
- **No exclamation marks in headlines**.
- **Max two CTAs per page** — one hero action, one contact/footer at most.
- **Eyebrows carry context** — location · specialty · availability (not "Hello, I'm…").
- **CTAs are action verbs** — "Book a session", "View portfolio", "Get the recipe".

## Niche voices

### Fitness / wellness
- Tone: direct, motivating, no hype.
- Eyebrow: "Online coaching · HYROX prep"
- Headline: outcome-focused ("Stronger every session")
- Avoid: "Crush your goals", "Beast mode"

### Food / chef
- Tone: warm, sensory, approachable.
- Eyebrow: "Home cooking · London"
- Headline: dish or style-led ("Seasonal plates, honest flavours")
- Use specific ingredients or cuisines when known from bio.

### Fashion / beauty
- Tone: editorial, minimal words, confident.
- Eyebrow: "Stylist · Editorial"
- Headline: statement, not explanation ("Less noise. More intention.")
- Avoid: excessive exclamation marks.

### Photography / visual
- Tone: cinematic, sparse, location-aware.
- Eyebrow: "Documentary · Available worldwide"
- Headline: visual metaphor ("Frames that outlast the moment")
- Marquee: commission types or locations.

### Business / coach / consultant
- Tone: professional, clear ROI, trustworthy.
- Eyebrow: "Strategy · Remote"
- Headline: problem → outcome ("Clarity for growing teams")
- Bullets: concrete deliverables, not buzzwords.

### Lifestyle / creator
- Tone: friendly, authentic, conversational.
- Eyebrow: city or vibe ("Brighton · Daily life")
- Headline: personal but not cheesy ("The ordinary bits I actually love")
- IG CTA: "@handle" not "Follow me on Instagram!!!"

### Travel / adventure
- Tone: wanderlust without cliché.
- Avoid: "Explore the world", "Adventure awaits".
- Prefer: specific regions or trip types from bio/posts.

## Token mapping

| Token | Max length | Notes |
|-------|------------|-------|
| HERO_EYEBROW | 40 chars | Uppercase in CSS |
| HERO_TITLE | 60 chars | May split across lines in cinematic |
| HERO_SUBTITLE | 160 chars | Bio excerpt or value prop |
| TAGLINE | 80 chars | Pull quotes, about intro |
| MARQUEE_TEXT | 50 chars | Repeating ticker copy |
| ABOUT_BODY | 300 chars | 2–3 sentences |
| CONTACT_SUBTITLE | 120 chars | Low-friction invite |
