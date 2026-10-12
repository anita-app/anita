import { useCallback, useEffect, useState } from 'react'
import { Icons } from 'app/libs/icons/icons.class'
import type { CSSProperties, FC, ReactNode } from 'react'
import type { TIconName } from 'app/libs/icons/icons.class'
import './onboarding.css'

const ONBOARDING_DONE_KEY = 'anita.onboarding.done'

export const isOnboardingDone = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_DONE_KEY) === '1'
  } catch {
    return false
  }
}

export const markOnboardingDone = (): void => {
  try {
    localStorage.setItem(ONBOARDING_DONE_KEY, '1')
  } catch {
    // Storage disabled: the introduction is shown again next time.
  }
}

/** Delay index for the staggered entrance animation. */
const delay = (index: number) => ({ '--d': index } as CSSProperties)

const SLIDES = 3

interface IOnboardingProps {
  onTemplates: () => void
  onWordPress: () => void
  onScratch: () => void
  /** Slide to open, e.g. the last one when coming back from the templates. */
  initialStep?: number
}

const PrimaryButton: FC<{ onClick: () => void; children: ReactNode; index: number }> = (props) => (
  <button
    type="button"
    onClick={props.onClick}
    className="onb-rise onb-cta inline-flex items-center gap-2 rounded-full bg-white text-prussian-blue-500 font-semibold text-lg px-8 py-4 shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/40"
    style={delay(props.index)}
  >
    {props.children}
  </button>
)

const WelcomeSlide: FC<{ onNext: () => void }> = (props) => (
  <div className="flex flex-col items-center text-center">
    <img
      src={`${process.env.PUBLIC_URL}/assets/logo/logo_square.svg`}
      alt=""
      className="onb-logo h-24 w-24 rounded-3xl bg-white p-2"
    />
    <p
      className="onb-rise text-white/70 uppercase tracking-[0.3em] text-sm mt-10"
      style={delay(1)}
    >
      Hello, nice to meet you
    </p>
    <div
      className="onb-rise mt-3"
      style={delay(2)}
    >
      <h1 className="onb-gradient-text text-5xl md:text-7xl font-bold pb-2">Welcome to Anita</h1>
    </div>
    <p
      className="onb-rise text-xl text-white/80 mt-6 max-w-xl"
      style={delay(3)}
    >
      Let&apos;s set you up in less than a minute.
    </p>
    <div className="mt-12">
      <PrimaryButton
        onClick={props.onNext}
        index={4}
      >
        Let&apos;s start {Icons.render('arrowForwardOutline')}
      </PrimaryButton>
    </div>
  </div>
)

const CHIPS: Array<{ label: string; icon: TIconName; className: string }> = [
  { label: 'Tasks', icon: 'checkboxOutline', className: 'left-0 top-4' },
  { label: 'Clients', icon: 'peopleOutline', className: 'right-2 top-0' },
  { label: 'Books', icon: 'bookOutline', className: '-left-10 top-44' },
  { label: 'Recipes', icon: 'restaurantOutline', className: '-right-10 top-40' },
  { label: 'Trips', icon: 'airplaneOutline', className: 'left-6 bottom-0' },
  { label: 'Invoices', icon: 'receiptOutline', className: 'right-4 -bottom-2' },
]

const ROWS = [
  { title: 'Design the new logo', status: 'Done', color: 'bg-green-400' },
  { title: 'Call ACME about the offer', status: 'Doing', color: 'bg-yellow-300' },
  { title: 'Plan the team offsite', status: 'To do', color: 'bg-blue-300' },
]

