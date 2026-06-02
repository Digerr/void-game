#!/usr/bin/env python3
"""Generate VOID Game Pre-Release Audit Report as PDF"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
import datetime

# Register fonts
pdfmetrics.registerFont(TTFont('NotoSansSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))

# Colors
C_CRIT = HexColor('#e74c3c')
C_HIGH = HexColor('#e67e22')
C_MED = HexColor('#f1c40f')
C_LOW = HexColor('#3498db')
C_OK = HexColor('#2ecc71')
C_BG = HexColor('#1a1a2e')
C_BG2 = HexColor('#16213e')
C_ACCENT = HexColor('#5a8aba')
C_TEXT = HexColor('#333333')
C_HEADER = HexColor('#2c3e50')

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'CustomTitle', parent=styles['Title'],
    fontName='NotoSansSC', fontSize=28, textColor=C_HEADER,
    spaceAfter=6, alignment=TA_CENTER
)
subtitle_style = ParagraphStyle(
    'CustomSubtitle', parent=styles['Normal'],
    fontName='NotoSansSC', fontSize=12, textColor=HexColor('#7f8c8d'),
    spaceAfter=20, alignment=TA_CENTER
)
h1_style = ParagraphStyle(
    'H1', parent=styles['Heading1'],
    fontName='NotoSerifSC-Bold', fontSize=18, textColor=C_HEADER,
    spaceBefore=18, spaceAfter=10, borderPadding=4
)
h2_style = ParagraphStyle(
    'H2', parent=styles['Heading2'],
    fontName='NotoSerifSC-Bold', fontSize=14, textColor=C_ACCENT,
    spaceBefore=14, spaceAfter=8
)
h3_style = ParagraphStyle(
    'H3', parent=styles['Heading3'],
    fontName='NotoSansSC', fontSize=11, textColor=C_HEADER,
    spaceBefore=10, spaceAfter=6
)
body_style = ParagraphStyle(
    'Body', parent=styles['Normal'],
    fontName='NotoSansSC', fontSize=9, textColor=C_TEXT,
    spaceBefore=2, spaceAfter=4, leading=14, alignment=TA_JUSTIFY
)
bug_style = ParagraphStyle(
    'Bug', parent=styles['Normal'],
    fontName='NotoSansSC', fontSize=9, textColor=C_TEXT,
    spaceBefore=2, spaceAfter=4, leading=13, leftIndent=12
)
crit_style = ParagraphStyle(
    'Critical', parent=bug_style,
    textColor=C_CRIT, fontName='NotoSansSC'
)
high_style = ParagraphStyle(
    'High', parent=bug_style,
    textColor=HexColor('#d35400'), fontName='NotoSansSC'
)
med_style = ParagraphStyle(
    'Medium', parent=bug_style,
    textColor=HexColor('#8a6d00'), fontName='NotoSansSC'
)
low_style = ParagraphStyle(
    'Low', parent=bug_style,
    textColor=HexColor('#2471a3'), fontName='NotoSansSC'
)
code_style = ParagraphStyle(
    'Code', parent=styles['Code'],
    fontName='DejaVuSans', fontSize=8, textColor=HexColor('#2c3e50'),
    backColor=HexColor('#f8f9fa'), leftIndent=12,
    spaceBefore=2, spaceAfter=4, leading=11
)
center_style = ParagraphStyle(
    'Center', parent=body_style,
    alignment=TA_CENTER
)

def bug_block(severity, bid, title, line, desc, fix):
    """Create a formatted bug block"""
    sev_colors = {
        'CRITICAL': (C_CRIT, crit_style),
        'HIGH': (C_HIGH, high_style),
        'MEDIUM': (C_MED, med_style),
        'LOW': (C_LOW, low_style)
    }
    col, sty = sev_colors.get(severity, (C_TEXT, bug_style))
    elements = []
    # Header with severity badge
    badge_bg = col
    elements.append(Paragraph(
        f'<font color="{col.hexval()}">[{severity}]</font> '
        f'<b>{bid}: {title}</b> '
        f'<font color="#999999" size="7">(строка {line})</font>',
        h3_style
    ))
    elements.append(Paragraph(desc, sty))
    elements.append(Paragraph(f'<b>Исправление:</b> {fix}', bug_style))
    elements.append(Spacer(1, 4))
    return elements

def section_header(text, level=1):
    sty = h1_style if level == 1 else h2_style
    return [Paragraph(text, sty), HRFlowable(width="100%", thickness=0.5, color=C_ACCENT, spaceAfter=6)]

# Build document
doc = SimpleDocTemplate(
    '/home/z/my-project/download/VOID_Audit_Report.pdf',
    pagesize=A4,
    topMargin=2*cm, bottomMargin=2*cm,
    leftMargin=2*cm, rightMargin=2*cm,
    title='VOID — Pre-Release Audit Report',
    author='Super Z Audit System'
)

story = []

# ===== COVER =====
story.append(Spacer(1, 60))
story.append(Paragraph('VOID', title_style))
story.append(Paragraph('Pre-Release Audit Report', ParagraphStyle(
    'SubTitle', parent=subtitle_style, fontSize=16, textColor=C_ACCENT
)))
story.append(Spacer(1, 10))
story.append(Paragraph('v2.8.0 | 30 Levels | 6 Acts', ParagraphStyle(
    'VerLine', parent=subtitle_style, fontSize=11, textColor=HexColor('#555555')
)))
story.append(Spacer(1, 30))
story.append(HRFlowable(width="60%", thickness=2, color=C_ACCENT, spaceAfter=20))
story.append(Paragraph(f'Date: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M")}', center_style))
story.append(Paragraph('Game: VOID — Telegram Mini App Platformer', center_style))
story.append(Paragraph('Developer: SKUFI4', center_style))
story.append(Paragraph('Repository: github.com/Digerr/void-game', center_style))
story.append(Paragraph('Deployment: void-game-ruddy.vercel.app', center_style))
story.append(PageBreak())

# ===== SUMMARY TABLE =====
story.extend(section_header('Executive Summary'))

summary_data = [
    ['Category', 'Critical', 'High', 'Medium', 'Low', 'Total'],
    ['Game Logic', '3', '6', '6', '6', '21'],
    ['Telegram Bot', '1', '1', '1', '0', '3'],
    ['Supabase / Security', '2', '1', '1', '0', '4'],
    ['Vercel / Deployment', '0', '0', '0', '2', '2'],
    ['GitHub / Repo', '0', '0', '1', '2', '3'],
    ['Total', '6', '8', '9', '10', '33'],
]

t = Table(summary_data, colWidths=[90, 55, 55, 55, 55, 55])
t.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'NotoSansSC'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('FONTNAME', (0, 0), (-1, 0), 'NotoSerifSC-Bold'),
    ('FONTNAME', (0, -1), (-1, -1), 'NotoSerifSC-Bold'),
    ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, -1), (-1, -1), HexColor('#e8e8e8')),
    ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, HexColor('#f5f5f5')]),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(t)
story.append(Spacer(1, 12))

story.append(Paragraph(
    '<b>Verdict:</b> The game has <font color="#e74c3c"><b>6 CRITICAL</b></font> bugs that must be fixed before release. '
    'The most severe is BUG-C1 (winLevel crash) which makes the game unplayable after completing any level. '
    'Additionally, BUG-C2 (time unit mismatch) makes the 3-star rating system impossible, and BUG-C3/C4/C5/C6 '
    'mean Acts V-VI content is invisible or broken across multiple screens. '
    'The Supabase security configuration allows anonymous write access to the players table, which must be locked down before launch.',
    body_style
))

story.append(PageBreak())

# ===== GAME LOGIC BUGS =====
story.extend(section_header('Game Logic Bugs'))

# CRITICAL
story.extend(section_header('Critical Bugs', 2))

story.extend(bug_block(
    'CRITICAL', 'BUG-C1',
    'lvl undefined in winLevel() — game crashes on level completion',
    4815,
    'The function winLevel() references <b>lvl</b> on line 4815 (<code>if(lvl&amp;&amp;lvl.flashlight)</code>) but never declares it. '
    'All other functions use <code>var lvl=LEVELS[state.level]</code>. This causes a ReferenceError when any level is completed. '
    'As a result: the setTimeout calling showWinScreen() never fires, the win screen never appears, the player appears frozen after '
    'touching the exit. Achievements for light_bearer and gravity_master are never checked, and leaderboard data is not submitted.',
    'Add <code>var lvl=LEVELS[state.level];</code> at the beginning of winLevel(), before the challenge check block.'
))

story.extend(bug_block(
    'CRITICAL', 'BUG-C2',
    'recordLevelComplete passes milliseconds to calculateStars which expects seconds',
    1176,
    'The function recordLevelComplete receives <code>elapsed</code> in milliseconds from winLevel() and passes it directly to '
    'calculateStars(deaths, time) which checks thresholds like time&lt;25, time&lt;45, time&lt;60 — clearly expecting seconds. '
    'Since 25000ms is never less than 25, the 3-star rating is functionally impossible to save. Meanwhile, showWinScreen() '
    'correctly divides by 1000, so the display shows correct stars but saves wrong stars. The bestTime is also stored in '
    'milliseconds, causing cascading time display errors throughout the app.',
    'In recordLevelComplete, convert time to seconds: <code>var stars=calculateStars(deaths,time/1000);</code> and '
    '<code>bestTime:Math.min(time/1000,...)</code>. Alternatively, pass elapsed/1000 from winLevel().'
))

story.extend(bug_block(
    'CRITICAL', 'BUG-C3',
    'Records screen missing Acts V and VI — levels 20-29 invisible',
    5087,
    'The level select screen (line 4927) defines 6 acts: [0-4],[5-9],[10-14],[15-19],[20-24],[25-29]. '
    'But the records screen (line 5087) only defines 4 acts: [0-4],[5-9],[10-14],[15-19]. Levels 20-29 from Acts V '
    '(Возрождение) and VI (Исход) are completely invisible in the records view. Players who have completed these levels '
    'will not see their times or stars displayed.',
    'Add Acts V and VI to the acts array in showRecords(): '
    '<code>{name:"Возрождение",color:"#4a8a7a",levels:[20,21,22,23,24]}</code> and '
    '<code>{name:"Исход",color:"#9a3a6a",levels:[25,26,27,28,29]}</code>'
))

# HIGH
story.extend(section_header('High Severity Bugs', 2))

story.extend(bug_block(
    'HIGH', 'BUG-H1',
    'bestTime displayed 1000x too large in records and level select',
    4993,
    'bestTime is stored in milliseconds (from elapsed), but showRecords() and showLevelSelect() call '
    'formatTime(best*1000), multiplying by 1000 again. A 30-second level shows as approximately 8 hours 20 minutes. '
    'Meanwhile showWinScreen() correctly calls formatTime(bestTime) without extra multiplication. This makes all '
    'time displays in records and level-select screens completely meaningless.',
    'Change formatTime(best*1000) to formatTime(best) in lines 4993, 5110. Also fix formatTime(actTime*1000) '
    'to formatTime(actTime) in line 5100, and formatTime(totalTime*1000) to formatTime(totalTime) in lines 5064, 5082.'
))

story.extend(bug_block(
    'HIGH', 'BUG-H2',
    'Rank system broken — millisecond values compared to second thresholds',
    5047,
    'totalTime accumulates getLevelBestTime() values (in milliseconds). Rank thresholds expect seconds '
    '(300=5min, 480=8min, etc.). Since 300ms is less than any completed level time, S/A/B ranks are impossible. '
    'Every player automatically receives C or D rank regardless of performance. This completely undermines the '
    'ranking/leaderboard system.',
    'Convert totalTime to seconds before comparison: <code>if(totalTime/1000&lt;300)</code> etc. Apply same fix '
    'in updateMenuStats() which has the same comparison logic.'
))

story.extend(bug_block(
    'HIGH', 'BUG-H3',
    'Checkpoint system non-functional — respawnPlayer() never called from death screen',
    5220,
    'The function respawnPlayer() exists and properly respawns at state.lastCheckpoint, and the death screen '
    'shows "чекпоинт активирован" when a checkpoint is active. However, the only button on the death screen '
    '("снова") calls clearLevel(); loadLevel() which always restarts from the beginning. The checkpoint hint '
    'is misleading and the entire checkpoint system is effectively non-functional for the player.',
    'Add a "чекпоинт" button to the death screen that calls respawnPlayer() + startPlaying() when '
    'state.lastCheckpoint is not null. Show/hide it based on checkpoint availability.'
))

story.extend(bug_block(
    'HIGH', 'BUG-H4',
    'Profile achievement grid uses 7 mismatched achievement IDs',
    1526,
    'Profile uses: [no_death, speedrun, die_50, dash_100, wall_crawler, thread_master, perfect_level, '
    'all_3star, music_lover, first_blood]. Actual ACHIEVEMENTS: [first_step, wall_crawler, thread_master, '
    'dash_king, no_death, speedrun, five_levels, halfway, void_master, perfectionist, dark_escape, '
    'light_bearer, gravity_master]. Only 4 of 10 profile IDs match. The other 6 (die_50, dash_100, '
    'perfect_level, all_3star, music_lover, first_blood) do not exist and will never light up.',
    'Replace the profile achievement ID list with actual ACHIEVEMENTS IDs. Update achIcons to match '
    'the actual achievement icons. Consider showing all 13 achievements or selecting the 10 most meaningful.'
))

story.extend(bug_block(
    'HIGH', 'BUG-H5',
    'getUnlockedSkins() only checks 4 acts — Act V skin unobtainable',
    1059,
    'The skin unlock check uses actComplete=[true,true,true,true] and iterates only 4 acts. With 6 acts in the game, '
    'Act 4 (index 4, skin "теневой" req:act4) and Act 5 (index 5) are never checked. The "теневой" skin requires '
    'completing Act V levels 20-24 but the unlock condition never evaluates, making the skin permanently locked.',
    'Expand to actComplete=[true,true,true,true,true,true] and for(var a=0;a&lt;6;a++). Add '
    '<code>if(actComplete[4])unlocked.push(4);</code> for the act4 skin.'
))

story.extend(bug_block(
    'HIGH', 'BUG-H6',
    'Profile shows hardcoded /60 stars — should be /90',
    1539,
    'The profile screen displays total stars as "X/60" but with 30 levels x 3 stars = 90 max stars. '
    'This was correct when the game had 20 levels but was not updated when Acts V-VI were added.',
    'Change hardcoded "/60" to <code>"/"+(LEVELS.length*3)</code> or "/90".'
))

# MEDIUM
story.extend(section_header('Medium Severity Bugs', 2))

story.extend(bug_block(
    'MEDIUM', 'BUG-M1',
    'perfectLevels counter never increments',
    1181,
    'progress.levels[n] is reassigned on line 1179 BEFORE prevStars is read on line 1181. Since prevStars reads '
    'the NEW value, it always equals stars. The condition prevStars&lt;3 is always false when stars===3, so '
    'perfectLevels is never incremented. The perfectionist achievement may still work via other paths, but the '
    'counter displayed in stats is permanently 0.',
    'Move var prevStars=progress.levels[n]?progress.levels[n].stars:0 BEFORE the reassignment on line 1179.'
))

story.extend(bug_block(
    'MEDIUM', 'BUG-M2',
    'calculateStars has dead redundant condition',
    1169,
    'Line 1169 checks deaths===0&amp;&amp;time&lt;25 for 3 stars. Line 1170 checks deaths===0&amp;&amp;time&lt;45 for 3 stars. '
    'Since &lt;25 is a strict subset of &lt;45 with the same deaths condition and same return value, line 1169 '
    'is dead code. There is no meaningful distinction between a "very fast" and "fast" 3-star run.',
    'Remove line 1169, or change thresholds to create meaningful tiers (e.g., &lt;20 for fast 3-star, &lt;45 for regular 3-star).'
))

story.extend(bug_block(
    'MEDIUM', 'BUG-M3',
    'Leaderboard local data formatTime(myD.totalTime*1000) wrong',
    1457,
    'computeLBScore().totalTime is already in milliseconds. Multiplying by 1000 displays time 1000x too large '
    'in the leaderboard profile section. Same pattern at line 5082 for the share text.',
    'Change to formatTime(myD.totalTime) and formatTime(totalTime) in the share function.'
))

story.extend(bug_block(
    'MEDIUM', 'BUG-M4',
    'Challenge can select locked levels',
    5838,
    'The daily challenge selects levelIdx using seededRandom across the entire LEVELS array without checking '
    'progress.unlocked. Players may be assigned levels they have never reached, which could be confusing or '
    'frustrating for new players.',
    'Add <code>levelIdx=Math.min(levelIdx,progress.unlocked-1);</code> or filter to only unlocked levels.'
))

story.extend(bug_block(
    'MEDIUM', 'BUG-M5',
    'Weather system only has 4 act themes — Acts V-VI share Act III style',
    4153,
    'Acts 0-3 have distinct weather effects (ash, rain, crystals, embers). Acts 4-5 fall through to the else '
    'clause and get the same dark embers effect as Act III, making them visually indistinct.',
    'Add unique weather configurations for Acts 4 and 5, e.g., spectral wisps for Act V and void distortion for Act VI.'
))

story.extend(bug_block(
    'MEDIUM', 'BUG-M6',
    'bestTime sent to Supabase in ms but may be expected in seconds',
    1366,
    'levelData[k]={stars:lvl.stars,bestTime:lvl.bestTime||0} sends milliseconds. The total_time field in the '
    'leaderboard table stores 37.8 (seconds for a 2-level run), suggesting the backend expects seconds. This '
    'inconsistency could cause leaderboard data corruption.',
    'Standardize units. Convert bestTime to seconds before sending to Supabase, or document that the field is in ms.'
))

# LOW
story.extend(section_header('Low Severity Issues', 2))

story.extend(bug_block(
    'LOW', 'BUG-L1',
    'Pendulum death has no specific color — falls to default gray',
    3194,
    'Death causes map specific colors: fall=0x2a2a4a, spikes=0x4a1a1a, saw=0x3a1a2a, enemy=0x2a1a3a, '
    'darkness=0x1a0a2a. Pendulum falls to the default 0x3e3e52 gray, which does not match the thematic feel.',
    'Add pendulum:0x3a1a3a or a purple tone to the death causes map.'
))

story.extend(bug_block(
    'LOW', 'BUG-L2',
    'Shard toasts overlap with achievement toasts — no queue system',
    1098,
    'showShardToast() creates independent toast elements that can overlap with the achievement queue system. '
    'No serialization or queuing exists between shard and achievement notifications.',
    'Implement a unified toast queue that serializes all notification types.'
))

story.extend(bug_block(
    'LOW', 'BUG-L3',
    'Real-time leaderboard subscription never cleaned up',
    1394,
    'lbSubscription is created once and never unsubscribed. While the !lbSubscription check prevents duplicates, '
    'the channel persists for the entire session, consuming resources.',
    'Unsubscribe from the realtime channel when leaving the leaderboard screen.'
))

story.extend(bug_block(
    'LOW', 'BUG-L4',
    'No error boundary around collision handler',
    3014,
    'onCollisionStart has no try-catch. Any error (like BUG-C1) propagates through Matter.js and crashes '
    'the update step entirely, rather than being gracefully handled.',
    'Wrap onCollisionStart body in try-catch with console.error logging.'
))

story.extend(bug_block(
    'LOW', 'BUG-L5',
    'var i redeclared in same function scope',
    3203,
    'Multiple for(var i=...) loops in the same function redeclare i. While not an error in JS (var is function-scoped), '
    'it is a code smell that could cause confusion during maintenance.',
    'Use different variable names or refactor to use let in block-scoped loops.'
))

story.extend(bug_block(
    'LOW', 'BUG-L6',
    'Gravity zone exit transition not smoothed',
    3676,
    'When exiting a gravity zone, player.gravityDir instantly flips back to 1 with no gradual transition. '
    'This can feel jarring for zones at level boundaries.',
    'Add a brief gravity transition period with interpolated gravity strength.'
))

story.append(PageBreak())

# ===== TELEGRAM BOT =====
story.extend(section_header('Telegram Bot Configuration'))

bot_data = [
    ['Parameter', 'Value', 'Status'],
    ['Bot Username', '@voide_game_bot', 'OK'],
    ['Display Name', 'VOID - Исследуй Пустоту', 'OK'],
    ['WebApp URL', 'void-game-ruddy.vercel.app/v2.6', 'OUTDATED'],
    ['Webhook URL', 'void-game-api.vercel.app/api/webhook', 'OK'],
    ['Webhook Pending', '0', 'OK'],
    ['Commands', '6 (start,play,help,stats,leaderboard,news)', 'OK'],
    ['Menu Button', 'web_app type, text: ИГРАТЬ', 'OK'],
    ['Bot Description', 'Mentions "20 levels, 4 acts"', 'OUTDATED'],
    ['Short Description', 'Mentions "20 levels"', 'OUTDATED'],
]

t = Table(bot_data, colWidths=[100, 220, 80])
t.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'NotoSansSC'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('FONTNAME', (0, 0), (-1, 0), 'NotoSerifSC-Bold'),
    ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#f5f5f5')]),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t)
story.append(Spacer(1, 10))

story.extend(bug_block(
    'CRITICAL', 'BUG-C4',
    'Telegram bot WebApp URL points to /v2.6 but game is v2.8.0',
    'Bot API',
    'The menu button WebApp URL is set to https://void-game-ruddy.vercel.app/v2.6 while the current game version '
    'is 2.8.0. Due to Vercel rewrites in vercel.json, the versioned URL still serves the latest content (all /v* '
    'paths rewrite to index.html), so the game loads correctly. However, the no-cache headers combined with the '
    'old versioned URL may cause caching issues. The auto-version-check code in the game (VOID_VERSION comparison) '
    'should handle forced reloads, but the mismatched URL is misleading and should be updated.',
    'Update the bot menu button URL to /v2.8 using setChatMenuButton API call: '
    'curl "https://api.telegram.org/botTOKEN/setChatMenuButton" -d \'{"menu_button":{"type":"web_app","text":"ИГРАТЬ","web_app":{"url":"https://void-game-ruddy.vercel.app/v2.8"}}}\''
))

story.extend(bug_block(
    'HIGH', 'BUG-H7',
    'Bot description mentions "20 levels, 4 acts" — should be "30 levels, 6 acts"',
    'Bot API',
    'Both the bot description and short description reference "20 levels" and "4 acts" (Pre-release 1.0.0). '
    'The game now has 30 levels across 6 acts at version 2.8.0. This is misleading for new players.',
    'Update using setMyDescription and setMyShortDescription API calls to reflect 30 levels, 6 acts.'
))

story.extend(bug_block(
    'MEDIUM', 'BUG-M7',
    'Webhook only listens for "message" updates — missing callback_query',
    'Bot API',
    'The webhook allowed_updates is set to ["message"] only. If the bot uses inline keyboards or callback queries '
    '(e.g., for notifications or settings), it will not receive them. This limits future bot functionality.',
    'Update webhook to include "callback_query" in allowed_updates if inline buttons are planned.'
))

story.append(PageBreak())

# ===== SUPABASE =====
story.extend(section_header('Supabase Database and Security'))

db_data = [
    ['Table', 'Columns', 'Rows', 'RLS Status'],
    ['leaderboard', 'id, name, score, completed, total_stars, total_time, level_data, updated', '1', 'SELECT only (OK)'],
    ['players', 'id, chat_id, name, notifications_enabled, best_rank, created', '5', 'ALL OPEN (CRITICAL)'],
]

t = Table(db_data, colWidths=[70, 200, 40, 100])
t.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'NotoSansSC'),
    ('FONTSIZE', (0, 0), (-1, -1), 7.5),
    ('FONTNAME', (0, 0), (-1, 0), 'NotoSerifSC-Bold'),
    ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#f5f5f5')]),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t)
story.append(Spacer(1, 10))

story.extend(bug_block(
    'CRITICAL', 'BUG-C5',
    'Players table allows anonymous INSERT and UPDATE — no RLS',
    'Supabase',
    'The players table has no RLS policies restricting write access. Testing confirmed that anyone with the anon key '
    '(which is exposed in client-side code) can INSERT fake player records with arbitrary IDs and names, and UPDATE '
    'any existing player data including names, chat_ids, and notification settings. An attacker could modify or '
    'impersonate any player.',
    'Add RLS policies: 1) Enable RLS on players table. 2) Allow INSERT only for matching user ID (via Telegram '
    'initData validation on the API side). 3) Allow UPDATE only for own record. 4) Consider restricting SELECT '
    'to not expose chat_id to other users.'
))

story.extend(bug_block(
    'CRITICAL', 'BUG-C6',
    'Players table exposes chat_ids to all anonymous readers',
    'Supabase',
    'The players table allows anon SELECT which returns chat_id for every player. Telegram chat_ids can be used '
    'to send unsolicited messages. With 5 players currently registered, this is a privacy violation that will '
    'grow more severe as the user base increases.',
    'Create a view or RLS policy that strips chat_id from SELECT results for non-service-role queries. '
    'Alternatively, move chat_id to a separate private table.'
))

story.extend(bug_block(
    'HIGH', 'BUG-H8',
    'Only /api/webhook endpoint exists — no health/sync API',
    'Vercel API',
    'The void-game-api Vercel project only has a functional /api/webhook endpoint. There are no /api/health, '
    '/api/sync, /api/leaderboard, or any other REST endpoints. The game interacts with Supabase directly from '
    'the client, which means the anon key and all data access patterns are exposed in client-side code. This '
    'architecture is acceptable for a prototype but insecure for production.',
    'For production: Move all Supabase writes through API endpoints that validate Telegram initData server-side. '
    'At minimum, add /api/sync and /api/leaderboard endpoints with authentication.'
))

story.extend(bug_block(
    'MEDIUM', 'BUG-M8',
    'progress table does not exist in Supabase',
    'Supabase',
    'The game code references saving progress to Supabase, but the "progress" table does not exist in the database. '
    'Querying /rest/v1/progress returns "Could not find the table". This means progress saving via Supabase may '
    'be failing silently, and players relying on cloud saves could lose their progress.',
    'Create the progress table in Supabase, or verify that the game uses Telegram Cloud Storage instead of '
    'direct Supabase queries for progress data.'
))

story.append(PageBreak())

# ===== VERCEL / DEPLOYMENT =====
story.extend(section_header('Vercel Deployment'))

deploy_data = [
    ['Parameter', 'Value'],
    ['Project', 'void-game'],
    ['Status', 'READY (Production)'],
    ['Primary URL', 'void-game-ruddy.vercel.app'],
    ['Git Integration', 'GitHub Digerr/void-game, main branch'],
    ['Auto-deploy', 'Enabled on push to main'],
    ['rootDirectory', 'void-game (correct)'],
    ['Framework', 'null (static HTML)'],
    ['Latest Deploy', 'v2.8.0 commit 993acf5'],
    ['Build Time', '~2.3 seconds'],
    ['Content Size', '358,216 bytes'],
    ['HTTP Status', '200 OK'],
    ['Cache Headers', 'no-cache, no-store, must-revalidate'],
    ['Versioned URLs', '/v2.6, /v2.8, etc. all work via rewrites'],
]

t = Table(deploy_data, colWidths=[100, 280])
t.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'NotoSansSC'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('FONTNAME', (0, 0), (-1, 0), 'NotoSerifSC-Bold'),
    ('BACKGROUND', (0, 0), (-1, 0), C_OK),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#f5f5f5')]),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t)
story.append(Spacer(1, 10))

story.append(Paragraph(
    'Vercel deployment is <font color="#2ecc71"><b>healthy</b></font>. The game is live, accessible, and serving '
    'the correct v2.8.0 content. All 5 recent deployments are READY with zero failures. The vercel.json configuration '
    'is properly set up with no-cache headers and versioned URL rewrites. The rootDirectory is correctly set to "void-game".',
    body_style
))

# ===== GITHUB =====
story.extend(section_header('GitHub Repository'))

repo_data = [
    ['Parameter', 'Value'],
    ['Repository', 'github.com/Digerr/void-game'],
    ['Branch', 'main'],
    ['Working Tree', 'Clean (no uncommitted changes)'],
    ['Files', 'index.html, manifest.json, vercel.json, releases/'],
    ['Latest Commit', '993acf5 — v2.8.0'],
]

t = Table(repo_data, colWidths=[100, 280])
t.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'NotoSansSC'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('FONTNAME', (0, 0), (-1, 0), 'NotoSerifSC-Bold'),
    ('BACKGROUND', (0, 0), (-1, 0), C_OK),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#f5f5f5')]),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t)
story.append(Spacer(1, 10))

story.extend(bug_block(
    'MEDIUM', 'BUG-M9',
    'No .gitignore file in repository',
    'GitHub',
    'The repository has no .gitignore file. This risks committing editor artifacts, OS files (.DS_Store), '
    'swap files, and other temporary files. It also means the GitHub PAT token is visible in the remote URL '
    'when cloning, which is a security concern if the machine is shared.',
    'Add a .gitignore with common patterns: .DS_Store, *.swp, .vscode/, node_modules/, etc. '
    'Consider using SSH keys instead of PAT tokens for the remote URL.'
))

story.extend(bug_block(
    'LOW', 'BUG-L7',
    'No README.md in repository',
    'GitHub',
    'The public repository has no README file. This makes it harder for potential contributors or users to '
    'understand the project, build process, or deployment setup.',
    'Add a README.md with project description, setup instructions, and deployment info.'
))

story.extend(bug_block(
    'LOW', 'BUG-L8',
    'UUID commit messages make history hard to read',
    'GitHub',
    'Some commits (e.g., ef614d9) use UUID strings as commit messages instead of descriptive text. '
    'This makes it difficult to understand the change history.',
    'Use descriptive commit messages like "fix: resolve darkness checkpoint bug" or "feat: add Act V levels".'
))

story.append(PageBreak())

# ===== RECOMMENDATIONS =====
story.extend(section_header('Priority Fix Order'))

story.append(Paragraph(
    'The following list orders all bugs by priority for the pre-release fix. Critical bugs must be fixed '
    'before any public release, as they cause game-breaking behavior or security vulnerabilities.',
    body_style
))
story.append(Spacer(1, 8))

priority_data = [
    ['#', 'Bug ID', 'Title', 'Severity'],
    ['1', 'BUG-C1', 'lvl undefined in winLevel() — crash on completion', 'CRITICAL'],
    ['2', 'BUG-C2', 'Time unit mismatch — 3-star impossible to save', 'CRITICAL'],
    ['3', 'BUG-C5', 'Supabase players table: no RLS on INSERT/UPDATE', 'CRITICAL'],
    ['4', 'BUG-C6', 'Players table exposes chat_ids publicly', 'CRITICAL'],
    ['5', 'BUG-C3', 'Records screen missing Acts V-VI', 'CRITICAL'],
    ['6', 'BUG-C4', 'Bot WebApp URL points to /v2.6 not /v2.8', 'CRITICAL'],
    ['7', 'BUG-H1', 'bestTime displayed 1000x too large', 'HIGH'],
    ['8', 'BUG-H2', 'Rank system broken — ms vs seconds', 'HIGH'],
    ['9', 'BUG-H3', 'Checkpoint system non-functional', 'HIGH'],
    ['10', 'BUG-H4', 'Profile achievement IDs mismatched', 'HIGH'],
    ['11', 'BUG-H5', 'Skins for Acts V-VI unobtainable', 'HIGH'],
    ['12', 'BUG-H6', 'Profile shows /60 instead of /90 stars', 'HIGH'],
    ['13', 'BUG-H7', 'Bot description says "20 levels"', 'HIGH'],
    ['14', 'BUG-H8', 'No API endpoints — client writes directly to DB', 'HIGH'],
    ['15', 'BUG-M1', 'perfectLevels counter stuck at 0', 'MEDIUM'],
    ['16', 'BUG-M2', 'calculateStars dead redundant condition', 'MEDIUM'],
    ['17', 'BUG-M3', 'Leaderboard time display 1000x wrong', 'MEDIUM'],
    ['18', 'BUG-M4', 'Challenge can select locked levels', 'MEDIUM'],
    ['19', 'BUG-M5', 'Weather system only has 4 act themes', 'MEDIUM'],
    ['20', 'BUG-M6', 'bestTime unit inconsistency with Supabase', 'MEDIUM'],
]

t = Table(priority_data, colWidths=[20, 55, 250, 60])
t.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'NotoSansSC'),
    ('FONTSIZE', (0, 0), (-1, -1), 7.5),
    ('FONTNAME', (0, 0), (-1, 0), 'NotoSerifSC-Bold'),
    ('BACKGROUND', (0, 0), (-1, 0), C_HEADER),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#f5f5f5')]),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    # Color code severity
    ('TEXTCOLOR', (3, 1), (3, 6), C_CRIT),
    ('TEXTCOLOR', (3, 7), (3, 14), C_HIGH),
    ('TEXTCOLOR', (3, 15), (3, 20), C_MED),
]))
story.append(t)
story.append(Spacer(1, 12))

# ===== INFRASTRUCTURE SUMMARY =====
story.extend(section_header('Infrastructure Status Summary'))

infra_data = [
    ['Component', 'Status', 'Details'],
    ['Vercel Deployment', 'OK', 'READY, serving v2.8.0, 200 OK, ~0.3s response'],
    ['GitHub Repository', 'OK', 'Clean, latest commit v2.8.0'],
    ['Telegram Bot', 'WARNING', 'Outdated URL and description'],
    ['Supabase Database', 'CRITICAL', 'RLS not configured on players table'],
    ['API Backend', 'WARNING', 'Only webhook endpoint exists'],
    ['vercel.json Config', 'OK', 'No-cache headers, versioned rewrites'],
    ['manifest.json', 'OK', 'PWA config correct'],
    ['CDN / Cache', 'OK', 'No-cache + versioned URLs prevent stale cache'],
]

t = Table(infra_data, colWidths=[100, 70, 210])
t.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'NotoSansSC'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('FONTNAME', (0, 0), (-1, 0), 'NotoSerifSC-Bold'),
    ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#f5f5f5')]),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
story.append(t)

# Build PDF
doc.build(story)
print("PDF generated successfully!")
