import { PageContainer } from '@renderer/components/ui'

import exampleVideo from '../../assets/images/родители 30_измененный.mov'

function IdleScreen() {
  return (
    <PageContainer>
      <p>Это страница ожидания... В разработке</p>
      <video controls autoPlay>
        <source src={exampleVideo} />
      </video>
    </PageContainer>
  )
}

export default IdleScreen
