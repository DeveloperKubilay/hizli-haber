# AI Görsel Prompt Test Notları (2026-11-18)

## Kullanılan Prompt (Pollinations.ai / Flux modeli)

```
minimal flat vector illustration of a modern laptop and smartphone on a desk, 
dark navy background, cyan and green accent lines, isometric technical diagram style, 
no people, no humans, no faces, clean geometric shapes, editorial tech magazine art
```

### Negative Prompt (eksik - bir sonraki testte eklenecek):
```
no people, no humans, no faces, no persons, illustration style, isometric, 
technical diagram, infographic, flat design, vector art, photorealistic, 3d render
```

## Test Görselleri (local)
- `/opt/data/cache/test_images2/01_laptop.jpg` — Laptop + telefon
- `/opt/data/cache/test_images2/02_datacenter.jpg` — Sunucu rafları
- `/opt/data/cache/test_images2/03_space_retry.jpg` — Uzay/uydu
- `/opt/data/cache/test_images2/04_phone.jpg` — Telefon + kod (küçük insan silueti riski var)

## Stok SVG Karşılaştırması
- `/opt/data/workspace/hizli-haber/public/imgs/stok/*.png` — 9 kategori, %100 vektör, insansız

## Değerlendirme Kriterleri (yarın kontrol edilecek)
1. **İnsan/yüz sızıntısı var mı?** (Flux bazen küçük siluetler ekliyor)
2. **Haber kartında nasıl duruyor?** (16:9, 4:5, 9:16 kırpmalarda)
3. **Renk paleti site temasıyla (koyu navy/cyan/yeşil) uyumlu mu?**
4. **SVG vs AI — hangisi daha "editöryel/haber sitesi" hissi veriyor?**
5. **Küçük thumbnail (200px) boyutunda net mi kalıyor?**

## Fallback Zinciri (genimg.js)
1. Google Imagen (ai.randdcodes.com) — kota dolduğunda atlanır
2. **Pollinations.ai (Flux)** — şu an test ediliyor
3. Hugging Face SDXL — yedek
4. Stok SVG (kategoriye göre) — son çare, %100 güvenli

## Yapılacaklar
- [ ] Negative prompt ekleyip tekrar test
- [ ] Farklı seed'lerle 10+ görsel üretip "insansız" oranını ölç
- [ ] Canlı haber sayfasında A/B test (AI vs SVG)
