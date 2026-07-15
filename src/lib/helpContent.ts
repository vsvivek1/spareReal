export type Bilingual = { en: string; ml: string };

export const HELP_SECTIONS: { question: Bilingual; answer: Bilingual }[] = [
  {
    question: {
      en: "How do I list a spare part for sale?",
      ml: "വിൽക്കാനുള്ള സ്പെയർ പാർട്ട് എങ്ങനെ ലിസ്റ്റ് ചെയ്യാം?",
    },
    answer: {
      en: "Tap Sell from the menu, add a clear photo of the part (or use the camera — our AI will try to auto-fill the title, category, and vehicle for you), then fill in price, quantity, and condition. If the part came from a vehicle you've registered under My Vehicles, you can link it there so buyers see everything pulled from that car.",
      ml: "മെനുവിൽ നിന്ന് 'Sell' തിരഞ്ഞെടുക്കുക. സ്പെയർ പാർട്ടിന്റെ വ്യക്തമായ ഫോട്ടോ ചേർക്കുക (ക്യാമറ ഉപയോഗിക്കാം — ടൈറ്റിൽ, കാറ്റഗറി, വാഹനം എന്നിവ എഐ സ്വയമേവ പൂരിപ്പിക്കാൻ ശ്രമിക്കും). വില, എണ്ണം, അവസ്ഥ എന്നിവ നൽകുക. 'My Vehicles'-ൽ നിങ്ങൾ രജിസ്റ്റർ ചെയ്ത വാഹനത്തിൽ നിന്നുള്ള പാർട്ടാണെങ്കിൽ, ആ വാഹനവുമായി ലിങ്ക് ചെയ്യാം — അപ്പോൾ ആ കാറിൽ നിന്ന് ലഭ്യമായ എല്ലാ പാർട്സും വാങ്ങുന്നവർക്ക് ഒരുമിച്ച് കാണാം.",
    },
  },
  {
    question: {
      en: "How do I register a dismantled vehicle?",
      ml: "പൊളിച്ച വാഹനം എങ്ങനെ രജിസ്റ്റർ ചെയ്യാം?",
    },
    answer: {
      en: "If you're parting out a whole vehicle, go to My Vehicles → Add Vehicle. Add several photos (front, rear, engine bay), the make/model/year, and optionally the VIN, color, and odometer reading. Once saved, every part you list can be linked to it, so buyers browsing one part can see everything else available from the same vehicle.",
      ml: "ഒരു മുഴുവൻ വാഹനം പൊളിച്ച് പാർട്സ് വിൽക്കുകയാണെങ്കിൽ, 'My Vehicles' → 'Add Vehicle' എന്നതിലേക്ക് പോകുക. മുൻവശം, പിൻവശം, എഞ്ചിൻ ഭാഗം എന്നിവയുടെ ഫോട്ടോകൾ ചേർക്കുക, മേക്ക്/മോഡൽ/വർഷം നൽകുക, ആവശ്യമെങ്കിൽ VIN, നിറം, ഓടിച്ച ദൂരം (odometer) എന്നിവയും നൽകാം. സേവ് ചെയ്ത ശേഷം, നിങ്ങൾ ലിസ്റ്റ് ചെയ്യുന്ന ഓരോ പാർട്ടും ഈ വാഹനവുമായി ലിങ്ക് ചെയ്യാം — അതിനാൽ ഒരു പാർട്ട് കാണുന്ന വാങ്ങുന്നയാൾക്ക് അതേ വാഹനത്തിൽ നിന്നുള്ള മറ്റ് പാർട്സും കാണാൻ കഴിയും.",
    },
  },
  {
    question: {
      en: "How do I browse and search for parts?",
      ml: "പാർട്സ് എങ്ങനെ ബ്രൗസ് ചെയ്യാം, തിരയാം?",
    },
    answer: {
      en: "Go to Browse to see every listing and request in one feed. Use the search box plus the Category, District, and Make filters to narrow things down — search also matches make, model, and year, so typing a model name works even without picking it from the filter.",
      ml: "എല്ലാ ലിസ്റ്റിംഗുകളും റിക്വസ്റ്റുകളും ഒരുമിച്ച് കാണാൻ 'Browse' എന്നതിലേക്ക് പോകുക. തിരയൽ ബോക്സും Category, District, Make ഫിൽട്ടറുകളും ഉപയോഗിച്ച് ഫലങ്ങൾ ചുരുക്കാം — മോഡൽ പേര് ടൈപ്പ് ചെയ്താലും തിരയൽ അത് കണ്ടെത്തും, ഫിൽട്ടറിൽ നിന്ന് പ്രത്യേകം തിരഞ്ഞെടുക്കേണ്ട ആവശ്യമില്ല.",
    },
  },
  {
    question: {
      en: "I can't find a part — what do I do?",
      ml: "വേണ്ട പാർട്ട് കിട്ടുന്നില്ല — എന്ത് ചെയ്യണം?",
    },
    answer: {
      en: "Tap Request, describe the part and your vehicle (brand, model, year), and your budget. Sellers browsing the Requirements tab can see your request and contact you directly.",
      ml: "'Request' അമർത്തി, പാർട്ടിന്റെ വിവരവും നിങ്ങളുടെ വാഹനവും (ബ്രാൻഡ്, മോഡൽ, വർഷം) ബഡ്ജറ്റും നൽകുക. 'Requirements' ടാബിൽ ഇത് കാണുന്ന വിൽപ്പനക്കാർക്ക് നിങ്ങളെ നേരിട്ട് ബന്ധപ്പെടാം.",
    },
  },
  {
    question: {
      en: "How do I contact a seller or requester?",
      ml: "വിൽപ്പനക്കാരനെയോ ആവശ്യക്കാരനെയോ എങ്ങനെ ബന്ധപ്പെടാം?",
    },
    answer: {
      en: "Every listing and request shows Call and WhatsApp buttons wherever a phone number is available — tap either to reach out directly. spareX doesn't have in-app chat yet, so all communication happens over phone or WhatsApp.",
      ml: "ഓരോ ലിസ്റ്റിംഗിലും റിക്വസ്റ്റിലും ഫോൺ നമ്പർ ലഭ്യമെങ്കിൽ Call, WhatsApp ബട്ടണുകൾ കാണാം — അതിൽ അമർത്തി നേരിട്ട് ബന്ധപ്പെടാം. spareX-ൽ ഇപ്പോൾ ആപ്പിനുള്ളിൽ ചാറ്റ് സൗകര്യമില്ല, എല്ലാ ആശയവിനിമയവും ഫോൺ വഴിയോ വാട്സ്ആപ്പ് വഴിയോ ആണ്.",
    },
  },
  {
    question: {
      en: "How do I manage stock and record a sale?",
      ml: "സ്റ്റോക്ക് എങ്ങനെ കൈകാര്യം ചെയ്യാം, വിൽപ്പന എങ്ങനെ രേഖപ്പെടുത്താം?",
    },
    answer: {
      en: "In My Listings, mark an item Booked once a buyer commits, then Confirm Sale once it's paid for — this updates your remaining stock and records the sale for your Dashboard, which tracks revenue, profit, and units sold.",
      ml: "'My Listings'-ൽ, ഒരു വാങ്ങുന്നയാൾ ഉറപ്പിച്ചാൽ ഐറ്റം 'Booked' ആയി മാർക്ക് ചെയ്യുക, പണം ലഭിച്ചാൽ 'Confirm Sale' അമർത്തുക — ഇത് ബാക്കിയുള്ള സ്റ്റോക്ക് അപ്ഡേറ്റ് ചെയ്യുകയും വിൽപ്പന നിങ്ങളുടെ Dashboard-ൽ രേഖപ്പെടുത്തുകയും ചെയ്യും (വരുമാനം, ലാഭം, വിറ്റ എണ്ണം എന്നിവ ട്രാക്ക് ചെയ്യുന്നു).",
    },
  },
  {
    question: {
      en: "How do reviews work?",
      ml: "റിവ്യൂ എങ്ങനെ പ്രവർത്തിക്കുന്നു?",
    },
    answer: {
      en: "After dealing with a seller, buyers can leave a star rating and comment on that listing's page. Reviews are tied to the seller, so they build up a reputation across all their listings — you can't review your own listing.",
      ml: "ഒരു വിൽപ്പനക്കാരനുമായി ഇടപാട് കഴിഞ്ഞാൽ, ആ ലിസ്റ്റിംഗിന്റെ പേജിൽ വാങ്ങുന്നവർക്ക് സ്റ്റാർ റേറ്റിംഗും കമന്റും നൽകാം. റിവ്യൂകൾ വിൽപ്പനക്കാരനുമായി ബന്ധപ്പെട്ടതാണ്, അതിനാൽ അവരുടെ എല്ലാ ലിസ്റ്റിംഗുകളിലും ഇത് പ്രശസ്തി ഉണ്ടാക്കുന്നു — സ്വന്തം ലിസ്റ്റിംഗിന് റിവ്യൂ നൽകാൻ കഴിയില്ല.",
    },
  },
  {
    question: {
      en: "How does my district/location work?",
      ml: "എന്റെ ഡിസ്ട്രിക്റ്റ്/ലൊക്കേഷൻ എങ്ങനെ പ്രവർത്തിക്കുന്നു?",
    },
    answer: {
      en: "Your district is set automatically from your location when you register, and it's applied to every listing and request you post. Buyers can filter by district to find parts near them — so keep your profile district accurate in User → Profile if you move.",
      ml: "രജിസ്റ്റർ ചെയ്യുമ്പോൾ നിങ്ങളുടെ ലൊക്കേഷനിൽ നിന്ന് ഡിസ്ട്രിക്റ്റ് സ്വയമേവ സെറ്റ് ചെയ്യപ്പെടും, ഇത് നിങ്ങൾ പോസ്റ്റ് ചെയ്യുന്ന എല്ലാ ലിസ്റ്റിംഗിലും റിക്വസ്റ്റിലും ചേർക്കും. അടുത്തുള്ള പാർട്സ് കണ്ടെത്താൻ വാങ്ങുന്നവർക്ക് ഡിസ്ട്രിക്റ്റ് ഫിൽട്ടർ ചെയ്യാം — അതിനാൽ താമസസ്ഥലം മാറിയാൽ 'User → Profile'-ൽ ഡിസ്ട്രിക്റ്റ് കൃത്യമായി അപ്ഡേറ്റ് ചെയ്യുക.",
    },
  },
];

