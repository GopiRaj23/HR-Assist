"""Generate a PDF report from an InterviewReport JSON file."""

import json
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
    KeepTogether, Frame, PageTemplate, BaseDocTemplate
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


# -- Colour palette --
CLR_PRIMARY = HexColor("#1a1a2e")
CLR_ACCENT = HexColor("#4f46e5")
CLR_TEXT = HexColor("#1e293b")
CLR_TEXT_MUTED = HexColor("#6b7280")
CLR_BORDER = HexColor("#d1d5db")
CLR_BORDER_LIGHT = HexColor("#e5e7eb")
CLR_BG_LIGHT = HexColor("#f8fafc")
CLR_BG_SCORE = HexColor("#f0f4ff")
CLR_GREEN = HexColor("#059669")
CLR_GREEN_BG = HexColor("#ecfdf5")
CLR_RED = HexColor("#dc2626")
CLR_RED_BG = HexColor("#fef2f2")
CLR_AMBER = HexColor("#d97706")
CLR_WHITE = HexColor("#ffffff")


def create_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=CLR_PRIMARY,
        spaceAfter=2,
        leading=24,
    ))

    styles.add(ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=CLR_TEXT_MUTED,
        alignment=TA_CENTER,
        spaceAfter=16,
    ))

    styles.add(ParagraphStyle(
        "ScoreText",
        parent=styles["Normal"],
        fontSize=28,
        alignment=TA_CENTER,
        leading=34,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        "RecText",
        parent=styles["Normal"],
        fontSize=11,
        alignment=TA_CENTER,
        textColor=CLR_TEXT,
        spaceBefore=4,
        spaceAfter=4,
        fontName="Helvetica-Bold",
    ))

    styles.add(ParagraphStyle(
        "SectionHead",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=CLR_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        fontName="Helvetica-Bold",
        borderPadding=0,
    ))

    styles.add(ParagraphStyle(
        "CardTitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=CLR_TEXT_MUTED,
        fontName="Helvetica-Bold",
        spaceAfter=6,
        textTransform="uppercase",
    ))

    styles.add(ParagraphStyle(
        "QAQuestion",
        parent=styles["Normal"],
        fontSize=10,
        textColor=CLR_ACCENT,
        fontName="Helvetica-Bold",
        spaceAfter=3,
        leading=13,
    ))

    styles.add(ParagraphStyle(
        "QASummary",
        parent=styles["Normal"],
        fontSize=9,
        textColor=CLR_TEXT_MUTED,
        spaceAfter=4,
        leading=12,
    ))

    styles.add(ParagraphStyle(
        "BodyText9",
        parent=styles["Normal"],
        fontSize=9,
        textColor=CLR_TEXT,
        leading=13,
        spaceAfter=2,
    ))

    styles.add(ParagraphStyle(
        "StrengthItem",
        parent=styles["Normal"],
        fontSize=9,
        textColor=CLR_GREEN,
        leftIndent=12,
        spaceAfter=2,
        leading=12,
    ))

    styles.add(ParagraphStyle(
        "WeaknessItem",
        parent=styles["Normal"],
        fontSize=9,
        textColor=CLR_RED,
        leftIndent=12,
        spaceAfter=2,
        leading=12,
    ))

    styles.add(ParagraphStyle(
        "BulletItem",
        parent=styles["Normal"],
        fontSize=9,
        leftIndent=12,
        spaceAfter=2,
        leading=12,
        textColor=CLR_TEXT_MUTED,
    ))

    return styles


def score_color(score):
    if score is None:
        return CLR_TEXT_MUTED
    if score >= 7:
        return CLR_GREEN
    if score >= 5:
        return CLR_AMBER
    return CLR_RED


