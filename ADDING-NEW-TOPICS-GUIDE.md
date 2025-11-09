# Guide: Adding New Topics and Questions to SIKHAY

This guide will walk you through the process of adding new topics, questions, and access codes to your SIKHAY quiz application.

---

## Overview

When you want to add a new topic or set of questions, you need to modify **three main files**:

1. **questions-new.json** - Add your new questions and section
2. **script-new.js** - Add new access code mapping
3. **index.html** (optional) - Update help text if needed

---

## Step-by-Step Process

### Step 1: Add Questions to `questions-new.json`

Open `questions-new.json` and add a new section object to the array. Follow this structure:

```json
{
  "section": "YOUR-SECTION-NAME",
  "title": "Display Title for Section",
  "instruction": "Panuto: Instructions for students...",
  "questions": [
    {
      "id": 25,
      "question": "Your question text here?",
      "options": {
        "a": "Option A text",
        "b": "Option B text",
        "c": "Option C text",
        "d": "Option D text"
      },
      "correct": "a"
    }
  ]
}
```

#### Example: Adding a New "TALASALITAAN" Section

```json
{
  "section": "TALASALITAAN",
  "title": "TALASALITAAN: Pag-unawa sa Salita",
  "instruction": "Panuto: Piliin ang kahulugan ng mga salitang nakasalungguhit.",
  "questions": [
    {
      "id": 25,
      "question": "Ang kanyang pagsasalita ay puno ng 'kahusayan' at dedikasyon.",
      "options": {
        "a": "Katalinuhan",
        "b": "Kahirapan",
        "c": "Kasipagan",
        "d": "Kahinaan"
      },
      "correct": "a"
    },
    {
      "id": 26,
      "question": "Siya ay 'retirado' na ngunit aktibo pa rin sa komunidad.",
      "options": {
        "a": "Nagtrabaho pa rin",
        "b": "Hindi na nagtatrabaho dahil sa edad",
        "c": "Nag-aaral pa",
        "d": "Walang trabaho"
      },
      "correct": "b"
    },
    {
      "id": 27,
      "question": "Ang 'anekdota' ay isang maikling kuwento.",
      "options": {
        "a": "Tula",
        "b": "Sanaysay",
        "c": "Maikling kwentong may aral",
        "d": "Nobela"
      },
      "correct": "c"
    }
  ]
}
```

#### Important Notes:
- **Question IDs**: Continue numbering from the last question (currently 24, so start at 25)
- **Section Names**: Use UPPERCASE for consistency (e.g., "TALASALITAAN", "GRAMATIKA")
- **Place in Array**: Add your new section object anywhere in the main array (usually at the end)

#### Question Types Supported:

**1. Multiple Choice** (default):
```json
{
  "id": 25,
  "question": "Your question?",
  "options": {
    "a": "Option A",
    "b": "Option B",
    "c": "Option C",
    "d": "Option D"
  },
  "correct": "a"
}
```

**2. Open-Ended** (for reflective questions):
```json
{
  "id": 26,
  "question": "Ipaliwanag ang iyong pananaw...",
  "type": "open-ended",
  "answer": "Expected answer or rubric here..."
}
```

**3. Fill-in-the-Blank** (with word bank):
```json
{
  "id": 27,
  "question": "Ang (1)________ ay elemento ng akda.",
  "type": "fill-in-blank",
  "correct": "tauhan"
}
```

Note: For fill-in-blank, you need to add a `wordBank` array at the section level:
```json
{
  "section": "PAGSASANAY",
  "title": "Pagsasanay",
  "instruction": "Panuto: ...",
  "wordBank": ["tauhan", "paksa", "tagpuan", "banghay"],
  "questions": [...]
}
```

**4. Text Input for ACTIVITY Section** (student types answer in textarea):
- Automatically detected when section is "ACTIVITY" and type is "open-ended"
- Student writes answer in a text box before seeing the expected answer

---

### Step 2: Add Access Code to `script-new.js`

Open `script-new.js` and locate the `ACCESS_CODES` object (around line 20-30). Add your new access code:

```javascript
const ACCESS_CODES = {
  'SIKHAY': 'all', // All sections
  'SIKHAY-PRETEST': ['PRETEST'],
  'SIKHAY-ACTIVITY': ['ACTIVITY'],
  'SIKHAY-ANALISIS': ['ANALISIS'],
  'SIKHAY-ABSTRACT': ['ABSTRACT'],
  'SIKHAY-APPLICATION': ['APPLICATION'],
  'SIKHAY-POSTTEST': ['POST-TEST'],
  'SIKHAY-PRE-POST': ['PRETEST', 'POST-TEST'],
  
  // ADD YOUR NEW ACCESS CODE HERE
  'SIKHAY-TALASALITAAN': ['TALASALITAAN'],
  'SIKHAY-GRAMATIKA': ['GRAMATIKA'],
  
  // You can also create combinations
  'SIKHAY-BASICS': ['TALASALITAAN', 'GRAMATIKA'],
  
  'SIKHAY-ALL': 'all'
};
```

