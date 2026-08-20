const anatomyCategories = [
  { key: 'cardiovascular', keywords: ['cardiac', 'cardiovascular', 'heart', 'coronary'], organ: 'HEART', displayName: 'Cardiovascular System', reason: 'Diagnosis is cardiovascular related' },
  { key: 'pulmonary', keywords: ['pulmonary', 'lung', 'respiratory', 'bronch'], organ: 'LUNGS', displayName: 'Pulmonary System', reason: 'Diagnosis is pulmonary related' },
  { key: 'neurological', keywords: ['neurolog', 'brain', 'migraine', 'seizure'], organ: 'BRAIN', displayName: 'Neurological System', reason: 'Diagnosis is neurological related' },
  { key: 'renal', keywords: ['renal', 'kidney', 'nephro'], organ: 'KIDNEYS', displayName: 'Renal System', reason: 'Diagnosis is renal related' },
  { key: 'hepatic', keywords: ['hepatic', 'liver'], organ: 'LIVER', displayName: 'Hepatic System', reason: 'Diagnosis is hepatic related' },
  { key: 'gastrointestinal', keywords: ['gastro', 'stomach', 'intestinal', 'colon', 'digestive'], organ: 'STOMACH', displayName: 'Gastrointestinal System', reason: 'Diagnosis is gastrointestinal related' },
  { key: 'musculoskeletal', keywords: ['musculoskeletal', 'spine', 'back', 'knee', 'shoulder', 'joint', 'osteoarthritis', 'fracture'], organ: 'SPINE', displayName: 'Musculoskeletal System', reason: 'Diagnosis is musculoskeletal related' }
];

const musculoskeletalTargets = [
  { keywords: ['knee'], organ: 'KNEE', displayName: 'Knee Region' },
  { keywords: ['shoulder'], organ: 'SHOULDER', displayName: 'Shoulder Region' },
  { keywords: ['spine', 'back'], organ: 'SPINE', displayName: 'Spine Region' }
];

export function mapDiagnosisToAnatomy({ diagnosis = '', icdCode = '', procedure = '', bodySite = '', specialty = '', anatomyTarget } = {}) {
  if (anatomyTarget) return { organ: anatomyTarget, displayName: anatomyTarget, reason: 'Anatomy target supplied by the record' };
  const text = [diagnosis, icdCode, procedure, bodySite, specialty].join(' ').toLowerCase();
  const category = anatomyCategories.find(item => item.keywords.some(keyword => text.includes(keyword)));
  if (!category) return { organ: 'GENERAL', displayName: 'General Context', reason: 'No specific anatomy region was identified' };
  if (category.key === 'musculoskeletal') {
    const target = musculoskeletalTargets.find(item => item.keywords.some(keyword => text.includes(keyword)));
    if (target) return { ...target, reason: category.reason };
  }
  return { organ: category.organ, displayName: category.displayName, reason: category.reason };
}
