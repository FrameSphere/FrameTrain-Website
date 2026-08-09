import type { Metadata } from 'next'
import { siteUrl, pageAlternates, pageOpenGraph } from '@/lib/seo'

/**
 * Zentrale SEO-Definition für die 8 Kapitel des KI-Training-Coach.
 *
 * Vorher lagen Title/Description hartcodiert (nur Deutsch) in jeder einzelnen
 * chapter/layout.tsx – die /en-Kapitel bekamen dadurch deutsche Meta-Tags.
 * Hier sind alle Kapitel zweisprachig gepflegt und liefern zusätzlich
 * strukturierte Daten (BreadcrumbList + TechArticle), die es vorher nicht gab.
 */

type LocaleCopy = {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  /** Kurzer Kapitelname für Breadcrumb (JSON-LD + sichtbar). */
  name: string
}

type ChapterCopy = {
  /** Pfad ohne Locale-Präfix. */
  path: string
  de: LocaleCopy
  en: LocaleCopy
}

const COACH_PATH = '/docs/ai-training-guide'

// Sichtbarer Name des Eltern-Guides (Breadcrumb-Ebene 3).
const COACH_NAME = { de: 'KI-Training Coach', en: 'AI Training Coach' } as const

export type CoachChapterId =
  | 'ml-grundlagen'
  | 'training-verstehen'
  | 'trainingsverlauf'
  | 'diagnose'
  | 'hyperparameter'
  | 'fine-tuning'
  | 'dataset-mastery'
  | 'fortgeschrittene'

