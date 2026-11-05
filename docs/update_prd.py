from pathlib import Path

from docx import Document
from docx.shared import Inches, Pt
path = Path('Vivatheca PRD.docx')
document = Document(path)

replacements = {
    'Vivatheca is a non-profit, open-source platform offering free, browser-based 3D medical models. It helps clinicians explain conditions and procedures to patients through interactive visualisation, augmented reality, plain-language information and printable physical models. No login, subscription or dedicated application is required.':
        'The Vivatheca platform is a non-profit, open-source library offering free, browser-based 3D medical models. It helps clinicians explain conditions and procedures to patients through interactive visualisation, augmented reality, plain-language information and printable physical models. No login, subscription or dedicated application is required.',
    'Vivatheca provides:': 'The Vivatheca platform provides:',
    'Publications included and shown on the site to show the process for the creation of the tool and the workflow for individual models that have been published in academic peer-reviewed journals':
        'Peer-reviewed publications are cited with accessible verification links. Interpretive AI-generated illustrations may accompany publication records only when visibly disclosed and must not be implied to be figures from the papers.',
    'About Vivatheca': '',
    'Support clearer clinician�patient conversations.': 'Support clearer clinician–patient conversations.',
    'The hero uses the normally oriented heading “Medical models made clear.” The heading and introduction share the same maximum text-block width, while the heading remains substantially larger.':
        'The hero uses the normally oriented two-line heading “Medical models” / “made clear.” at wide viewports. The heading and justified introduction share the same maximum text-block width, while the heading remains substantially larger.',
    'A thin origin strip immediately below the hero states that the platform is founded and operated in Australia and displays the complete official Australian National Flag sourced from the Australian Government.':
        'A paper origin strip immediately below the hero states that the platform is founded and operated in Australia and displays the complete official Australian National Flag sourced from the Australian Government.',
    'The global access and collaboration map continues to identify demonstration model deliveries and creator, donor, reviewer and translator roles with non-colour labels and explicit prototype-data disclosure.':
        'The global access and collaboration visualization uses a disclosed AI-generated, geographically recognizable map base beneath accessible HTML demonstration markers. It continues to identify model deliveries and creator, donor, reviewer and translator roles with non-colour labels and explicit prototype-data disclosure.',
    'A sustainable-printing commitment follows the global map. It describes investigation into recycling retired or failed prints and finding uses for supports, prime towers, purge material, empty filament spools and packaging.':
        'A sustainable-printing commitment follows the global map. A large sustainability heading and disclosed AI-generated makerspace image introduce investigation into recycling retired or failed prints and finding uses for supports, prime towers, purge material, empty filament spools and packaging.',
    'A sustainable-printing commitment follows the global map. A large “Sustainability” heading and disclosed AI-generated makerspace image introduce investigation into recycling retired or failed prints and finding uses for supports, prime towers, purge material, empty filament spools and packaging.':
        'A sustainable-printing commitment follows the global map. A large sustainability heading and disclosed AI-generated makerspace image introduce investigation into recycling retired or failed prints and finding uses for supports, prime towers, purge material, empty filament spools and packaging.',
    'The contribution section presents Arabic, Chinese, Hindi, Persian, Spanish and Urdu alphabetically by English name alongside their native scripts, while stating that expert review is required before publication.':
        'The translation roadmap presents 24 targets alphabetically by English name—Arabic, Bengali, Cantonese Chinese, Dutch, English, Farsi, French, German, Hindi, Italian, Japanese, Javanese, Korean, Mandarin Chinese, Portuguese, Punjabi, Russian, Spanish, Swahili, Tamil, Telugu, Turkish, Urdu and Vietnamese—alongside centred native names and accurate regional flag icons. Dutch appears as “Nederlands” with the Netherlands flag. Expert review is required before publication.',
}

for index, paragraph in enumerate(document.paragraphs):
    if paragraph.text in replacements:
        paragraph.text = replacements[paragraph.text]

