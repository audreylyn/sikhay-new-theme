# SIKHAY Quiz - Implementation Guide

## What Has Been Done:

### 1. **New Questions Structure (questions-new.json)**
The quiz is now organized into **6 sections** with **24 total questions**:

#### Section Breakdown:
- **PRETEST**: 5 multiple choice questions (IDs: 1-5)
- **ACTIVITY: "ANEK-SURI!"**: 3 open-ended questions (IDs: 6-8)
  - Includes the story "Ang Alaga ni Mang Kiko"
- **ANALISIS**: 3 multiple choice questions (IDs: 9-11)
- **ABSTRACT**: 5 fill-in-the-blank questions (IDs: 12-16)
  - Word bank: paksa, tauhan, motibo, paraan, tagpuan
- **APPLICATION**: 3 multiple choice questions (IDs: 17-19)
- **POST-TEST**: 5 multiple choice questions (IDs: 20-24)

### 2. **Translated Access Code Screen**
All text has been translated to Filipino:
- "Welcome to SIKHAY Quiz" → "Maligayang Pagdating sa SIKHAY Quiz"
- "Enter your access code to continue" → "Ilagay ang iyong access code upang magpatuloy"
- "Enter code" → "Ilagay ang kodigo"
- "Invalid access code. Please try again." → "Mali ang access code. Subukan ulit."
- "Enter Quiz" → "Magsimula"

### 3. **Updated Score Display**
- Changed from "Puntos0/18" to "Puntos0/24" to reflect the new total

---

## Next Steps to Implement:

You now need to update **script.js** to handle the different question types:

### Required JavaScript Updates:

1. **Load the new questions-new.json file**
2. **Handle different section types:**
   - Multiple choice (PRETEST, ANALISIS, APPLICATION, POST-TEST)
   - Open-ended with story (ACTIVITY)
   - Fill-in-the-blank with word bank (ABSTRACT)

3. **Display section titles and instructions**
4. **Show the story before ACTIVITY questions**
5. **Display word bank for ABSTRACT section**
6. **Handle different feedback messages:**
   - "ANEK WOW! Tumpak! Matalas ang iyong pagsusuri at pag-unawa sa aralin. Kaya naman magtutungo na tayo sa susunod na katanungan."
   - "ANEK DAW? Subukan muli! Balikan at suriin pang mabuti ang aralin."

---

## Files Modified:
1. ✅ **index.html** - Translated access code screen, updated score display
2. ✅ **questions-new.json** - Created new structured quiz file (USE THIS)
3. ⏳ **script.js** - NEEDS UPDATE to handle new structure

## Files Not Modified:
- ✅ **CHATBOT Q&A.txt** - Kept as-is (source document)
- **questions.json** - Old file (can be replaced or deleted)

---

## Implementation Priority:

**HIGH PRIORITY**: Update script.js to:
1. Load questions-new.json
2. Display section transitions
3. Handle 3 different question types
4. Use Filipino feedback messages from the text file
