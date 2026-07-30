import JoinRoomClient from '@/components/JoinRoomClient'

interface JoinRoomPageProps {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function JoinRoomPage({ searchParams }: JoinRoomPageProps) {
  const { token } = await searchParams
  const inviteToken = typeof token === 'string' ? token : ''

  return <JoinRoomClient token={inviteToken} />
}
