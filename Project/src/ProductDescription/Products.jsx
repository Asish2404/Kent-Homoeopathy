import { useState } from 'react';
import { Star, Heart, ShoppingCart, Stethoscope, Calendar, Phone } from 'lucide-react';

const Products = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPotency, setSelectedPotency] = useState('30C');
  const [selectedSize, setSelectedSize] = useState('30ml');

  const product = {
    name: "Arnica Montana",
    latinName: "Leopard's Bane",
    images: [
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
      "/api/placeholder/600/600"
    ],
    rating: 4.8,
    reviewCount: 256,
    currentPrice: 12.99,
    originalPrice: 16.99,
    discount: 24,
    shortDescription: "Natural remedy for bruises, muscle soreness, and trauma.",
    potencies: ['6C', '12C', '30C', '200C', '1M'],
    sizes: ['10ml', '30ml', '50ml', '100ml'],
    inStock: true
  };

  const comboOffers = [
    {
      id: 1,
      name: "Pain Relief Combo",
      medicines: ["Arnica Montana", "Rhus Tox", "Bryonia Alba"],
      image: "/api/placeholder/300/300",
      price: 34.99,
      originalPrice: 45.99
    },
    {
      id: 2,
      name: "Immunity Booster",
      medicines: ["Echinacea", "Arsenicum", "Gelsemium"],
      image: "/api/placeholder/300/300",
      price: 39.99,
      originalPrice: 52.99
    },
    {
      id: 3,
      name: "Digestive Health",
      medicines: ["Nux Vomica", "Carbo Veg", "Pulsatilla"],
      image: "/api/placeholder/300/300",
      price: 36.99,
      originalPrice: 48.99
    }
  ];

  const suggestions = [
    { id: 1, name: "Rhus Toxicodendron", indication: "Joint Pain", price: 13.99, rating: 4.6 },
    { id: 2, name: "Calendula", indication: "Wound Healing", price: 11.99, rating: 4.8 },
    { id: 3, name: "Belladonna", indication: "Fever", price: 12.99, rating: 4.5 },
    { id: 4, name: "Nux Vomica", indication: "Digestion", price: 13.99, rating: 4.7 }
  ];

  const reviews = [
    { id: 1, author: "Dr. Priya Sharma", rating: 5, date: "Jan 15", comment: "Excellent quality. Highly effective for my patients.", isDoctor: true },
    { id: 2, author: "Rajesh Kumar", rating: 5, date: "Jan 10", comment: "Great relief from muscle soreness. Will buy again.", isDoctor: false },
    { id: 3, author: "Dr. Meena Patel", rating: 4, date: "Jan 05", comment: "Good potency and results. Authentic product.", isDoctor: true }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Simple Header Bar */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500">
            <span>Home</span> <span className="mx-2">/</span>
            <span>Medicines</span> <span className="mx-2">/</span>
            <span className="text-gray-900">Arnica Montana</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Consultation Strip */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Need Help Choosing?</h3>
              <p className="text-sm text-gray-600">Consult with certified homeopathy doctors</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Consult Doctor
              </button>
              <button className="px-6 py-2.5 border border-gray-900 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-lg mb-4 relative overflow-hidden">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-sm rounded">
                  -{product.discount}%
                </div>
              )}
              <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-gray-900' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-light mb-2">{product.name}</h1>
            <p className="text-gray-500 italic mb-4">{product.latinName}</p>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) 
                        ? 'fill-gray-900 text-gray-900' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount})</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b">
              <span className="text-3xl font-light">₹{product.currentPrice}</span>
              <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">{product.shortDescription}</p>

            {/* Potency */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Potency</label>
              <div className="flex gap-2">
                {product.potencies.map((potency) => (
                  <button
                    key={potency}
                    onClick={() => setSelectedPotency(potency)}
                    className={`px-4 py-2 border rounded ${
                      selectedPotency === potency
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {potency}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Size</label>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded ${
                      selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border rounded hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border rounded hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-6">
              <button className="flex-1 bg-gray-900 text-white py-3.5 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="px-8 border border-gray-900 rounded-lg hover:bg-gray-50 transition">
                Buy Now
              </button>
            </div>

            {/* Quick Contact */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">Need Expert Advice?</p>
                  <p className="text-sm text-gray-600">Talk to our homeopathic specialist</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-medium hover:underline">
                  <Phone className="w-4 h-4" />
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Combo Offers */}
        <section className="mb-16">
          <h2 className="text-2xl font-light mb-8">Combo Offers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {comboOffers.map((combo) => (
              <div key={combo.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="aspect-[4/3] bg-gray-50">
                  <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-medium text-lg mb-3">{combo.name}</h3>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    {combo.medicines.map((med, i) => (
                      <li key={i}>• {med}</li>
                    ))}
                  </ul>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-light">₹{combo.price}</span>
                    <span className="text-sm text-gray-400 line-through">₹{combo.originalPrice}</span>
                  </div>
                  <button className="w-full py-2.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition">
                    Add Combo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        <section className="mb-16">
          <h2 className="text-2xl font-light mb-8">You May Also Need</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {suggestions.map((item) => (
              <div key={item.id} className="group">
                <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                  <div className="w-full h-full bg-gray-100"></div>
                </div>
                <h3 className="font-medium mb-1 text-sm">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{item.indication}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(item.rating) 
                            ? 'fill-gray-900 text-gray-900' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">{item.rating}</span>
                </div>
                <p className="font-medium mb-3">₹{item.price}</p>
                <button className="w-full py-2 border rounded hover:bg-gray-50 transition text-sm">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-16 max-w-4xl">
          <h2 className="text-2xl font-light mb-6">About This Medicine</h2>
          
          <div className="bg-yellow-50 border-l-2 border-yellow-400 p-4 mb-6 text-sm">
            ⚠️ Consult a qualified homeopathic practitioner before use.
          </div>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Common Indications</h3>
              <ul className="space-y-2">
                <li>• Bruises and muscle soreness from physical trauma</li>
                <li>• Reduces inflammation and swelling</li>
                <li>• Post-surgical recovery and wound healing</li>
                <li>• Sports injuries and sprains</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Dosage</h3>
              <p><strong>Adults:</strong> 5-10 drops in water, 3 times daily</p>
              <p><strong>Children:</strong> Half the adult dose</p>
              <p className="text-sm italic mt-2">Maintain 30-minute gap from meals</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Storage</h3>
              <ul className="space-y-2">
                <li>• Store in cool, dry place</li>
                <li>• Keep away from strong odors</li>
                <li>• Keep out of reach of children</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light">Reviews</h2>
            <button className="text-sm font-medium hover:underline">Write Review</button>
          </div>

          <div className="flex items-center gap-8 mb-8 pb-8 border-b">
            <div>
              <div className="text-5xl font-light mb-2">{product.rating}</div>
              <div className="flex mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) 
                        ? 'fill-gray-900 text-gray-900' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">{product.reviewCount} reviews</div>
            </div>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="pb-6 border-b last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.author}</span>
                      {review.isDoctor && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Doctor</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating 
                                ? 'fill-gray-900 text-gray-900' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="px-6 py-2 border rounded hover:bg-gray-50 transition text-sm">
              Load More
            </button>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 bg-gray-900 text-white rounded-lg text-center">
          <h3 className="text-2xl font-light mb-3">Still Have Questions?</h3>
          <p className="text-gray-400 mb-6">Expert homeopathic doctors available 24/7</p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition">
              Free Consultation
            </button>
            <button className="px-8 py-3 border border-white rounded-lg hover:bg-white hover:text-gray-900 transition">
              Call Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Products;