requirements = [
    'The hero uses the normally oriented two-line heading “Medical models” / “made clear.” at wide viewports. The heading and justified introduction share the same maximum text-block width, while the heading remains substantially larger.',
    'The hero introduction describes the Vivatheca platform as a non-profit, open-source library for exploring, explaining, sharing and printing medical models, with browser access, transparent review and known limitations.',
    'A paper origin strip immediately below the hero states that the platform is founded and operated in Australia and displays the complete official Australian National Flag sourced from the Australian Government.',
    'A separate cyan mission strip follows the origin strip and states “Open-source medical education for clearer conversations.”',
    'The redundant “Open access, built for clearer conversations” section is removed from the homepage and navigation.',
    'Each cited peer-reviewed article pairs accessible citation copy with one relevant 4:3 interpretive image. Every generated image on the homepage carries the subtle visible disclosure “AI-generated illustration.”',
    'The global access and collaboration visualization uses a disclosed AI-generated, geographically recognizable map base beneath accessible HTML demonstration markers. It continues to identify model deliveries and creator, donor, reviewer and translator roles with non-colour labels and explicit prototype-data disclosure.',
    'A sustainable-printing commitment follows the global map. A large sustainability heading and disclosed AI-generated makerspace image introduce investigation into recycling retired or failed prints and finding uses for supports, prime towers, purge material, empty filament spools and packaging.',
    'Sustainability content remains explicitly exploratory until a verified recycling programme or recovery partner exists.',
    'The featured 3D model uses a closer default camera orbit and a comfortably enlarged explanation panel so anatomy and guided text are immediately legible.',
    'The contribution section presents five distinct paths: submit a model, donate a printed model, donate filament, printing hardware or related equipment, review clinical accuracy, and translate health content.',
    'The translation roadmap presents 24 targets alphabetically by English name—Arabic, Bengali, Cantonese Chinese, Dutch, English, Farsi, French, German, Hindi, Italian, Japanese, Javanese, Korean, Mandarin Chinese, Portuguese, Punjabi, Russian, Spanish, Swahili, Tamil, Telugu, Turkish, Urdu and Vietnamese—alongside centred native names and accurate regional flag icons. Dutch appears as “Nederlands” with the Netherlands flag. Expert review is required before publication.',
    'Published model records are designed to disclose whether clinical review is approved, rejected or pending, the model rating, and whether the model is recommended for review by clinicians.',
    'A clinician’s identity and eligibility to review are verified privately. Public reviewer attribution is limited to title, initials, occupation and country of practice.',
    'Clinical reviewers are asked only to approve or reject whether a model reflects the named condition or procedure well enough for patient education; they are not required to provide medical or health advice or explanatory condition or procedure content.',
    'Condition and procedure information associated with models is drawn from appropriately licensed public government health-service advice, with source attribution and directions to further information.',
    'The trust section includes a clearly labelled illustrative impacted-molar review record showing “Dr AB, Oral & Maxillofacial Surgeon, Australia” as the most recent approving reviewer, 23 total reviews, 96% approval, one negative review and additional reviewer initials. This is prototype data rather than a verified endorsement.',
    'The illustrative review record is capped at 1280 pixels and uses a compact fluid desktop frame, then stacks its model visual and accessible review data below 900 pixels to reduce unused space without hiding any review feature.',
    'The generated impacted-molar review anatomy removes the erupted tooth directly above the impaction and depicts the left inferior alveolar nerve below the tooth roots, emerging through the left mental foramen. The image remains an interpretive prototype requiring independent clinical verification.',
    'The translation roadmap uses a compact responsive grid with 8, 6, 4, 3 and 2 columns as the viewport narrows, preserving centred labels while reducing unnecessary vertical space.',
    'Featured disciplines are Cardiology, Dentistry, Ear, Nose and Throat Surgery, Ophthalmology, Oral and Maxillofacial Surgery, and Orthopaedics, presented alphabetically.',
    'The sustainability explanation and its ruled waste-stream list vertically balance the adjacent heading and image at wide viewports, then reflow naturally on smaller screens.',
    'Instagram and Facebook badges use recognizable symbols and remain disabled until exact official Vivatheca profile URLs are supplied or independently verified.',
    'User-facing content describes Vivatheca as a platform, not a site or service.',
    'Every material landing-page release includes a regenerated and visually verified full-length desktop PDF reference. AGENTS.md, DESIGN.md, PRODUCT.md, this PRD, asset provenance and relevant testing records remain synchronized with the released experience.',
    'The canonical production origin is https://vivatheca.com. Canonical, Open Graph and X metadata use this origin rather than the temporary hosted preview hostname.',
    'During private preview, the platform is protected at the hosting edge with owner-only or explicit identity-allowlist access. Passwords, access tokens and authorization decisions are never embedded in client code or committed to source control.',
    'The vivatheca.com apex domain remains pending until its supplied Cloudflare A and TXT records validate and an active TLS certificate is issued. Domain activation must not alter the platform appearance, 3D controls, downloads, responsive behavior or accessibility.',
]
provenance = [
    'Research citations link to PubMed records so viewers can verify the underlying peer-reviewed articles.',
    'Research images generated for the platform are interpretive editorial illustrations, not reproductions of journal figures.',
    'The Australian flag image is sourced from the Australian Government Department of the Prime Minister and Cabinet and must remain complete, accurate and unobscured.',
    'Generated asset prompts, purpose, alternative text and generation provenance are recorded in assets/manifest.json and the associated prompt files.',
    'Translation flags use the MIT-licensed flag-icons vector collection, with the licence retained beside source and shipping assets. Flags supplement rather than replace centred English and native-language labels.',
]

