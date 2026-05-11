type Props = { params: Promise<{ slug: string }> };

export default async function CategorieDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main>
      <h1>Catégorie : {slug}</h1>
      {/* TODO: Bento Grid filtré par catégorie */}
    </main>
  );
}
