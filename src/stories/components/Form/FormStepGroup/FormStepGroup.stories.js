import FormStep from '@/components/Form/FormStep/FormStep'
import FormStepGroup from '@/components/Form/FormStepGroup/FormStepGroup'

export default {
  title: 'Components/Form/FormStepGroup/FormStepGroup',
  component: FormStepGroup,
  render: () => ({
    components: {
      FormStep,
      FormStepGroup
    },
    template: `
      <form-step-group>
        <template #default="{ toggle, isCollapsed }">
          <form-step
            title="Name, project(s) and description"
            :index="1"
            :collapse="isCollapsed(1, false)"
            @update:collapse="toggle(1, $event)">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </form-step>
          <form-step
            title="Queries"
            :index="2"
            :collapse="isCollapsed(2)"
            @update:collapse="toggle(2, $event)">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </form-step>
          <form-step
            title="Search operators"
            :index="3"
            :collapse="isCollapsed(3)"
            @update:collapse="toggle(3, $event)">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </form-step>
          <form-step
            title="Filters"
            :index="4"
            :collapse="isCollapsed(4)"
            @update:collapse="toggle(4, $event)">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </form-step>
          <form-step
            title="Visibility"
            :index="5"
            :collapse="isCollapsed(5)"
            @update:collapse="toggle(5, $event)">
            Aenean sollicitudin, sem quis malesuada lacinia, leo elit scelerisque ligula, eget imperdiet elit velit eu sem.
          </form-step>
        </template>
      </form-step-group>
    `
  })
}

export const Default = {}
