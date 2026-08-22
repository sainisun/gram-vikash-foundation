# Design System

**Project:** Gram Vikash Foundation  
**Status:** Provisional implementation baseline; reconcile against the approved HTML prototype when it is added to the repository  
**Audience:** Product designers, frontend engineers, and AI coding agents  
**Source of truth:** [`PRD.md`](../PRD.md) [1]

> The supplied documentation brief describes a ruled-paper ledger/notebook motif, an indigo-and-turmeric palette, Hindi/Devanagari content, and the Baloo 2, Hind, and IBM Plex Mono families. The actual `foundation-prototype.html` was not present in the repository during this documentation pass. The tokens below are therefore a coherent implementation baseline, not a claim that every value has been reverse-engineered from that missing file.

## 1. Design principles

The interface should feel like a **well-kept community ledger**: warm, legible, human, and accountable. Financial information should be visually calm and scannable, not gamified. Hindi content must have the same visual status as English content. The public site is mobile-first because the PRD targets village and diaspora audiences, expects most traffic from mobile devices, and sets a low-bandwidth performance target. [1]

Use visual emphasis for three things only: the foundation’s mission, the movement of money, and clear actions a visitor can take. Avoid decorative illustrations that compete with ledger rows, sensitive program metrics, or donor receipts.

## 2. Color tokens

The following CSS variables are the only colors that application components should use. New colors require a design-system change review; ad-hoc hexadecimal values in JSX or CSS are not permitted.

| Token | Hex | Semantic use |
|---|---|---|
| `--color-paper` | `#FBF8EF` | Main page and ledger paper background |
| `--color-paper-deep` | `#F2EBDD` | Card tint, table header tint, disabled surfaces |
| `--color-ink` | `#1F2440` | Primary text, headings, dark navigation, button text on turmeric |
| `--color-ink-muted` | `#5A5C70` | Secondary text, metadata, helper copy |
| `--color-indigo-primary` | `#343F8F` | Primary links, primary button background, active navigation |
| `--color-indigo-dark` | `#252C67` | Hover/pressed primary state, dark footer, high-emphasis panels |
| `--color-indigo-soft` | `#E7E9F7` | Focus ring tint, selected filters, soft callout background |
| `--color-turmeric` | `#D99205` | Primary donation CTA, highlights, progress accents, decorative rule |
| `--color-turmeric-dark` | `#A86D00` | Hover/pressed turmeric state and dark text-safe accent |
| `--color-turmeric-soft` | `#FFF0C7` | Notice background, metric emphasis, selected program tag |
| `--color-ledger-negative` | `#9E2A2B` | Expense amounts and negative balance indicators |
| `--color-ledger-positive` | `#216A4A` | Donation amounts, positive balance, success status |
| `--color-ledger-neutral` | `#6B5D3A` | General-fund or neutral transaction labels |
| `--color-border` | `#D7D0BF` | Dividers, card borders, input borders |
| `--color-border-strong` | `#AFA58F` | Table rules, focused/active borders |
| `--color-margin-red` | `#C75B55` | Ruled-paper margin line only; never use for alerts or financial semantics |
| `--color-white` | `#FFFFFF` | Text on dark indigo surfaces and white modal surfaces |
| `--color-black` | `#000000` | Only for browser-native fallback; not a design token for regular UI |

**Usage rules.** `--color-ledger-negative` and `--color-ledger-positive` must be paired with a text label or icon; color alone must never communicate financial direction. Do not use `--color-margin-red` for destructive actions because it belongs to the notebook motif. Turmeric is an action color, not a warning color. On small screens, reduce decorative color before reducing text contrast.

## 3. Typography

Load the selected web fonts with a system fallback stack and use `font-display: swap`. The repository should vendor or self-host approved font files when licensing and performance review permit; otherwise use the documented Google Fonts or equivalent deployment configuration. Devanagari fallback must be tested on a mid-range Android device.

| Role | Family | Weight | Size / line height | Usage |
|---|---|---:|---:|---|
| Display heading | `Baloo 2`, `Noto Sans Devanagari`, sans-serif | 700 | 48px / 1.08 | Hero headline and major page title |
| Section heading | `Baloo 2`, `Noto Sans Devanagari`, sans-serif | 700 | 32px / 1.15 | Program and dashboard sections |
| Card heading | `Baloo 2`, `Noto Sans Devanagari`, sans-serif | 600 | 22px / 1.2 | Program cards, callout titles |
| Body | `Hind`, `Noto Sans Devanagari`, sans-serif | 400 | 17px / 1.55 | Paragraphs, descriptions, Hindi-first copy |
| Body emphasis | `Hind`, `Noto Sans Devanagari`, sans-serif | 600 | 17px / 1.5 | Inline emphasis and labels |
| UI label | `Hind`, `Noto Sans Devanagari`, sans-serif | 600 | 13px / 1.2 | Buttons, tabs, form labels |
| Eyebrow | `IBM Plex Mono`, monospace | 600 | 11px / 1.3, letter spacing 0.08em | Dates, category labels, section markers |
| Financial data | `IBM Plex Mono`, monospace | 600 | 20px / 1.2 | Amounts and dashboard totals |
| Ledger detail | `IBM Plex Mono`, monospace | 400 | 13px / 1.35 | Transaction dates, IDs, metadata |
| Button text | `Hind`, `Noto Sans Devanagari`, sans-serif | 700 | 15px / 1.1 | Action buttons |

