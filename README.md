# Caladan Worlds · capabilities brief (16 Air Assault Brigade)

A six-slide 16:9 deck built as a website. Every slide is laid out at 1920×1080 and scales to the screen.

1. Cover, with the Brigadier's quote and the founders
2. The front changes every few weeks (race chart, with a Caladan lane)
3. How we're different (comparison by type of tool)
4. The rehearsal (mission map story)
5. What you get better at (a graphic per role)
6. How you'll know it worked (performance chart, contact)

## Open it

It runs fully offline. The animation libraries and fonts are bundled.

```bash
cd "/Users/odin/Git/Deck capabilities/site" && python3 -m http.server 8123
```

Then open http://localhost:8123.

## Presenting

Click the page once, then:

- `→` / `←`, Page Down / Page Up, Space, or a clicker: next and previous slide
- `R`: replay the current slide's animation (there are no on-screen buttons)
- `J`: cut the link on the mission map (slide 4)
- `F`: full screen
- `#s4` on the end of the address opens slide 4

## PDF

Print from the browser (the page size is set to 1920×1080, one slide per page), or use the exported `Caladan-Capabilities-16AA.pdf`. `?pdf=1` shows every slide stacked in its finished state.

## Files

- `index.html`: slides
- `styles.css`: deck look (warm paper, Archivo SemiExpanded, bronze, photo slides with frosted cards)
- `app.js`: the deck controller and each slide's animation (Motion and Anime.js)
- `artifact.html`: generated copy for publishing as an artifact
- `vendor/`: Motion 14.9.0 and Anime.js 4.5.0, pinned
- `assets/`: images from the deck's generated-images folder, and the Archivo fonts

## Notes

- The Caladan lane on slide 2 is a design target, and the source line says so.
- The comparison on slide 3 uses the pitch deck's matrix, by category, with no competitor names.
- The mission map, link-quality chart and the three role graphics are labelled illustrative.
- Capabilities come from the 18 Nov 2026 technical note, and most are planned. The slides carry no dates or readiness labels, by choice.
