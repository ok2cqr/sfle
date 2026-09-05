# SFLE - Simple fast log entry

**Simple fast log entry** - a tool to enter QSO from your SOTA/GMA/WWFF activations and create the ADIF file - everything just in your browser.

## Working application is available on **[sfle.ok2cqr.com](https://sfle.ok2cqr.com)**

Written in HTML/Javascript by [Petr, OK2CQR](https://www.ok2cqr.com).

Heavily inspired by [FLE](https://df3cb.com/fle/) from [Bernd, DF3CB](https://df3cb.com/).
Unfortunately, the FLE works only on Windows and Linux using Wine, but I needed something working on macOS and/or
Android tablet. I&nbsp;didn't need all the features, just wanted to log QSO from my WFF/SOTA/GMA activation.

If you find any bug or have a suggestion on how to improve the website, please let me know at [petr@ok2cqr.com](mailto:petr@ok2cqr.com).
I&nbsp;get many emails every day, if you don't get a reply in a few days, don't hesitate to send your email again.

## Deployment

Copying the files to the server is not quite enough. Browsers cache `js/app.js`
and `css/style.css`, so a release only reaches anyone when the **version stamp**
in their `?v=` query strings changes.

Unlike RTLE, SFLE is not a PWA - there is no service worker and no cache name to
rotate. The `YYYYMMDDHHMM` stamp lives in two files: `APP_VERSION` in
`js/app.js` (which also ends up in the ADIF export header, so it has to stay
exactly 12 characters long) and the two asset tags in `index.html`.
`tools/bump-version.sh` rewrites all of them at once:

```sh
sh tools/bump-version.sh                # stamp with the current time
sh tools/bump-version.sh 202601011200   # or an explicit one
```

The two tags are bumped independently while developing, so they may have drifted
apart; a release stamps both with the same value. Forgetting to bump means the
release reaches nobody - every browser keeps serving the copy it already has.

### On the server

```sh
make prod
```

That fetches the branch, hard-resets the working tree to it, bumps the stamp and
gives the files to the web user. Defaults can be overridden:

```sh
make prod BRANCH=main OWNER=www-data:www-data
```

`make version` prints the stamp currently deployed.

The bump edits a tracked file, so the working tree on the server is always dirty
and a plain `git pull` would refuse to run - hence the hard reset. It also means
**anything uncommitted on the server is discarded** on every deploy. Untracked
files are left alone.

### By hand

Copy the files as before and run `sh tools/bump-version.sh` afterwards, either on
the server or locally before copying.