def build_score_box(score, styles):
    """Build the overall score as a bordered box with clear spacing."""
    score_text = str(score) if score is not None else "N/A"
    color = score_color(score)

    score_para = Paragraph(
        f'<font color="{color.hexval()}" size="28"><b>{score_text}</b></font>'
        f'<font color="#6b7280" size="14"> / 10</font>',
        ParagraphStyle("ScoreInner", parent=styles["Normal"],
                       alignment=TA_CENTER, leading=34),
    )
    label = Paragraph("Overall Score", ParagraphStyle(
        "ScoreLabel", parent=styles["Normal"], fontSize=9,
        textColor=CLR_TEXT_MUTED, alignment=TA_CENTER, spaceBefore=2,
    ))

    tbl = Table([[score_para], [label]], colWidths=[2.5 * inch])
    tbl.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (0, 0), 12),
        ("BOTTOMPADDING", (0, 1), (0, 1), 10),
        ("BOX", (0, 0), (-1, -1), 1.5, CLR_BORDER),
        ("BACKGROUND", (0, 0), (-1, -1), CLR_BG_SCORE),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
    ]))
    return tbl


def build_pdf(report, output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
    )

    styles = create_styles()
    story = []

    # ── Title ──
    story.append(Paragraph("HR Assist - Interview Analysis Report", styles["ReportTitle"]))

    # Meta info
    duration = ""
    if report.get("duration"):
        duration = f"  |  Duration: {int(report['duration'] // 60)} min"
    meta = f"{report['fileName']}  |  {report['uploadedAt'][:10]}{duration}"
    story.append(Paragraph(meta, styles["ReportSubtitle"]))

    # ── Score + Recommendation in a centred block ──
    score = report.get("overallScore")
    score_box = build_score_box(score, styles)

    rec = report.get("recommendation") or ""
    rec_para = Paragraph(rec, styles["RecText"])

    # Centre the score box using a wrapper table
    wrapper = Table(
        [[score_box], [Spacer(1, 6)], [rec_para]],
        colWidths=[doc.width],
    )
    wrapper.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(wrapper)
    story.append(Spacer(1, 12))

    story.append(HRFlowable(width="100%", color=CLR_BORDER_LIGHT, thickness=1))

    # ── Summary ──
    summary = report.get("summary")
    if summary:
        story.append(Paragraph("Summary", styles["SectionHead"]))
        summary_para = Paragraph(summary, styles["BodyText9"])
        # Wrap in a bordered card
        summary_tbl = Table([[summary_para]], colWidths=[doc.width - 16])
        summary_tbl.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.75, CLR_BORDER),
            ("BACKGROUND", (0, 0), (-1, -1), CLR_BG_LIGHT),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("ROUNDEDCORNERS", [4, 4, 4, 4]),
        ]))
        story.append(summary_tbl)

    # ── Strengths & Weaknesses side by side ──
    strengths = report.get("strengths", [])
    weaknesses = report.get("weaknesses", [])
    if strengths or weaknesses:
        story.append(Spacer(1, 6))

        s_items = [Paragraph("STRENGTHS", styles["CardTitle"])]
        for s in strengths:
            s_items.append(Paragraph(f"+ {s}", styles["StrengthItem"]))
        if not strengths:
            s_items.append(Paragraph("None identified", styles["BulletItem"]))

        w_items = [Paragraph("WEAKNESSES", styles["CardTitle"])]
        for w in weaknesses:
            w_items.append(Paragraph(f"- {w}", styles["WeaknessItem"]))
        if not weaknesses:
            w_items.append(Paragraph("None identified", styles["BulletItem"]))

        col_width = (doc.width - 24) / 2
        tbl = Table(
            [[s_items, w_items]],
            colWidths=[col_width, col_width],
        )
        tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            # Strengths column — green-tinted card
            ("BOX", (0, 0), (0, 0), 0.75, HexColor("#a7f3d0")),
            ("BACKGROUND", (0, 0), (0, 0), CLR_GREEN_BG),
            # Weaknesses column — red-tinted card
            ("BOX", (1, 0), (1, 0), 0.75, HexColor("#fecaca")),
            ("BACKGROUND", (1, 0), (1, 0), CLR_RED_BG),
            # Padding
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("ROUNDEDCORNERS", [4, 4, 4, 4]),
        ]))
        story.append(tbl)

    # ── Question-by-Question Analysis ──
    analyses = report.get("questionAnalyses", [])
    if analyses:
        story.append(Spacer(1, 6))
        story.append(HRFlowable(width="100%", color=CLR_BORDER_LIGHT, thickness=1))
        story.append(Paragraph("Question-by-Question Analysis", styles["SectionHead"]))

        for qa in analyses:
            qa_elements = []

            # Question heading
            qa_elements.append(Paragraph(
                f"Q{qa['questionNumber']}: {qa['question']}", styles["QAQuestion"]
            ))
            qa_elements.append(Paragraph(
                qa.get("answerSummary", ""), styles["QASummary"]
            ))

            # Scores in a neat row
            r = qa.get("relevanceScore", 0)
            cl = qa.get("clarityScore", 0)
            co = qa.get("confidenceScore", 0)

            def colored_score(label, val):
                c = CLR_GREEN if val >= 7 else CLR_AMBER if val >= 5 else CLR_RED
                return Paragraph(
                    f'<font size="8" color="#6b7280">{label}</font><br/>'
                    f'<font size="12" color="{c.hexval()}"><b>{val}</b></font>'
                    f'<font size="8" color="#6b7280">/10</font>',
                    ParagraphStyle("ScoreCell", parent=styles["Normal"],
                                   alignment=TA_CENTER, leading=14),
                )

            score_tbl = Table(
                [[colored_score("Relevance", r),
                  colored_score("Clarity", cl),
                  colored_score("Confidence", co)]],
                colWidths=[(doc.width - 40) / 3] * 3,
            )
            score_tbl.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("BACKGROUND", (0, 0), (-1, -1), CLR_BG_LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.5, CLR_BORDER_LIGHT),
                ("LINEBEFORE", (1, 0), (1, 0), 0.5, CLR_BORDER_LIGHT),
                ("LINEBEFORE", (2, 0), (2, 0), 0.5, CLR_BORDER_LIGHT),
                ("ROUNDEDCORNERS", [3, 3, 3, 3]),
            ]))
            qa_elements.append(score_tbl)

            # Per-question strengths/weaknesses
            for s in qa.get("strengths", []):
                qa_elements.append(Paragraph(f"+ {s}", styles["StrengthItem"]))
            for w in qa.get("weaknesses", []):
                qa_elements.append(Paragraph(f"- {w}", styles["WeaknessItem"]))

            # Wrap each Q&A in a bordered card
            inner = []
            for el in qa_elements:
                inner.append([el])

            card_tbl = Table(inner, colWidths=[doc.width - 20])
            card_tbl.setStyle(TableStyle([
                ("BOX", (0, 0), (-1, -1), 0.75, CLR_BORDER),
                ("BACKGROUND", (0, 0), (-1, -1), CLR_WHITE),
                ("TOPPADDING", (0, 0), (0, 0), 10),
                ("BOTTOMPADDING", (-1, -1), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 1), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
                ("ROUNDEDCORNERS", [4, 4, 4, 4]),
            ]))
            story.append(Spacer(1, 6))
            story.append(KeepTogether(card_tbl))

    # ── Footer ──
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", color=CLR_BORDER_LIGHT, thickness=0.5))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Generated by HR Assist - AI-Powered Interview Analyzer",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=7,
                       textColor=HexColor("#9ca3af"), alignment=TA_CENTER),
    ))

    doc.build(story)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_pdf.py <input.json> <output.pdf>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    with open(input_path, "r", encoding="utf-8") as f:
        report = json.load(f)

    build_pdf(report, output_path)
    print(f"PDF generated: {output_path}")
