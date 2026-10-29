CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  documents TEXT NOT NULL DEFAULT '',
  steps TEXT NOT NULL DEFAULT '',
  official_url TEXT NOT NULL DEFAULT '',
  reviewed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  icon TEXT NOT NULL DEFAULT '◎',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Submitted'
    CHECK (status IN ('Submitted','Under Review','In Progress','Action Required','Resolved','Closed')),
  is_demo BOOLEAN NOT NULL DEFAULT TRUE,
  phone_number TEXT,
  lookup_pin_salt TEXT,
  lookup_pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grievance_lookup_attempts (
  id BIGSERIAL PRIMARY KEY,
  phone_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS grievance_lookup_attempts_time_idx ON grievance_lookup_attempts (attempted_at);

CREATE TABLE IF NOT EXISTS grievance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO services (id,title,category,description,documents,steps,official_url,reviewed_on,icon) VALUES
('svc-water','Water Supply & Sanitation','Water & sanitation','Guidance for reporting irregular water supply, drainage and sanitation concerns. Verify local procedures with your municipal body.','Location, issue description, dates, optional non-sensitive photos','Describe the issue; identify the local body; check its official complaint channel.','https://www.india.gov.in/','2026-10-28','◉'),
('svc-roads','Roads & Streetlights','Roads & streetlights','Guidance for reporting damaged roads, potholes or non-working streetlights to the relevant local authority.','Location or landmark, issue description, optional photo','Record the location; identify the responsible local authority; use its official channel.','https://www.india.gov.in/','2026-10-28','⌁'),
('svc-cert','Certificates & Documents','Certificates & documents','Find general guidance for locating official information about certificates and public documents.','Document type and issuing authority; requirements vary','Identify the certificate; check the issuing authority’s official instructions.','https://www.india.gov.in/','2026-10-28','▤'),
('svc-health','Public Health Services','Public health','Navigate public health information and identify the relevant official health department or facility.','General issue details; avoid sharing medical identifiers','Check the state health department or official facility information.','https://www.mohfw.gov.in/','2026-10-28','✚'),
('svc-education','Education Services','Education','Find official information for public education services, school-related issues and education department contacts.','Institution, district and a brief description','Identify the institution and relevant education authority; verify official procedures.','https://www.education.gov.in/','2026-10-28','▣'),
('svc-electricity','Electricity Supply','Electricity','Guidance for finding the correct electricity distribution provider and its official complaint channel.','Service area, issue description, optional consumer reference kept private','Identify the distribution provider; use its official website or helpline.','https://powermin.gov.in/','2026-10-28','ϟ'),
('svc-welfare','Social Welfare Schemes','Welfare','Explore general government welfare information and find the official scheme or department page.','Scheme name and broad eligibility details; no sensitive IDs','Identify the scheme; confirm eligibility and documents on its official page.','https://www.india.gov.in/','2026-10-28','♡'),
('svc-housing','Housing & Municipal Services','Housing','Find public information about housing services and local municipal processes.','Locality, service type and a short description','Identify the responsible local or state authority and check its official guidance.','https://www.india.gov.in/','2026-10-28','⌂'),
('svc-transport','Transport Services','Transport','Navigate public transport and transport department information using official resources.','Route, service and location details as applicable','Identify the transport provider or department; check its official contact page.','https://morth.nic.in/','2026-10-28','↗'),
('svc-agri','Agriculture Support','Agriculture','Find official agriculture department information and public support resources for farmers.','Crop or service topic and district; avoid sensitive financial data','Check the state agriculture department and the relevant official scheme page.','https://agriwelfare.gov.in/','2026-10-28','✿'),
('svc-ration','Food & Public Distribution','Food distribution','Find official information about public distribution and food-related government services.','State, district and broad service issue','Check the official food and public distribution authority for your state.','https://dfpd.gov.in/','2026-10-28','◈'),
('svc-pension','Pension Information','Social security','Locate official pension scheme information and the relevant public authority.','Scheme type and broad circumstances; avoid sharing account details','Identify the scheme and confirm eligibility and process on the official source.','https://www.india.gov.in/','2026-10-28','◷'),
('svc-women','Women & Child Services','Public welfare','Find official information for women and child-related public services and support.','General topic and location; do not share identifying sensitive details','Use the relevant official department or verified support resource.','https://wcd.gov.in/','2026-10-28','♡'),
('svc-labour','Labour & Employment','Employment','Find official labour and employment information, including relevant department resources.','General employment issue and location','Identify the appropriate state or central authority and verify its official process.','https://labour.gov.in/','2026-10-28','▥'),
('svc-grievance','Central Public Grievances','Grievance redressal','Learn about the official central public grievance channel and distinguish it from this demo tracker.','Details required by the official portal may differ; check its instructions','Visit CPGRAMS directly for official grievance registration and tracking.','https://pgportal.gov.in/','2026-10-28','◎')
ON CONFLICT (id) DO NOTHING;