export const COACH_CHAPTERS: Record<CoachChapterId, ChapterCopy> = {
  'ml-grundlagen': {
    path: `${COACH_PATH}/ml-grundlagen`,
    de: {
      title: 'ML Grundlagen – Machine Learning, Neuronale Netze, Transformer erklärt | FrameTrain',
      description:
        'Was ist Machine Learning? Neuronale Netzwerke, Transformer-Architektur, LLMs, Backpropagation und Gradient Descent – vollständig und verständlich erklärt für KI-Training.',
      ogTitle: 'ML Grundlagen – Machine Learning, Neuronale Netze, Transformer | FrameTrain',
      ogDescription:
        'Was ist Machine Learning? Neuronale Netzwerke, Transformer, Backpropagation und Gradient Descent verständlich erklärt.',
      name: 'ML Grundlagen',
    },
    en: {
      title: 'ML Basics – Machine Learning, Neural Networks & Transformers Explained | FrameTrain',
      description:
        'What is machine learning? Neural networks, the transformer architecture, LLMs, backpropagation and gradient descent – explained clearly and completely for AI training.',
      ogTitle: 'ML Basics – Machine Learning, Neural Networks & Transformers | FrameTrain',
      ogDescription:
        'What is machine learning? Neural networks, transformers, backpropagation and gradient descent explained simply.',
      name: 'ML Basics',
    },
  },
  'training-verstehen': {
    path: `${COACH_PATH}/training-verstehen`,
    de: {
      title: 'Training verstehen – Loss-Funktionen, Metriken, Train/Val/Test Split | FrameTrain',
      description:
        'Der Trainings-Loop Schritt für Schritt, Loss-Funktionen (Cross-Entropy, MSE), Metriken wie Accuracy, F1, Perplexity, und warum du deinen Datensatz aufteilen musst.',
      ogTitle: 'Training verstehen – Loss-Funktionen, Metriken, Train/Val/Test Split | FrameTrain',
      ogDescription:
        'Trainings-Loop, Loss-Funktionen, Accuracy/F1/Perplexity und Dataset-Split verständlich erklärt.',
      name: 'Training verstehen',
    },
    en: {
      title: 'Understanding Training – Loss Functions, Metrics & Train/Val/Test Split | FrameTrain',
      description:
        'The training loop step by step, loss functions (cross-entropy, MSE), metrics like accuracy, F1 and perplexity, and why you must split your dataset.',
      ogTitle: 'Understanding Training – Loss Functions, Metrics & Dataset Split | FrameTrain',
      ogDescription:
        'Training loop, loss functions, accuracy/F1/perplexity and dataset splitting explained clearly.',
      name: 'Understanding Training',
    },
  },
  trainingsverlauf: {
    path: `${COACH_PATH}/trainingsverlauf`,
    de: {
      title: 'Trainingsverlauf lesen – Loss-Kurven, Overfitting & Underfitting erkennen | FrameTrain',
      description:
        'Loss-Kurven interpretieren, Overfitting und Underfitting erkennen, instabiles Training diagnostizieren – mit interaktiven SVG-Diagrammen und klaren Erklärungen.',
      ogTitle: 'Trainingsverlauf lesen – Loss-Kurven, Overfitting & Underfitting | FrameTrain',
      ogDescription:
        'Loss-Kurven interpretieren, Overfitting und Underfitting diagnostizieren mit interaktiven Diagrammen.',
      name: 'Trainingsverlauf lesen',
    },
    en: {
      title: 'Reading Training Curves – Loss Curves, Overfitting & Underfitting | FrameTrain',
      description:
        'Interpret loss curves, spot overfitting and underfitting, and diagnose unstable training – with interactive SVG diagrams and clear explanations.',
      ogTitle: 'Reading Training Curves – Loss Curves, Overfitting & Underfitting | FrameTrain',
      ogDescription:
        'Interpret loss curves and diagnose overfitting and underfitting with interactive diagrams.',
      name: 'Reading Training Curves',
    },
  },
  diagnose: {
    path: `${COACH_PATH}/diagnose`,
    de: {
      title: 'Diagnose & Fixes – Overfitting bekämpfen, LR-Probleme, Loss Spikes | FrameTrain',
      description:
        'Konkrete Maßnahmen gegen Overfitting, Underfitting beheben, Learning Rate Probleme diagnostizieren und Loss Spikes durch Gradient Clipping eliminieren.',
      ogTitle: 'Diagnose & Fixes – Overfitting, LR-Probleme, Loss Spikes beheben | FrameTrain',
      ogDescription:
        'Overfitting bekämpfen, Underfitting beheben, Loss Spikes stoppen – konkrete Lösungen für ML-Trainingsprobleme.',
      name: 'Diagnose & Fixes',
    },
    en: {
      title: 'Diagnosis & Fixes – Beat Overfitting, LR Problems & Loss Spikes | FrameTrain',
      description:
        'Concrete fixes for overfitting, underfitting, learning-rate problems and loss spikes – eliminate instability with gradient clipping and the right settings.',
      ogTitle: 'Diagnosis & Fixes – Fix Overfitting, LR Problems & Loss Spikes | FrameTrain',
      ogDescription:
        'Beat overfitting, fix underfitting and stop loss spikes – concrete solutions for ML training problems.',
      name: 'Diagnosis & Fixes',
    },
  },
  hyperparameter: {
    path: `${COACH_PATH}/hyperparameter`,
    de: {
      title: 'Hyperparameter-Coaching – Learning Rate, Batch Size, AdamW, LR Scheduler | FrameTrain',
      description:
        'Learning Rate (vertieft), LR Scheduler Strategien (Cosine Decay, Warmup), Batch Size und Gradient Accumulation, Optimizer-Vergleich AdamW vs SGD, Regularisierung.',
      ogTitle: 'Hyperparameter-Coaching – Learning Rate, Batch Size, Optimizer | FrameTrain',
      ogDescription:
        'Learning Rate, LR Scheduler, Batch Size, Gradient Accumulation, AdamW und Regularisierung – vollständig erklärt.',
      name: 'Hyperparameter',
    },
    en: {
      title: 'Hyperparameter Coaching – Learning Rate, Batch Size, AdamW & LR Scheduler | FrameTrain',
      description:
        'Learning rate in depth, LR scheduler strategies (cosine decay, warmup), batch size and gradient accumulation, AdamW vs SGD, and regularization.',
      ogTitle: 'Hyperparameter Coaching – Learning Rate, Batch Size, Optimizer | FrameTrain',
      ogDescription:
        'Learning rate, LR scheduler, batch size, gradient accumulation, AdamW and regularization – fully explained.',
      name: 'Hyperparameters',
    },
  },
  'fine-tuning': {
    path: `${COACH_PATH}/fine-tuning`,
    de: {
      title: 'Fine-Tuning Methoden – LoRA, QLoRA, Full Fine-Tuning, PEFT erklärt | FrameTrain',
      description:
        'Full Fine-Tuning, LoRA (Low-Rank Adaptation) mit Architektur-Diagramm, QLoRA 4-bit Training, PEFT-Methoden im Vergleich und Entscheidungsbaum: Wann welche Methode?',
      ogTitle: 'Fine-Tuning Methoden – LoRA, QLoRA, Full Fine-Tuning, PEFT | FrameTrain',
      ogDescription:
        'LoRA, QLoRA, Full Fine-Tuning und PEFT-Methoden erklärt – mit Diagramm und Entscheidungsbaum.',
      name: 'Fine-Tuning Methoden',
    },
    en: {
      title: 'Fine-Tuning Methods – LoRA, QLoRA, Full Fine-Tuning & PEFT Explained | FrameTrain',
      description:
        'Full fine-tuning, LoRA (Low-Rank Adaptation) with an architecture diagram, QLoRA 4-bit training, PEFT methods compared, and a decision tree: which method when?',
      ogTitle: 'Fine-Tuning Methods – LoRA, QLoRA, Full Fine-Tuning & PEFT | FrameTrain',
      ogDescription:
        'LoRA, QLoRA, full fine-tuning and PEFT methods explained – with diagram and decision tree.',
      name: 'Fine-Tuning Methods',
    },
  },
  'dataset-mastery': {
    path: `${COACH_PATH}/dataset-mastery`,
    de: {
      title: 'Dataset-Mastery – Datenqualität, Preprocessing, Augmentation, Balancing | FrameTrain',
      description:
        'Wie viele Trainingsdaten brauche ich? Datenqualitäts-Checkliste, Text-Preprocessing-Pipeline, Data Augmentation Techniken und Klassen-Balancing für ML.',
      ogTitle: 'Dataset-Mastery – Datenqualität, Preprocessing, Augmentation | FrameTrain',
      ogDescription:
        'Datenqualität, Preprocessing, Augmentation und Klassen-Balancing für erfolgreiches ML-Training.',
      name: 'Dataset-Mastery',
    },
    en: {
      title: 'Dataset Mastery – Data Quality, Preprocessing, Augmentation & Balancing | FrameTrain',
      description:
        'How much training data do you need? A data-quality checklist, text preprocessing pipeline, data augmentation techniques and class balancing for ML.',
      ogTitle: 'Dataset Mastery – Data Quality, Preprocessing & Augmentation | FrameTrain',
      ogDescription:
        'Data quality, preprocessing, augmentation and class balancing for successful ML training.',
      name: 'Dataset Mastery',
    },
  },
  fortgeschrittene: {
    path: `${COACH_PATH}/fortgeschrittene`,
    de: {
      title:
        'Fortgeschrittene ML-Techniken – Mixed Precision, Gradient Checkpointing, Ensembles | FrameTrain',
      description:
        'Mixed Precision Training mit bf16/fp16, Gradient Checkpointing für weniger VRAM, Early Stopping optimal nutzen und Model Ensembles für bessere Performance.',
      ogTitle: 'Fortgeschrittene ML-Techniken – Mixed Precision, Gradient Checkpointing | FrameTrain',
      ogDescription:
        'Mixed Precision (bf16/fp16), Gradient Checkpointing, Early Stopping und Model Ensembles für professionelles ML-Training.',
      name: 'Fortgeschrittene Techniken',
    },
    en: {
      title:
        'Advanced ML Techniques – Mixed Precision, Gradient Checkpointing & Ensembles | FrameTrain',
      description:
        'Mixed precision training with bf16/fp16, gradient checkpointing for lower VRAM, using early stopping well, and model ensembles for better performance.',
      ogTitle: 'Advanced ML Techniques – Mixed Precision & Gradient Checkpointing | FrameTrain',
      ogDescription:
        'Mixed precision (bf16/fp16), gradient checkpointing, early stopping and model ensembles for professional ML training.',
      name: 'Advanced Techniques',
    },
  },
}

