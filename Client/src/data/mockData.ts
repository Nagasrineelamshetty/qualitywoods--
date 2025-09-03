
export const products = [
  {
    id: '1',
    name: 'Luxury King Size Bed',
    category: 'Beds',
    price: 45000,
    image: '/kingsize_bed.avif',
    description: 'Handcrafted king size bed with premium teak wood finish. Features elegant headboard design and sturdy construction.',
    specifications: {
      material: 'Teak Wood',
      dimensions: '6ft x 6.5ft',
      warranty: '10 years'
    },
    customizations: {
      wood: ['Teak', 'Mahogany', 'Oak', 'Sheesham'],
      finish: ['Natural', 'Walnut', 'Cherry', 'Espresso'],
      dimensions: ['Single', 'Double', 'Queen', 'King']
    },
    inStock: true
  },
  {
    id: '2',
    name: 'L Shaped Sofa Set',
    category: 'Sofas',
    price: 65000,
    image: '/sofa.jpg',
    description: 'Contemporary sofa with premium fabric upholstery. Perfect for modern living rooms.',
    specifications: {
      material: 'Fabric & Wood Frame',
      dimensions: '8ft x 6ft',
      warranty: '5 years'
    },
    customizations: {
      wood: ['Teak', 'Pine', 'Oak'],
      finish: ['Natural', 'Walnut', 'White'],
      dimensions: ['2-Seater', '3-Seater', 'L-Shaped', 'U-Shaped']
    },
    inStock: true
  },
  {
    id: '3',
    name: 'Modular Kitchen Set',
    category: 'Kitchen',
    price: 125000,
    image: '/kitchenset.jpg',
    description: 'Complete modular kitchen solution with modern cabinets, countertops, and storage solutions.',
    specifications: {
      material: 'Plywood & Laminate',
      dimensions: 'Custom',
      warranty: '7 years'
    },
    customizations: {
      wood: ['Plywood', 'MDF', 'Solid Wood'],
      finish: ['Matte', 'Glossy', 'Textured'],
      dimensions: ['L-Shaped', 'U-Shaped', 'Straight', 'Island']
    },
    inStock: true
  },
  {
    id: '4',
    name: 'Executive Office Desk',
    category: 'Office',
    price: 25000,
    image: '/laptop_desk.jpg',
    description: 'Professional executive desk with ample storage and cable management. Perfect for home office.',
    specifications: {
      material: 'Engineered Wood',
      dimensions: '5ft x 2.5ft',
      warranty: '3 years'
    },
    customizations: {
      wood: ['Engineered Wood', 'Solid Wood', 'Metal Frame'],
      finish: ['Oak', 'Walnut', 'White', 'Black'],
      dimensions: ['Compact', 'Standard', 'Executive', 'L-Shaped']
    },
    inStock: true
  },
  {
    id: '5',
    name: '2-Door Wardrobe',
    category: 'Storage',
    price: 35000,
    image: '/2door_wardrobe.avif',
    description: 'Spacious 2-door wardrobe with hanging space, shelves, and drawers. Sliding door mechanism.',
    specifications: {
      material: 'Plywood',
      dimensions: '7ft x 2ft x 7ft',
      warranty: '5 years'
    },
    customizations: {
      wood: ['Plywood', 'MDF', 'Solid Wood'],
      finish: ['Natural', 'White', 'Walnut', 'Cherry'],
      dimensions: ['2-Door', '3-Door', '4-Door', '6-Door']
    },
    inStock: true
  },
  {
    id: '6',
    name: 'Dining Table Set',
    category: 'Dining',
    price: 42000,
    image: '/dining_table.jpg',
    description: '6-seater dining table set with matching chairs. Perfect for family gatherings.',
    specifications: {
      material: 'Solid Wood',
      dimensions: '6ft x 3ft',
      warranty: '8 years'
    },
    customizations: {
      wood: ['Teak', 'Mahogany', 'Oak', 'Pine'],
      finish: ['Natural', 'Dark Brown', 'Light Brown', 'Black'],
      dimensions: ['4-Seater', '6-Seater', '8-Seater', '10-Seater']
    },
    inStock: true
  },
  // New products within allowed categories
  {
    id: '7',
    name: 'Single Size Bed',
    category: 'Beds',
    price: 10000,
    image: '/single_bed.webp',
    description: 'Comfortable queen size bed with elegant headboard and solid wood frame.',
    specifications: {
      material: 'Sheesham Wood',
      dimensions: '5ft x 6ft',
      warranty: '7 years'
    },
    customizations: {
      wood: ['Teak', 'Mahogany', 'Sheesham'],
      finish: ['Natural', 'Walnut', 'Espresso'],
      dimensions: ['Single', 'Double', 'Queen']
    },
    inStock: true
  },
  {
    id: '8',
    name: '3 Seater Sofa',
    category: 'Sofas',
    price: 30000,
    image: '/3seater_sofa.avif',
    description: 'Spacious L-shaped sofa with premium fabric upholstery. Perfect for large living rooms.',
    specifications: {
      material: 'Fabric & Solid Wood',
      dimensions: '10ft x 6ft',
      warranty: '5 years'
    },
    customizations: {
      color: ['Gray', 'Beige', 'Blue'],
      dimensions: ['L-Shaped', 'U-Shaped']
    },
    inStock: true
  },
  {
    id: '9',
    name: 'Office Chair',
    category: 'Office',
    price: 12000,
    image: '/office_chair.avif',
    description: 'Ergonomic office chair with adjustable height and lumbar support. Ideal for long working hours.',
    specifications: {
      material: 'Mesh & Metal',
      dimensions: '2ft x 2ft',
      warranty: '3 years'
    },
    customizations: {
      color: ['Black', 'Gray', 'Blue'],
      type: ['Standard', 'Executive', 'Gaming']
    },
    inStock: true
  },
  {
    id: '10',
    name: 'Kitchen Cabinet Set',
    category: 'Kitchen',
    price: 85000,
    image: '/kitchen_cabinet.webp',
    description: 'Premium modular kitchen cabinet set with drawers, overhead storage, and sleek finish.',
    specifications: {
      material: 'Plywood & Laminate',
      dimensions: 'Custom',
      warranty: '7 years'
    },
    customizations: {
      finish: ['Matte', 'Glossy', 'Textured'],
      dimensions: ['L-Shaped', 'U-Shaped', 'Straight']
    },
    inStock: true
  }
];


