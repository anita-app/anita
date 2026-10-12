import { TemplatesCatalog } from 'app/libs/templates/templates-catalog.class'
import type { IProjectTemplate } from 'app/libs/templates/templates-catalog.class'

// crypto-es is an ES module, which jest does not transform.
jest.mock('app/libs/id-creator/id-creator.class', () => {
  let count = 0
  return { IdCreator: { make: (name: string) => `${name}-${++count}`, random: () => `random-${++count}` } }
})

const template: IProjectTemplate = {
  id: 'reading-list',
  title: 'Reading list',
  description: '',
  category: 'learning',
  sections: [
    { key: 'authors', title: 'Authors', fields: [{ label: 'Name', fieldName: 'name', componentCode: 1, type: 'text' }] },
    {
      key: 'books',
      title: 'Books',
      childOf: ['authors'],
      fields: [
        { label: 'Title', fieldName: 'title', componentCode: 1, type: 'text' },
        { label: 'Pages', fieldName: 'pages', componentCode: 1, type: 'number' },
        { label: 'Status', fieldName: 'status', componentCode: 4, options: [{ value: 'read', label: 'Read' }] },
        { label: 'Owned', fieldName: 'owned', componentCode: 3 },
        { label: 'Finished on', fieldName: 'finishedOn', componentCode: 8, type: 'date' },
        { label: 'Month', fieldName: 'month', componentCode: 8, type: 'month' },
        { label: 'Club meeting', fieldName: 'clubMeeting', componentCode: 9, type: 'datetime-local' },
        { label: 'Review', fieldName: 'review', componentCode: 2 },
      ],
    },
  ],
  samples: {
    authors: [{ ref: 'crichton', values: { name: 'Michael Crichton' } }],
    books: [
      {
        values: { title: 'Jurassic Park', pages: 400, status: 'read', owned: true, finishedOn: '2026-01-31', month: '@today', clubMeeting: '2026-02-03', review: 'Great.\nScary.' },
        parents: ['authors:crichton', 'authors:missing'],
      },
      { values: { title: 'Sphere', status: 'notAnOption' } },
    ],
  },
}

const instantiate = (withSamples: boolean) => TemplatesCatalog.instantiate(template, { title: 'Books', description: '' }, { withSamples })

describe('TemplatesCatalog.instantiate', () => {
  it('adds no records unless asked', () => {
    expect(Object.keys(instantiate(false))).toEqual(['_settings', '_sections'])
  })

  it('creates the example records, linked to their parents', () => {
    const project = instantiate(true)
    const [authors, books] = project._sections
    const author = project[authors.id][0]
    const [jurassic, sphere] = project[books.id]

    expect(author.name).toBe('Michael Crichton')
    expect(jurassic.parentsInfo).toEqual([`${authors.id}|${author.id}`])
    expect(jurassic.id).not.toBe(sphere.id)
    expect(sphere.parentsInfo).toBeUndefined()
  })

  it('converts the values to what the fields save', () => {
    const project = instantiate(true)
    const [jurassic, sphere] = project[project._sections[1].id]
    const today = new Date()

    expect(jurassic.pages).toBe('400')
    expect(jurassic.status).toBe('read')
    expect(jurassic.owned).toBe(true)
    expect(jurassic.finishedOn).toBe('2026-01-31')
    expect(jurassic.month).toBe(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
    expect(jurassic.clubMeeting).toBe('2026-02-03T10:00')
    expect(JSON.parse(jurassic.review)).toEqual([{ type: 'paragraph', children: [{ text: 'Great.' }] }, { type: 'paragraph', children: [{ text: 'Scary.' }] }])
    expect(sphere.status).toBeUndefined()
  })
})
