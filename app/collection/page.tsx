import { redirect } from 'next/navigation';

// Friendly alias: vivatheca.com/collection opens the model library.
export default function CollectionPage() {
  redirect('/models');
}
