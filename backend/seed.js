
const mongoose = require("mongoose");
require("dotenv").config();

const Medicine = require("./models/Medicine");
const Pharmacy = require("./models/Pharmacy");
const Inventory = require("./models/Inventory");

const medicines = [
  { name: "Dolo 650", category: "Pain Relief", description: "Paracetamol-based medicine." },
  { name: "Crocin Advance", category: "Pain Relief", description: "Paracetamol-based medicine." },
  { name: "Calpol 500", category: "Pain Relief", description: "Paracetamol-based medicine." },
  { name: "Combiflam", category: "Pain Relief", description: "Common pain relief medicine." },
  { name: "Brufen 400", category: "Pain Relief", description: "Ibuprofen-based medicine." },
  { name: "Cetirizine", category: "Allergy", description: "Antihistamine medicine." },
  { name: "Allegra 120", category: "Allergy", description: "Fexofenadine-based medicine." },
  { name: "Levocetirizine", category: "Allergy", description: "Antihistamine medicine." },
  { name: "Montair-LC", category: "Allergy", description: "Combination allergy medicine." },
  { name: "Azithral 500", category: "Antibiotic", description: "Azithromycin-based antibiotic." },
  { name: "Augmentin 625", category: "Antibiotic", description: "Amoxicillin and clavulanic acid combination." },
  { name: "Amoxicillin", category: "Antibiotic", description: "Penicillin-class antibiotic." },
  { name: "Pan 40", category: "Digestive Health", description: "Pantoprazole-based medicine." },
  { name: "Pan-D", category: "Digestive Health", description: "Combination medicine for acid-related conditions." },
  { name: "Omez 20", category: "Digestive Health", description: "Omeprazole-based medicine." },
  { name: "Digene", category: "Digestive Health", description: "Antacid product." },
  { name: "Gelusil", category: "Digestive Health", description: "Antacid product." },
  { name: "Electral ORS", category: "Hydration", description: "Oral rehydration salts." },
  { name: "Ondem 4", category: "Digestive Health", description: "Ondansetron-based medicine." },
  { name: "Avomine", category: "Digestive Health", description: "Promethazine-based medicine." },
  { name: "Becosules", category: "Vitamins", description: "Vitamin B-complex supplement." },
  { name: "Limcee 500", category: "Vitamins", description: "Vitamin C supplement." },
  { name: "Shelcal 500", category: "Vitamins", description: "Calcium and vitamin D supplement." },
  { name: "Neurobion Forte", category: "Vitamins", description: "Vitamin B-complex supplement." },
  { name: "Supradyn", category: "Vitamins", description: "Multivitamin supplement." },
  { name: "Volini Gel", category: "Pain Relief", description: "Topical pain relief product." },
  { name: "Moov Cream", category: "Pain Relief", description: "Topical pain relief product." },
  { name: "Betadine Ointment", category: "Antiseptic", description: "Povidone-iodine antiseptic product." },
  { name: "Soframycin", category: "Antiseptic", description: "Topical antibiotic product." },
  { name: "Vicks Action 500", category: "Cold and Cough", description: "Cold and flu relief product." },
  { name: "Crocin Cold & Flu", category: "Cold and Cough", description: "Cold and flu relief product." },
  { name: "Ascoril", category: "Cold and Cough", description: "Cough syrup range." },
  { name: "Honitus", category: "Cold and Cough", description: "Herbal cough syrup." },
  { name: "Benadryl Cough Syrup", category: "Cold and Cough", description: "Cough syrup product." },
  { name: "Himalaya Liv.52", category: "Wellness", description: "Herbal wellness product." },
  { name: "Dettol Antiseptic Liquid", category: "Antiseptic", description: "Antiseptic liquid." }
];

const pharmacies = [
  {
    name: "Guardian Pharmacy - Dwarka Sector 10",
    address: "Shop G4, GF, Plot 6, MLU, Aditya Complex, Dwarka Sector 10, New Delhi - 110075",
    city: "Delhi",
    phone: "+91 9205780420",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Green Park",
    address: "Shop G56, Green Park Main Market, New Delhi - 110016",
    city: "Delhi",
    phone: "+91 9205780423",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Sarita Vihar",
    address: "Plot 9, H and J Block Market, Sarita Vihar, New Delhi - 110076",
    city: "Delhi",
    phone: "+91 9205780414",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Hauz Khas",
    address: "E-45, Hauz Khas Main Market, New Delhi - 110016",
    city: "Delhi",
    phone: "+91 9205780424",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Vasant Vihar",
    address: "C-25, Shop 1, C Block Market, New Delhi - 110017",
    city: "Delhi",
    phone: "+91 9205780425",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Saket",
    address: "Shop 1, J Block, Saket LSC Market, New Delhi - 110016",
    city: "Delhi",
    phone: "+91 9205780423",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Vasant Kunj",
    address: "C-9/2, Main Masoodpur Road, Vasant Kunj, New Delhi - 110070",
    city: "Delhi",
    phone: "+91 9205780428",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Model Town",
    address: "Shop 1, H-7, Model Town III, New Delhi - 110009",
    city: "Delhi",
    phone: "+91 9205780433",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Khanna Market",
    address: "Shop 72, Khanna Market, New Delhi - 110003",
    city: "Delhi",
    phone: "+91 9205780432",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Rajouri Garden",
    address: "Shop 2, J-13/1, Rajouri Garden, New Delhi - 110027",
    city: "Delhi",
    phone: "+91 9205780422",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Punjabi Bagh",
    address: "Shop 1, Plot 21, Punjabi Bagh, New Delhi - 110026",
    city: "Delhi",
    phone: "+91 9205780418",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - East Patel Nagar",
    address: "29/1, Shop 5, Ground Floor, East Patel Nagar, New Delhi - 110008",
    city: "Delhi",
    phone: "+91 9319998376",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Chittaranjan Park",
    address: "Shop E-778, Ground Floor, Chittaranjan Park, New Delhi - 110019",
    city: "Delhi",
    phone: "+91 9319998377",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Janakpuri",
    address: "Shop 14, B1 Block Community Center, Janakpuri, New Delhi - 110058",
    city: "Delhi",
    phone: "+91 9319998378",
    openingHours: "08:00 AM - 10:00 PM"
  },
  {
    name: "Guardian Pharmacy - Kirti Nagar",
    address: "Shop 29 and 30, Building F29, Kirti Nagar Central Market, New Delhi - 110015",
    city: "Delhi",
    phone: "+91 9319998379",
    openingHours: "08:00 AM - 10:00 PM"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear previous seed data
    await Inventory.deleteMany({});
    await Medicine.deleteMany({});
    await Pharmacy.deleteMany({});

    // Insert medicines and pharmacies
    const savedMedicines = await Medicine.insertMany(medicines);
    const savedPharmacies = await Pharmacy.insertMany(pharmacies);

    // Create demo inventory entries
    const inventoryData = [];

    savedMedicines.forEach((medicine, medicineIndex) => {
      savedPharmacies.forEach((pharmacy, pharmacyIndex) => {
        inventoryData.push({
          medicineId: medicine._id,
          pharmacyId: pharmacy._id,
          price: 30 + medicineIndex * 7 + pharmacyIndex * 3,
          quantity: 5 + ((medicineIndex + pharmacyIndex) % 25)
        });
      });
    });

    await Inventory.insertMany(inventoryData);

    console.log("Database seeded successfully!");
    console.log(`Medicines added: ${savedMedicines.length}`);
    console.log(`Pharmacies added: ${savedPharmacies.length}`);
    console.log(`Inventory entries added: ${inventoryData.length}`);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