#### Access Code Patterns:

**Single Section Access:**
```javascript
'SIKHAY-SECTIONNAME': ['SECTIONNAME']
```

**Multiple Sections Access:**
```javascript
'SIKHAY-COMBO': ['SECTION1', 'SECTION2', 'SECTION3']
```

**All Sections Access:**
```javascript
'SIKHAY-EVERYTHING': 'all'
```

#### Naming Conventions:
- Always start with `SIKHAY-`
- Use ALL CAPS
- Use hyphens to separate words (e.g., `SIKHAY-PRE-POST`)
- Keep it short and memorable for students

---

### Step 3: Test Your New Topic

After adding your questions and access code:

1. **Save all files** (`questions-new.json` and `script-new.js`)
2. **Refresh your browser** (or clear cache with Ctrl+Shift+R)
3. **Test the new access code**:
   - Enter student information
   - Type your new access code (e.g., `SIKHAY-TALASALITAAN`)
   - Verify questions display correctly
   - Check scoring and navigation

---

### Step 4: Update Documentation (Optional)

If you want to provide access code information to teachers/students, you can uncomment the help section in `index.html`.

Find this section (around line 75-84):
```html
<!-- <div class="text-xs text-amber-700 bg-amber-100 p-3 rounded-lg text-left">
  <p class="font-semibold mb-1">Available Codes:</p>
  <p>• SIKHAY - All sections (24 questions)</p>
  ...
</div> -->
```

Remove the `<!--` and `-->` to show it, then update with your new codes:
```html
<div class="text-xs text-amber-700 bg-amber-100 p-3 rounded-lg text-left">
  <p class="font-semibold mb-1">Available Codes:</p>
  <p>• SIKHAY - All sections (27 questions)</p>
  <p>• SIKHAY-PRETEST - Pretest only (5 questions)</p>
  <p>• SIKHAY-ACTIVITY - Activity only (3 questions)</p>
  <p>• SIKHAY-TALASALITAAN - Vocabulary only (3 questions)</p>
  <p>• SIKHAY-POSTTEST - Post-test only (5 questions)</p>
</div>
```

---

## Complete Example: Adding a "GRAMATIKA" Topic

Let's add a complete new topic about Filipino grammar.

### 1. Add to `questions-new.json`:

```json
{
  "section": "GRAMATIKA",
  "title": "GRAMATIKA: Wastong Gamit ng Wika",
  "instruction": "Panuto: Piliin ang tamang sagot batay sa wastong gamit ng gramatika.",
  "questions": [
    {
      "id": 25,
      "question": "Alin ang tamang pangungusap?",
      "options": {
        "a": "Kumain na kami ng tanghalian.",
        "b": "Kumain na ako ng tanghalian.",
        "c": "Kumain na siya ng tanghalian.",
        "d": "Lahat ng nabanggit ay tama."
      },
      "correct": "d"
    },
    {
      "id": 26,
      "question": "Ano ang pang-abay sa pangungusap: 'Mabilis na tumakbo si Juan.'?",
      "options": {
        "a": "Juan",
        "b": "Mabilis",
        "c": "tumakbo",
        "d": "na"
      },
      "correct": "b"
    },
    {
      "id": 27,
      "question": "Piliin ang pangungusap na may tamang bantas.",
      "options": {
        "a": "Kumusta ka na",
        "b": "Kumusta ka na!",
        "c": "Kumusta ka na?",
        "d": "Kumusta ka na."
      },
      "correct": "c"
    },
    {
      "id": 28,
      "question": "Ano ang simuno sa pangungusap: 'Ang guro ay nagtuturo.'?",
      "options": {
        "a": "Ang",
        "b": "guro",
        "c": "ay",
        "d": "nagtuturo"
      },
      "correct": "b"
    }
  ]
}
```

### 2. Add to `script-new.js` ACCESS_CODES:

```javascript
const ACCESS_CODES = {
  'SIKHAY': 'all',
  'SIKHAY-PRETEST': ['PRETEST'],
  'SIKHAY-ACTIVITY': ['ACTIVITY'],
  'SIKHAY-ANALISIS': ['ANALISIS'],
  'SIKHAY-ABSTRACT': ['ABSTRACT'],
  'SIKHAY-APPLICATION': ['APPLICATION'],
  'SIKHAY-POSTTEST': ['POST-TEST'],
  'SIKHAY-PRE-POST': ['PRETEST', 'POST-TEST'],
  'SIKHAY-GRAMATIKA': ['GRAMATIKA'], // NEW CODE
  'SIKHAY-ALL': 'all'
};
```

### 3. Test with access code `SIKHAY-GRAMATIKA`

---

## Advanced: Creating Topic Combinations

You can create custom combinations for different learning paths:

```javascript
const ACCESS_CODES = {
  // Basic path (for beginners)
  'SIKHAY-BASIC': ['PRETEST', 'TALASALITAAN', 'GRAMATIKA'],
  
  // Advanced path (for advanced students)
  'SIKHAY-ADVANCED': ['ANALISIS', 'ABSTRACT', 'APPLICATION', 'POST-TEST'],
  
  // Review path (pre and post only)
  'SIKHAY-REVIEW': ['PRETEST', 'POST-TEST'],
  
  // Full curriculum
  'SIKHAY-FULL': 'all',
  
  // Skills focus
  'SIKHAY-SKILLS': ['ACTIVITY', 'APPLICATION'],
  
  // Assessment only
  'SIKHAY-ASSESSMENT': ['PRETEST', 'POST-TEST', 'ANALISIS']
};
```

---

## Google Sheets Integration

When you add new questions, they will automatically be tracked in your Google Sheets:

- **Summary Sheet**: Shows student name, email, section, score, percentage
- **Detailed Responses Sheet**: Shows every answer with question text and correctness
- **Student Portfolio (Google Drive)**: Each student gets a document with all quiz attempts

**No additional setup needed** - your existing Google Apps Script handles all question types automatically.

---

## Troubleshooting

### Problem: Questions don't appear
- **Check**: Did you save `questions-new.json`?
- **Check**: Is your JSON valid? Use [JSONLint](https://jsonlint.com/) to validate
- **Check**: Are question IDs unique?
- **Solution**: Clear browser cache (Ctrl+Shift+R)

### Problem: Access code doesn't work
- **Check**: Did you add it to `ACCESS_CODES` object in `script-new.js`?
- **Check**: Is the section name exactly matching (case-sensitive)?
- **Check**: Did you save `script-new.js`?
- **Solution**: Check browser console (F12) for errors

### Problem: Score calculation is wrong
- **Check**: Total questions count is automatic - it recalculates based on filtered sections
- **Check**: Each question should have unique ID
- **Solution**: Verify no duplicate question IDs exist

### Problem: JSON syntax error
- **Common mistakes**:
  - Missing comma between objects
  - Extra comma after last item
  - Missing quotes around strings
  - Unmatched brackets `{}` or `[]`
- **Solution**: Use a JSON validator or IDE with JSON support

---

## Quick Reference Checklist

When adding a new topic, complete these steps:

- [ ] **Step 1**: Add section object to `questions-new.json`
  - [ ] Include section name, title, instruction
  - [ ] Add all questions with unique IDs
  - [ ] Verify JSON syntax is valid
  
- [ ] **Step 2**: Add access code to `script-new.js`
  - [ ] Add entry to `ACCESS_CODES` object
  - [ ] Use consistent naming (SIKHAY-TOPICNAME)
  - [ ] Match section names exactly
  
- [ ] **Step 3**: Test thoroughly
  - [ ] Refresh browser (clear cache)
  - [ ] Enter student info + new access code
  - [ ] Complete quiz and verify scoring
  - [ ] Check Google Sheets integration
  
- [ ] **Step 4** (Optional): Update documentation
  - [ ] Update access code list in `index.html`
  - [ ] Update README if needed

---

## Example Use Cases

### Use Case 1: Weekly Vocabulary Quiz
Create weekly vocab quizzes with codes like:
- `SIKHAY-VOCAB-WEEK1`
- `SIKHAY-VOCAB-WEEK2`
- etc.

### Use Case 2: Skill-Based Assessment
Create skill-specific assessments:
- `SIKHAY-READING` (reading comprehension)
- `SIKHAY-WRITING` (writing exercises)
- `SIKHAY-SPEAKING` (oral questions)

### Use Case 3: Differentiated Instruction
Create level-based paths:
- `SIKHAY-BEGINNER`
- `SIKHAY-INTERMEDIATE`
- `SIKHAY-ADVANCED`

---

## Best Practices

1. **Consistent Naming**: Always use `SIKHAY-` prefix and UPPERCASE
2. **Unique IDs**: Never reuse question IDs
3. **Clear Instructions**: Write clear, concise instructions for each section
4. **Test First**: Always test new questions before giving access code to students
5. **Backup Data**: Keep a backup of `questions-new.json` before major changes
6. **Version Control**: Use Git to track changes (you're already doing this!)
7. **Student Feedback**: Ask students if questions are clear and difficulty is appropriate

---

## Need Help?

- **JSON Validation**: https://jsonlint.com/
- **VS Code Extension**: Install "JSON" extension for syntax highlighting
- **Browser Console**: Press F12 to see JavaScript errors
- **Test Mode**: Use `SIKHAY-PRETEST` (only 5 questions) for quick testing

---

## Summary

Adding new topics is a **three-step process**:

1. **Add questions** to `questions-new.json`
2. **Add access code** to `script-new.js`
3. **Test** the new topic

The system handles everything else automatically:
- Question display and navigation
- Scoring and feedback
- Google Sheets integration
- Student portfolio creation

Happy teaching! 🎓