Do not use the mono family for long explanatory text. Hindi and English may share a line, but a line-height adjustment must not cause Devanagari vowel marks to collide. Use `lang="hi"` or `lang="en"` at the content boundary so assistive technology and font fallback behave correctly.

## 4. Spacing, sizing, and shape tokens

Normalize all layout values to the following scale. The numbers are CSS pixels and should be exposed through Tailwind theme extensions.

| Token | Value | Typical use |
|---|---:|---|
| `--space-1` | 4px | Icon gap, compact badge padding |
| `--space-2` | 8px | Label-to-control gap, tag padding |
| `--space-3` | 12px | Table cell inset, compact card gap |
| `--space-4` | 16px | Default component padding |
| `--space-5` | 20px | Form group gap |
| `--space-6` | 24px | Card padding, section inner gap |
| `--space-8` | 32px | Grid gap, section title separation |
| `--space-10` | 40px | Medium section spacing |
| `--space-12` | 48px | Hero internal spacing |
| `--space-14` | 56px | Large section spacing |
| `--space-16` | 64px | Page section padding |
| `--space-20` | 80px | Desktop hero top/bottom spacing |
| `--radius-sm` | 4px | Inputs, badges |
| `--radius-md` | 8px | Cards, buttons |
| `--radius-lg` | 16px | Hero callouts and major panels |
| `--radius-pill` | 9999px | Donor chips and status tags |
| `--shadow-card` | `0 2px 10px rgba(31, 36, 64, 0.08)` | Elevated card only |
| `--shadow-focus` | `0 0 0 3px rgba(52, 63, 143, 0.28)` | Keyboard focus ring |
| `--content-max` | 1200px | Main content max width |
| `--reading-max` | 720px | Long-form text max width |

## 5. Component inventory and states

| Component | Anatomy | Default state | Hover/focus/other states |
|---|---|---|---|
| Ledger-page hero | Eyebrow, display title, short mission copy, summary metric or CTA | Paper surface with margin line and restrained turmeric accent | CTA darkens; focus uses visible indigo ring; no animated number spinners in initial load |
| Primary button | Label plus optional leading icon | Indigo background, white text, `radius-md`, 44px minimum height | Turmeric donation button darkens to `--color-turmeric-dark`; disabled uses paper-deep and muted ink |
| Secondary button | Label, optional icon | Transparent paper surface, indigo border/text | Background changes to indigo-soft; focus ring remains visible |
| Program card | Image, program tag, title, short description, metric, link | White/paper-deep surface, border, moderate radius | Lift is optional; do not move content; link underlines on hover |
| Dash card | Metric label, financial number, explanatory caption | Four-card desktop grid; mono number; semantic positive/negative styling | No color-only status; loading uses text skeleton or explicit loading label |
| Ledger row | Date, description, program tag, amount, source/receipt affordance | Ruled row, fixed numeric alignment, positive/negative text plus label | Hover highlights row background; focus applies to row link/action, not entire non-interactive row |
| Ledger table | Header, paginated rows, empty/loading/error states | Desktop columns preserve date/amount alignment | On mobile, becomes stacked transaction cards or horizontally scrollable region with accessible label |
| Donor chip | Display name or Anonymous, optional amount/date | Pill with paper-deep background | Opt-in names only; no tooltip reveals private donor identity |
| Tag/badge | Program, payment mode, status | Small mono/label token with text | Status colors pair with visible words such as `Success`, `Pending`, or `Failed` |
| Donor wall | Heading, explanatory consent copy, chip/list items | Recent/top donors according to documented query | Anonymous entries remain indistinguishable from intentional anonymity |
| Progress metric | Label, numeric value, optional progress bar | Text value remains primary; bar is supplemental | Never imply a target is achieved without source data |
| Photo gallery | Responsive image tiles, alt text, consent metadata internally | Group/classroom imagery preferred | Lightbox, if added, must trap focus and offer text caption; no identifying minor captions |
| Form field | Label, input, helper/error text | 44px minimum control height, visible label | Error uses text and border/icon; never rely only on red |
| Donation amount selector | Presets, custom amount, program earmark | Presets plus custom input; currency explicitly shown as INR | Selected state has border and text; keyboard and screen-reader selection required |
| Receipt link | Label, date, secure download action | Only authorized/private URL or approved public expense receipt | Expired/missing file states are explicit and retryable |
| Pagination | Previous/next, page indicator, optional page size | Clear current page and disabled boundary buttons | Keyboard order is logical; URL query reflects page for shareability |
| Alert/callout | Icon, title, body, optional action | Indigo/turmeric informational surface | Destructive/error state uses semantic text, not notebook red by default |
| Admin quick action | Add expense, add offline donation, review queue | Large thumb-friendly action | Destructive or money-sensitive action requires confirmation and audit record |
| Moderation queue item | Content preview, risk/report reason, actions | Quarantined or under-review label | Actions show confirmation, actor, timestamp, and reason |

