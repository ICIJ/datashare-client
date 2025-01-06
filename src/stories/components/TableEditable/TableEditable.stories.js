import TableEditable from '@/components/TableEditable/TableEditable.vue';

export default {
    title: 'Components/TableEditable/TableEditable',
    component: TableEditable,
    tags: ['autodocs'],
    args: {
    }
};


export const Default = {};

export const WithValues = {
    args: { items: [{name:'tutu'},{name:'toto'},{name:'titi'}] }
}
  