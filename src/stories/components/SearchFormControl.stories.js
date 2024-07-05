import SearchFormControl from "@/components/SearchFormControl";

export default {
  title: "Components/SearchBar/SearchFormControl",
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: {
        type: "string",
      },
    },
    noIcon: {
      control: {
        type: "boolean",
      },
    },
    autofocus: {
      control: {
        type: "boolean",
      },
    },
    rounded: {
      control: {
        type: "boolean",
      },
    },
    loading: {
      control: {
        type: "boolean",
      },
    },
    dark: {
      control: {
        type: "boolean",
      },
    },
    small: {
      control: {
        type: "boolean",
      },
    },
  },
  render: (args) => ({
    components: {
      SearchFormControl,
    },
    setup: () => ({ args }),
    template: `
      <search-form-control v-bind="args">
      </search-form-control>
    `,
  }),
};

export const Default = {
  args: {
    placeholder: "Type queries, use operators or type regex...",
    modelValue: "",
    small: false,
  },
};
export const NoIcon = {
  args: {
    placeholder: "Type queries, use operators or type regex...",
    modelValue: "test",
    noIcon: true,
    /*    placeholder: 'placeholder',
    submitLabel: 'submitLabel',
    fillSubmit: true,
    showSubmitLabel: true,
    autofocus: true,
    rounded: true,
    loading: true,
    dark: true,
    small: true,
    autocomplete: 'off' */
  },
};

export const Small = {
  args: {
    placeholder: "Type queries, use operators or type regex...",
    modelValue: "",
    small: true,
  },
};

export const Dark = {
  args: {
    placeholder: "Type queries, use operators or type regex...",
    modelValue: "",
    dark: true,
  },
};

export const Rounded = {
  args: {
    placeholder: "Type queries, use operators or type regex...",
    modelValue: "",
    small: false,
    rounded: true,
  },
};
