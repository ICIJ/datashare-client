import TextTruncate from '@/components/Text/TextTruncate'

export default {
  title: 'Components/Text/TextTruncate',
  component: TextTruncate,
  tags: ['autodocs'],
  args: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque malesuada ex egestas sem fringilla euismod. Curabitur cursus mattis lectus, a dignissim libero mattis dapibus. Nulla at lectus imperdiet, sollicitudin nunc ut, consectetur sapien. Morbi fermentum dolor ac ultrices commodo. Sed dictum posuere lobortis. Suspendisse hendrerit elit at convallis suscipit. Nullam non massa eu eros tempor varius id id dolor. Vestibulum eu sagittis arcu, nec sagittis turpis. Donec maximus aliquet tortor, a blandit ligula laoreet eu. In quis est sed urna lacinia sagittis ut ac lectus. Morbi ut ipsum et libero dignissim pretium eu ut diam. Vestibulum ante ips'
  }
}
export const Default = {}
export const Short = {
  args: { truncateLength: 8 }
}
export const Long = {
  args: { truncateLength: 2000 }
}
