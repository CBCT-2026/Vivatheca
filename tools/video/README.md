# Model videos

Every model in the collection has a short narrated video (at most 45 seconds) in English and Japanese,
made the same way as the education video for the Vivatheca wisdom tooth model
(CBCT-2026/wisdom-tooth, `video/`): a computer voice reads short, cited sentences, the subtitles are
timed to the voice, and the 3D model turns and changes stage under labelled parts. Every frame shows
the review status and the model disclaimer.

Output: `public/videos/<slug>/<slug>-<lang>.mp4`, `.vtt` captions and `poster-<lang>.jpg`.
The pages show them with `public/video-embed.js` (static pages) and `app/video-section.tsx`
(app pages); the collection (`/models`) badges each card with the video length.

## Files

- `scripts/<slug>.json`: models, camera scenes, label anchors, sources, and the words in `en` and `ja`
  (paragraphs of sentences, each with `cite` numbers into `sources`; Japanese uses `{漢字|かんじ}`
  furigana, and an optional `tts` field when the reading needs help). Optional `speed` per language.
- `tts.py`: voice and subtitles (Kokoro-82M via kokoro-onnx; English `bf_emma`, Japanese `jf_alpha`).
  Fails if a video is over 45 s.
- `render.html` + `render.mjs`: draws each frame with three.js in Chromium (720×1280, 24 fps) and joins
  frames and voice with ffmpeg.
- `build-embed.mjs`: writes `public/videos/videos.js` and `app/videos.ts` (words, sources, lengths).

## Rebuild one video

```sh
# Python 3.12 (spacy does not build on 3.13); Japanese needs unidic-lite, not unidic
pip install kokoro-onnx misaki[en,ja] soundfile unidic-lite
# model files: kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx releases, in one folder
python tools/video/tts.py <slug> en --model-dir <folder>
python tools/video/tts.py <slug> ja --model-dir <folder>
node tools/video/render.mjs <slug> en      # PW_CHROMIUM=<path> if Playwright's browser is elsewhere
node tools/video/render.mjs <slug> ja
node tools/video/build-embed.mjs
node tools/patient-text/snapshot.mjs && pitk check
```

`--still 3,12.5` renders single frames to `tools/video/build/` for checking the camera and labels.
Japanese text needs ffmpeg plus the Noto Sans JP font. One video takes several minutes on 4 CPUs.

## Open items

- The Japanese voice and subtitles have not been checked by a Japanese-speaking clinician.
- Re-render a video when its model's GLB changes (colours, parts), and keep its words in step with the page.
