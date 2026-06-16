import { Text } from '@mantine/core'

function NotRegisteredScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '150px',
        justifyContent: 'center',
        alignItems: 'center',
        paddingInline: '200px',
      }}
    >
      <Text c="white" fw={700} fz={'80px'}>
        Киоск не зарегистрирован.
      </Text>
      <Text c="dimmed" fw={600} style={{ textAlign: 'center' }}>
        Проверьте подключение к интернету, зарегистрируйте киоск в системе и перезапустите приложение.
      </Text>
    </div>
  )
}

export default NotRegisteredScreen
