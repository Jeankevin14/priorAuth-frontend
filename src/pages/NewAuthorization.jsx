import { useState } from 'react';
import { ArrowUpRight, Check, ChevronRight, CircleHelp, FileText, Search, ShieldCheck, Sparkles, UploadCloud, X } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { Badge, Card } from '../components/ui';
import { Field, Stepper } from '../components/authorization/FormPrimitives';
import Processing from './Processing';
import { requests } from '../data/requests';
import { useAuth } from '../hooks/useAuth';

const initialFormData = {
  patientId: '', dob: '', firstName: '', lastName: '', age: '', sex: 'Female', phone: '', email: '',
  diagnosis: '', icd10: '', secondaryDiagnoses: '', duration: '', symptoms: '', clinicalJustification: '',
  serviceType: 'Imaging', procedure: '', procedureCode: '', requestedDate: '', urgency: 'Routine', careSetting: 'Outpatient',
  insuranceProvider: '', planName: '', memberId: '', planId: '', policyType: 'Medicare', coverageType: 'Active'
};

function buildRequest(formData, ownerId) {
  const patientName = `${formData.firstName} ${formData.lastName}`.trim() || 'New patient';
  const initials = patientName.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'NP';
  const highestId = requests.reduce((max, r) => { const n = parseInt(r.id.replace('PA-', ''), 10); return Number.isFinite(n) && n > max ? n : max; }, 0);
  const id = `PA-${highestId + 1}`;
  const date = `Today, ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  const diagnosisLabel = formData.diagnosis || 'the submitted diagnosis';
  const serviceLabel = formData.procedure || formData.serviceType;
  const policyName = formData.insuranceProvider ? `${formData.insuranceProvider} coverage policy` : 'Demo coverage policy';

  return {
    id, ownerId, patient: patientName, initials, patientId: formData.patientId || id,
    memberId: formData.memberId, age: formData.age, sex: formData.sex, dateOfBirth: formData.dob,
    insuranceProvider: formData.insuranceProvider || 'Not specified',
    planName: formData.planName, planId: formData.planId, coverageStatus: formData.coverageType,
    policyName, policyId: 'POL-' + id, policyType: formData.policyType, policyEffective: 'Jan 2026',
    diagnosis: formData.diagnosis || 'Not specified', icd10: formData.icd10, secondaryDiagnoses: formData.secondaryDiagnoses || 'None reported',
    clinicalHistory: formData.clinicalJustification || 'No clinical justification provided.',
    service: serviceLabel || 'Not specified', procedureCode: formData.procedureCode, urgency: formData.urgency, careSetting: formData.careSetting,
    prediction: 'Nurse review', confidence: '85%', status: 'Pending review', date, lastUpdated: date,
    tone: 'blue', stage: 'ML triage', decision: 'Nurse Review',
    decisionExplanation: 'The request is within policy scope, but prior treatment documentation needs review before a final decision.',
    missingInformation: 'Documentation of prior conservative treatment',
    documents: [['Clinical_Notes.pdf', 'Analyzed'], ['Previous_Treatment.pdf', 'Missing']],
    timeline: ['Submitted', 'Under Review', 'Decision pending'],
    resultDetail: {
      icon: 'clock', reviewBadge: 'Review recommended', reviewBadgeTone: 'blue', headline: 'Pend for nurse review',
      headlineNote: 'Additional clinical evidence is suggested before a final human decision.',
      whyText: `The request for ${diagnosisLabel} meets several policy-aligned criteria, but the available record does not clearly establish completion of conservative treatment.`,
      reasons: [
        ['green', `Diagnosis (${diagnosisLabel}) aligns with retrieved coverage criteria`, 'Evidence 01'],
        ['green', `Requested service (${serviceLabel || 'service'}) is represented in policy scope`, 'Evidence 02'],
        ['amber', 'Prior treatment history needs reviewer verification', 'Document check']
      ],
      complianceScore: 82,
      criteria: [
        ['Diagnosis covered', 'PASS', 'green'], ['Requested service covered', 'PASS', 'green'], ['Required documentation', 'PASS', 'green'],
        ['Previous treatment', 'MISSING', 'amber'], ['Clinical evidence', 'REVIEW', 'blue']
      ],
      distribution: { approve: 10, nurseReview: 87, moreInfo: 3 },
      missingEvidenceText: 'Documentation of prior conservative treatment',
      policyEvidence: {
        name: policyName, type: formData.policyType || 'Not specified', effective: 'Jan 2026',
        summary: 'Demo evidence summary: this request may require documented clinical findings and relevant prior treatment context. Connect your policy source to view authoritative content.',
        relevance: 90
      },
      workbench: [
        ['Policy agent', 'Policy identified'], ['Evidence agent', '2 relevant evidence items retrieved'],
        ['Document agent', '2 documents analyzed'], ['Coverage agent', '5 criteria evaluated'], ['Triage model', 'Recommendation generated']
      ]
    }
  };
}

function PatientStep({ formData, set }){return <><div className="form-title"><div><p className="eyebrow">STEP 1 OF 7</p><h2>Patient information</h2><p>Identify the patient or create a new patient record.</p></div><button className="button compact"><Search size={15}/>Search existing patient</button></div><div className="connected"><Check size={16}/><span><strong>FHIR patient record connected</strong><small>Patient demographics verified from your clinical system</small></span></div><div className="fields"><Field label="Patient ID" placeholder="PAT-009821" value={formData.patientId} onChange={set('patientId')}/><Field label="Date of birth" placeholder="MM / DD / YYYY" value={formData.dob} onChange={set('dob')}/><Field label="First name" placeholder="Maya" value={formData.firstName} onChange={set('firstName')}/><Field label="Last name" placeholder="Rodriguez" value={formData.lastName} onChange={set('lastName')}/><Field label="Age" placeholder="58" value={formData.age} onChange={set('age')}/><label className="field"><span>Sex</span><select value={formData.sex} onChange={set('sex')}><option>Female</option><option>Male</option></select></label><Field label="Phone" placeholder="(415) 555-0128" value={formData.phone} onChange={set('phone')}/><Field label="Email" placeholder="maya.rodriguez@example.com" wide value={formData.email} onChange={set('email')}/></div></>}
function ClinicalStep({ formData, set }){return <><div className="form-title"><div><p className="eyebrow">STEP 2 OF 7</p><h2>Clinical information</h2><p>Provide the clinical context for this authorization request.</p></div></div><div className="fields"><Field label="Primary diagnosis" placeholder="Knee osteoarthritis" value={formData.diagnosis} onChange={set('diagnosis')}/><Field label="ICD-10 code" placeholder="M17.11" value={formData.icd10} onChange={set('icd10')}/><Field label="Secondary diagnoses" placeholder="Search and select diagnoses" wide value={formData.secondaryDiagnoses} onChange={set('secondaryDiagnoses')}/><Field label="Duration of symptoms" placeholder="e.g. 6 months" value={formData.duration} onChange={set('duration')}/><Field label="Clinical symptoms" placeholder="Pain, limited mobility" wide value={formData.symptoms} onChange={set('symptoms')}/></div><label className="field textarea"><span>Clinical justification</span><textarea placeholder="Describe the patient’s condition, prior treatments, and clinical rationale for the requested service…" value={formData.clinicalJustification} onChange={set('clinicalJustification')}/></label><div className="ai-note"><Sparkles size={17}/><span><strong>AI-readable clinical summary</strong><small>A concise summary will be generated after submission for your review.</small></span></div></>}
function TreatmentStep({ formData, set, choose }){return <><div className="form-title"><div><p className="eyebrow">STEP 3 OF 7</p><h2>Requested service</h2><p>Tell us what is being requested and where it will be delivered.</p></div></div><div className="choice-row">{['Procedure','Imaging','Medication','Therapy','Specialist service'].map(x=><button type="button" className={`choice ${formData.serviceType===x?'chosen':''}`} key={x} onClick={()=>choose('serviceType')(x)}>{x}</button>)}</div><div className="fields"><Field label="Requested procedure" placeholder="MRI lower extremity" wide value={formData.procedure} onChange={set('procedure')}/><Field label="Procedure code / CPT / HCPCS" placeholder="73721" value={formData.procedureCode} onChange={set('procedureCode')}/><Field label="Requested date" placeholder="MM / DD / YYYY" value={formData.requestedDate} onChange={set('requestedDate')}/><label className="field"><span>Urgency</span><select value={formData.urgency} onChange={set('urgency')}><option>Routine</option><option>Urgent</option><option>Emergency</option></select></label><label className="field"><span>Care setting</span><select value={formData.careSetting} onChange={set('careSetting')}><option>Outpatient</option><option>Inpatient</option></select></label></div></>}
function InsuranceStep({ formData, set }){return <><div className="form-title"><div><p className="eyebrow">STEP 4 OF 7</p><h2>Insurance & policy</h2><p>Enter member coverage details. Policy evidence is retrieved only after submission.</p></div></div><div className="fields"><Field label="Insurance provider" placeholder="Meridian Health Plan" value={formData.insuranceProvider} onChange={set('insuranceProvider')}/><Field label="Plan name" placeholder="Medicare Advantage Plus" value={formData.planName} onChange={set('planName')}/><Field label="Member ID" placeholder="MHP-8821094" value={formData.memberId} onChange={set('memberId')}/><Field label="Plan ID" placeholder="MA-2026-CA" value={formData.planId} onChange={set('planId')}/><label className="field"><span>Policy type</span><select value={formData.policyType} onChange={set('policyType')}><option>Medicare</option><option>Commercial</option></select></label><label className="field"><span>Coverage type</span><select value={formData.coverageType} onChange={set('coverageType')}><option>Active</option><option>Unknown</option></select></label></div><div className="policy-wait"><ShieldCheck size={19}/><div><strong>Policy intelligence</strong><span>Waiting for policy retrieval after submission</span></div><Badge>Not evaluated</Badge></div></>}
function DocumentsStep(){return <><div className="form-title"><div><p className="eyebrow">STEP 5 OF 7</p><h2>Supporting documents</h2><p>Upload documentation that supports this request.</p></div></div><div className="uploader"><UploadCloud size={28}/><strong>Drop documents here, or <u>browse files</u></strong><span>PDF, DOCX, PNG, or JPG · Maximum file size 20 MB</span></div><div className="doc-row"><div className="doc-icon"><FileText size={19}/></div><div><strong>Clinical_Notes.pdf</strong><small>Clinical notes · 2.4 MB</small></div><Badge type="green"><Check size={12}/>Uploaded</Badge><button><X size={16}/></button></div><div className="doc-row warn"><div className="doc-icon"><FileText size={19}/></div><div><strong>Previous_Treatment.pdf</strong><small>Treatment records · 1.1 MB</small></div><Badge type="amber">Evidence check pending</Badge><button><X size={16}/></button></div></>}
function ReviewStep({ formData }){const patientName=`${formData.firstName} ${formData.lastName}`.trim();const rows=[['Patient',[patientName||'Not provided',formData.age&&`${formData.age} years`,formData.sex].filter(Boolean).join(' · '),patientName?'green':'amber'],['Clinical information',[formData.diagnosis||'Not provided',formData.icd10].filter(Boolean).join(' · '),formData.diagnosis?'green':'amber'],['Requested service',[formData.procedure||formData.serviceType||'Not provided',formData.procedureCode&&`CPT ${formData.procedureCode}`].filter(Boolean).join(' · '),formData.procedure?'green':'amber'],['Insurance',[formData.insuranceProvider||'Not provided',formData.coverageType&&`${formData.coverageType} coverage`].filter(Boolean).join(' · '),formData.insuranceProvider?'green':'amber'],['Documents','2 supporting documents attached','amber']];return <><div className="form-title"><div><p className="eyebrow">STEP 6 OF 7</p><h2>Review request</h2><p>Confirm the details below before submitting for AI triage.</p></div></div>{rows.map(x=><div className="review-row" key={x[0]}><span className={`review-check ${x[2]}`}><Check size={14}/></span><div><strong>{x[0]}</strong><small>{x[1]}</small></div><ChevronRight size={16}/></div>)}</>}
function AsideHelp({step}){return <aside className="aside-help"><Card><div className="help-icon"><CircleHelp size={18}/></div><h3>Request guidance</h3><p>{step===0?'Search to prefill patient details from your connected clinical system.':step===4?'Add clinical notes and prior-treatment records when they support medical necessity.':'Only the information needed for this step is shown. You can edit it before submission.'}</p><a>Learn about authorizations <ArrowUpRight size={13}/></a></Card><div className="privacy"><ShieldCheck size={16}/><span><strong>Protected information</strong><small>Your data is encrypted and access is audited.</small></span></div></aside>}

export default function NewAuthorization(){
  const { user } = useAuth();
  const [step,setStep]=useState(0);
  const [formData,setFormData]=useState(initialFormData);
  const [submittedId,setSubmittedId]=useState(null);
  const set = key => e => setFormData(prev => ({ ...prev, [key]: e.target.value }));
  const choose = key => value => setFormData(prev => ({ ...prev, [key]: value }));
  const submit = () => { const newRequest = buildRequest(formData, user.id); requests.push(newRequest); setSubmittedId(newRequest.id); };

  if(submittedId) return <Processing requestId={submittedId}/>;

  return <AppLayout><div className="page workflow"><div className="crumb">Authorization <ChevronRight size={14}/> <span>New request</span></div><div className="workflow-head"><div><h1>New authorization request</h1><p>Complete the request details. You’ll be able to review everything before it is submitted for AI triage.</p></div><button className="text-button">Save as draft</button></div><Stepper step={step}/><div className="form-layout"><Card className="form-card">{step===0&&<PatientStep formData={formData} set={set}/>}{step===1&&<ClinicalStep formData={formData} set={set}/>}{step===2&&<TreatmentStep formData={formData} set={set} choose={choose}/>}{step===3&&<InsuranceStep formData={formData} set={set}/>}{step===4&&<DocumentsStep/>}{step>=5&&<ReviewStep formData={formData}/>}<div className="form-actions"><button className="button" disabled={step===0} onClick={()=>setStep(step-1)}>Back</button>{step<5?<button className="button primary" onClick={()=>setStep(step+1)}>Continue <ChevronRight size={16}/></button>:<button className="button primary" onClick={submit}><Sparkles size={16}/>Submit for AI triage</button>}</div></Card><AsideHelp step={step}/></div></div></AppLayout>;
}
