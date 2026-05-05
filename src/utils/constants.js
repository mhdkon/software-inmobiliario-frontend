// Datos estáticos de España
export const provincesSpain = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'
];

export const citiesByProvinceSpain = {
  'Madrid': ['Madrid', 'Alcalá de Henares', 'Móstoles', 'Getafe'],
  'Barcelona': ['Barcelona', 'Hospitalet de Llobregat', 'Badalona', 'Sabadell'],
  'Valencia': ['Valencia', 'Alicante', 'Elche', 'Castellón de la Plana'],
  'Sevilla': ['Sevilla', 'Dos Hermanas', 'Alcalá de Guadaíra'],
  'Zaragoza': ['Zaragoza', 'Utebo', 'Cuarte de Huerva'],
  'Málaga': ['Málaga', 'Marbella', 'Fuengirola', 'Torremolinos'],
  'Murcia': ['Murcia', 'Cartagena', 'Lorca'],
  'Palma': ['Palma de Mallorca', 'Manacor', 'Inca'],
  'Las Palmas': ['Las Palmas de Gran Canaria', 'Telde', 'Santa Lucía'],
  'Bilbao': ['Bilbao', 'Barakaldo', 'Getxo', 'Portugalete']
};

export const propertyTypes = [
  'casa', 'piso', 'ático', 'estudio', 'loft', 'local', 'garaje'
];

export const formatPrice = (price) => {
  if (typeof price !== 'number') price = parseFloat(price);
  return `€${price.toLocaleString('es-ES')}`;
};