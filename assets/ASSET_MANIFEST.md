# Website Media Provenance — 2026-08-18

All gameplay media in this website is derived from user-supplied, real in-game
captures. Sources remain outside this repository and were not modified.

## Screenshot mapping

Source: external account-owner screenshot set; source basenames and hashes are
recorded below.

| Source | SHA-256 | Website role | Derived basename |
|---|---|---|---|
| `IMG_8340.PNG` | `C56532D90C8DDF4938CEA8C947B423CC7D5C31BF037F8BB83404569B376581DF` | Hero Classic board | `hero-classic-{480,720}.webp` |
| `IMG_8325.PNG` | `6D959A8203B0B72EB00EDC7486509A5E1EE71A41D1B4123B4680937F19618722` | Classic full-clear payoff | `classic-full-clear-{480,720}.webp` |
| `IMG_8317.PNG` | `C116FEFFC7A4BA0F7B8ACA04CBB255A5DBE03CE3F3401C011936BD3EF43FA56A` | Arcade progression map | `arcade-map-{480,720}.webp` |
| `IMG_8342.PNG` | `F407E1345340DA666F4EC5388F717A74EFFE5A7931DA63376F1B1ADCB8A54002` | Arcade break-seals objective | `arcade-seals-{480,720}.webp` |
| `IMG_8328.PNG` | `26E51E6908327F700C3EACC74ACE40E374396BB74225AA83A8878F9FF771E725` | Theme Studio | `theme-studio-{480,720}.webp` |
| `IMG_8320.PNG` | `D1F8C26B3E9912B8D20DA97433D5EBDB58645B9B75989BB14625E0CA9C9AF784` | RGB Market | `rgb-market-{480,720}.webp` |
| `IMG_8322.PNG` | `5AF570813FA4E116A6A4F45DB7938568FCE5FA6F14F9C17C6352CC3844AEA640` | Arcade target-cells gallery | `arcade-target-cells-{480,720}.webp` |
| `IMG_8341.PNG` | `96B8C9A90E21AC41207DB3126589D552A9916792C57D2E993523902D84A6B95F` | Arcade rotating-piece gallery | `arcade-level-{480,720}.webp` |
| `IMG_8321.PNG` | `A208AD334A0537A4630D08D47A05D7168409F7564EB711679109471D8E2C3E39` | Bonus Reward gallery | `bonus-reward-{480,720}.webp` |

Screenshot derivatives preserve the complete source frame and aspect ratio.
They are Lanczos-scaled WebP files at `480×1040` and `720×1560`; no crop,
stretch, in-game text replacement or generative edit was applied.

## Gameplay video

- Source: external account-owner video `app_preview.mp4`
- Source SHA-256: `B9AA59969BEA0EBD7CB56F3B9B6BB6A3B4AB151E0A8B476515D5B7084A5A595F`
- Source identity: H.264 Main, `886×1920`, `30 fps`, `29.233991 s`, AAC stereo,
  `34,857,858` bytes.
- Web MP4: H.264 High, `720×1560`, `30 fps`, `29.233333 s`, `yuv420p`, no
  audio track, fast-start, `2,211,042` bytes.
- Web MP4 SHA-256: `B575E7C71DAB86E8E227AC79C6BE7B03F022F40ECD0397F584013A3F0B4496CE`
- Poster SHA-256: `80D06552C0A5950C55436EAE7C85B21D3CE9F94F05CAAD46FFA9521248A8AA4E`

The complete Classic-to-Arcade sequence is retained. The site never requests
the MP4 until the visitor explicitly presses play.

## Brand icon

- Source: repository root `app_icon_source.png`
- Source SHA-256: `81F8B1393A9DF76E9F8BBDDC15FBDFD072EDFAD4E8E6806495231900B282AD8A`
- Loaded derivative: `assets/images/brand/app-icon-192.png`
- Derivative SHA-256: `587A6EF898B8CA917B40E166DD06335DC91E4637EE33910E9CA33CB53CCC115C`
- Trust-section derivative: `assets/images/brand/app-icon-512.webp`, `16,042`
  bytes, SHA-256
  `80BB2987E354814369C21D7DDCC98FB3FF22CC2C701B706A53F69D92BB680A8B`.
- The trust composition preserves the complete app icon. CSS supplies only the
  surrounding uninterrupted-flow ring; it does not alter the icon pixels or make
  a broader `no ads` claim.

## Official store badges

- App Store English preferred-black SVG source: official Apple marketing-artwork
  package supplied by the account owner,
  `Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg`
- Repository copy: `assets/images/store/app-store-en.svg`, `10,804` bytes,
  SHA-256
  `A26FC5B38380272C92E9019A2EB8B45542A66814B3E2B203772DB8904B9FB99F`.
- Google Play English PNG source:
  `https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png`
- Repository copy: `assets/images/store/google-play-en.png`, `4,904` bytes,
  SHA-256
  `F72611E2DF8E88204009FD896D05D5E8E83C77009C63943BBFFA169559934849`.
- Both website CTAs use the official English artwork in English and Turkish page
  modes, per the account owner's explicit approval. Artwork shapes, colors,
  text, wordmarks and icon proportions are unchanged.
- Unused localized intake copies are retained for provenance/possible later use:
  `app-store-tr.svg` and `google-play-tr.png`; they are not referenced by the
  current prototype.

## Brand-neutral device frame

- Generation mode: built-in `imagegen`, new original transparent raster asset.
- Generation source: Codex generated-images output
  `01a0150c-0fe4-7ff3-a9c9-7ab44cc5f1c1/exec-941d161f-f8ff-418e-9090-c2837e12ba0d.png`.
- Source: `1024×1536`, `1,127,497` bytes, alpha-enabled PNG, SHA-256
  `F0ACE18969204B7F62A31F480B7A650DF9AB39178506B956101111B45C28E908`.
- Website derivative: `assets/images/device/brand-neutral-phone-frame-v1.webp`,
  `1024×1536`, `yuva420p`, `49,200` bytes, SHA-256
  `4BFDCED4F2D35F8A2CEDD719D9A5FE764133728FAACDABA9E94232FE8D637C88`.
- The device has no brand, logo, notch, Dynamic Island, home button, sensor
  housing or platform-unique control. Exact gameplay remains a separate HTML
  image layer above the uniform screen region; generation did not touch gameplay
  pixels.

## Social preview

- Output: `assets/images/brand/rgb-block-puzzle-social.jpg`
- Dimensions: `1200×630`
- Bytes: `119,009`
- SHA-256: `EB807701A5D0493087652095A3FC41A291C333A8A1E69930D943045BEAE1D398`
- Composition: deterministic crop of the verified local `1440×1000` English hero
  viewport; real gameplay and live website typography only, with no generative edit.