export const testimonials = [
  {
    id: '1',
    name: 'Priya Sharma',
    rating: 5,
    comment: 'Absolutely loved the custom bed design! The quality is exceptional and delivery was on time.',
    image: 'dining_table.jpg'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    rating: 5,
    comment: 'The modular kitchen exceeded our expectations. Professional team and excellent craftsmanship.',
    image: 'dining_table.jpg'
  },
  {
    id: '3',
    name: 'Anjali Patel',
    rating: 4,
    comment: 'Beautiful furniture and great customer service. Highly recommend FurnitureCraft for custom designs.',
    image: 'dining_table.jpg'
  }
];

export const orders = [
  {
    id: 'FC2024001',
    status: 'In Production',
    customerName: 'John Doe',
    items: ['Luxury King Size Bed', 'Bedside Tables'],
    total: 52000,
    orderDate: '2024-01-15',
    estimatedDelivery: '2024-02-15'
  },
  {
    id: 'FC2024002',
    status: 'Shipped',
    customerName: 'Jane Smith',
    items: ['Modern L-Shaped Sofa'],
    total: 65000,
    orderDate: '2024-01-10',
    estimatedDelivery: '2024-02-10'
  },
  {
    id: 'FC2024003',
    status: 'Delivered',
    customerName: 'Mike Johnson',
    items: ['Modular Kitchen Set'],
    total: 125000,
    orderDate: '2023-12-20',
    estimatedDelivery: '2024-01-20'
  }
];