const AppMockup: FC = () => (
  <div className="relative w-full max-w-md h-80 mx-auto">
    {CHIPS.map((chip, index) => (
      <div
        key={chip.label}
        className={`absolute z-10 ${chip.className}`}
      >
        <div
          className="onb-rise"
          style={delay(index + 3)}
        >
          <span
            className="onb-float inline-flex items-center gap-1 rounded-full bg-prussian-blue-400/90 backdrop-blur px-3 py-1.5 text-sm border border-white/25 shadow-lg"
            style={delay(index)}
          >
            {Icons.render(chip.icon)} {chip.label}
          </span>
        </div>
      </div>
    ))}
    <div
      className="onb-rise absolute inset-x-12 top-14 rounded-2xl bg-white text-gray-800 shadow-2xl p-4"
      style={delay(1)}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
        <span className="ml-2 text-sm font-semibold">Projects &amp; tasks</span>
      </div>
      {ROWS.map((row, index) => (
        <div
          key={row.title}
          className="onb-row flex items-center justify-between gap-2 py-2 text-sm border-b border-gray-50 last:border-0"
          style={delay(index)}
        >
          <span className="truncate">{row.title}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs text-gray-800 ${row.color}`}>{row.status}</span>
        </div>
      ))}
    </div>
  </div>
)

const Feature: FC<{ icon: TIconName; title: string; children: ReactNode; index: number }> = (props) => (
  <div
    className="onb-rise flex gap-4"
    style={delay(props.index)}
  >
    <span className="w-11 h-11 shrink-0 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl text-blue-200">{Icons.render(props.icon)}</span>
    <div>
      <p className="font-semibold text-lg">{props.title}</p>
      <p className="text-white/70">{props.children}</p>
    </div>
  </div>
)

const WhatSlide: FC<{ onNext: () => void }> = (props) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div>
      <p
        className="onb-rise text-blue-200 uppercase tracking-[0.25em] text-sm"
        style={delay(0)}
      >
        What is Anita
      </p>
      <h2
        className="onb-rise text-4xl md:text-5xl font-bold mt-3"
        style={delay(1)}
      >
        Organize anything, your way.
      </h2>
      <div className="space-y-6 mt-10">
        <Feature
          icon="gridOutline"
          title="Any kind of data"
          index={2}
        >
          Tasks, clients, books, recipes, trips: you decide the sections and the fields, and how records link together.
        </Feature>
        <Feature
          icon="flashOutline"
          title="Fast, also offline"
          index={3}
        >
          It runs in your browser and keeps working without a connection.
        </Feature>
        <Feature
          icon="logoWordpress"
          title="Your data, on your site"
          index={4}
        >
          Store projects on your own WordPress site: backed up, on all your devices, shared with your team.
        </Feature>
      </div>
      <div className="mt-10">
        <PrimaryButton
          onClick={props.onNext}
          index={5}
        >
          How do I start? {Icons.render('arrowForwardOutline')}
        </PrimaryButton>
      </div>
    </div>
    <div className="hidden md:block">
      <AppMockup />
    </div>
  </div>
)

const ChooseSlide: FC<Pick<IOnboardingProps, 'onTemplates' | 'onWordPress' | 'onScratch'>> = (props) => (
  <div className="flex flex-col items-center text-center">
    <p
      className="onb-rise text-blue-200 uppercase tracking-[0.25em] text-sm"
      style={delay(0)}
    >
      Let&apos;s begin
    </p>
    <h2
      className="onb-rise text-4xl md:text-5xl font-bold mt-3"
      style={delay(1)}
    >
      How do you want to start?
    </h2>

    <div
      className="onb-rise w-full max-w-2xl mt-12"
      style={delay(2)}
    >
      <div className="onb-glow-border">
        <button
          type="button"
          onClick={props.onTemplates}
          className="onb-glow-inner onb-card-hover group w-full text-left bg-prussian-blue-500 hover:bg-prussian-blue-400 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 focus:outline-none focus:ring-4 focus:ring-white/40"
        >
          <span className="w-16 h-16 shrink-0 rounded-2xl bg-white text-prussian-blue-500 flex items-center justify-center text-4xl">{Icons.render('albumsOutline')}</span>
          <span className="grow">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-semibold">Start from a template</span>
              <span className="rounded-full bg-green-400 text-green-950 text-xs font-semibold px-2 py-0.5">Recommended</span>
            </span>
            <span className="block text-white/75 mt-1">Dozens of ready-made projects: tasks, CRM, budget, recipes and more. Everything set up in a click, and you can change it anytime.</span>
          </span>
          <span className="text-3xl text-white/70 group-hover:translate-x-1 transition-transform hidden sm:block">{Icons.render('arrowForwardOutline')}</span>
        </button>
      </div>
    </div>

    <button
      type="button"
      onClick={props.onWordPress}
      className="onb-rise onb-card-hover w-full max-w-2xl mt-4 text-left rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 p-5 flex items-center gap-4 focus:outline-none focus:ring-4 focus:ring-white/30"
      style={delay(3)}
    >
      <span className="w-11 h-11 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-2xl">{Icons.render('logoWordpress')}</span>
      <span className="grow">
        <span className="block font-semibold">Import my projects from WordPress</span>
        <span className="block text-sm text-white/65">Already using Anita with a WordPress site? Connect it and your projects are downloaded here.</span>
      </span>
      <span className="text-xl text-white/50">{Icons.render('chevronForwardOutline')}</span>
    </button>

    <button
      type="button"
      onClick={props.onScratch}
      className="onb-rise mt-8 text-sm text-white/55 hover:text-white underline underline-offset-4"
      style={delay(4)}
    >
      or start from scratch with an empty project
    </button>
  </div>
)

/**
 * First-run introduction, in three slides: welcome, what Anita does, how to start.
 */
export const Onboarding: FC<IOnboardingProps> = (props) => {
  const [step, setStep] = useState(props.initialStep ?? 0)
  const [isBack, setIsBack] = useState(false)

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= SLIDES) {
      return
    }
    setIsBack(next < step)
    setStep(next)
  }, [step])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && step < SLIDES - 1) {
        goTo(step + 1)
      } else if (event.key === 'ArrowLeft') {
        goTo(step - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, goTo])

  return (
    <div
      className="onb-stage"
      role="region"
      aria-label="Introduction to Anita"
    >
      <div className="onb-stars" />
      <div className="onb-blob onb-blob-1" />
      <div className="onb-blob onb-blob-2" />
      <div className="onb-blob onb-blob-3" />

      <div className="relative min-h-full flex flex-col px-6 py-6 md:px-12">
        <div className="flex items-center justify-between h-8">
          {step > 0
            ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white"
              >
                {Icons.render('arrowBackOutline')} Back
              </button>)
            : <span />}
          {step < SLIDES - 1 && (
            <button
              type="button"
              onClick={() => goTo(SLIDES - 1)}
              className="text-sm text-white/60 hover:text-white"
            >
              Skip intro
            </button>
          )}
        </div>

        <div className="grow flex items-center justify-center py-8">
          <div
            key={step}
            className={`onb-slide w-full max-w-5xl ${isBack ? 'onb-back' : ''}`}
          >
            {step === 0 && <WelcomeSlide onNext={() => goTo(1)} />}
            {step === 1 && <WhatSlide onNext={() => goTo(2)} />}
            {step === 2 && (
              <ChooseSlide
                onTemplates={props.onTemplates}
                onWordPress={props.onWordPress}
                onScratch={props.onScratch}
              />
            )}
          </div>
        </div>

        <div
          className="flex justify-center gap-2 pb-2"
          role="tablist"
          aria-label="Introduction steps"
        >
          {Array.from({ length: SLIDES }, (_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === step}
              aria-label={`Step ${index + 1} of ${SLIDES}`}
              onClick={() => goTo(index)}
              className={`onb-dot ${index === step ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
