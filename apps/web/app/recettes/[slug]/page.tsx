type Props = { params: Promise<{ slug: string }> };

export default async function RecetteDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main>
      <h1>Recette : {slug}</h1>
      {/* TODO: layout 2 colonnes — photo/étapes | infos sticky */}
    </main>
  );
}
