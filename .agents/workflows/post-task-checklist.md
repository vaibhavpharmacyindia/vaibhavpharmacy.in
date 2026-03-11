---
description: Standard steps to follow after every task involving the Vaibhav Pharmacy website
---

# Post-Task Checklist

After completing any task on the Vaibhav Pharmacy website, always follow these steps:

## 1. Update `history.md`
- Add a new dated entry at the top of `history.md` (below the title)
- Include: what was done, files modified (table), git commits
- Update the Project Structure section if new files were added/removed

## 2. Remove em dashes
- Search all modified files for `—` (em dash) and replace with `-` (hyphen)
- Run: `grep -r '—' website/` to verify none remain

## 3. Git commit & push
- Stage changes: `git add <files>`
- Commit with descriptive message
- Push: `git push origin main`

## 4. Content standards
- All content in **Hinglish** (unless specified otherwise)
- Optimized for **SEO** (meta tags, schema, keywords) and **GEO** (FAQ schema for AI search)
- Local references to **Lucknow, Vrindavan Yojna, Sector 11**
