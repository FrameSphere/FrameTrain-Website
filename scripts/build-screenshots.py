"""App-Screenshots → WebP für die Website (DE + EN).

Aufruf (aus dem Repo-Root):  python3 scripts/build-screenshots.py

Quelle: ~/Desktop/frametrain_peek/app_in_pngs/<locale>/NNN_name.png – macOS-Fensteraufnahmen
mit transparentem Hintergrund und Schatten. Zugeschnitten wird über den Alphakanal
(deckende Fensterfläche), die runden Fensterecken bleiben transparent.

Ziel:
- public/images/app/<locale>/<slug>.webp (+@2x)            → AppShot (Startseite, Zielgruppenseiten)
- public/images/screenshots/<locale>/frametrain-<slug>.webp → AppScreenshot (/screenshots, Docs)
  Diese Dateinamen nie ändern: Google indexiert die Bild-URLs.

Neue App-Version? Nur die Zuordnung Slug → Quelldatei unten anpassen und neu laufen lassen.
"""
import os
from PIL import Image

SRC = os.path.expanduser('~/Desktop/frametrain_peek/app_in_pngs/')
WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'images') + '/'

# Startseite, Kreislauf, Use Cases, Zielgruppenseiten (AppShot, 1200×772)
APP = {
    'home': '001_home_dashboard', 'briefing': '002_home_ai_briefing',
    'studio': '021_studio_projects_overview', 'studio-boxes': '024_studio_image_boxes_project',
    'studio-classes': '030_studio_text_classes_project', 'training': '037_training_llm_setup',
    'training-lora': '039_training_llm_lora_parameters', 'analysis': '056_analysis_textclassifier_overview',
    'coach': '057_analysis_ai_training_analysis', 'lab-results': '069_laboratory_session_evaluation',
    'lab-pose': '074_laboratory_session_result', 'hosting': '076_hosting_yolo_history',
    'synapse': '081_synapse_builder_graph', 'versions': '009_versions_overview',
}
# /screenshots und Docs (AppScreenshot, 1200×771, Dateinamen bleiben gleich)
LEGACY = {
    'home': '001_home_dashboard', 'models': '003_models_overview', 'datasets': '013_datasets_overview_yolo',
    'dataset-builder-image-boxes': '024_studio_image_boxes_project', 'dataset-builder-web': '029_studio_fetch_from_web',
    'dataset-builder-new-project': '022_studio_new_project_boxes', 'dataset-builder-video': '034_studio_video_project',
    'dataset-builder-export-report': '026_studio_export_dialog', 'training': '037_training_llm_setup',
    'training-history': '044_training_history_all', 'analysis-charts': '051_analysis_loss_curve',
    'ai-analysis': '057_analysis_ai_training_analysis', 'ai-coach': '113_coach_expanded',
    'ai-providers': '097_settings_ai_assistant_provider', 'versions': '010_versions_model_dialog',
    'laboratory': '072_laboratory_samples_loaded', 'synapse-builder': '081_synapse_builder_graph',
    'training-lora': '039_training_llm_lora_parameters',
}


def window(path):
    im = Image.open(path).convert('RGBA')
    box = im.getchannel('A').point(lambda a: 255 if a >= 250 else 0).getbbox()
    return im.crop(box)


def fit(im, w, h):
    """Auf exakt w×h bringen, Seitenverhältnis halten, Rest transparent."""
    scale = min(w / im.width, h / im.height)
    r = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    canvas.paste(r, ((w - r.width) // 2, (h - r.height) // 2), r)
    return canvas


def export(im, out, w, h, q1=84, q2=80):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    fit(im, w, h).save(out + '.webp', 'WEBP', quality=q1, method=5)
    fit(im, w * 2, h * 2).save(out + '@2x.webp', 'WEBP', quality=q2, method=5)


cache = {}
for loc in ('de', 'en'):
    for slug, name in APP.items():
        key = (loc, name)
        cache.setdefault(key, window(f'{SRC}{loc}/{name}.png'))
        export(cache[key], f'{WEB}app/{loc}/{slug}', 1200, 772)
    for slug, name in LEGACY.items():
        key = (loc, name)
        cache.setdefault(key, window(f'{SRC}{loc}/{name}.png'))
        export(cache[key], f'{WEB}screenshots/{loc}/frametrain-{slug}', 1200, 771)
    sizes = {n: im.size for (l, n), im in cache.items() if l == loc}
    print(loc, 'Fenstergrößen:', sorted(set(sizes.values())))
print('fertig')
