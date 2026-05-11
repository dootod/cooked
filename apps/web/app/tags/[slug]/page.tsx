type Props = { params: Promise<{ slug: string }> };

export default async function TagDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main>
      <h1>Tag : {slug}</h1>
      {/* TODO: Bento Grid filtré par tag */}
    </main>
  );
}
