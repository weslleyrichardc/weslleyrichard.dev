# Releasing

Releases are git tags on `main`. There are no GitHub Release objects; `latest` is an annotated tag that always points at the newest release.

## Before tagging

1. Every change for the release is merged into `main`.
2. `main` is in sync with `origin/main` and the working tree is clean.
3. The release passes the full gate:

   ```bash
   pnpm test
   pnpm build
   pnpm lint
   ```

4. Review what is shipping:

   ```bash
   git log --oneline "$(git describe --tags --abbrev=0)"..main
   ```

## 1. Bump the version

`package.json` must match the tag (`v1.8` → `"1.8.0"`). The project is on `1.x`, so features and audit batches normally bump the minor version and fixes bump the patch.

```bash
# edit package.json "version"
git add package.json
git commit -m "chore: bump version to 1.9.0"
```

Push the bump to `main` through a PR when possible. An admin direct push bypasses the branch's PR-only rule; avoid it unless the release itself is the reason.

## 2. Tag the release commit

Use an annotated tag; the message is the release summary shown by `git show vX.Y`.

```bash
git tag -a v1.9 -m "Release v1.9: <one-line summary of what changed>"
```

## 3. Move `latest`

`latest` is force-updated to the new release commit. `v1.9^{commit}` peels the annotated tag to its commit.

```bash
git tag -fa latest -m "Latest release (v1.9)" v1.9^{commit}
```

## 4. Push the tags

```bash
git push origin v1.9
git push origin latest --force
```

Only `latest` is force-pushed. Never force-push `main` or a version tag — if a version tag is wrong, delete it deliberately (`git tag -d v1.9`, `git push origin :refs/tags/v1.9`) and re-create it before anyone depends on it.

## 5. Verify

```bash
git rev-list -n1 v1.9
git rev-list -n1 latest        # both must print the same commit
grep '"version"' package.json  # must be 1.9.0
git ls-remote --tags origin | grep -E 'refs/tags/(v1.9|latest)'
git status --short --branch    # clean, main up to date
```

The remote listing shows the annotated tag object and its peeled commit (`^{}`); both must resolve to the release commit.

## Tag message convention

- Version tag: `Release vX.Y: <what changed>`
- `latest`: `Latest release (vX.Y)`