export const FIELD_HINTS = {
  addSpare: {
    photo: {
      en: "Add a clear photo — our AI will try to auto-fill the title, category, and vehicle.",
      ml: "വ്യക്തമായ ഫോട്ടോ ചേർക്കുക — ടൈറ്റിൽ, കാറ്റഗറി, വാഹനം എന്നിവ എഐ സ്വയമേവ പൂരിപ്പിക്കാൻ ശ്രമിക്കും.",
    },
    vehicleLink: {
      en: "Already registered the donor vehicle? Link it here so buyers see every part from the same car.",
      ml: "വാഹനം നേരത്തെ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ടെങ്കിൽ ഇവിടെ ലിങ്ക് ചെയ്യുക — അതേ കാറിൽ നിന്നുള്ള എല്ലാ പാർട്സും വാങ്ങുന്നവർക്ക് കാണാം.",
    },
    acquisitionCost: {
      en: "What you paid for this part — used only to calculate your profit on the Dashboard, buyers never see it.",
      ml: "ഈ പാർട്ടിന് നിങ്ങൾ നൽകിയ വില — Dashboard-ൽ ലാഭം കണക്കാക്കാൻ മാത്രം ഉപയോഗിക്കുന്നു, വാങ്ങുന്നവർ ഇത് കാണില്ല.",
    },
  },
  makeRequest: {
    vehicleInfo: {
      en: "The more specific you are, the easier it is for sellers to match your request.",
      ml: "കൂടുതൽ കൃത്യമായി നൽകുന്തോറും വിൽപ്പനക്കാർക്ക് നിങ്ങളുടെ ആവശ്യം കണ്ടെത്താൻ എളുപ്പമാകും.",
    },
    budget: {
      en: "An approximate budget helps sellers decide if it's worth reaching out.",
      ml: "ഏകദേശ ബഡ്ജറ്റ് നൽകുന്നത് ബന്ധപ്പെടണോ എന്ന് വിൽപ്പനക്കാർക്ക് തീരുമാനിക്കാൻ സഹായിക്കും.",
    },
  },
  addVehicle: {
    photos: {
      en: "Multiple angles — front, rear, sides, engine bay — help buyers trust the listing.",
      ml: "പല ആംഗിളുകളിൽ (മുൻവശം, പിൻവശം, വശങ്ങൾ, എഞ്ചിൻ) ഫോട്ടോ ചേർക്കുന്നത് വാങ്ങുന്നവരുടെ വിശ്വാസം വർധിപ്പിക്കും.",
    },
    vin: {
      en: "Optional today, but helps with accurate part-matching as spareX grows.",
      ml: "ഇപ്പോൾ നിർബന്ധമില്ല, പക്ഷേ ഭാവിയിൽ കൃത്യമായ പാർട്ട് പൊരുത്തപ്പെടുത്തലിന് സഹായകമാകും.",
    },
    acquisitionReason: {
      en: "Helps buyers understand the vehicle's history and part condition.",
      ml: "വാഹനത്തിന്റെ ചരിത്രവും പാർട്ടുകളുടെ അവസ്ഥയും മനസ്സിലാക്കാൻ വാങ്ങുന്നവരെ സഹായിക്കുന്നു.",
    },
  },
} as const;
