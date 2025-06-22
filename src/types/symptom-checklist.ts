export interface SystemSymptom {
  id: string;
  label: string;
  category: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface BodySystem {
  id: string;
  name: string;
  description: string;
  icon: string;
  symptoms: SystemSymptom[];
}

export const BODY_SYSTEMS: BodySystem[] = [
  {
    id: 'constitutional',
    name: 'Constitutional',
    description: 'General symptoms affecting the whole body',
    icon: '🌡️',
    symptoms: [
      { id: 'fever', label: 'Fever or chills', category: 'constitutional' },
      { id: 'fatigue', label: 'Fatigue or weakness', category: 'constitutional' },
      { id: 'weight-loss', label: 'Unexplained weight loss', category: 'constitutional' },
      { id: 'weight-gain', label: 'Unexplained weight gain', category: 'constitutional' },
      { id: 'night-sweats', label: 'Night sweats', category: 'constitutional' },
      { id: 'appetite-loss', label: 'Loss of appetite', category: 'constitutional' },
      { id: 'malaise', label: 'General feeling unwell', category: 'constitutional' }
    ]
  },
  {
    id: 'eyes',
    name: 'Eyes',
    description: 'Vision and eye-related symptoms',
    icon: '👁️',
    symptoms: [
      { id: 'vision-blurry', label: 'Blurry vision', category: 'eyes' },
      { id: 'vision-double', label: 'Double vision', category: 'eyes' },
      { id: 'eye-pain', label: 'Eye pain', category: 'eyes' },
      { id: 'eye-redness', label: 'Eye redness', category: 'eyes' },
      { id: 'eye-discharge', label: 'Eye discharge', category: 'eyes' },
      { id: 'light-sensitivity', label: 'Light sensitivity', category: 'eyes' },
      { id: 'vision-loss', label: 'Vision loss or changes', category: 'eyes' },
      { id: 'floaters', label: 'Floaters or flashes', category: 'eyes' }
    ]
  },
  {
    id: 'ent',
    name: 'Ears, Nose, Throat',
    description: 'ENT and mouth symptoms',
    icon: '👂',
    symptoms: [
      { id: 'ear-pain', label: 'Ear pain', category: 'ent' },
      { id: 'hearing-loss', label: 'Hearing loss', category: 'ent' },
      { id: 'tinnitus', label: 'Ringing in ears', category: 'ent' },
      { id: 'nasal-congestion', label: 'Nasal congestion', category: 'ent' },
      { id: 'runny-nose', label: 'Runny nose', category: 'ent' },
      { id: 'sore-throat', label: 'Sore throat', category: 'ent' },
      { id: 'hoarseness', label: 'Hoarseness', category: 'ent' },
      { id: 'difficulty-swallowing', label: 'Difficulty swallowing', category: 'ent' },
      { id: 'sinus-pressure', label: 'Sinus pressure/pain', category: 'ent' }
    ]
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    description: 'Heart and circulation symptoms',
    icon: '❤️',
    symptoms: [
      { id: 'chest-pain', label: 'Chest pain or discomfort', category: 'cardiovascular' },
      { id: 'palpitations', label: 'Heart palpitations', category: 'cardiovascular' },
      { id: 'irregular-heartbeat', label: 'Irregular heartbeat', category: 'cardiovascular' },
      { id: 'sob-exertion', label: 'Shortness of breath with exertion', category: 'cardiovascular' },
      { id: 'sob-lying', label: 'Shortness of breath when lying down', category: 'cardiovascular' },
      { id: 'leg-swelling', label: 'Leg swelling', category: 'cardiovascular' },
      { id: 'leg-pain-walking', label: 'Leg pain when walking', category: 'cardiovascular' },
      { id: 'fainting', label: 'Fainting or near-fainting', category: 'cardiovascular' }
    ]
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    description: 'Breathing and lung symptoms',
    icon: '🫁',
    symptoms: [
      { id: 'cough', label: 'Cough', category: 'respiratory' },
      { id: 'cough-blood', label: 'Coughing up blood', category: 'respiratory' },
      { id: 'sob-rest', label: 'Shortness of breath at rest', category: 'respiratory' },
      { id: 'wheezing', label: 'Wheezing', category: 'respiratory' },
      { id: 'chest-tightness', label: 'Chest tightness', category: 'respiratory' },
      { id: 'sputum', label: 'Excessive sputum/phlegm', category: 'respiratory' },
      { id: 'breathing-pain', label: 'Pain with breathing', category: 'respiratory' }
    ]
  },
  {
    id: 'gastrointestinal',
    name: 'Gastrointestinal',
    description: 'Digestive system symptoms',
    icon: '🔥',
    symptoms: [
      { id: 'nausea', label: 'Nausea', category: 'gastrointestinal' },
      { id: 'vomiting', label: 'Vomiting', category: 'gastrointestinal' },
      { id: 'diarrhea', label: 'Diarrhea', category: 'gastrointestinal' },
      { id: 'constipation', label: 'Constipation', category: 'gastrointestinal' },
      { id: 'abdominal-pain', label: 'Abdominal pain', category: 'gastrointestinal' },
      { id: 'heartburn', label: 'Heartburn/reflux', category: 'gastrointestinal' },
      { id: 'bloating', label: 'Bloating', category: 'gastrointestinal' },
      { id: 'blood-stool', label: 'Blood in stool', category: 'gastrointestinal' },
      { id: 'black-stool', label: 'Black/tarry stools', category: 'gastrointestinal' },
      { id: 'difficulty-swallowing-food', label: 'Difficulty swallowing food', category: 'gastrointestinal' }
    ]
  },
  {
    id: 'genitourinary',
    name: 'Genitourinary',
    description: 'Kidney, bladder, and reproductive symptoms',
    icon: '💧',
    symptoms: [
      { id: 'urinary-frequency', label: 'Frequent urination', category: 'genitourinary' },
      { id: 'urinary-urgency', label: 'Urgent need to urinate', category: 'genitourinary' },
      { id: 'urinary-pain', label: 'Pain with urination', category: 'genitourinary' },
      { id: 'blood-urine', label: 'Blood in urine', category: 'genitourinary' },
      { id: 'incontinence', label: 'Urinary incontinence', category: 'genitourinary' },
      { id: 'hesitancy', label: 'Difficulty starting urination', category: 'genitourinary' },
      { id: 'pelvic-pain', label: 'Pelvic pain', category: 'genitourinary' },
      { id: 'flank-pain', label: 'Flank/kidney pain', category: 'genitourinary' }
    ]
  },
  {
    id: 'musculoskeletal',
    name: 'Musculoskeletal',
    description: 'Muscle, joint, and bone symptoms',
    icon: '🦴',
    symptoms: [
      { id: 'joint-pain', label: 'Joint pain', category: 'musculoskeletal' },
      { id: 'joint-swelling', label: 'Joint swelling', category: 'musculoskeletal' },
      { id: 'muscle-pain', label: 'Muscle pain', category: 'musculoskeletal' },
      { id: 'muscle-weakness', label: 'Muscle weakness', category: 'musculoskeletal' },
      { id: 'back-pain', label: 'Back pain', category: 'musculoskeletal' },
      { id: 'neck-pain', label: 'Neck pain', category: 'musculoskeletal' },
      { id: 'morning-stiffness', label: 'Morning stiffness', category: 'musculoskeletal' },
      { id: 'limitation-movement', label: 'Limited range of motion', category: 'musculoskeletal' }
    ]
  },
  {
    id: 'integumentary',
    name: 'Integumentary (Skin)',
    description: 'Skin, hair, and nail symptoms',
    icon: '🩹',
    symptoms: [
      { id: 'rash', label: 'Rash', category: 'integumentary' },
      { id: 'itching', label: 'Itching', category: 'integumentary' },
      { id: 'skin-lesions', label: 'Skin lesions or sores', category: 'integumentary' },
      { id: 'skin-color-change', label: 'Skin color changes', category: 'integumentary' },
      { id: 'hair-loss', label: 'Hair loss', category: 'integumentary' },
      { id: 'nail-changes', label: 'Nail changes', category: 'integumentary' },
      { id: 'excessive-sweating', label: 'Excessive sweating', category: 'integumentary' },
      { id: 'dry-skin', label: 'Unusually dry skin', category: 'integumentary' }
    ]
  },
  {
    id: 'neurological',
    name: 'Neurological',
    description: 'Brain and nervous system symptoms',
    icon: '🧠',
    symptoms: [
      { id: 'headache', label: 'Headache', category: 'neurological' },
      { id: 'dizziness', label: 'Dizziness', category: 'neurological' },
      { id: 'seizures', label: 'Seizures', category: 'neurological' },
      { id: 'numbness', label: 'Numbness or tingling', category: 'neurological' },
      { id: 'weakness', label: 'Weakness', category: 'neurological' },
      { id: 'coordination', label: 'Loss of coordination', category: 'neurological' },
      { id: 'memory-loss', label: 'Memory loss', category: 'neurological' },
      { id: 'confusion', label: 'Confusion', category: 'neurological' },
      { id: 'speech-difficulty', label: 'Difficulty speaking', category: 'neurological' },
      { id: 'tremor', label: 'Tremor', category: 'neurological' }
    ]
  },
  {
    id: 'psychiatric',
    name: 'Psychiatric',
    description: 'Mental health symptoms',
    icon: '🧘',
    symptoms: [
      { id: 'anxiety', label: 'Anxiety', category: 'psychiatric' },
      { id: 'depression', label: 'Depression', category: 'psychiatric' },
      { id: 'mood-swings', label: 'Mood swings', category: 'psychiatric' },
      { id: 'insomnia', label: 'Insomnia', category: 'psychiatric' },
      { id: 'excessive-sleep', label: 'Excessive sleep', category: 'psychiatric' },
      { id: 'panic-attacks', label: 'Panic attacks', category: 'psychiatric' },
      { id: 'concentration-difficulty', label: 'Difficulty concentrating', category: 'psychiatric' },
      { id: 'irritability', label: 'Irritability', category: 'psychiatric' }
    ]
  },
  {
    id: 'endocrine',
    name: 'Endocrine',
    description: 'Hormone-related symptoms',
    icon: '⚡',
    symptoms: [
      { id: 'excessive-thirst', label: 'Excessive thirst', category: 'endocrine' },
      { id: 'excessive-hunger', label: 'Excessive hunger', category: 'endocrine' },
      { id: 'heat-intolerance', label: 'Heat intolerance', category: 'endocrine' },
      { id: 'cold-intolerance', label: 'Cold intolerance', category: 'endocrine' },
      { id: 'excessive-hair-growth', label: 'Excessive hair growth', category: 'endocrine' },
      { id: 'menstrual-irregular', label: 'Irregular menstrual periods', category: 'endocrine' },
      { id: 'hot-flashes', label: 'Hot flashes', category: 'endocrine' }
    ]
  },
  {
    id: 'hematologic',
    name: 'Hematologic/Lymphatic',
    description: 'Blood and lymph node symptoms',
    icon: '🩸',
    symptoms: [
      { id: 'easy-bruising', label: 'Easy bruising', category: 'hematologic' },
      { id: 'excessive-bleeding', label: 'Excessive bleeding', category: 'hematologic' },
      { id: 'lymph-nodes', label: 'Swollen lymph nodes', category: 'hematologic' },
      { id: 'pale-skin', label: 'Pale skin', category: 'hematologic' },
      { id: 'frequent-infections', label: 'Frequent infections', category: 'hematologic' },
      { id: 'prolonged-bleeding', label: 'Prolonged bleeding from cuts', category: 'hematologic' }
    ]
  },
  {
    id: 'allergic',
    name: 'Allergic/Immunologic',
    description: 'Allergy and immune system symptoms',
    icon: '🤧',
    symptoms: [
      { id: 'seasonal-allergies', label: 'Seasonal allergies', category: 'allergic' },
      { id: 'food-reactions', label: 'Food reactions', category: 'allergic' },
      { id: 'hives', label: 'Hives', category: 'allergic' },
      { id: 'swelling-face', label: 'Facial swelling', category: 'allergic' },
      { id: 'anaphylaxis', label: 'Severe allergic reactions', category: 'allergic' },
      { id: 'frequent-illness', label: 'Getting sick frequently', category: 'allergic' }
    ]
  }
];
