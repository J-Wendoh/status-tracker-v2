-- =========================
-- Insert Departments
-- =========================
insert into departments_sagas (name, type) values
('International Law Division', 'department'),
('Government Transaction Division', 'department'),
('Legal Advisory and Research Division', 'department'),
('Legislative Drafting', 'department'),
('Civil Litigation', 'department'),
('Marriages', 'department'),
('Registrar Coat of Arms and Adoption', 'department'),
('Registrar Societies', 'department'),
('Probate and Administration Department', 'department'),
('Advocates Complaint Commission', 'department');

-- =========================
-- Insert SAGAs
-- =========================
insert into departments_sagas (name, type) values
('Business Registration Services', 'saga'),
('Assets Recovery Agency', 'saga'),
('National Legal Aid Services', 'saga'),
('National Council for Law Reporting', 'saga'),
('Kenya School of Law', 'saga'),
('Council for Legal Education', 'saga'),
('Auctioneers Licensing Board', 'saga'),
('Nairobi Center for International Arbitration', 'saga'),
('Kenya Law Reform Commission', 'saga');

-- =========================
-- Services for Departments
-- =========================

-- International Law Division
insert into services (department_or_saga_id, name)
select id, 'Legal Opinions and Advisories on Agreements'
from departments_sagas where name='International Law Division';
insert into services (department_or_saga_id, name)
select id, 'Cabinet Memoranda reviewed'
from departments_sagas where name='International Law Division';
insert into services (department_or_saga_id, name)
select id, 'Matters on Judicial Cooperation and International Criminal Justice'
from departments_sagas where name='International Law Division';
insert into services (department_or_saga_id, name)
select id, 'Defending the government in International Arbitration'
from departments_sagas where name='International Law Division';
insert into services (department_or_saga_id, name)
select id, 'Memorandum of Understandings reviewed'
from departments_sagas where name='International Law Division';

-- Government Transaction Division
insert into services (department_or_saga_id, name)
select id, 'MOUs reviewed'
from departments_sagas where name='Government Transaction Division';
insert into services (department_or_saga_id, name)
select id, 'Cabinet Memorandums reviewed'
from departments_sagas where name='Government Transaction Division';
insert into services (department_or_saga_id, name)
select id, 'Legal Opinions/Advisories Issued'
from departments_sagas where name='Government Transaction Division';
insert into services (department_or_saga_id, name)
select id, 'Finance Agreement reviewed'
from departments_sagas where name='Government Transaction Division';
insert into services (department_or_saga_id, name)
select id, 'Procurement Contracts Vetted'
from departments_sagas where name='Government Transaction Division';

-- Legal Advisory and Research Division
insert into services (department_or_saga_id, name)
select id, 'Cabinet Memoranda reviewed'
from departments_sagas where name='Legal Advisory and Research Division';
insert into services (department_or_saga_id, name)
select id, 'Legal Advisories and Opinions'
from departments_sagas where name='Legal Advisory and Research Division';
insert into services (department_or_saga_id, name)
select id, 'Memorandum of Understandings'
from departments_sagas where name='Legal Advisory and Research Division';

-- Legislative Drafting
insert into services (department_or_saga_id, name)
select id, 'Published Acts'
from departments_sagas where name='Legislative Drafting';
insert into services (department_or_saga_id, name)
select id, 'Published Legal Notices'
from departments_sagas where name='Legislative Drafting';
insert into services (department_or_saga_id, name)
select id, 'Published Gazette Notices'
from departments_sagas where name='Legislative Drafting';
insert into services (department_or_saga_id, name)
select id, 'Total Correspondences received'
from departments_sagas where name='Legislative Drafting';

-- Civil Litigation
insert into services (department_or_saga_id, name)
select id, 'Total cases recorded'
from departments_sagas where name='Civil Litigation';
insert into services (department_or_saga_id, name)
select id, 'Total cases concluded'
from departments_sagas where name='Civil Litigation';

