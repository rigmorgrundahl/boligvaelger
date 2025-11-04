# Boligvælger – Leaflet (image overlay)

Denne lille pakke giver dig en klikbar boligvælger oven på et statisk situationskort (PNG/SVG).
Den kan lægges på enhver side (WordPress, Webflow, custom) ved at uploade filerne til et underkatalog og indsætte en *iframe*.

## Hurtigt i gang
1) Åbn `index.html` lokalt i din browser (dobbeltklik).
2) Du kan panorere/zoome og klikke på de 3 demo-boliger.
3) Redigér `data/units.json` for at styre farver/status/links.
4) Erstat `assets/plan.png` med et rent situationskort. Nu: 1398×908px.

## Dataformat (`data/units.json`)
Hver bolig er et polygon:
```json
{
  "id": "B1",
  "label": "1",
  "status": "LEDIG|RESERVERET|UDLEJET",
  "rooms": 4,
  "size": 98,
  "desc": "valgfrit",
  "more_url": "https://...",
  "cta_url": "https://...",
  "coords": [[y,x], [y,x], ...]   // billed-pixelkoordinater (0,0 = øverste venstre)
}
```
> Tip: Brug et værktøj som **Maplat**, **geojson.io** (med image overlay) eller et simpelt koordinat-script til at klikke hjørnerne af hver bolig.

Du kan også starte med rektangler og finjustere senere.

## Indlejring på velkomn.dk
- Upload hele mappen til dit webhotel (fx `/boligvaelger/lysholm/`).
- Indsæt på en side via *Custom HTML* blok:

```html
<iframe src="/boligvaelger/lysholm/index.html" style="width:100%;height:80vh;border:0;border-radius:12px;overflow:hidden"></iframe>
```

## Farver og status
- `LEDIG` = grøn, `RESERVERET` = gul, `UDLEJET` = rød (kan tilpasses i `styles.css`).
- Tooltip viser label + status. Klik åbner modal med flere detaljer og CTA.

## Videreudvikling (nemt)
- Knyt data til Google Sheet eller Airtable → byg et lille endpoint der returnerer samme JSON.
- Tilføj filtrering (værelser, m², pris) og en sidepanel-liste.
- Track klik/visninger i GA4 (event på polygon-click).
- Tilgængelighed: tab-fokus på polygoner + tast-luk af modal (ESC).

## Licenser
Leaflet 1.9.4 (BSD-2). Alt andet MIT.
