<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the public experience in the single index route; page sections use in-page anchors to preserve one-page navigation.
- Use global semantic tokens and scoped editorial classes to keep typography and spacing consistent across the single-page experience without changing waitlist behavior.
- Use inline SVG logo icons traced from the supplied official artwork with currentColor, never font approximations or external logo URLs; this preserves lettering and avoids deployment-specific asset endpoints. Derive the favicon from the same source and never embed brand-guideline screenshots in the page.
- Keep app-store marks in a shared browser-safe brand component and display them as availability labels, not download links, until real store destinations are supplied.
- Membership uses a natural-ratio background video with a lower white fade and viewport-triggered playback; scoped presentation classes keep mobile footage undistorted and text readable.
- Use the guide-approved secondary font until licensed primary font files are supplied; never download or substitute unlicensed primary font files.
- The app showcase uses a source-grounded generated phone image in an unframed overlay feature with CSS reveal motion and a reduced-motion fallback, not a live wallet interface; this preserves brand fidelity without implying functional payments.
- Waitlist validation is shared between the public form and its dedicated server function; writes use a server-only client and the CRM table has no visitor read grants, keeping contact details private.
- The waitlist owner reviews and exports records through Lovable Cloud rather than a public export endpoint; this avoids exposing the CRM without an established owner login.
