import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  const { cat, slug } = req.query;

  // Si faltan parámetros, redirigimos silenciosamente a la página principal
  if (!cat || !slug) {
    return res.redirect(302, '/');
  }

  // Identificar la tabla en Supabase según la categoría
  let table = '';
  switch (cat.toLowerCase()) {
    case 'suplementos':
      table = 'suplementos';
      break;
    case 'ropa':
    case 'playeras':
    case 'tops':
    case 'shorts':
      table = 'ropa';
      break;
    case 'maquinas':
      table = 'maquinas';
      break;
    default:
      return res.redirect(302, '/');
  }

  try {
    // Buscar el producto en la base de datos por su slug
    const { data: product, error } = await supabase
      .from(table)
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !product) {
      console.error('Error fetching product for share:', error);
      return res.redirect(302, '/');
    }

    // Preparar la imagen y el precio
    const imageUrl = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : 'https://iron-form-coral.vercel.app/og-image.jpeg';
    const priceText = `$${parseFloat(product.price).toFixed(2)} MXN`;
    
    // Fallback de descripción si está vacía
    const desc = product.description ? product.description.substring(0, 150) + '...' : `Equipamiento fitness de nivel premium. Adquiere ${product.name} por ${priceText}.`;

    // Generar el HTML con las meta tags de Open Graph
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${product.name} | IRON/FORM</title>
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="product" />
  <meta property="og:url" content="https://iron-form-coral.vercel.app/p/${cat}/${slug}" />
  <meta property="og:title" content="${product.name} - ${priceText}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${imageUrl}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://iron-form-coral.vercel.app/p/${cat}/${slug}" />
  <meta name="twitter:title" content="${product.name} - ${priceText}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <script>
    // Redirige a la aplicación cliente enviando los parámetros para abrir el producto
    window.location.replace("/?pCat=${encodeURIComponent(cat)}&pSlug=${encodeURIComponent(slug)}");
  </script>
</head>
<body style="background: #111; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <p>Abriendo producto...</p>
</body>
</html>
    `;

    // Devolver el HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=86400');
    return res.status(200).send(html);

  } catch (err) {
    console.error('Server error in api/share:', err);
    return res.redirect(302, '/');
  }
}
