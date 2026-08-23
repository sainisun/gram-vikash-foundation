export default async function ChannelPage({ params }: { params: Promise<{ channel_id: string }> }) {
  const { channel_id } = await params;
  return <main className="main"><p className="eyebrow">Member · channel {channel_id}</p><h1>Group chat is not active.</h1><section className="gate">Chat remains feature-gated until moderation, safeguarding, retention, and operational ownership are approved.</section></main>;
}