-- Marriages
insert into services (department_or_saga_id, name)
select id, 'Solemnization of Civil marriages'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Issuance of Registrar’s certificate for Christian and Hindu marriages'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Issuance of Special license for Church and Hindu marriages'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Registration of Christian marriages'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Registration of Hindu marriages'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Registration of Customary marriages'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Issuance of Certified Copies of an Entry of Marriage'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Issuance of a Certificate of No Impediment to Marriage'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Licensing of Christian, Hindu and Muslim Ministers of faith'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Issuance of marriage books for Christian, Hindu and Muslim marriages'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Registration of foreign marriages'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Registration of Divorces'
from departments_sagas where name='Marriages';
insert into services (department_or_saga_id, name)
select id, 'Determination of objections'
from departments_sagas where name='Marriages';

-- Registrar Coat of Arms and Adoption
insert into services (department_or_saga_id, name)
select id, 'Registration of Coat of Arms (Heraldic representations)'
from departments_sagas where name='Registrar Coat of Arms and Adoption';
insert into services (department_or_saga_id, name)
select id, 'Adoptions'
from departments_sagas where name='Registrar Coat of Arms and Adoption';

-- Registrar Societies
insert into services (department_or_saga_id, name)
select id, 'Societies registered under societies Act'
from departments_sagas where name='Registrar Societies';
insert into services (department_or_saga_id, name)
select id, 'Number of New Files Opened'
from departments_sagas where name='Registrar Societies';
insert into services (department_or_saga_id, name)
select id, 'Summary Certificates Issued'
from departments_sagas where name='Registrar Societies';

-- Probate and Administration Department
insert into services (department_or_saga_id, name)
select id, 'Certificate of Confirmation of Grant received'
from departments_sagas where name='Probate and Administration Department';
insert into services (department_or_saga_id, name)
select id, 'Estates Finalized'
from departments_sagas where name='Probate and Administration Department';
insert into services (department_or_saga_id, name)
select id, 'Trust Opened'
from departments_sagas where name='Probate and Administration Department';
insert into services (department_or_saga_id, name)
select id, 'Trust Deeds Prepared and Sealed'
from departments_sagas where name='Probate and Administration Department';
insert into services (department_or_saga_id, name)
select id, 'Trusts Terminated'
from departments_sagas where name='Probate and Administration Department';

-- Advocates Complaint Commission
insert into services (department_or_saga_id, name)
select id, 'Total new Complaints'
from departments_sagas where name='Advocates Complaint Commission';
insert into services (department_or_saga_id, name)
select id, 'Total Prosecutions'
from departments_sagas where name='Advocates Complaint Commission';
insert into services (department_or_saga_id, name)
select id, 'Total Inhouse Dispute Resolutions'
from departments_sagas where name='Advocates Complaint Commission';
insert into services (department_or_saga_id, name)
select id, 'Total Amount Recovered'
from departments_sagas where name='Advocates Complaint Commission';

-- =========================
-- Services for SAGAs
-- =========================

-- Business Registration Services
insert into services (department_or_saga_id, name)
select id, 'Business Entities Registered'
from departments_sagas where name='Business Registration Services';
insert into services (department_or_saga_id, name)
select id, 'Revenue Collected from Service Fees'
from departments_sagas where name='Business Registration Services';
insert into services (department_or_saga_id, name)
select id, 'Average Number of Days taken to register a private Company'
from departments_sagas where name='Business Registration Services';
insert into services (department_or_saga_id, name)
select id, 'Movable property Security rights notices registered'
from departments_sagas where name='Business Registration Services';

-- Assets Recovery Agency
insert into services (department_or_saga_id, name)
select id, 'Suspected Proceeds of Crime traced and Identified'
from departments_sagas where name='Assets Recovery Agency';
insert into services (department_or_saga_id, name)
select id, 'Suspected proceeds of crime preserved'
from departments_sagas where name='Assets Recovery Agency';
insert into services (department_or_saga_id, name)
select id, 'Proceeds of Crime forfeited to Government'
from departments_sagas where name='Assets Recovery Agency';