## 6. Reusable ruled-paper ledger motif

The motif is a signature pattern, not a global background texture. It consists of a warm paper base, very low-contrast horizontal rules, and a single vertical red margin line offset from the content boundary. The horizontal rules should be implemented with a CSS repeating linear gradient; the margin line should be a pseudo-element or dedicated decorative element with `aria-hidden="true"`.

Use the motif on the home hero, transparency dashboard, public ledgers, and selected trust/about panels where a record-keeping metaphor supports comprehension. Do not use it behind dense admin forms, payment error dialogs, community chat, or sensitive kanyadan application data. Do not place the margin line through text, interactive controls, or a cropped photo. On very small screens, reduce rule contrast and remove the margin line if it causes visual crowding.

Example pattern:

```css
.ledger-surface {
  position: relative;
  background-color: var(--color-paper);
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 31px,
    rgba(175, 165, 143, 0.22) 32px
  );
}

.ledger-surface::before {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: clamp(20px, 8vw, 112px);
  width: 1px;
  background: var(--color-margin-red);
  opacity: 0.52;
  pointer-events: none;
}
```

## 7. Responsive behavior

The primary breakpoint is **760px**, matching the design brief. Below it, the desktop navigation collapses to a menu button, multi-column hero content stacks, dashboard cards become one or two columns, program cards become a single column, and secondary decorative elements are hidden or reduced. Ledger tables must either convert each row into a labeled stack or provide a clearly announced horizontal scroll container; never allow important amount or date cells to be clipped.

Touch targets should remain at least 44px high. Horizontal page padding should reduce from 32–40px on desktop to 16px on mobile. Long Hindi headings may use a slightly smaller display size rather than overflow. Image galleries should use two columns only when the rendered tile remains large enough to identify the intended scene without exposing sensitive detail.

## 8. Accessibility and validation

All financial direction uses text such as `Donation` or `Expense` alongside color. Focus indicators must remain visible against both paper and indigo surfaces. Run automated contrast checks for body text, links, buttons, amount colors, and focus rings against their actual backgrounds using the current WCAG contrast guidance [2]. The chosen ledger positive/negative colors are intended to be dark enough for paper surfaces, but they still require automated and manual verification after component composition.

Test Devanagari at the body, label, and ledger-detail sizes on a mid-range Android device. Check vowel marks, numerals, line wrapping, mixed Hindi/English strings, browser zoom to 200%, screen-reader labels, reduced motion, keyboard-only operation, error announcements, and the accessible names of pagination and receipt controls. The PRD explicitly requires Devanagari legibility, sufficient contrast, and mobile-first testing. [1]

## 9. Tailwind mapping

```ts
// tailwind.config.ts — illustrative mapping
export default {
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#FBF8EF', deep: '#F2EBDD' },
        ink: { DEFAULT: '#1F2440', muted: '#5A5C70' },
        indigo: { DEFAULT: '#343F8F', dark: '#252C67', soft: '#E7E9F7' },
        turmeric: { DEFAULT: '#D99205', dark: '#A86D00', soft: '#FFF0C7' },
        ledger: { negative: '#9E2A2B', positive: '#216A4A', neutral: '#6B5D3A' },
        border: { DEFAULT: '#D7D0BF', strong: '#AFA58F' },
        margin: { red: '#C75B55' },
      },
      fontFamily: {
        display: ['Baloo 2', 'Noto Sans Devanagari', 'sans-serif'],
        body: ['Hind', 'Noto Sans Devanagari', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      maxWidth: { content: '1200px', reading: '720px' },
    },
  },
};
```

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: https://www.w3.org/TR/WCAG22/ "W3C Web Content Accessibility Guidelines 2.2"
