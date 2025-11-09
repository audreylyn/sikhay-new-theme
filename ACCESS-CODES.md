# SIKHAY Quiz - Access Code Reference

## Available Access Codes:

### Individual Sections:
| Access Code | Section | Questions | Description |
|-------------|---------|-----------|-------------|
| `SIKHAY-PRETEST` | PRETEST | 5 | Basic knowledge assessment |
| `SIKHAY-ACTIVITY` | ACTIVITY | 3 | Story analysis (Ang Alaga ni Mang Kiko) |
| `SIKHAY-ANALISIS` | ANALISIS | 3 | Deep analysis questions |
| `SIKHAY-ABSTRACT` | ABSTRACT | 5 | Fill-in-the-blank with word bank |
| `SIKHAY-APPLICATION` | APPLICATION | 3 | Apply learned concepts |
| `SIKHAY-POSTTEST` | POST-TEST | 5 | Final assessment |

### Combined Sections:
| Access Code | Sections Included | Total Questions |
|-------------|-------------------|-----------------|
| `SIKHAY` | All sections | 24 |
| `SIKHAY-ALL` | All sections | 24 |
| `SIKHAY-PRE-POST` | PRETEST + POST-TEST | 10 |

## Usage Examples:

### For Teachers:
- **Pre-assessment**: Use `SIKHAY-PRETEST` before the lesson
- **During lesson**: Use `SIKHAY-ACTIVITY` for story discussion
- **Practice**: Use `SIKHAY-APPLICATION` for application exercises
- **Post-assessment**: Use `SIKHAY-POSTTEST` after the lesson
- **Full quiz**: Use `SIKHAY` for complete assessment

### For Students:
- Enter the access code provided by your teacher
- Access codes are **case-insensitive** (sikhay-pretest = SIKHAY-PRETEST)
- Each access code shows only the relevant section(s)
- Score is calculated based on the sections included

## Features:
✅ Section-specific scoring (e.g., "Puntos3/5" for PRETEST)
✅ Dynamic question counting
✅ All section types supported (multiple choice, open-ended, fill-in-blank)
✅ Same quiz experience, just filtered by access code

## Adding New Access Codes:
To add custom combinations, edit `script-new.js` and add to the `ACCESS_CODES` object:

```javascript
const ACCESS_CODES = {
  'CUSTOM-CODE': ['SECTION1', 'SECTION2'],
  // Add more as needed
};
```

Available section names:
- 'PRETEST'
- 'ACTIVITY'
- 'ANALISIS'
- 'ABSTRACT'
- 'APPLICATION'
- 'POST-TEST'