-- National Legal Aid Services
insert into services (department_or_saga_id, name)
select id, 'Number of Indigent Persons Offered Legal Aid'
from departments_sagas where name='National Legal Aid Services';
insert into services (department_or_saga_id, name)
select id, 'Legal Aid regulations and Scale of Fees developed'
from departments_sagas where name='National Legal Aid Services';
insert into services (department_or_saga_id, name)
select id, 'Legal Aid Offices Operationalized'
from departments_sagas where name='National Legal Aid Services';

-- National Council for Law Reporting
insert into services (department_or_saga_id, name)
select id, 'Number of Laws of Kenya, Volumes Published'
from departments_sagas where name='National Council for Law Reporting';
insert into services (department_or_saga_id, name)
select id, 'Specialized publications published'
from departments_sagas where name='National Council for Law Reporting';
insert into services (department_or_saga_id, name)
select id, 'Completion of the ICT Systems on Specialized Publications'
from departments_sagas where name='National Council for Law Reporting';

-- Kenya School of Law
insert into services (department_or_saga_id, name)
select id, 'No. of lawyers trained under the Advocates Training Programme (ATP)'
from departments_sagas where name='Kenya School of Law';
insert into services (department_or_saga_id, name)
select id, 'No. of students trained under the paralegal Training Programme (PTP)'
from departments_sagas where name='Kenya School of Law';
insert into services (department_or_saga_id, name)
select id, 'No. of community paralegals trained'
from departments_sagas where name='Kenya School of Law';
insert into services (department_or_saga_id, name)
select id, 'No. of Continuing Professional Development (CPD) courses delivered'
from departments_sagas where name='Kenya School of Law';

-- Council for Legal Education
insert into services (department_or_saga_id, name)
select id, 'No. of candidates examined on Advocates Training Programme (ATP)'
from departments_sagas where name='Council for Legal Education';
insert into services (department_or_saga_id, name)
select id, 'Qualified ATP candidates gazetted for admission to the Roll of Advocates'
from departments_sagas where name='Council for Legal Education';
insert into services (department_or_saga_id, name)
select id, 'No. of Quality assurance audits conducted to legal education providers'
from departments_sagas where name='Council for Legal Education';
insert into services (department_or_saga_id, name)
select id, 'No. of on-site inspections conducted on legal education providers'
from departments_sagas where name='Council for Legal Education';

-- Auctioneers Licensing Board
insert into services (department_or_saga_id, name)
select id, 'Licenses Issued to Qualified Applicants'
from departments_sagas where name='Auctioneers Licensing Board';
insert into services (department_or_saga_id, name)
select id, 'Numbers Of Auctioneers Inspected'
from departments_sagas where name='Auctioneers Licensing Board';
insert into services (department_or_saga_id, name)
select id, 'Cases Filed against the Auctioneers resolved'
from departments_sagas where name='Auctioneers Licensing Board';

-- Nairobi Center for International Arbitration
insert into services (department_or_saga_id, name)
select id, 'New Disputes on Commercial Contracts registered'
from departments_sagas where name='Nairobi Center for International Arbitration';
insert into services (department_or_saga_id, name)
select id, 'Ongoing Claims on Commercial Contracts'
from departments_sagas where name='Nairobi Center for International Arbitration';
insert into services (department_or_saga_id, name)
select id, 'Disputes on Commercial Contracts Finalized'
from departments_sagas where name='Nairobi Center for International Arbitration';
insert into services (department_or_saga_id, name)
select id, 'No of Practitioners Trained in ADR'
from departments_sagas where name='Nairobi Center for International Arbitration';

-- Kenya Law Reform Commission (no detailed services in PDF but we seed placeholder)
insert into services (department_or_saga_id, name)
select id, 'Law Reform Projects'
from departments_sagas where name='Kenya Law Reform Commission';
