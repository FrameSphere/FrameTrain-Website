import { siteUrl } from '@/lib/seo'

// /llms.txt – kompakte, maschinenlesbare Entitäts-Definition für AI-Crawler
// und Antwort-Engines (llmstxt.org-Konvention). Ziel ist NICHT Ranking,
// sondern dass ChatGPT/Perplexity/Claude/Google-AI FrameTrain eindeutig als
// Entität einordnen und aus zitierbaren Seiten (Docs/Guides/FAQ) schöpfen.
//
// Liegt bewusst außerhalb von [locale] (wie robots.ts/sitemap.ts) und wird
// vom Middleware-Matcher ignoriert, weil der Pfad einen Punkt enthält.
// Inhalt englisch, weil llms.txt konventionell einsprachig ist; die Links
// zeigen auf die /en-Seiten (x-default leitet Sprachwahl ohnehin um).

export const dynamic = 'force-static'

export function GET() {
  const base = siteUrl

  const body = `# FrameTrain

> FrameTrain is a cross-platform desktop application (Windows, macOS, Linux) for training and fine-tuning AI models locally on your own hardware — no cloud required. It combines LoRA/QLoRA fine-tuning of Hugging Face models, PyTorch-based training with GPU acceleration (NVIDIA CUDA and Apple Silicon / Metal MPS), a visual neural-network builder, dataset management, live training monitoring and automatic model versioning in one GUI.

FrameTrain is aimed at developers, researchers and privacy-conscious teams who want to fine-tune large language models and build custom neural networks without sending data to the cloud. It is GDPR-compliant by design because training runs entirely on the user's machine.

## What FrameTrain does
- Home screen after login: project status with running trainings, results since the last visit, key figures, loss trend, accuracy leaderboard and rule-based "needs attention" hints
- Local LLM fine-tuning with LoRA and QLoRA (no cloud lock-in, data stays on device)
- Import and train Hugging Face models; export trained model versions as a local folder
- Visual neural-network builder ("Synapse Builder") for Transformer, CNN and LSTM architectures
- Dataset management: import, Parquet, train/validation/test splitting
- Dataset Builder (since app 1.3.4): build trainable image, text, audio and video datasets inside the app — seven project types (object boxes with YOLO export, image/text/audio/video-segment classification, text-to-answer pairs, transcripts); import from folders, CSV/JSONL/TXT, YOLO labels, clipboard and video frames; microphone recording (16 kHz WAV); AI-generated examples; polite web collection from URLs, whole websites or sitemaps (robots.txt respected, per-file URL and license); keyboard labeling with model suggestions, least-confident first; near-duplicate and class-balance checks; grouped train/val/test export with EXPORT_REPORT.md, PROVENANCE.csv and DATA_CARD.md
- Live training monitoring with loss curves and AI training analysis / coach
- Automatic model versioning and comparison of training runs
- Runs on NVIDIA CUDA and Apple Silicon (M1/M2/M3/M4) via Metal MPS — no CUDA required on Mac
- Optional AI assistant, off by default: Claude, OpenAI or Groq with the user's own API key (one key per provider, stored in the OS keychain) or fully local via Ollama; adjustable token budget (Minimal to Unlimited)
- Page-aware AI coach with slash-command skills, apply buttons and a RAM estimate checked against the machine's actual memory; code assistant for custom training/test scripts; AI training analysis with follow-up chat

## Documentation
- [Documentation home](${base}/en/docs): overview of all guides and references
- [AI Training Guide](${base}/en/docs/ai-training-guide): end-to-end guide to local model training
- [ML fundamentals](${base}/en/docs/ai-training-guide/ml-grundlagen): core machine-learning concepts
- [Understanding training](${base}/en/docs/ai-training-guide/training-verstehen): how model training works
- [Hyperparameters](${base}/en/docs/ai-training-guide/hyperparameter): tuning learning rate, batch size and more
- [Fine-tuning](${base}/en/docs/ai-training-guide/fine-tuning): fine-tuning pretrained models
- [Dataset mastery](${base}/en/docs/ai-training-guide/dataset-mastery): preparing high-quality datasets

## Guides
- [Guides overview](${base}/en/guides)
- [LoRA fine-tuning](${base}/en/guides/lora-finetuning): step-by-step local LoRA fine-tuning
- [Local vs. cloud training](${base}/en/guides/local-vs-cloud): when to train locally vs. in the cloud
- [GPU guide](${base}/en/guides/gpu-guide): choosing hardware for local training

## Product
- [Homepage](${base}/en): what FrameTrain is and who it is for
- [Apple Silicon](${base}/en/apple-silicon): local AI training on Mac (M1/M2/M3/M4) via Metal MPS, no CUDA
- [Compare](${base}/en/compare): FrameTrain vs. MLX LoRA Studio vs. Unsloth
- [Download](${base}/en/download): get FrameTrain for Windows, macOS and Linux
- [Screenshots](${base}/en/screenshots): real screenshots of the desktop app
- [FAQ](${base}/en/faq): common questions (Apple Silicon support, LLM fine-tuning, requirements)
- [Changelog](${base}/en/changelog): release history and new features
- [About](${base}/en/about): the project, its stack and open-source components

## Facts
- Category: local AI / machine-learning training desktop application
- Platforms: Windows, macOS, Linux
- Hardware: NVIDIA CUDA GPUs and Apple Silicon (M1/M2/M3/M4, Metal MPS)
- Core tech: PyTorch, Hugging Face, PEFT/LoRA, QLoRA, BitsAndBytes, Tauri/Rust
- Pricing: Early Access from €4.99/month (€39.99/year)
- Privacy: training runs fully local, GDPR-compliant, no cloud required
- Source / releases: https://github.com/FrameSphere/FrameTrain-App
`

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
