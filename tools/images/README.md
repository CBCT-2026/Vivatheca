# Image tools

`openverse.mjs` searches the [Openverse](https://openverse.org) API (WordPress/openverse, MIT) for openly licensed images and Europe PMC for CC BY journal articles, and drafts entries for `docs/image-register.json`, the register that `docs/image-licensing.md` requires for every third-party clinical image.

```
node tools/images/openverse.mjs "mandible radiograph"              # CC BY / BY-SA / CC0 / public domain only
node tools/images/openverse.mjs "mandible radiograph" --all        # also NC and ND, each flagged with the policy limit
node tools/images/openverse.mjs "oroantral fistula" --pmc          # CC BY open-access articles (Europe PMC)
node tools/images/openverse.mjs --draft <id> --for head-neck/scc --name opg.jpg   # draft register entry
```

The tool only finds candidates. Every image still needs the policy's case-by-case check (licence on the file page, rights holder, no identifiable patient, consent) and a second check recorded in `secondCheck` before it is used.
