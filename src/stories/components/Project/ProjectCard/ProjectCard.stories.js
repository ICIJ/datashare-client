import { vueRouter } from 'storybook-vue3-router'

import ProjectCard from '@/components/Project/ProjectCard/ProjectCard'

const routes = [
  {
    path: '/project/:name',
    name: 'project.view.insights'
  },
  {
    path: '/search',
    name: 'search'
  }
]

export default {
  title: 'Components/Project/ProjectCard',
  decorators: [
    vueRouter(routes)
  ],
  tags: ['autodocs'],
  component: ProjectCard,
  args: {
    project: {
      name: 'banana-papers',
      label: 'Banana Papers',
      logoUrl: 'https://media.icij.org/uploads/2018/04/Banana-Getty-PanamaPapers.jpg',
      description: 'A shoking exposé about bananas involved in a world-wide tax evasion scheme.',
      updateDate: '2024-08-07',
      documentsCount: 8.2e6
    }
  }
}

export const Default = {}

export const WithLongDescription = {
  args: {
    project: {
      name: 'citrus-confidential',
      label: 'Citrus Confidential',
      description: `
        A new investigation by ICIJ and 68 media partners exposes the sprawling
        citrus industry that has powered the Orange Julius regime as it dominates
        its neighbors — and undermines the zest of the West.
      `,
      updateDate: '2024-08-07',
      documentsCount: 7.26e3
    }
  }
}

export const MutlipleCards = {
  decorators: [vueRouter(routes)],
  args: {
    projects: [
      {
        name: 'cocorico',
        label: 'Cocorico',
        description: `Big corporations’ wrongdoings in the Philippines in the 1990s from a very secret soruces who worked in one of these companies.`,
        updateDate: '2024-08-07',
        documentsCount: 8.2e6
      },
      {
        name: 'falbala',
        label: 'Falbala',
        description: `An oil empire is lying about its law compliance in the Middle East.`,
        updateDate: '2024-08-07',
        documentsCount: 7.26e3
      },
      {
        name: 'frittatiu',
        label: 'Frittatiu',
        description: `The transportation industry has hidden very dangerous things.`,
        updateDate: '2024-08-07',
        documentsCount: 7.26e3
      },
      {
        name: 'flowera',
        label: 'Flowera',
        description: `A collection of documents which describe the state of fields in all countries regarding 1000+ criterias including biological diversity, soil diversity, butterflies, plants, etc.`,
        updateDate: '2024-08-07',
        documentsCount: 7.26e3
      }
    ]
  },
  render: (args) => ({
    components: {
      ProjectCard
    },
    setup: () => ({ args }),
    template: `
      <div class="container-fluid">
        <div class="row g-4">
          <div class="col-lg-6 col-12" v-for="project in args.projects" :key="project.name">
            <project-card :project="project" class="h-100 w-100" />
          </div>
        </div>
      </div>
    `
  })
}
