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
- [Connect Claude and ChatGPT (MCP)](${base}/en/docs/mcp): remote MCP connector ${base}/api/mcp – setup, tools, approvals and privacy
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
- [Parking space detection with AI](${base}/en/guides/parking-space-detection): train a no-code model that detects free and occupied parking spaces from a camera, locally on a Mac
- [AI for spelling correction](${base}/en/guides/spelling-correction-ai): fine-tune a small language model with LoRA on sentence pairs, locally

## Product
- [Homepage](${base}/en): what FrameTrain is and who it is for
- [Apple Silicon](${base}/en/apple-silicon): local AI training on Mac (M1/M2/M3/M4) via Metal MPS, no CUDA
- [Best AI training software for Mac 2026](${base}/en/best-ai-training-software-mac): FrameTrain, Create ML, Roboflow, Unsloth Studio, MLX LoRA Studio, LLaMA-Factory, Kiln, Axolotl, Orange, KNIME compared by use case
- [Compare](${base}/en/compare): Unsloth vs. MLX LoRA Studio vs. FrameTrain
- [FrameTrain vs. Apple Create ML](${base}/en/compare/create-ml): Core ML for Apple apps vs. full local workflow incl. labeling and LLMs
- [FrameTrain vs. Roboflow](${base}/en/compare/roboflow): cloud computer vision platform vs. local labeling and YOLO training
- [Lobe alternatives](${base}/en/compare/lobe): replacements for the discontinued Microsoft Lobe
- [FrameTrain vs. Kiln](${base}/en/compare/kiln): cloud-provider fine-tuning vs. local training
- [FrameTrain vs. LLaMA-Factory](${base}/en/compare/llama-factory): WebUI for many LLMs vs. guided desktop app
- [FrameTrain vs. Unsloth Studio](${base}/en/compare/unsloth): LLM-focused studio vs. multi-modality workflow
- [FrameTrain vs. MLX LoRA Studio](${base}/en/compare/mlx-lora-studio): MLX-based Mac app vs. full cross-platform workflow
- [Download](${base}/en/download): get FrameTrain for Windows, macOS and Linux
- [Screenshots](${base}/en/screenshots): real screenshots of the desktop app
- [FAQ](${base}/en/faq): common questions (Apple Silicon support, LLM fine-tuning, requirements)
- [Changelog](${base}/en/changelog): release history and new features
- [About](${base}/en/about): the project, its stack and open-source components

## Facts
- Category: local AI / machine-learning training desktop application (no-code AI training software for Mac, Windows and Linux)
- Typical use cases: no-code image classification and object detection (e.g. parking occupancy detection), local LLM fine-tuning (e.g. spelling correction), managing many datasets, models and training runs in one dashboard
- Requirements: Python 3.10–3.13; on Mac only Apple Silicon (M1 or newer), no Intel Macs
- Platforms: Windows, macOS, Linux
- Hardware: NVIDIA CUDA GPUs and Apple Silicon (M1/M2/M3/M4, Metal MPS)
- Core tech: PyTorch, Hugging Face, PEFT/LoRA, QLoRA, BitsAndBytes, Tauri/Rust
- Pricing: Early Access from €4.99/month (€39.99/year)
- Privacy: training runs fully local, GDPR-compliant, no cloud required
- Source: https://github.com/FrameSphere/FrameTrain-App
- Downloads: https://github.com/FrameSphere/FrameTrain-Releases/releases/latest
- Community: https://www.reddit.com/r/FrameTrain/
- Video tutorials: https://www.youtube.com/@FrameTrain
- Social: https://www.tiktok.com/@frametrainofficial, https://www.instagram.com/frametrainofficial/
`

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
