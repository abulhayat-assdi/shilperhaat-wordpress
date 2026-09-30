export interface District {
  name: string;
  isDhakaDivision: boolean;
  thanas: string[];
}

export const BANGLADESH_DISTRICTS: District[] = [
  // ── Dhaka Division ──────────────────────────────────────────────────────────
  {
    name: "Dhaka",
    isDhakaDivision: true,
    thanas: [
      "Adabor", "Badda", "Bangshal", "Bimanbandar", "Cantonment",
      "Chawkbazar", "Dakshinkhan", "Demra", "Dhamrai", "Dhanmondi",
      "Dohar", "Gandaria", "Gulshan", "Hazaribagh", "Jatrabari",
      "Kafrul", "Kalabagan", "Kamrangirchar", "Keraniganj", "Khilgaon",
      "Khilkhet", "Kotwali", "Lalbagh", "Mirpur", "Mohammadpur",
      "Motijheel", "Nawabganj", "New Market", "Pallabi", "Paltan",
      "Ramna", "Sabujbagh", "Savar", "Shahbag", "Shyampur",
      "Sutrapur", "Tejgaon", "Turag", "Uttara", "Uttarkhan", "Wari",
    ],
  },
  {
    name: "Gazipur",
    isDhakaDivision: true,
    thanas: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
  },
  {
    name: "Narayanganj",
    isDhakaDivision: true,
    thanas: ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"],
  },
  {
    name: "Manikganj",
    isDhakaDivision: true,
    thanas: ["Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia", "Shivalaya", "Singair"],
  },
  {
    name: "Munshiganj",
    isDhakaDivision: true,
    thanas: ["Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"],
  },
  {
    name: "Narsingdi",
    isDhakaDivision: true,
    thanas: ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"],
  },
  {
    name: "Tangail",
    isDhakaDivision: true,
    thanas: [
      "Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail",
      "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur",
      "Sakhipur", "Tangail Sadar",
    ],
  },
  {
    name: "Faridpur",
    isDhakaDivision: true,
    thanas: [
      "Alfadanga", "Bhanga", "Boalmari", "Char Bhadrashan",
      "Faridpur Sadar", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha",
    ],
  },
  {
    name: "Gopalganj",
    isDhakaDivision: true,
    thanas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
  },
  {
    name: "Madaripur",
    isDhakaDivision: true,
    thanas: ["Kalkini", "Madaripur Sadar", "Rajoir", "Shibchar"],
  },
  {
    name: "Rajbari",
    isDhakaDivision: true,
    thanas: ["Baliakandi", "Goalandaghat", "Kalukhali", "Pangsha", "Rajbari Sadar"],
  },
  {
    name: "Shariatpur",
    isDhakaDivision: true,
    thanas: ["Bhedarganj", "Damudya", "Gosairhat", "Jajira", "Naria", "Shariatpur Sadar", "Zanjira"],
  },
  {
    name: "Kishoreganj",
    isDhakaDivision: true,
    thanas: [
      "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna",
      "Karimganj", "Katiadi", "Kishoreganj Sadar", "Kuliarchar",
      "Mithamain", "Nikli", "Pakundia", "Tarail",
    ],
  },
  {
    name: "Netrokona",
    isDhakaDivision: true,
    thanas: [
      "Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua",
      "Khaliajuri", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala",
    ],
  },

  // ── Chittagong Division ─────────────────────────────────────────────────────
  {
    name: "Chittagong",
    isDhakaDivision: false,
    thanas: [
      "Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari",
      "Hathazari", "Karnaphuli", "Lohagara", "Mirsharai", "Patiya",
      "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda",
      "Akbar Shah", "Bayazid", "Bakalia", "Chandgaon", "Chawkbazar",
      "Double Mooring", "Halishahar", "Khulshi", "Kotoali",
      "Pahartali", "Panchlaish", "Patenga",
    ],
  },
  {
    name: "Cox's Bazar",
    isDhakaDivision: false,
    thanas: ["Chakaria", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhiya"],
  },
  {
    name: "Comilla",
    isDhakaDivision: false,
    thanas: [
      "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram",
      "Comilla Sadar", "Comilla Sadar South", "Daudkandi", "Debidwar",
      "Homna", "Laksam", "Lalmai", "Meghna", "Monohorganj",
      "Muradnagar", "Nangalkot", "Titas",
    ],
  },
  {
    name: "Feni",
    isDhakaDivision: false,
    thanas: ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"],
  },
  {
    name: "Brahmanbaria",
    isDhakaDivision: false,
    thanas: ["Akhaura", "Ashuganj", "Bancharampur", "Bijoynagar", "Brahmanbaria Sadar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail"],
  },
  {
    name: "Rangamati",
    isDhakaDivision: false,
    thanas: [
      "Baghaichhari", "Barkal", "Belaichhari", "Juraichhari",
      "Kaptai", "Kaukhali", "Langadu", "Nannerchar", "Rajasthali", "Rangamati Sadar",
    ],
  },
  {
    name: "Noakhali",
    isDhakaDivision: false,
    thanas: [
      "Begumganj", "Chatkhil", "Companiganj", "Hatiya",
      "Kabirhat", "Noakhali Sadar", "Senbagh", "Sonaimuri", "Subarnachar",
    ],
  },
  {
    name: "Chandpur",
    isDhakaDivision: false,
    thanas: [
      "Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj",
      "Kachua", "Matlab North", "Matlab South", "Shahrasti",
    ],
  },
  {
    name: "Lakshmipur",
    isDhakaDivision: false,
    thanas: ["Kamalnagar", "Lakshmipur Sadar", "Ramganj", "Ramgati", "Roypur"],
  },
  {
    name: "Khagrachhari",
    isDhakaDivision: false,
    thanas: [
      "Dighinala", "Guimara", "Khagrachhari Sadar", "Lakshmichhari",
      "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh",
    ],
  },
  {
    name: "Bandarban",
    isDhakaDivision: false,
    thanas: ["Alikadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"],
  },

  // ── Rajshahi Division ───────────────────────────────────────────────────────
  {
    name: "Rajshahi",
    isDhakaDivision: false,
    thanas: [
      "Bagha", "Bagmara", "Boalia", "Charghat", "Durgapur",
      "Godagari", "Matihar", "Mohanpur", "Paba", "Puthia",
      "Rajpara", "Shah Makhdum", "Tanore",
    ],
  },
  {
    name: "Chapai Nawabganj",
    isDhakaDivision: false,
    thanas: ["Bholahat", "Chapai Nawabganj Sadar", "Gomastapur", "Nachole", "Shibganj"],
  },
  {
    name: "Natore",
    isDhakaDivision: false,
    thanas: ["Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Naldanga", "Natore Sadar", "Singra"],
  },
  {
    name: "Naogaon",
    isDhakaDivision: false,
    thanas: [
      "Atrai", "Badalgachhi", "Dhamoirhat", "Mahadebpur", "Manda",
      "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar",
    ],
  },
  {
    name: "Bogra",
    isDhakaDivision: false,
    thanas: [
      "Adamdighi", "Bogra Sadar", "Dhunat", "Dupchanchia", "Gabtali",
      "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur",
      "Sherpur", "Shibganj", "Sonatola",
    ],
  },
  {
    name: "Pabna",
    isDhakaDivision: false,
    thanas: ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"],
  },
  {
    name: "Sirajganj",
    isDhakaDivision: false,
    thanas: [
      "Belkuchi", "Chauhali", "Enayetpur", "Kamarkhanda", "Kazipur",
      "Raiganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullahpara",
    ],
  },
  {
    name: "Joypurhat",
    isDhakaDivision: false,
    thanas: ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"],
  },

  // ── Khulna Division ─────────────────────────────────────────────────────────
  {
    name: "Khulna",
    isDhakaDivision: false,
    thanas: [
      "Batiaghata", "Dacope", "Daulatpur", "Dighalia", "Dumuria",
      "Harintana", "Khan Jahan Ali", "Khulna Sadar", "Koyra",
      "Labanchara", "Paikgachha", "Phultala", "Rupsa", "Sonadanga", "Terokhada",
    ],
  },
  {
    name: "Bagerhat",
    isDhakaDivision: false,
    thanas: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sharankhola"],
  },
  {
    name: "Satkhira",
    isDhakaDivision: false,
    thanas: ["Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar", "Shyamnagar", "Tala"],
  },
  {
    name: "Jessore",
    isDhakaDivision: false,
    thanas: ["Abhaynagar", "Bagherpara", "Chaugachha", "Jessore Sadar", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
  },
  {
    name: "Magura",
    isDhakaDivision: false,
    thanas: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
  },
  {
    name: "Jhenaidah",
    isDhakaDivision: false,
    thanas: ["Harinakunda", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
  },
  {
    name: "Narail",
    isDhakaDivision: false,
    thanas: ["Kalia", "Lohagara", "Narail Sadar"],
  },
  {
    name: "Chuadanga",
    isDhakaDivision: false,
    thanas: ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"],
  },
  {
    name: "Meherpur",
    isDhakaDivision: false,
    thanas: ["Gangni", "Meherpur Sadar", "Mujibnagar"],
  },
  {
    name: "Kushtia",
    isDhakaDivision: false,
    thanas: ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"],
  },

  // ── Sylhet Division ─────────────────────────────────────────────────────────
  {
    name: "Sylhet",
    isDhakaDivision: false,
    thanas: [
      "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshin Surma",
      "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat",
      "Osmani Nagar", "Sylhet Sadar", "Zakiganj",
    ],
  },
  {
    name: "Moulvibazar",
    isDhakaDivision: false,
    thanas: ["Barlekha", "Juri", "Kamalganj", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"],
  },
  {
    name: "Habiganj",
    isDhakaDivision: false,
    thanas: ["Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj", "Shaistaganj"],
  },
  {
    name: "Sunamganj",
    isDhakaDivision: false,
    thanas: [
      "Bishwamvarpur", "Chhatak", "Derai", "Dharampasha", "Dowarabazar",
      "Jagannathpur", "Jamalganj", "Sullah", "Sunamganj Sadar", "Tahirpur",
    ],
  },

  // ── Barisal Division ────────────────────────────────────────────────────────
  {
    name: "Barisal",
    isDhakaDivision: false,
    thanas: [
      "Agailjhara", "Babuganj", "Bakerganj", "Banaripara",
      "Barisal Sadar", "Gaurnadi", "Hizla", "Kotwali",
      "Mehendiganj", "Muladi", "Uzirpur",
    ],
  },
  {
    name: "Bhola",
    isDhakaDivision: false,
    thanas: ["Bhola Sadar", "Borhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
  },
  {
    name: "Patuakhali",
    isDhakaDivision: false,
    thanas: ["Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Patuakhali Sadar", "Rangabali"],
  },
  {
    name: "Pirojpur",
    isDhakaDivision: false,
    thanas: ["Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Pirojpur Sadar", "Zianagar"],
  },
  {
    name: "Barguna",
    isDhakaDivision: false,
    thanas: ["Amtali", "Bamna", "Barguna Sadar", "Betagi", "Patharghata", "Taltali"],
  },
  {
    name: "Jhalokati",
    isDhakaDivision: false,
    thanas: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  },

  // ── Rangpur Division ────────────────────────────────────────────────────────
  {
    name: "Rangpur",
    isDhakaDivision: false,
    thanas: ["Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Rangpur Sadar", "Taraganj"],
  },
  {
    name: "Dinajpur",
    isDhakaDivision: false,
    thanas: [
      "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar",
      "Dinajpur Sadar", "Fulbari", "Ghoraghat", "Hakimpur",
      "Kaharole", "Khansama", "Nawabganj", "Parbatipur",
    ],
  },
  {
    name: "Kurigram",
    isDhakaDivision: false,
    thanas: [
      "Bhurungamari", "Char Rajibpur", "Chilmari", "Kurigram Sadar",
      "Nageshwari", "Phulbari", "Rajarhat", "Rajibpur", "Rowmari", "Ulipur",
    ],
  },
  {
    name: "Gaibandha",
    isDhakaDivision: false,
    thanas: ["Fulchhari", "Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
  },
  {
    name: "Nilphamari",
    isDhakaDivision: false,
    thanas: ["Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Saidpur"],
  },
  {
    name: "Panchagarh",
    isDhakaDivision: false,
    thanas: ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"],
  },
  {
    name: "Thakurgaon",
    isDhakaDivision: false,
    thanas: ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"],
  },
  {
    name: "Lalmonirhat",
    isDhakaDivision: false,
    thanas: ["Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram"],
  },

  // ── Mymensingh Division ─────────────────────────────────────────────────────
  {
    name: "Mymensingh",
    isDhakaDivision: false,
    thanas: [
      "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur",
      "Haluaghat", "Ishwarganj", "Muktagachha", "Mymensingh Sadar",
      "Nandail", "Phulpur", "Tarakanda", "Trishal",
    ],
  },
  {
    name: "Jamalpur",
    isDhakaDivision: false,
    thanas: ["Bakshiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarishabari"],
  },
  {
    name: "Sherpur",
    isDhakaDivision: false,
    thanas: ["Jhenaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sreebardi"],
  },
];

export function getDeliveryCharge(district: string): number {
  if (!district) return 0;
  return district.toLowerCase() === "dhaka" ? 100 : 150;
}

export function getThanas(district: string): string[] {
  const found = BANGLADESH_DISTRICTS.find((d) => d.name === district);
  return found ? found.thanas : [];
}