function copyFor(locale: string, id: CoachChapterId): LocaleCopy {
  const chapter = COACH_CHAPTERS[id]
  return locale === 'en' ? chapter.en : chapter.de
}

/** Zweisprachige Metadata für ein Coach-Kapitel (Title, Description, Canonical, hreflang, OG). */
export function coachChapterMetadata(locale: string, id: CoachChapterId): Metadata {
  const chapter = COACH_CHAPTERS[id]
  const copy = copyFor(locale, id)
  return {
    title: copy.title,
    description: copy.description,
    alternates: pageAlternates(locale, chapter.path),
    openGraph: pageOpenGraph({
      locale,
      path: chapter.path,
      title: copy.ogTitle,
      description: copy.ogDescription,
      type: 'article',
    }),
  }
}

/** JSON-LD (@graph: BreadcrumbList + TechArticle) für ein Coach-Kapitel. */
export function coachChapterJsonLd(locale: string, id: CoachChapterId) {
  const chapter = COACH_CHAPTERS[id]
  const copy = copyFor(locale, id)
  const coachName = locale === 'en' ? COACH_NAME.en : COACH_NAME.de
  const home = `${siteUrl}/${locale}`
  const docs = `${siteUrl}/${locale}/docs`
  const coach = `${siteUrl}/${locale}${COACH_PATH}`
  const pageUrl = `${siteUrl}/${locale}${chapter.path}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: home },
          { '@type': 'ListItem', position: 2, name: 'Docs', item: docs },
          { '@type': 'ListItem', position: 3, name: coachName, item: coach },
          { '@type': 'ListItem', position: 4, name: copy.name, item: pageUrl },
        ],
      },
      {
        '@type': 'TechArticle',
        headline: copy.ogTitle,
        description: copy.description,
        inLanguage: locale === 'en' ? 'en-US' : 'de-DE',
        image: `${siteUrl}/og-image.png`,
        author: { '@type': 'Organization', name: 'FrameTrain', url: siteUrl },
        publisher: {
          '@type': 'Organization',
          name: 'FrameTrain',
          logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.svg` },
        },
        isPartOf: { '@type': 'Course', name: coachName, url: coach },
        mainEntityOfPage: pageUrl,
      },
    ],
  }
}

/** Server-Komponente: rendert das JSON-LD-Script für ein Coach-Kapitel. */
export function CoachChapterJsonLd({ locale, id }: { locale: string; id: CoachChapterId }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(coachChapterJsonLd(locale, id)) }}
    />
  )
}
