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

- Global appearance is managed by ThemeProvider and semantic CSS tokens; persist only the appearance preference in browser storage.
- Fetch official publisher RSS through the public read-only news server function with bounded timeouts and short caching; never accept caller-supplied feed URLs.
- All news surfaces share the same query and asset-matching helpers so publisher summaries, attribution, and original links stay consistent; never fall back to fabricated news.
