export const orders = [
  { id: 'ORD-001', customer: 'James Osei',     product: 'Jordan Jumpman Jack',  colorway: "TR 'Green Spark'",     sizeEu: 42, total: 189.99, status: 'delivered',  date: '2026-03-01' },
  { id: 'ORD-002', customer: 'Ama Mensah',     product: 'Air Max 97',           colorway: "'Silver Bullet'",      sizeEu: 39, total: 174.99, status: 'delivered',  date: '2026-03-03' },
  { id: 'ORD-003', customer: 'Kofi Asante',    product: 'Yeezy Boost 350 V2',   colorway: "'Zebra'",              sizeEu: 44, total: 229.99, status: 'delivered',  date: '2026-03-05' },
  { id: 'ORD-004', customer: 'Efua Darko',     product: '990v6',                colorway: "'Grey Day'",           sizeEu: 40, total: 199.99, status: 'delivered',  date: '2026-03-07' },
  { id: 'ORD-005', customer: 'Nana Amponsah',  product: 'Air Force 1 Low',      colorway: "'MCA Chicago'",        sizeEu: 43, total: 299.99, status: 'delivered',  date: '2026-03-08' },
  { id: 'ORD-006', customer: 'Abena Sarpong',  product: 'Jordan Jumpman Jack',  colorway: "TR 'Green Spark'",     sizeEu: 41, total: 189.99, status: 'delivered',  date: '2026-03-10' },
  { id: 'ORD-007', customer: 'Yaw Boateng',    product: 'BADBO 1.0',            colorway: "'Rise'",               sizeEu: 45, total: 174.99, status: 'delivered',  date: '2026-03-12' },
  { id: 'ORD-008', customer: 'Akosua Frimpong',product: 'Air Foamposite Pro',   colorway: "'University Blue'",    sizeEu: 42, total: 299.99, status: 'delivered',  date: '2026-03-13' },
  { id: 'ORD-009', customer: 'Kwame Asiedu',   product: '990v6',                colorway: "'Grey Day'",           sizeEu: 43, total: 199.99, status: 'delivered',  date: '2026-03-15' },
  { id: 'ORD-010', customer: 'Adwoa Kusi',     product: 'Air Max 97',           colorway: "'Silver Bullet'",      sizeEu: 39, total: 174.99, status: 'shipped',    date: '2026-03-18' },
  { id: 'ORD-011', customer: 'Kweku Mensah',   product: 'Yeezy Boost 350 V2',   colorway: "'Zebra'",              sizeEu: 41, total: 229.99, status: 'shipped',    date: '2026-03-20' },
  { id: 'ORD-012', customer: 'Esi Owusu',      product: 'Air Force 1 Low',      colorway: "'MCA Chicago'",        sizeEu: 40, total: 299.99, status: 'shipped',    date: '2026-03-21' },
  { id: 'ORD-013', customer: 'Fiifi Acheampong',product:'Jordan Jumpman Jack',  colorway: "TR 'Green Spark'",     sizeEu: 44, total: 189.99, status: 'shipped',    date: '2026-03-23' },
  { id: 'ORD-014', customer: 'Maame Asante',   product: 'BADBO 1.0',            colorway: "'Rise'",               sizeEu: 42, total: 174.99, status: 'processing', date: '2026-03-25' },
  { id: 'ORD-015', customer: 'Ofori Mensah',   product: '990v6',                colorway: "'Grey Day'",           sizeEu: 45, total: 199.99, status: 'processing', date: '2026-03-27' },
  { id: 'ORD-016', customer: 'Akua Boateng',   product: 'Air Foamposite Pro',   colorway: "'University Blue'",    sizeEu: 41, total: 299.99, status: 'processing', date: '2026-03-28' },
  { id: 'ORD-017', customer: 'Kojo Asare',     product: 'Air Max 97',           colorway: "'Silver Bullet'",      sizeEu: 43, total: 174.99, status: 'processing', date: '2026-03-29' },
  { id: 'ORD-018', customer: 'Aba Osei',       product: 'Jordan Jumpman Jack',  colorway: "TR 'Green Spark'",     sizeEu: 40, total: 189.99, status: 'processing', date: '2026-03-30' },
  { id: 'ORD-019', customer: 'Sena Darko',     product: 'Yeezy Boost 350 V2',   colorway: "'Zebra'",              sizeEu: 42, total: 229.99, status: 'processing', date: '2026-03-30' },
  { id: 'ORD-020', customer: 'Kwesi Frimpong', product: 'Air Foamposite Pro',   colorway: "'University Blue'",    sizeEu: 44, total: 299.99, status: 'processing', date: '2026-03-30' },
]

export const inventory = [
  { id: 1, brand: 'Travis Scott x Air Jordan', name: 'Jordan Jumpman Jack',  colorway: "TR 'Green Spark'",   price: 189.99, stock: 8,  onSale: false, salePrice: null },
  { id: 2, brand: 'Adidas',                    name: 'BADBO 1.0',            colorway: "'Rise'",             price: 174.99, stock: 14, onSale: false, salePrice: null },
  { id: 3, brand: 'Nike Kobe Dunk Low',        name: "Proto 'Lower Merion",  colorway: "'Aces Home'",        price: 229.99, stock: 3,  onSale: true,  salePrice: 189.99 },
  { id: 4, brand: 'Kobe Bryant x Nike Air',    name: "Force 1 low 'Lower",   colorway: "'Merion'",           price: 199.99, stock: 6,  onSale: false, salePrice: null },
  { id: 5, brand: 'Nike Air',                  name: 'Foamposite Pro',       colorway: "'University Blue'",  price: 299.99, stock: 2,  onSale: false, salePrice: null },
]

export const displayOrder = [1, 2, 3, 4, 5]