if not any(paragraph.text.startswith('15. Current homepage') for paragraph in document.paragraphs):
    document.add_paragraph('15. Current homepage content and design requirements')
    for item in requirements:
        document.add_paragraph(f'•\t{item}')
    document.add_paragraph('15.1 Content provenance and verification')
    for item in provenance:
        document.add_paragraph(f'•\t{item}')
else:
    provenance_heading = next((paragraph for paragraph in document.paragraphs if paragraph.text.startswith('15.1 Content provenance')), None)
    existing_text = {paragraph.text.lstrip('•').lstrip() for paragraph in document.paragraphs}
    for item in requirements:
        if item not in existing_text:
            if provenance_heading is not None:
                provenance_heading.insert_paragraph_before(f'•\t{item}')
            else:
                document.add_paragraph(f'•\t{item}')
    for item in provenance:
        if item not in existing_text:
            document.add_paragraph(f'•\t{item}')

for index, paragraph in enumerate(document.paragraphs):
    if paragraph.text.startswith('15. Current homepage'):
        paragraph.paragraph_format.page_break_before = True
        paragraph.paragraph_format.keep_with_next = True
        for run in paragraph.runs:
            run.bold = True
            run.font.size = Pt(14)
    elif paragraph.text.startswith('15.1 Content provenance'):
        paragraph.paragraph_format.keep_with_next = True
        paragraph.paragraph_format.left_indent = Inches(0)
        paragraph.paragraph_format.first_line_indent = Inches(0)
        paragraph.paragraph_format.space_before = Pt(18)
        paragraph.paragraph_format.space_after = Pt(6)
        for run in paragraph.runs:
            run.bold = True
            run.font.size = Pt(12)
    elif paragraph.text.startswith('•') and index > 180:
        paragraph.text = '•\t' + paragraph.text.lstrip('•').lstrip()
        paragraph.paragraph_format.left_indent = Inches(0.3)
        paragraph.paragraph_format.first_line_indent = Inches(-0.3)
        paragraph.paragraph_format.space_after = Pt(3)
        for run in paragraph.runs:
            run.font.size = Pt(10.5)

document.save(path)
